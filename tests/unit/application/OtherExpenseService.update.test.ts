import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { OtherExpenseService } from '../../../src/application/services/OtherExpenseService';

describe('OtherExpenseService.update (US3)', () => {
  const service = new OtherExpenseService();

  beforeEach(() => {
    RepositoryRegistry.clear();
  });

  it('登録済みのその他経費を正常なデータで更新できること', async () => {
    const listBefore = await service.getOtherExpenses('WK001');
    const target = listBefore.find(x => x.lineNo === 2);
    expect(target).toBeDefined();
    expect(target?.amount).toBe(12000);
    expect(target?.memo).toBe('会議費');

    // 更新の実行
    await service.updateOtherExpense({
      caseAssignmentId: 'WK001',
      lineNo: 2,
      amount: 15000,
      memo: '会議費（お弁当代込み）',
    });

    const listAfter = await service.getOtherExpenses('WK001');
    const updated = listAfter.find(x => x.lineNo === 2);
    expect(updated).toBeDefined();
    expect(updated?.amount).toBe(15000);
    expect(updated?.memo).toBe('会議費（お弁当代込み）');
  });

  it('存在しない行Noを指定して更新したとき、エラーがスローされること', async () => {
    await expect(
      service.updateOtherExpense({
        caseAssignmentId: 'WK001',
        lineNo: 999, // 存在しない
        amount: 2000,
        memo: 'ダミー',
      })
    ).rejects.toThrow('対象の経費データが存在しません。');
  });

  it('金額が負数（マイナス値）のとき、ドメインバリデーションによりエラーがスローされること', async () => {
    await expect(
      service.updateOtherExpense({
        caseAssignmentId: 'WK001',
        lineNo: 2,
        amount: -500, // 負数
        memo: '会議費',
      })
    ).rejects.toThrow('金額は0以上の整数でなければなりません。');
  });
});
