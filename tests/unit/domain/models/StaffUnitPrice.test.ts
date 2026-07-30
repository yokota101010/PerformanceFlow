import { describe, it, expect } from 'vitest';
import { StaffUnitPrice } from '../../../../src/domain/models/StaffUnitPrice';

describe('StaffUnitPrice (期間別要員単価集約モデル)', () => {
  it('適用開始年月と単価を設定したとき、終了年月が自動補完され期間内ルックアップで正しく単価が取得できること', () => {
    const entity = new StaffUnitPrice('SUP001', 'MEM001', [
      { unitPriceId: 'SUP001', startYearMonth: '2026-04', price: 1000000 },
      { unitPriceId: 'SUP001', startYearMonth: '2026-10', price: 1050000 },
    ]);

    expect(entity.monthlyPrices).toHaveLength(2);
    expect(entity.monthlyPrices[0].endYearMonth).toBe('2026-09');
    expect(entity.monthlyPrices[1].endYearMonth).toBe('9999-12');

    // 期間ルックアップの検証
    expect(entity.getPriceForMonth('2026-03')).toBe(0);
    expect(entity.getPriceForMonth('2026-04')).toBe(1000000);
    expect(entity.getPriceForMonth('2026-08')).toBe(1000000);
    expect(entity.getPriceForMonth('2026-09')).toBe(1000000);
    expect(entity.getPriceForMonth('2026-10')).toBe(1050000);
    expect(entity.getPriceForMonth('2027-01')).toBe(1050000);
  });
});
