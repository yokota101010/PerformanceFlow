import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CaseView } from '../../../../src/infrastructure/ui/CaseView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { LocalStorageProjectRepository } from '../../../../src/infrastructure/persistence/LocalStorageProjectRepository';

describe('CaseView (案件登録フロー)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseRepository(new InMemoryCaseRepository());
    
    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    await projectRepo.save(new Project('PJ002', 'プロジェクトB'));
    
    RepositoryRegistry.registerProjectRepository(projectRepo);
  });

  it('フォームに妥当な値を入力して登録ボタンをクリックすると、新規案件が正常に登録され、一覧に追加されること', async () => {
    render(<CaseView />);

    // まず新規登録フォームを表示するために、フォーム要素があるか確認します。
    // ※後ほど実装する CaseForm は CaseView 内にインラインで表示される想定です。
    // 親プロジェクト選択セレクトボックス
    const projectSelect = await screen.findByLabelText('親プロジェクト');
    expect(projectSelect).toBeInTheDocument();

    // 案件名入力
    const nameInput = screen.getByLabelText('案件名');
    const startInput = screen.getByLabelText('開始日');
    const endInput = screen.getByLabelText('終了日');
    const submitBtn = screen.getByRole('button', { name: '登録' });

    // 入力
    fireEvent.change(projectSelect, { target: { value: 'PJ001' } });
    fireEvent.change(nameInput, { target: { value: '新規登録UIテスト案件' } });
    fireEvent.change(startInput, { target: { value: '2026-10-01' } });
    fireEvent.change(endInput, { target: { value: '2026-12-31' } });

    // 登録実行
    fireEvent.click(submitBtn);

    // 一覧に追加されて表示されることを確認
    const newCase = await screen.findByText('新規登録UIテスト案件');
    expect(newCase).toBeInTheDocument();
  });

  it('同一プロジェクト内重複名や期間不正などのバリデーションエラーが発生した場合、画面に警告メッセージが表示されること', async () => {
    render(<CaseView />);

    const projectSelect = await screen.findByLabelText('親プロジェクト');
    const nameInput = screen.getByLabelText('案件名');
    const startInput = screen.getByLabelText('開始日');
    const endInput = screen.getByLabelText('終了日');
    const submitBtn = screen.getByRole('button', { name: '登録' });

    // PJ001 の既存重複案件名を入力
    fireEvent.change(projectSelect, { target: { value: 'PJ001' } });
    fireEvent.change(nameInput, { target: { value: '案件1: Ａソフト開発支援' } });
    fireEvent.change(startInput, { target: { value: '2026-10-01' } });
    fireEvent.change(endInput, { target: { value: '2026-12-31' } });

    fireEvent.click(submitBtn);

    // 重複エラー警告が表示されること
    const errorMsg = await screen.findByText('この案件名は同一プロジェクト内にすでに登録されています。');
    expect(errorMsg).toBeInTheDocument();
  });
});
