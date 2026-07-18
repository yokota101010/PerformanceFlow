import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectView } from '../../../../src/infrastructure/ui/ProjectView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { Project } from '../../../../src/domain/models';
import React from 'react';

describe('ProjectView (削除操作統合)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();

    // 削除テスト用の追加プロジェクトをセットアップ
    const repo = RepositoryRegistry.getProjectRepository();
    await repo.save(new Project('PJ002', '新規製品開発プロジェクト'));

    // window.confirm をモックし、常に true (OK) を返すように設定
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('案件が紐づいていないプロジェクトの削除ボタンを押し、確認ダイアログでOKを押すと一覧から消えること', async () => {
    render(<ProjectView />);

    // 初期表示確認
    const pj2Text = await screen.findByText('新規製品開発プロジェクト');
    expect(pj2Text).toBeInTheDocument();

    // PJ002 の行にある削除ボタンをクリック
    const rows = screen.getAllByRole('row');
    // rows[0] はヘッダー, rows[1] は PJ001, rows[2] は PJ002
    const pj2Row = rows[2];
    const deleteBtn = pj2Row.querySelector('button[name="delete-btn"]') as HTMLButtonElement;
    expect(deleteBtn).toBeInTheDocument();

    await userEvent.click(deleteBtn);

    // confirm が呼ばれたことを確認
    expect(window.confirm).toHaveBeenCalledWith('プロジェクト「新規製品開発プロジェクト」を削除しますか？');

    // 一覧から消滅したことを確認
    await waitFor(() => {
      expect(screen.queryByText('新規製品開発プロジェクト')).not.toBeInTheDocument();
    });
  });

  it('案件が紐づいているプロジェクト (PJ001) の削除を試みると、エラーメッセージが表示され削除されないこと', async () => {
    render(<ProjectView />);

    const pj1Text = await screen.findByText('次世代基幹システム開発プロジェクト');
    expect(pj1Text).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const pj1Row = rows[1];
    const deleteBtn = pj1Row.querySelector('button[name="delete-btn"]') as HTMLButtonElement;

    await userEvent.click(deleteBtn);

    // エラーメッセージが表示されることを確認
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('このプロジェクトには案件が登録されているため削除できません。');

    // リストには残っていること
    expect(screen.getByText('次世代基幹システム開発プロジェクト')).toBeInTheDocument();
  });
});
