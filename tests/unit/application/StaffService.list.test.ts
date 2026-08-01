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

  it('初期状態ではデータ無しの状態（0件）であること', async () => {
    const list = await service.getStaffs();
    expect(list).toHaveLength(0);
  });

  it('複数登録されている場合、要員IDの昇順でソートされて取得できること', async () => {
    const repo = RepositoryRegistry.getStaffRepository();
    
    await repo.save(new Staff('MEM001', 'BP001', '坂本龍馬'));
    await repo.save(new Staff('MEM002', 'BP001', '高杉晋作'));
    await repo.save(new Staff('MEM003', 'BP002', '西郷隆盛'));
    await repo.save(new Staff('MEM004', 'BP002', '勝海舟'));
    await repo.save(new Staff('MEM006', 'BP001', '武市半平太'));
    await repo.save(new Staff('MEM005', 'BP001', '岡田以蔵'));

    const list = await service.getStaffs();

    expect(list).toHaveLength(6);
    expect(list[4].id).toBe('MEM005');
    expect(list[5].id).toBe('MEM006');
  });
});
