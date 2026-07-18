import { describe, it, expect, beforeEach } from 'vitest';
import { StaffService } from '../../../src/application/services/StaffService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryStaffRepository } from '../../../src/infrastructure/persistence/InMemoryStaffRepository';
import { InMemoryPartnerRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerRepository';

describe('StaffService.createStaff (新規登録)', () => {
  let service: StaffService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerStaffRepository(new InMemoryStaffRepository());
    // FK検証用に発注先リポジトリにシードデータを登録
    const partnerRepo = new InMemoryPartnerRepository();
    RepositoryRegistry.registerPartnerRepository(partnerRepo);
    
    service = new StaffService();
  });

  it('正常系: 要員を新規登録でき、IDが自動採番されること', async () => {
    const staff = await service.createStaff({
      partnerId: 'BP001',
      name: '岡田以蔵',
      costPerMonth: 500000
    });

    expect(staff.id).toBe('MEM005'); // シード4名の次
    expect(staff.name).toBe('岡田以蔵');
    expect(staff.partnerId).toBe('BP001');
    expect(staff.costPerMonth).toBe(500000);

    const list = await service.getStaffs();
    expect(list).toHaveLength(5);
  });

  it('正常系: 同姓同名 (同名氏名) の要員の重複登録が正常に許可されること', async () => {
    // 1人目登録
    await service.createStaff({
      partnerId: 'BP001',
      name: '岡田以蔵',
      costPerMonth: 500000
    });

    // 2人目の同姓同名登録
    const staff2 = await service.createStaff({
      partnerId: 'BP002',
      name: '  岡田以蔵  ', // スペース付き
      costPerMonth: 550000
    });

    expect(staff2.id).toBe('MEM006');
    expect(staff2.name).toBe('岡田以蔵'); // トリミングされていること
    expect(staff2.partnerId).toBe('BP002');
    expect(staff2.costPerMonth).toBe(550000);

    const list = await service.getStaffs();
    expect(list).toHaveLength(6);
  });

  it('正常系: 氏名の前後にスペースが含まれる場合、自動トリミングして保存されること', async () => {
    const staff = await service.createStaff({
      partnerId: 'BP001',
      name: ' 　岡田以蔵　 ', // 半角全角混在
      costPerMonth: 400000
    });

    expect(staff.name).toBe('岡田以蔵');
  });

  it('異常系: 氏名が空欄の場合はエラーになること', async () => {
    await expect(
      service.createStaff({
        partnerId: 'BP001',
        name: '   ',
        costPerMonth: 500000
      })
    ).rejects.toThrow('氏名は必須です。');
  });

  it('異常系: 単価が負数の場合はエラーになること', async () => {
    await expect(
      service.createStaff({
        partnerId: 'BP001',
        name: '岡田以蔵',
        costPerMonth: -1
      })
    ).rejects.toThrow('単価は0以上の整数で入力してください。');
  });

  it('異常系: 存在しない所属会社IDを指定した場合はエラーになること', async () => {
    await expect(
      service.createStaff({
        partnerId: 'BP999', // 存在しない
        name: '岡田以蔵',
        costPerMonth: 500000
      })
    ).rejects.toThrow('指定された所属会社（発注先）が存在しません。');
  });
});
