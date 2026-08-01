import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { OtherExpenseService } from '../../../src/application/services/OtherExpenseService';

describe('OtherExpenseService.delete (US4)', () => {
  const service = new OtherExpenseService();

  beforeEach(async () => {
    RepositoryRegistry.clear();
    const expenseRepo = new (await import('../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository')).InMemoryOtherExpenseRepository();
    const { OtherExpense } = await import('../../../src/domain/models/OtherExpense');
    await expenseRepo.save(new OtherExpense({ caseAssignmentId: 'WK001', lineNo: 1, amount: 50000, memo: '出張旅費' }));
    await expenseRepo.save(new OtherExpense({ caseAssignmentId: 'WK001', lineNo: 2, amount: 12000, memo: '会議費' }));
    RepositoryRegistry.registerOtherExpenseRepository(expenseRepo);
  });

  it('指定したその他経費レコードが物理削除されること', async () => {
    const listBefore = await service.getOtherExpenses('WK001');
    expect(listBefore.length).toBe(2);

    // 削除の実行 (WK001, lineNo: 2)
    await service.deleteOtherExpense('WK001', 2);

    const listAfter = await service.getOtherExpenses('WK001');
    expect(listAfter.length).toBe(1);
    expect(listAfter.some(x => x.lineNo === 2)).toBe(false);

    // リポジトリ上でも null になることを検証
    const repo = RepositoryRegistry.getOtherExpenseRepository();
    const deleted = await repo.findByKeys('WK001', 2);
    expect(deleted).toBeNull();
  });
});
