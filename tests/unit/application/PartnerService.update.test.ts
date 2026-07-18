import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerService } from '../../../src/application/services/PartnerService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerRepository';

describe('PartnerService.updatePartner (情報更新)', () => {
  let service: PartnerService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
    service = new PartnerService();
  });

  it('正常な値で発注先名を更新できること', async () => {
    // 初期データ BP001: Ａソフトウェア
    await service.updatePartner({
      id: 'BP001',
      name: 'Ａソフトウェア改'
    });

    const list = await service.getPartners();
    const partner = list.find((p) => p.id === 'BP001');
    expect(partner?.name).toBe('Ａソフトウェア改');
  });

  it('更新後の発注先名も前後の空白 (全角・半角) が自動トリミングされること', async () => {
    await service.updatePartner({
      id: 'BP001',
      name: ' 　Ａソフトウェア更新  　'
    });

    const list = await service.getPartners();
    const partner = list.find((p) => p.id === 'BP001');
    expect(partner?.name).toBe('Ａソフトウェア更新');
  });

  it('更新後の発注先名が空文字、またはスペースのみの場合はエラーをスローすること', async () => {
    await expect(
      service.updatePartner({ id: 'BP001', name: '' })
    ).rejects.toThrow('発注先名は必須です。');

    await expect(
      service.updatePartner({ id: 'BP001', name: ' 　 ' })
    ).rejects.toThrow('発注先名は必須です。');
  });

  it('存在しない発注先IDの場合はエラーをスローすること', async () => {
    await expect(
      service.updatePartner({ id: 'BP999', name: '新規企業' })
    ).rejects.toThrow('指定された発注先が見つかりません。');
  });

  it('すでに別のIDで登録されている発注先名と同名（重複）に変更しようとした場合、エラーをスローすること', async () => {
    // BP002: Ｂエンジニアリング が登録されている状態で BP001 を同名に更新
    await expect(
      service.updatePartner({ id: 'BP001', name: 'Ｂエンジニアリング' })
    ).rejects.toThrow('この発注先名はすでに登録されています。');

    // トリミング後重複も検出されること
    await expect(
      service.updatePartner({ id: 'BP001', name: ' 　Ｂエンジニアリング 　' })
    ).rejects.toThrow('この発注先名はすでに登録されています。');
  });

  it('自分自身が現在登録している名前と同じ名前に変更（維持）しようとした場合は重複エラーにならず、正常に更新できること', async () => {
    await expect(
      service.updatePartner({ id: 'BP001', name: 'Ａソフトウェア' })
    ).resolves.not.toThrow();

    // トリミング後に自分と同じになる場合も許可されること
    await expect(
      service.updatePartner({ id: 'BP001', name: '  Ａソフトウェア  ' })
    ).resolves.not.toThrow();
  });
});
