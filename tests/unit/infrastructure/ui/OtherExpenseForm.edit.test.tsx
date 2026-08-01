import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OtherExpenseForm } from '../../../../src/infrastructure/ui/OtherExpenseForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryOtherExpenseRepository } from '../../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository';
import { OtherExpense } from '../../../../src/domain/models/OtherExpense';

describe('OtherExpenseForm.edit (US3)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerOtherExpenseRepository(new InMemoryOtherExpenseRepository());
  });

  it('編集モードでフォームをレンダリングし、初期値が入力されており、更新保存ができること', async () => {
    const handleSuccess = vi.fn();
    const handleCancel = vi.fn();

    const existingItem = new OtherExpense({
      caseAssignmentId: 'CON001',
      lineNo: 1,
      amount: 15000,
      memo: '開発環境クラウド利用料'
    });
    await RepositoryRegistry.getOtherExpenseRepository().save(existingItem);

    render(
      <OtherExpenseForm
        caseAssignmentId="CON001"
        editingItem={existingItem}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );

    const amountInput = screen.getByLabelText('金額 (円)') as HTMLInputElement;
    const memoInput = screen.getByLabelText('摘要') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: '保存' });

    // 初期値の確認
    expect(amountInput.value).toBe('15000');
    expect(memoInput.value).toBe('開発環境クラウド利用料');

    // 編集入力
    fireEvent.change(amountInput, { target: { value: '18000' } });
    fireEvent.change(memoInput, { target: { value: '開発環境クラウド利用料（拡張）' } });

    // 保存実行
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });

    const repo = RepositoryRegistry.getOtherExpenseRepository();
    const updated = await repo.findByKeys('CON001', 1);
    expect(updated).toBeDefined();
    expect(updated?.amount).toBe(18000);
    expect(updated?.memo).toBe('開発環境クラウド利用料（拡張）');

  });
});
