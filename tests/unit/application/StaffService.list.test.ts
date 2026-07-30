import { describe, it, expect, beforeEach } from 'vitest';
import { StaffService } from '../../../src/application/services/StaffService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryStaffRepository } from '../../../src/infrastructure/persistence/InMemoryStaffRepository';
import { Staff } from '../../../src/domain/models';

describe('StaffService.getStaffs (一覧取得)', () => {
  let service: StaffService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerStaffRepository(new InMemoryStaffRepository());
    service = new StaffService();
  });

  it('初回起動時にシードデータ (4名) が自動的に投入されて取得できること', async () => {
    const list = await service.getStaffs();
    
    expect(list).toHaveLength(4);
    expect(list[0]).toEqual({
      id: 'MEM001',
      partnerId: 'BP001',
      name: '坂本龍馬',
    });
  });

  it('複数登録されている場合、要員IDの昇順でソートされて取得できること', async () => {
    const repo = RepositoryRegistry.getStaffRepository();
    
    // 順序を入れ替えて追加保存
    await repo.save(new Staff('MEM006', 'BP001', '武市半平太'));
    await repo.save(new Staff('MEM005', 'BP001', '岡田以蔵'));

    const list = await service.getStaffs();

    expect(list).toHaveLength(6);
    expect(list[4].id).toBe('MEM005');
    expect(list[5].id).toBe('MEM006');
  });
});
