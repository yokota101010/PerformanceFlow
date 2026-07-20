import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { OtherExpenseService } from '../../../src/application/services/OtherExpenseService';

describe('OtherExpenseService.delete (US4)', () => {
  const service = new OtherExpenseService();

  beforeEach(() => {
    RepositoryRegistry.clear();
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
