import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CaseAssignmentView } from '../../../../src/infrastructure/ui/CaseAssignmentView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseAssignmentRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { LocalStorageProjectRepository } from '../../../../src/infrastructure/persistence/LocalStorageProjectRepository';
import { InMemoryCaseRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { InMemoryOtherExpenseRepository } from '../../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository';

describe('CaseAssignmentView (アサイン契約一覧画面)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseAssignmentRepository(new InMemoryCaseAssignmentRepository());
    
    // その他経費のシード設定
    const expenseRepo = new InMemoryOtherExpenseRepository();
    expenseRepo.setSum('PJ001', 'WK001', 62000);
    expenseRepo.setSum('PJ001', 'WK002', 35000);
    RepositoryRegistry.registerOtherExpenseRepository(expenseRepo);

    // プロジェクトおよび案件のモックマスタ登録
    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);

    const caseRepo = new InMemoryCaseRepository();
    RepositoryRegistry.registerCaseRepository(caseRepo);
  });

  it('初期読み込み時にアサイン契約一覧がテーブル表示され、シードデータが一覧に表示されること', async () => {
    render(<CaseAssignmentView />);

    // タイトルまたはテーブルヘッダーが表示されていることを確認
    const headerTitle = screen.getByRole('heading', { name: '案件作業契約（アサイン明細）管理' });
    expect(headerTitle).toBeInTheDocument();

    // WK001, WK002, WK003, WK004 のアサインIDがレンダリングされていることを確認
    expect(await screen.findByText('WK001')).toBeInTheDocument();
    expect(screen.getByText('WK002')).toBeInTheDocument();
    expect(screen.getByText('WK003')).toBeInTheDocument();
    expect(screen.getByText('WK004')).toBeInTheDocument();

    // 金額や計算された粗利率（例: 0.34 や -0.78）が画面に出ていることを確認
    expect(screen.getByText('34%')).toBeInTheDocument();
    expect(screen.getAllByText('-78%')).toHaveLength(2);
  });
});
