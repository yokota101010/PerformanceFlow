import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PartnerForm } from '../../../../src/infrastructure/ui/PartnerForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';

describe('PartnerForm (登録フォーム)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
  });

  it('正しい名前を入力して登録ボタンを押すと、登録に成功して onSuccess コールバックが呼ばれること', async () => {
    const handleSuccess = vi.fn();
    render(<PartnerForm onSuccess={handleSuccess} />);

    const nameInput = screen.getByLabelText('発注先名');
    const submitButton = screen.getByRole('button', { name: '登録' });

    fireEvent.change(nameInput, { target: { value: 'Ｃシステムズ' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });

    // フォームがクリアされていること
    expect(nameInput).toHaveValue('');
  });

  it('空のまま、またはスペースのみ入力して登録ボタンを押すと、必須エラーメッセージが表示されること', async () => {
    render(<PartnerForm onSuccess={vi.fn()} />);

    const nameInput = screen.getByLabelText('発注先名');
    const submitButton = screen.getByRole('button', { name: '登録' });

    // 空名で送信
    fireEvent.change(nameInput, { target: { value: ' 　 ' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText('発注先名は必須です。');
    expect(errorMessage).toBeInTheDocument();
  });

  it('登録済みの重複する発注先名を入力して登録ボタンを押すと、重複エラーメッセージが表示されること', async () => {
    render(<PartnerForm onSuccess={vi.fn()} />);

    const nameInput = screen.getByLabelText('発注先名');
    const submitButton = screen.getByRole('button', { name: '登録' });

    fireEvent.change(nameInput, { target: { value: 'Ａソフトウェア' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText('この発注先名はすでに登録されています。');
    expect(errorMessage).toBeInTheDocument();
  });
});
