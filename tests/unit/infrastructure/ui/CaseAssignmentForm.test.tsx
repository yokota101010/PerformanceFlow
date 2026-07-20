import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CaseAssignmentView } from '../../../../src/infrastructure/ui/CaseAssignmentView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseAssignmentRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { LocalStorageProjectRepository } from '../../../../src/infrastructure/persistence/LocalStorageProjectRepository';
import { InMemoryCaseRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseRepository';

describe('CaseAssignmentForm (新規登録UI)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseAssignmentRepository(new InMemoryCaseAssignmentRepository());
    
    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    await projectRepo.save(new Project('PJ002', '新規社内ポータル開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);

    const caseRepo = new InMemoryCaseRepository();
    const { Case } = await import('../../../../src/domain/models');
    await caseRepo.save(new Case('PJ001', 'AJ001', '案件1: Ａソフト開発支援', '2026-08-15', '2026-11-15'));
    await caseRepo.save(new Case('PJ002', 'AJ001', '案件2: ポータル作成支援', '2026-09-01', '2026-09-30'));
    RepositoryRegistry.registerCaseRepository(caseRepo);
  });

  it('新規登録フォームに妥当な値を入力して登録すると、一覧テーブルに新しい明細が追加されること', async () => {
    render(<CaseAssignmentView />);

    // プロジェクトのロードを待機
    const projectSelect = await screen.findByLabelText('プロジェクト');
    await screen.findByText('新規社内ポータル開発プロジェクト');

    // プロジェクト「新規社内ポータル開発プロジェクト (PJ002)」を選択
    fireEvent.change(projectSelect, { target: { value: 'PJ002' } });

    // 案件選択肢のロードを待機
    await screen.findByText('案件2: ポータル作成支援');

    // 案件「案件2: ポータル作成支援 (AJ001)」を選択
    const caseSelect = screen.getByLabelText('案件');
    fireEvent.change(caseSelect, { target: { value: 'AJ001' } });

    // 開始日、工数、単価を入力
    fireEvent.change(screen.getByLabelText('開始日'), { target: { value: '2026-09-01' } });
    fireEvent.change(screen.getByLabelText('契約工数 (人月)'), { target: { value: '1.5' } });
    fireEvent.change(screen.getByLabelText('契約単価 (円)'), { target: { value: '600000' } });

    // 登録ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    // 新規登録された WK001 がテーブル上にレンダリングされることを確認
    const newId = await screen.findByText('WK001');
    expect(newId).toBeInTheDocument();
  });

  it('バリデーションエラーが発生した場合、画面にエラーメッセージが描画されること', async () => {
    render(<CaseAssignmentView />);

    // プロジェクトのロードを待機
    const projectSelect = await screen.findByLabelText('プロジェクト');
    await screen.findByText('新規社内ポータル開発プロジェクト');

    // プロジェクト PJ002 を選択
    fireEvent.change(projectSelect, { target: { value: 'PJ002' } });

    // 案件選択肢のロードを待機
    await screen.findByText('案件2: ポータル作成支援');

    fireEvent.change(screen.getByLabelText('案件'), { target: { value: 'AJ001' } });

    // 隙間がある開始日（例: 案件開始日は 2026-09-01 だが、2026-09-10 と入力）を指定
    fireEvent.change(screen.getByLabelText('開始日'), { target: { value: '2026-09-10' } });
    fireEvent.change(screen.getByLabelText('契約工数 (人月)'), { target: { value: '1.0' } });
    fireEvent.change(screen.getByLabelText('契約単価 (円)'), { target: { value: '500000' } });

    // 登録実行
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    // エラーメッセージが表示されることを確認
    const errorAlert = await screen.findByText('案件の全期間をカバーするように明細を登録してください（隙間が存在します）。');
    expect(errorAlert).toBeInTheDocument();
  });
});
