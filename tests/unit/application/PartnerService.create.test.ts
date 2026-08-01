import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerService } from '../../../src/application/services/PartnerService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerRepository';

describe('PartnerService.createPartner (新規登録)', () => {
  let service: PartnerService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
    service = new PartnerService();
  });

  it('正常な名前で登録され、自動採番 (最大値+1) が機能すること', async () => {
    const newPartner = await service.createPartner({
      name: 'Ｃシステムズ'
    });

    expect(newPartner.id).toBe('BP001');
    expect(newPartner.name).toBe('Ｃシステムズ');

    // 一覧に反映されていること
    const list = await service.getPartners();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('BP001');
  });

  it('発注先名に入力された前後の空白 (全角・半角) が自動トリミングされること', async () => {
    const newPartner = await service.createPartner({
      name: ' 　Ｄネットワークス  　'
    });

    expect(newPartner.name).toBe('Ｄネットワークス');
  });

  it('発注先名が空文字、またはスペースのみの場合はエラーをスローすること', async () => {
    await expect(
      service.createPartner({ name: '' })
    ).rejects.toThrow('発注先名は必須です。');

    await expect(
      service.createPartner({ name: ' 　 ' })
    ).rejects.toThrow('発注先名は必須です。');
  });

  it('すでに登録されている発注先名と同名（重複）を登録しようとした場合、エラーをスローすること', async () => {
    const repo = RepositoryRegistry.getPartnerRepository();
    const { Partner } = await import('../../../src/domain/models');
    await repo.save(new Partner('BP001', 'Ａソフトウェア'));
    await repo.save(new Partner('BP002', 'Ｂエンジニアリング'));

    await expect(
      service.createPartner({ name: 'Ａソフトウェア' })
    ).rejects.toThrow('この発注先名はすでに登録されています。');

    // トリミング後重複も検出されること
    await expect(
      service.createPartner({ name: '  Ｂエンジニアリング  ' })
    ).rejects.toThrow('この発注先名はすでに登録されています。');
  });
});
