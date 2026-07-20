import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OtherExpenseView } from '../../../../src/infrastructure/ui/OtherExpenseView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { OtherExpense } from '../../../../src/domain/models/OtherExpense';
import { InMemoryOtherExpenseRepository } from '../../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository';

describe('OtherExpenseView.delete (US4)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();

    const expenseRepo = new InMemoryOtherExpenseRepository();
    expenseRepo.save(new OtherExpense({ caseAssignmentId: 'WK001', lineNo: 1, amount: 50000, memo: '旅費交通費' }));
    expenseRepo.save(new OtherExpense({ caseAssignmentId: 'WK001', lineNo: 2, amount: 12000, memo: '会議費' }));
    RepositoryRegistry.registerOtherExpenseRepository(expenseRepo);
  });

  it('削除ボタンを押下し、確認ダイアログで承諾した際、レコードが物理削除されること', async () => {
    // confirm のモック化 (常に true)
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { container } = render(<OtherExpenseView initialCaseAssignmentId="WK001" />);

    // 削除前のデータ存在確認
    await waitFor(() => {
      expect(screen.getAllByText((content) => content.includes('会議費')).length).toBeGreaterThan(0);
    });

    const deleteBtn = container.querySelector('#delete-expense-2-btn');
    if (!deleteBtn) throw new Error('Delete button not found');
    fireEvent.click(deleteBtn);

    // confirm が呼び出されたか検証
    expect(confirmMock).toHaveBeenCalledWith('この経費明細を削除しますか？');

    // 画面一覧から削除されたか検証
    await waitFor(() => {
      expect(screen.queryByText('会議費')).toBeNull();
    });

    // 合計値が 62,000円 から 50,000円 に減算されたか検証
    expect(screen.getAllByText((content) => content.includes('50,000')).length).toBeGreaterThan(0);
    expect(screen.queryByText('62,000')).toBeNull();

    confirmMock.mockRestore();
  });
});
