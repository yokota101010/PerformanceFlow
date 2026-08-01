import React, { useEffect, useState } from 'react';
import {
  MonthlyMemberWorkHoursSummaryUseCase,
  MonthlyMemberWorkHoursSummaryDTO
} from '../../application/usecases/MonthlyMemberWorkHoursSummaryUseCase';

interface Props {
  useCase: MonthlyMemberWorkHoursSummaryUseCase;
}

export interface HalfYearPeriod {
  id: string; // 例: "2026-H1"
  label: string; // 例: "2026年度 上半期 (2026/04 ～ 2026/09)"
  months: string[]; // 6要素: ['2026-04-01', '2026-05-01', '2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01']
}

/**
 * データの年月情報等から半期（6か月単位）の選択肢を生成する関数
 */
export function generateHalfYearPeriods(dataMonths: string[]): HalfYearPeriod[] {
  const yearSet = new Set<number>([2025, 2026, 2027]);
  for (const m of dataMonths) {
    if (!m) continue;
    const parts = m.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      if (!isNaN(year) && !isNaN(month)) {
        const fiscalYear = month <= 3 ? year - 1 : year;
        yearSet.add(fiscalYear);
        yearSet.add(fiscalYear - 1);
        yearSet.add(fiscalYear + 1);
      }
    }
  }

  const sortedYears = Array.from(yearSet).sort((a, b) => a - b);
  const periods: HalfYearPeriod[] = [];

  for (const fy of sortedYears) {
    const fyStr = String(fy);
    const nextFyStr = String(fy + 1);

    // 上半期 (H1): 4月〜9月
    const h1Months = [
      `${fyStr}-04-01`,
      `${fyStr}-05-01`,
      `${fyStr}-06-01`,
      `${fyStr}-07-01`,
      `${fyStr}-08-01`,
      `${fyStr}-09-01`,
    ];
    periods.push({
      id: `${fyStr}-H1`,
      label: `${fyStr}年度 上半期 (${fyStr}/04 ～ ${fyStr}/09)`,
      months: h1Months,
    });

    // 下半期 (H2): 10月〜翌3月
    const h2Months = [
      `${fyStr}-10-01`,
      `${fyStr}-11-01`,
      `${fyStr}-12-01`,
      `${nextFyStr}-01-01`,
      `${nextFyStr}-02-01`,
      `${nextFyStr}-03-01`,
    ];
    periods.push({
      id: `${fyStr}-H2`,
      label: `${fyStr}年度 下半期 (${fyStr}/10 ～ ${nextFyStr}/03)`,
      months: h2Months,
    });
  }

  return periods;
}

export const MonthlyMemberWorkHoursSummaryView: React.FC<Props> = ({ useCase }) => {
  const [data, setData] = useState<MonthlyMemberWorkHoursSummaryDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await useCase.execute();
        if (active) {
          setData(res);
          setError(null);

          // 半期期間リストを生成
          const periods = generateHalfYearPeriods(res.months || []);
          let bestPeriodId = periods[0]?.id || '2026-H1';
          let maxMatchCount = -1;

          for (const period of periods) {
            const matchCount = (res.months || []).filter((m) =>
              period.months.some((pm) => pm.slice(0, 7) === m.slice(0, 7))
            ).length;
            if (matchCount > maxMatchCount) {
              maxMatchCount = matchCount;
              bestPeriodId = period.id;
            }
          }

          setSelectedPeriodId(bestPeriodId);
        }
      } catch (err: any) {
        if (active) {
          console.error(err);
          setError('データの読み込みに失敗しました。');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [useCase]);

  // 年月の表示フォーマット（例: 2026-08-01 -> 2026年08月）
  const formatMonth = (monthStr: string): string => {
    try {
      const parts = monthStr.split('-');
      if (parts.length >= 2) {
        return `${parts[0]}年${parts[1]}月`;
      }
      return monthStr;
    } catch {
      return monthStr;
    }
  };

  const getEffortForMonth = (efforts: Record<string, number>, targetMonth: string): number => {
    if (efforts[targetMonth] !== undefined) {
      return efforts[targetMonth];
    }
    const yyyyMM = targetMonth.slice(0, 7);
    for (const key of Object.keys(efforts)) {
      if (key.startsWith(yyyyMM)) {
        return efforts[key];
      }
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
        <span className="ml-3 text-slate-400">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error">
        {error}
      </div>
    );
  }

  const periods = generateHalfYearPeriods(data?.months || []);
  const currentPeriod = periods.find((p) => p.id === selectedPeriodId) || periods[0];
  const displayedMonths = currentPeriod ? currentPeriod.months : [];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="page-header">
        <h2 className="page-title">要員別工数サマリ</h2>
        <p className="page-subtitle">
          パートナー要員の半期（6か月）単位の合計発注工数および稼働アサイン状況の一覧です。
        </p>
      </div>

      {/* 半期選択プルダウンフォーム */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label htmlFor="half-year-select" style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap' }}>
          表示対象半期:
        </label>
        <select
          id="half-year-select"
          value={selectedPeriodId}
          onChange={(e) => setSelectedPeriodId(e.target.value)}
          className="form-select"
          style={{ maxWidth: '360px' }}
        >
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      {/* マトリクスグリッドテーブル */}
      <div className="glass-panel overflow-hidden" style={{ padding: 0 }}>
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>要員名</th>
                <th>所属会社</th>
                {displayedMonths.map((month) => (
                  <th
                    key={month}
                    style={{ textAlign: 'center' }}
                  >
                    {formatMonth(month)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((row) => (
                <tr key={row.staffId}>
                  <td style={{ fontWeight: 500, color: '#f8fafc' }}>
                    {row.staffName}
                  </td>
                  <td style={{ color: '#cbd5e1' }}>
                    {row.companyName}
                  </td>
                  {displayedMonths.map((month) => {
                    const effort = getEffortForMonth(row.efforts, month);
                    const isOver = effort > 1.0;

                    return (
                      <td
                        key={month}
                        style={{ textAlign: 'center', fontFamily: 'monospace' }}
                      >
                        <span
                          className={isOver ? 'text-red-600 font-bold' : ''}
                          style={{
                            color: isOver ? '#f87171' : '#f8fafc',
                            fontWeight: isOver ? 700 : 500,
                          }}
                        >
                          {isOver && <span className="mr-1">⚠</span>}
                          {effort.toFixed(1)}人月
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {(!data || data.rows.length === 0) && (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    表示対象の工数データがありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
