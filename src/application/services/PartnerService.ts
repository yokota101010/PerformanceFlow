import { Partner } from '../../domain/models';
import { PartnerRepository } from '../../domain/repositories';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';
import {
  CreatePartnerCommand,
  PartnerUseCase,
  UpdatePartnerCommand,
} from '../usecases/PartnerUseCase';

/**
 * 発注先マスタ管理のユースケースを処理する具象アプリケーションサービス。
 */
export class PartnerService implements PartnerUseCase {
  private getRepository(): PartnerRepository {
    return RepositoryRegistry.getPartnerRepository();
  }

  async getPartners(): Promise<readonly Partner[]> {
    return this.getRepository().findAll();
  }

  /**
   * 新しい発注先を登録する (T023)。
   */
  async createPartner(command: CreatePartnerCommand): Promise<Partner> {
    const repo = this.getRepository();

    // 入力値のトリミング
    const trimmedName = command.name ? command.name.replace(/^[\s　]+|[\s　]+$/g, '') : '';

    // 一意性バリデーション: 重複名登録禁止 (T023)
    const existing = await repo.findByName(trimmedName);
    if (existing) {
      throw new Error('この発注先名はすでに登録されています。');
    }

    // 自動採番の取得
    const nextId = await repo.nextIdentity();

    // ドメイン層のPartnerクラス構築時に属性バリデーションが強制実行される (T002)
    const partner = new Partner(nextId, trimmedName);

    // リポジトリに永続化
    await repo.save(partner);

    return partner;
  }

  /**
   * 既存の発注先情報を更新する (T028)。
   */
  async updatePartner(command: UpdatePartnerCommand): Promise<void> {
    const repo = this.getRepository();

    // 存在チェック
    const existing = await repo.findById(command.id);
    if (!existing) {
      throw new Error('指定された発注先が見つかりません。');
    }

    // トリミング
    const trimmedName = command.name ? command.name.replace(/^[\s　]+|[\s　]+$/g, '') : '';

    // 一意性チェック: 自分以外のIDで重複しているか
    const duplicate = await repo.findByName(trimmedName);
    if (duplicate && duplicate.id !== command.id) {
      throw new Error('この発注先名はすでに登録されています。');
    }

    // 新規オブジェクト再構築による不変性の維持 (T002)
    const updatedPartner = new Partner(command.id, trimmedName);

    // 保存
    await repo.save(updatedPartner);
  }

  /**
   * 発注先を物理削除する (T033)。
   */
  async deletePartner(id: string): Promise<void> {
    const repo = this.getRepository();

    // 存在チェック
    const existing = await repo.findById(id);
    if (!existing) {
      throw new Error('指定された発注先が見つかりません。');
    }

    // 参照チェック (要員)
    const staffRepo = RepositoryRegistry.getPartnerStaffRepository();
    const hasStaff = await staffRepo.existsByPartnerId(id);

    // 参照チェック (発注)
    const orderRepo = RepositoryRegistry.getPartnerOrderRepository();
    const hasOrders = await orderRepo.existsByPartnerId(id);

    if (hasStaff || hasOrders) {
      throw new Error('この発注先は他テーブルから参照されているため削除できません。');
    }

    // 物理削除
    await repo.delete(id);
  }
}
