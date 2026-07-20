import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { OtherExpenseService } from '../../../src/application/services/OtherExpenseService';

describe('OtherExpenseService.list (US1)', () => {
  const service = new OtherExpenseService();

  beforeEach(() => {
    RepositoryRegistry.clear();
  });

  it('初期ロード時、指定の作業契約IDに紐づく経費一覧と合計金額が正しく取得できること', async () => {
    // WK001の検証 (シードデータ: 50,000円、12,000円)
    const listWK001 = await service.getOtherExpenses('WK001');
    expect(listWK001.length).toBe(2);
    expect(listWK001.some(x => x.lineNo === 1 && x.amount === 50000 && x.memo === '旅費交通費')).toBe(true);
    expect(listWK001.some(x => x.lineNo === 2 && x.amount === 12000 && x.memo === '会議費')).toBe(true);

    const repo = RepositoryRegistry.getOtherExpenseRepository();
    const sumWK001 = await repo.sumByCaseAssignmentId('PJ001', 'WK001');
    expect(sumWK001).toBe(62000);

    // WK002の検証 (シードデータ: 35,000円)
    const listWK002 = await service.getOtherExpenses('WK002');
    expect(listWK002.length).toBe(1);
    expect(listWK002[0].lineNo).toBe(1);
    expect(listWK002[0].amount).toBe(35000);
    expect(listWK002[0].memo).toBe('消耗品費');

    const sumWK002 = await repo.sumByCaseAssignmentId('PJ001', 'WK002');
    expect(sumWK002).toBe(35000);
  });

  it('経費が存在しない作業契約IDを指定したとき、空のリストと合計0円が返ること', async () => {
    const listWK003 = await service.getOtherExpenses('WK003');
    expect(listWK003.length).toBe(0);

    const repo = RepositoryRegistry.getOtherExpenseRepository();
    const sumWK003 = await repo.sumByCaseAssignmentId('PJ001', 'WK003');
    expect(sumWK003).toBe(0);
  });
});
