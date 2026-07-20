import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OtherExpenseForm } from '../../../../src/infrastructure/ui/OtherExpenseForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryOtherExpenseRepository } from '../../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository';

describe('OtherExpenseForm (US2)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerOtherExpenseRepository(new InMemoryOtherExpenseRepository());
  });

  it('新規登録モードでフォームをレンダリングし、有効な入力値を送信すると成功すること', async () => {
    const handleSuccess = vi.fn();
    const handleCancel = vi.fn();

    render(
      <OtherExpenseForm
        caseAssignmentId="WK001"
        editingItem={null}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );

    // 要素の存在確認
    const amountInput = screen.getByLabelText('金額 (円)');
    const memoInput = screen.getByLabelText('摘要');
    const submitButton = screen.getByRole('button', { name: '登録' });

    // 値の入力
    fireEvent.change(amountInput, { target: { value: '8000' } });
    fireEvent.change(memoInput, { target: { value: '宅急便代' } });

    // 送信
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });

    const repo = RepositoryRegistry.getOtherExpenseRepository();
    const list = await repo.findByCaseAssignmentId('WK001');
    // シード2件 + 追加1件 = 3件
    expect(list.length).toBe(3);
    expect(list.some(x => x.amount === 8000 && x.memo === '宅急便代')).toBe(true);
  });

  it('マイナスの金額を入力した際にエラーが表示され、登録がブロックされること', async () => {
    const handleSuccess = vi.fn();
    const handleCancel = vi.fn();

    render(
      <OtherExpenseForm
        caseAssignmentId="WK001"
        editingItem={null}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );

    const amountInput = screen.getByLabelText('金額 (円)');
    const submitButton = screen.getByRole('button', { name: '登録' });

    // 負数（マイナス）の入力
    fireEvent.change(amountInput, { target: { value: '-500' } });

    // 登録ボタンのクリック
    fireEvent.click(submitButton);

    // エラーメッセージの表示確認
    await waitFor(() => {
      expect(screen.getByText('金額は0以上の整数でなければなりません。')).toBeInTheDocument();
    });

    expect(handleSuccess).not.toHaveBeenCalled();
  });
});
