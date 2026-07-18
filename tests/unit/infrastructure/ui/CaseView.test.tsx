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

    // 案件名の表示確認
    const name1 = await screen.findByText('案件1: Ａソフト開発支援');
    expect(name1).toBeInTheDocument();

    const name2 = screen.getByText('案件2: Ｂエンジニアリング開発支援');
    expect(name2).toBeInTheDocument();

    // プロジェクト名表示確認
    const projectNames = screen.getAllByText('次世代基幹システム開発プロジェクト');
    expect(projectNames.length).toBeGreaterThanOrEqual(2);

    // 期間の表示確認
    const date1 = screen.getByText('2026-08-15 〜 2026-11-15');
    expect(date1).toBeInTheDocument();

    const date2 = screen.getByText('2026-09-13 〜 2026-10-31');
    expect(date2).toBeInTheDocument();
  });
});
