import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectForm } from '../../../../src/infrastructure/ui/ProjectForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryProjectRepository } from '../../../../src/infrastructure/persistence/InMemoryProjectRepository';
import { Project } from '../../../../src/domain/models';

describe('ProjectForm (編集モード)', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const testProject = { id: 'PJ002', name: '新規製品開発プロジェクト' };

  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerProjectRepository(new InMemoryProjectRepository());
    mockOnSuccess.mockClear();
    mockOnCancel.mockClear();

    const repo = RepositoryRegistry.getProjectRepository();
    await repo.save(new Project(testProject.id, testProject.name));
  });

  it('編集対象プロジェクトが渡されたとき、初期値がフォームに入力されていること', () => {
    render(
      <ProjectForm
        onSuccess={mockOnSuccess}
        projectToEdit={testProject}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByLabelText('プロジェクト名') as HTMLInputElement;
    expect(input.value).toBe('新規製品開発プロジェクト');
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('名称を編集して保存を押すと、更新に成功して onSuccess が呼ばれること', async () => {
    render(
      <ProjectForm
        onSuccess={mockOnSuccess}
        projectToEdit={testProject}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByLabelText('プロジェクト名');
    const submitBtn = screen.getByRole('button', { name: '保存' });

    await userEvent.clear(input);
    await userEvent.type(input, '名前変更テスト');
    await userEvent.click(submitBtn);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('他の登録済みプロジェクトと重複する名称で保存しようとすると、重複エラーメッセージが表示されること', async () => {
    render(
      <ProjectForm
        onSuccess={mockOnSuccess}
        projectToEdit={testProject}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByLabelText('プロジェクト名');
    const submitBtn = screen.getByRole('button', { name: '保存' });

    await userEvent.clear(input);
    await userEvent.type(input, '次世代基幹システム開発プロジェクト');
    await userEvent.click(submitBtn);

    const errorMsg = await screen.findByRole('alert');
    expect(errorMsg).toHaveTextContent('既に登録されています。');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('キャンセルボタンを押すと onCancel コールバックが呼ばれること', async () => {
    render(
      <ProjectForm
        onSuccess={mockOnSuccess}
        projectToEdit={testProject}
        onCancel={mockOnCancel}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'キャンセル' });
    await userEvent.click(cancelBtn);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
