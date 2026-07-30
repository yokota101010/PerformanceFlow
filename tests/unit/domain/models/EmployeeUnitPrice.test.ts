import { describe, it, expect } from 'vitest';
import { EmployeeUnitPrice } from '../../../../src/domain/models/EmployeeUnitPrice';

describe('EmployeeUnitPrice (期間別単価集約モデル)', () => {
  it('適用開始年月と単価を設定したとき、終了年月が自動補完され期間内ルックアップで正しく単価が取得できること', () => {
    const entity = new EmployeeUnitPrice('EUP001', 'EMP001', [
      { unitPriceId: 'EUP001', startYearMonth: '2026-04', price: 10000 },
      { unitPriceId: 'EUP001', startYearMonth: '2026-10', price: 11000 },
    ]);

    expect(entity.monthlyPrices).toHaveLength(2);
    // 1行目の終了年月が直前の月 (2026-09) に自動算出されていること
    expect(entity.monthlyPrices[0].endYearMonth).toBe('2026-09');
    // 2行目の終了年月が 9999-12 (無期限継続) に自動算出されていること
    expect(entity.monthlyPrices[1].endYearMonth).toBe('9999-12');

    // 期間ルックアップの検証
    // 開始前
    expect(entity.getPriceForMonth('2026-03')).toBe(0);
    // 最初の適用期間 (2026-04 〜 2026-09)
    expect(entity.getPriceForMonth('2026-04')).toBe(10000);
    expect(entity.getPriceForMonth('2026-08')).toBe(10000);
    expect(entity.getPriceForMonth('2026-09')).toBe(10000);
    // 改定後の適用期間 (2026-10 〜)
    expect(entity.getPriceForMonth('2026-10')).toBe(11000);
    expect(entity.getPriceForMonth('2027-05')).toBe(11000);
  });
});
