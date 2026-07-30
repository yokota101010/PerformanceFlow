import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmployeeForm } from '../../../../src/infrastructure/ui/EmployeeForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryEmployeeRepository } from '../../../../src/infrastructure/persistence/InMemoryEmployeeRepository';

describe('EmployeeForm (社員登録フォーム)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerEmployeeRepository(new InMemoryEmployeeRepository());
  });

  it('正しい名前を入力して登録ボタンを押すと、登録に成功して onSuccess コールバックが呼ばれること', async () => {
    const handleSuccess = vi.fn();
    render(<EmployeeForm onSuccess={handleSuccess} />);

    const nameInput = screen.getByLabelText('社員名');
    const submitButton = screen.getByRole('button', { name: '登録' });

    fireEvent.change(nameInput, { target: { value: 'デミ・ハリス' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });

    // フォームがクリアされていること
    expect(nameInput).toHaveValue('');
  });

  it('空のまま、またはスペースのみ入力して登録ボタンを押すと、必須エラーメッセージが表示されること', async () => {
    render(<EmployeeForm onSuccess={vi.fn()} />);

    const nameInput = screen.getByLabelText('社員名');
    const submitButton = screen.getByRole('button', { name: '登録' });

    // 空名で送信
    fireEvent.change(nameInput, { target: { value: ' 　 ' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText('社員名は必須です。');
    expect(errorMessage).toBeInTheDocument();
  });
});
