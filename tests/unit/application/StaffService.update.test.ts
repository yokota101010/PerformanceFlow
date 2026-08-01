import { describe, it, expect, beforeEach } from 'vitest';
import { StaffService } from '../../../src/application/services/StaffService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryStaffRepository } from '../../../src/infrastructure/persistence/InMemoryStaffRepository';
import { InMemoryPartnerRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerRepository';

describe('StaffService.updateStaff (要員情報更新)', () => {
  let service: StaffService;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    const staffRepo = new InMemoryStaffRepository();
    const partnerRepo = new InMemoryPartnerRepository();
    
    const { Staff, Partner } = await import('../../../src/domain/models');
    await partnerRepo.save(new Partner('BP001', 'Ａソフトウェア'));
    await partnerRepo.save(new Partner('BP002', 'Ｂエンジニアリング'));
    await staffRepo.save(new Staff('MEM001', 'BP001', '坂本龍馬'));

    RepositoryRegistry.registerStaffRepository(staffRepo);
    RepositoryRegistry.registerPartnerRepository(partnerRepo);
    
    service = new StaffService();
  });

  it('正常系: 要員情報を更新でき、リポジトリに保存されること', async () => {
    // 既存要員の情報をロード (MEM001)
    await service.updateStaff({
      id: 'MEM001',
      partnerId: 'BP002', // BP001からBP002へ変更
      name: '坂本武雄', // 坂本龍馬から変更
    });

    const list = await service.getStaffs();
    const updated = list.find(s => s.id === 'MEM001');

    expect(updated).toBeDefined();
    expect(updated?.name).toBe('坂本武雄');
    expect(updated?.partnerId).toBe('BP002');
  });

  it('異常系: 存在しない要員IDを指定した場合はエラーになること', async () => {
    await expect(
      service.updateStaff({
        id: 'MEM999', // 存在しない
        partnerId: 'BP001',
        name: '謎の要員',
      })
    ).rejects.toThrow('指定された要員が存在しません。');
  });

  it('異常系: 氏名が空欄の場合はエラーになること', async () => {
    await expect(
      service.updateStaff({
        id: 'MEM001',
        partnerId: 'BP001',
        name: '   ',
      })
    ).rejects.toThrow('氏名は必須です。');
  });

  it('異常系: 存在しない会社IDを指定した場合はエラーになること', async () => {
    await expect(
      service.updateStaff({
        id: 'MEM001',
        partnerId: 'BP999', // 存在しない
        name: '坂本龍馬',
      })
    ).rejects.toThrow('指定された所属会社（発注先）が存在しません。');
  });
});
