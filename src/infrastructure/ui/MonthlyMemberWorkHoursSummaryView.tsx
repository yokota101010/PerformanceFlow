import React, { useEffect, useState } from 'react';
import {
  MonthlyMemberWorkHoursSummaryUseCase,
  MonthlyMemberWorkHoursSummaryDTO
} from '../../application/usecases/MonthlyMemberWorkHoursSummaryUseCase';

interface Props {
  useCase: MonthlyMemberWorkHoursSummaryUseCase;
}

export const MonthlyMemberWorkHoursSummaryView: React.FC<Props> = ({ useCase }) => {
  const [data, setData] = useState<MonthlyMemberWorkHoursSummaryDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await useCase.execute();
        if (active) {
          setData(res);
          setError(null);
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

  if (!data || data.rows.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        表示対象の工数データがありません。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">要員別工数サマリ</h2>
        <p className="text-slate-400 text-sm">
          パートナー要員の月別の合計発注工数および稼働アサイン状況の一覧です。
        </p>
      </div>

      {/* マトリクスグリッドテーブル */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>要員名</th>
                <th>所属会社</th>
                {data.months.map((month) => (
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
              {data.rows.map((row) => (
                <tr key={row.staffId}>
                  <td style={{ fontWeight: 500, color: '#f8fafc' }}>
                    {row.staffName}
                  </td>
                  <td style={{ color: '#cbd5e1' }}>
                    {row.companyName}
                  </td>
                  {data.months.map((month) => {
                    const effort = row.efforts[month] || 0;
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
