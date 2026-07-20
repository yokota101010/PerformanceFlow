import { StaffOrderDetailRepository } from '../../domain/repositories';
import { RepositoryRegistry } from './RepositoryRegistry';

/**
 * LocalStorageの実データ（発注・注文明細）に基づき、要員の参照チェックを行うリポジトリ。
 */
export class LocalStorageStaffOrderDetailRepository implements StaffOrderDetailRepository {
  async existsByStaffId(staffId: string): Promise<boolean> {
    const partnerOrderRepo = RepositoryRegistry.getPartnerOrderRepository();
    const orders = await partnerOrderRepo.findAll();
    return orders.some((order) =>
      order.details.some((detail) => detail.staffId === staffId)
    );
  }
}
