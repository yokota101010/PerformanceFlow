import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CaseView } from '../../../../src/infrastructure/ui/CaseView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { LocalStorageProjectRepository } from '../../../../src/infrastructure/persistence/LocalStorageProjectRepository';

describe('CaseView (案件編集フロー)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseRepository(new InMemoryCaseRepository());
    
    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);
  });

  it('一覧の「編集」ボタンをクリックするとフォームに値が同期され、親プロジェクト選択が無効化され、保存クリックで更新されること', async () => {
    render(<CaseView />);

    // シードデータ「案件1: Ａソフト開発支援」(AJ001) の編集ボタンをクリック
    // 操作列内の最初の編集ボタンを探す
    const editBtns = await screen.findAllByRole('button', { name: '編集' });
    fireEvent.click(editBtns[0]);

    // フォームにデータがロードされていることを確認
    const nameInput = screen.getByLabelText('案件名') as HTMLInputElement;
    expect(nameInput.value).toBe('案件1: Ａソフト開発支援');

    // 親プロジェクト選択が非活性 (disabled) になっていることを確認
    const projectSelect = screen.getByLabelText('親プロジェクト') as HTMLSelectElement;
    expect(projectSelect.disabled).toBe(true);

    // 案件名を変更して保存
    fireEvent.change(nameInput, { target: { value: '案件1: Ａソフト開発支援 (編集後)' } });
    const saveBtn = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveBtn);

    // 一覧上のテキストが更新されていることを確認
    const updatedCell = await screen.findByText('案件1: Ａソフト開発支援 (編集後)');
    expect(updatedCell).toBeInTheDocument();
  });
});
