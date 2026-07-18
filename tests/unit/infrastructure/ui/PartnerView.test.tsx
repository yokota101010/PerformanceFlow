import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerView } from '../../../../src/infrastructure/ui/PartnerView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';

describe('PartnerView (発注先一覧画面)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
  });

  it('初期読み込み時に発注先一覧がテーブル表示され、シードデータが一覧に表示されること', async () => {
    render(<PartnerView />);

    const cell1 = await screen.findByText('Ａソフトウェア');
    expect(cell1).toBeInTheDocument();

    const cell2 = screen.getByText('Ｂエンジニアリング');
    expect(cell2).toBeInTheDocument();

    const id1 = screen.getByText('BP001');
    expect(id1).toBeInTheDocument();
  });
});
