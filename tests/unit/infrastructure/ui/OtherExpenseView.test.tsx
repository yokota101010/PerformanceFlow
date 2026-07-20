import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OtherExpenseView } from '../../../../src/infrastructure/ui/OtherExpenseView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { OtherExpense } from '../../../../src/domain/models/OtherExpense';
import { InMemoryOtherExpenseRepository } from '../../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository';

describe('OtherExpenseView (US1)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    
    // WK001 に対するテスト用その他経費データをインメモリリポジトリに登録
    const expenseRepo = new InMemoryOtherExpenseRepository();
    expenseRepo.save(new OtherExpense({ caseAssignmentId: 'WK001', lineNo: 1, amount: 50000, memo: '旅費交通費' }));
    expenseRepo.save(new OtherExpense({ caseAssignmentId: 'WK001', lineNo: 2, amount: 12000, memo: '会議費' }));
    RepositoryRegistry.registerOtherExpenseRepository(expenseRepo);
  });

  it('指定した作業契約IDに対して、経費一覧と合計金額が表示されること', async () => {
    render(<OtherExpenseView initialCaseAssignmentId="WK001" />);

    // ロード完了とテキストの表示を待機
    await waitFor(() => {
      expect(screen.getAllByText((content) => content.includes('旅費交通費')).length).toBeGreaterThan(0);
      expect(screen.getAllByText((content) => content.includes('会議費')).length).toBeGreaterThan(0);
    });

    // 金額や合計経費の確認
    expect(screen.getAllByText((content) => content.includes('50,000')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('12,000')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('62,000')).length).toBeGreaterThan(0);
  });
});
