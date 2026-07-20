import { PartnerStaffRepository } from '../../domain/repositories';
import { RepositoryRegistry } from './RepositoryRegistry';

/**
 * LocalStorageの実データ（要員マスタ）に基づき、発注先の参照チェックを行うリポジトリ。
 */
export class LocalStoragePartnerStaffRepository implements PartnerStaffRepository {
  async existsByPartnerId(partnerId: string): Promise<boolean> {
    const staffRepo = RepositoryRegistry.getStaffRepository();
    const staffs = await staffRepo.findAll();
    return staffs.some((staff) => staff.partnerId === partnerId);
  }
}
