import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerService } from '../../../src/application/services/PartnerService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { InMemoryPartnerStaffRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerStaffRepository';
import { InMemoryPartnerOrderRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { Partner } from '../../../src/domain/models';

describe('PartnerService.deletePartner (物理削除と制約)', () => {
  let service: PartnerService;
  let staffRepo: InMemoryPartnerStaffRepository;
  let orderRepo: InMemoryPartnerOrderRepository;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
    
    staffRepo = new InMemoryPartnerStaffRepository();
    orderRepo = new InMemoryPartnerOrderRepository();
    RepositoryRegistry.registerPartnerStaffRepository(staffRepo);
    RepositoryRegistry.registerPartnerOrderRepository(orderRepo);

    service = new PartnerService();
  });

  it('要員所属も発注実績もない発注先を正常に物理削除できること', async () => {
    const repo = RepositoryRegistry.getPartnerRepository();
    
    // 新規登録 (BP003) は初期状態で要員所属も発注実績もない (InMemoryダミー側が false を返す)
    const newPartner = new Partner('BP003', '新規パートナー');
    await repo.save(newPartner);

    staffRepo.setHasStaff('BP003', false);
    orderRepo.setHasOrders('BP003', false);

    await expect(service.deletePartner('BP003')).resolves.not.toThrow();

    // 削除されていること
    const partner = await repo.findById('BP003');
    expect(partner).toBeNull();
  });

  it('所属する要員が存在する場合、削除をブロックしエラーを投げること', async () => {
    const repo = RepositoryRegistry.getPartnerRepository();
    const newPartner = new Partner('BP003', '新規パートナー');
    await repo.save(newPartner);

    // 要員所属ありを設定
    staffRepo.setHasStaff('BP003', true);
    orderRepo.setHasOrders('BP003', false);

    await expect(
      service.deletePartner('BP003')
    ).rejects.toThrow('この発注先は他テーブルから参照されているため削除できません。');

    // 削除されず残っていること
    const partner = await repo.findById('BP003');
    expect(partner).not.toBeNull();
  });

  it('発注実績が存在する場合、削除をブロックしエラーを投げること', async () => {
    const repo = RepositoryRegistry.getPartnerRepository();
    const newPartner = new Partner('BP003', '新規パートナー');
    await repo.save(newPartner);

    // 発注実績ありを設定
    staffRepo.setHasStaff('BP003', false);
    orderRepo.setHasOrders('BP003', true);

    await expect(
      service.deletePartner('BP003')
    ).rejects.toThrow('この発注先は他テーブルから参照されているため削除できません。');

    // 削除されず残っていること
    const partner = await repo.findById('BP003');
    expect(partner).not.toBeNull();
  });

  it('存在しない発注先IDの場合はエラーをスローすること', async () => {
    await expect(
      service.deletePartner('BP999')
    ).rejects.toThrow('指定された発注先が見つかりません。');
  });
});
