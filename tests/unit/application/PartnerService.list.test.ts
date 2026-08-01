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

  it('初期状態ではデータ無しの状態（0件）であること', async () => {
    const list = await service.getPartners();
    expect(list).toHaveLength(0);
  });

  it('複数登録されている場合、発注先IDの昇順でソートされて取得できること', async () => {
    const repo = RepositoryRegistry.getPartnerRepository();
    
    await repo.save(new Partner('BP001', 'Ａソフトウェア'));
    await repo.save(new Partner('BP002', 'Ｂエンジニアリング'));
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
