import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerService } from '../../../src/application/services/PartnerService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { Partner } from '../../../src/domain/models';

describe('PartnerService.getPartners (一覧取得)', () => {
  let service: PartnerService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
    service = new PartnerService();
  });

  it('初回起動時にシードデータ (2社) が自動的に投入されて取得できること', async () => {
    const list = await service.getPartners();
    
    expect(list).toHaveLength(2);
    expect(list[0]).toEqual({
      id: 'BP001',
      name: 'Ａソフトウェア'
    });
    expect(list[1]).toEqual({
      id: 'BP002',
      name: 'Ｂエンジニアリング'
    });
  });

  it('複数登録されている場合、発注先IDの昇順でソートされて取得できること', async () => {
    const repo = RepositoryRegistry.getPartnerRepository();
    
    // 順序を入れ替えて追加保存
    await repo.save(new Partner('BP004', 'Ｄネットワークス'));
    await repo.save(new Partner('BP003', 'Ｃシステムズ'));

    const list = await service.getPartners();

    expect(list).toHaveLength(4);
    expect(list[0].id).toBe('BP001');
    expect(list[1].id).toBe('BP002');
    expect(list[2].id).toBe('BP003');
    expect(list[3].id).toBe('BP004');
  });
});
