import { describe, it, expect, beforeEach } from 'vitest';
import { StaffService } from '../../../src/application/services/StaffService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryStaffRepository } from '../../../src/infrastructure/persistence/InMemoryStaffRepository';
import { InMemoryStaffOrderDetailRepository } from '../../../src/infrastructure/persistence/InMemoryStaffOrderDetailRepository';
import { InMemoryStaffMonthlySummaryRepository } from '../../../src/infrastructure/persistence/InMemoryStaffMonthlySummaryRepository';
import { Staff } from '../../../src/domain/models';

describe('StaffService.deleteStaff (物理削除と制約)', () => {
  let service: StaffService;
  let orderRepo: InMemoryStaffOrderDetailRepository;
  let summaryRepo: InMemoryStaffMonthlySummaryRepository;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerStaffRepository(new InMemoryStaffRepository());
    
    orderRepo = new InMemoryStaffOrderDetailRepository();
    RepositoryRegistry.registerStaffOrderDetailRepository(orderRepo);

    summaryRepo = new InMemoryStaffMonthlySummaryRepository();
    RepositoryRegistry.registerStaffMonthlySummaryRepository(summaryRepo);

    service = new StaffService();
  });

  it('正常系: 実績データが紐づいていない要員を物理削除できること', async () => {
    // 実績のない要員を新規登録 (MEM005)
    await RepositoryRegistry.getStaffRepository().save(new Staff('MEM005', 'BP001', '岡田以蔵', 500000));
    
    // 実績なしをセット
    orderRepo.setHasDetails('MEM005', false);
    summaryRepo.setHasSummaries('MEM005', false);

    await service.deleteStaff('MEM005');

    const list = await service.getStaffs();
    const deleted = list.find(s => s.id === 'MEM005');
    expect(deleted).toBeUndefined();
  });

  it('異常系: 注文明細にデータが存在する要員の削除はエラーでブロックされること', async () => {
    // シード MEM001 に対するテスト
    // orderRepo.existsByStaffId('MEM001') -> true

    await expect(
      service.deleteStaff('MEM001')
    ).rejects.toThrow('この要員は実績データから参照されているため削除できません。');
  });

  it('異常系: 工数サマリにデータが存在する要員の削除はエラーでブロックされること', async () => {
    // 注文明細実績をクリアしても、工数サマリ実績があるためブロックされる
    orderRepo.setHasDetails('MEM001', false);
    summaryRepo.setHasSummaries('MEM001', true);

    await expect(
      service.deleteStaff('MEM001')
    ).rejects.toThrow('この要員は実績データから参照されているため削除できません。');
  });
});
