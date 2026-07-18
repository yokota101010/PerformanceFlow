import { Staff } from '../../domain/models';
import { StaffRepository } from '../../domain/repositories';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';
import {
  CreateStaffCommand,
  StaffUseCase,
  UpdateStaffCommand,
} from '../usecases/StaffUseCase';

/**
 * 要員マスタ管理のユースケースを処理する具象アプリケーションサービス。
 */
export class StaffService implements StaffUseCase {
  private getRepository(): StaffRepository {
    return RepositoryRegistry.getStaffRepository();
  }

  async getStaffs(): Promise<readonly Staff[]> {
    return this.getRepository().findAll();
  }

  async createStaff(command: CreateStaffCommand): Promise<Staff> {
    const trimmedName = command.name ? command.name.replace(/^[\s　]+|[\s　]+$/g, '') : '';
    if (!trimmedName) {
      throw new Error('氏名は必須です。');
    }

    if (typeof command.costPerMonth !== 'number' || isNaN(command.costPerMonth) || command.costPerMonth < 0) {
      throw new Error('単価は0以上の整数で入力してください。');
    }

    // FK検証: 所属会社IDの存在確認
    const partnerRepo = RepositoryRegistry.getPartnerRepository();
    const partner = await partnerRepo.findById(command.partnerId);
    if (!partner) {
      throw new Error('指定された所属会社（発注先）が存在しません。');
    }

    const nextId = await this.getRepository().nextIdentity();
    const newStaff = new Staff(nextId, command.partnerId, trimmedName, command.costPerMonth);
    await this.getRepository().save(newStaff);
    return newStaff;
  }

  async updateStaff(command: UpdateStaffCommand): Promise<void> {
    const repo = this.getRepository();
    const existing = await repo.findById(command.id);
    if (!existing) {
      throw new Error('指定された要員が存在しません。');
    }

    const trimmedName = command.name ? command.name.replace(/^[\s　]+|[\s　]+$/g, '') : '';
    if (!trimmedName) {
      throw new Error('氏名は必須です。');
    }

    if (typeof command.costPerMonth !== 'number' || isNaN(command.costPerMonth) || command.costPerMonth < 0) {
      throw new Error('単価は0以上の整数で入力してください。');
    }

    // FK検証: 所属会社IDの存在確認
    const partnerRepo = RepositoryRegistry.getPartnerRepository();
    const partner = await partnerRepo.findById(command.partnerId);
    if (!partner) {
      throw new Error('指定された所属会社（発注先）が存在しません。');
    }

    const updatedStaff = new Staff(command.id, command.partnerId, trimmedName, command.costPerMonth);
    await repo.save(updatedStaff);
  }

  async deleteStaff(id: string): Promise<void> {
    const repo = this.getRepository();
    const existing = await repo.findById(id);
    if (!existing) {
      throw new Error('指定された要員が存在しません。');
    }

    // 1. 注文明細参照チェック
    const orderRepo = RepositoryRegistry.getStaffOrderDetailRepository();
    const hasOrder = await orderRepo.existsByStaffId(id);
    if (hasOrder) {
      throw new Error('この要員は実績データから参照されているため削除できません。');
    }

    // 2. 工数サマリ参照チェック
    const summaryRepo = RepositoryRegistry.getStaffMonthlySummaryRepository();
    const hasSummary = await summaryRepo.existsByStaffId(id);
    if (hasSummary) {
      throw new Error('この要員は実績データから参照されているため削除できません。');
    }

    await repo.delete(id);
  }
}
