import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectForm } from '../../../../src/infrastructure/ui/ProjectForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import React from 'react';

describe('ProjectForm (登録フォーム)', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    RepositoryRegistry.clear();
    mockOnSuccess.mockClear();
  });

  it('正しい名前を入力して登録ボタンを押すと、登録に成功して onSuccess コールバックが呼ばれること', async () => {
    render(<ProjectForm onSuccess={mockOnSuccess} />);

    const input = screen.getByLabelText('プロジェクト名');
    const submitBtn = screen.getByRole('button', { name: '登録' });

    await userEvent.type(input, '新規登録テストプロジェクト');
    await userEvent.click(submitBtn);

    // 成功時、エラーテキストがないこと
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('空のまま、またはスペースのみ入力して登録ボタンを押すと、必須エラーメッセージが表示されること', async () => {
    render(<ProjectForm onSuccess={mockOnSuccess} />);

    const submitBtn = screen.getByRole('button', { name: '登録' });
    await userEvent.click(submitBtn);

    const errorMsg = await screen.findByRole('alert');
    expect(errorMsg).toHaveTextContent('プロジェクト名は必須です。');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('登録済みの重複するプロジェクト名を入力して登録ボタンを押すと、重複エラーメッセージが表示されること', async () => {
    render(<ProjectForm onSuccess={mockOnSuccess} />);

    const input = screen.getByLabelText('プロジェクト名');
    const submitBtn = screen.getByRole('button', { name: '登録' });

    // 既に存在するシード名を入力
    await userEvent.type(input, '次世代基幹システム開発プロジェクト');
    await userEvent.click(submitBtn);

    const errorMsg = await screen.findByRole('alert');
    expect(errorMsg).toHaveTextContent('既に登録されています。');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
