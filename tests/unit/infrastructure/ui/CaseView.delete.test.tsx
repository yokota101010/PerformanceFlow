import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaseView } from '../../../../src/infrastructure/ui/CaseView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { InMemoryCaseAssignmentRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { LocalStorageProjectRepository } from '../../../../src/infrastructure/persistence/LocalStorageProjectRepository';

describe('CaseView (案件削除フロー)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseRepository(new InMemoryCaseRepository());
    RepositoryRegistry.registerCaseAssignmentRepository(new InMemoryCaseAssignmentRepository());
    
    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);

    // confirm ダイアログをモック
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('アサイン実績がある案件の削除を試みると、削除制限の警告エラーメッセージが画面に表示されること', async () => {
    render(<CaseView />);

    // シード AJ001 の削除ボタンをクリック
    const deleteBtns = await screen.findAllByRole('button', { name: '削除' });
    fireEvent.click(deleteBtns[0]);

    // confirm が呼ばれたか確認
    expect(window.confirm).toHaveBeenCalled();

    // エラーメッセージが描画されることを確認
    const errorAlert = await screen.findByText('この案件はアサイン実績（案件作業明細）から参照されているため削除できません。');
    expect(errorAlert).toBeInTheDocument();
  });
});
