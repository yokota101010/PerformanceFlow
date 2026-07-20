import { StaffMonthlySummaryRepository } from '../../domain/repositories';
import { RepositoryRegistry } from './RepositoryRegistry';

/**
 * LocalStorageの実データ（要員工数サマリおよび注文明細）に基づき、要員の参照チェックを行うリポジトリ。
 */
export class LocalStorageStaffMonthlySummaryRepository implements StaffMonthlySummaryRepository {
  async existsByStaffId(staffId: string): Promise<boolean> {
    const summaryRepo = RepositoryRegistry.getMonthlyMemberWorkHoursSummaryRepository();
    const summaries = await summaryRepo.findAll();
    const hasSummary = summaries.some((s) => s.staffId === staffId && s.totalEffort > 0);
    if (hasSummary) {
      return true;
    }

    // 念のため発注（注文明細）もダブルチェック
    const partnerOrderRepo = RepositoryRegistry.getPartnerOrderRepository();
    const orders = await partnerOrderRepo.findAll();
    return orders.some((order) =>
      order.details.some((detail) => detail.staffId === staffId)
    );
  }
}
