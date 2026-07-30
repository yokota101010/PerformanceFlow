import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CaseView } from '../../../../src/infrastructure/ui/CaseView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { LocalStorageProjectRepository } from '../../../../src/infrastructure/persistence/LocalStorageProjectRepository';

describe('CaseView (案件一覧画面)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseRepository(new InMemoryCaseRepository());
    // プロジェクトマスタから親プロジェクト名解決用にモックを設定
    // LocalStorageProjectRepository にシード PJ001 (Aシステム開発プロジェクト) が入っています
    RepositoryRegistry.registerProjectRepository(new LocalStorageProjectRepository());
  });

  it('初期読み込み時に案件一覧がテーブル表示され、シードデータおよびプロジェクト名が正しく表示されること', async () => {
    render(<CaseView />);

    // 案件名の表示確認 (domain-model.md 正本シード)
    const name1 = await screen.findByText('要件定義・設計フェーズ');
    expect(name1).toBeInTheDocument();

    const name2 = screen.getByText('開発・テストフェーズ');
    expect(name2).toBeInTheDocument();

    // プロジェクト名表示確認
    const projectNames = screen.getAllByText('基幹基盤システム刷新プロジェクト');
    expect(projectNames.length).toBeGreaterThanOrEqual(2);

    // 期間の表示確認
    const date1 = screen.getByText('2026-08-15 〜 2026-11-15');
    expect(date1).toBeInTheDocument();

    const date2 = screen.getByText('2026-10-13 〜 2027-01-31');
    expect(date2).toBeInTheDocument();
  });
});
