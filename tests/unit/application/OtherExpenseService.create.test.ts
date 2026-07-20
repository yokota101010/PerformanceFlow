import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { OtherExpenseService } from '../../../src/application/services/OtherExpenseService';

describe('OtherExpenseService.create (US2)', () => {
  const service = new OtherExpenseService();

  beforeEach(() => {
    RepositoryRegistry.clear();
  });

  it('有効なデータでその他経費を登録した際、自動採番された行Noで正しく保存されること', async () => {
    const listBefore = await service.getOtherExpenses('WK001');
    expect(listBefore.length).toBe(2); // シードは2件

    // 新規登録の実行
    await service.createOtherExpense({
      caseAssignmentId: 'WK001',
      amount: 15000,
      memo: 'タクシー代',
    });

    const listAfter = await service.getOtherExpenses('WK001');
    expect(listAfter.length).toBe(3);

    // 最大行No + 1 として 3 が採番されていることを確認
    const newExpense = listAfter.find(x => x.lineNo === 3);
    expect(newExpense).toBeDefined();
    expect(newExpense?.amount).toBe(15000);
    expect(newExpense?.memo).toBe('タクシー代');
  });

  it('存在しない作業契約IDを指定したとき、エラーがスローされること', async () => {
    await expect(
      service.createOtherExpense({
        caseAssignmentId: 'WK999', // 存在しない
        amount: 5000,
        memo: '不明な経費',
      })
    ).rejects.toThrow('指定された作業契約が存在しません。');
  });

  it('金額が負数（マイナス値）のとき、ドメインバリデーションによりエラーがスローされること', async () => {
    await expect(
      service.createOtherExpense({
        caseAssignmentId: 'WK001',
        amount: -100, // 負数
        memo: 'マイナス経費',
      })
    ).rejects.toThrow('金額は0以上の整数でなければなりません。');
  });

  it('摘要が空または100文字を超えるとき、ドメインバリデーションによりエラーがスローされること', async () => {
    await expect(
      service.createOtherExpense({
        caseAssignmentId: 'WK001',
        amount: 1000,
        memo: '', // 空
      })
    ).rejects.toThrow('摘要は必須項目です。');

    await expect(
      service.createOtherExpense({
        caseAssignmentId: 'WK001',
        amount: 1000,
        memo: 'a'.repeat(101), // 101文字
      })
    ).rejects.toThrow('摘要は100文字以内でなければなりません。');
  });
});
