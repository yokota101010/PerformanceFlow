import React, { useEffect, useState } from 'react';
import {
  FinancialSummaryUseCase,
  FinancialSummaryDTO,
  CaseAssignmentFinancialRowDTO,
  FinancialSummaryFilterInput,
} from '../../application/usecases/FinancialSummaryUseCase';

interface FinancialSummaryViewProps {
  useCase: FinancialSummaryUseCase;
}

export const FinancialSummaryView: React.FC<FinancialSummaryViewProps> = ({ useCase }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FinancialSummaryDTO | null>(null);
  const [rows, setRows] = useState<CaseAssignmentFinancialRowDTO[]>([]);

  // フィルター用ステート (US3用)
  const [filterInput, setFilterInput] = useState<FinancialSummaryFilterInput>({
    projectName: '',
    startMonth: '',
    endMonth: '',
  });

  const loadData = async (filter?: FinancialSummaryFilterInput) => {
    setLoading(true);
    try {
      const data = await useCase.execute(filter);
      setSummary(data.summary);
      setRows(data.rows);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(filterInput);
  };

  const handleClearFilter = () => {
    const cleared = { projectName: '', startMonth: '', endMonth: '' };
    setFilterInput(cleared);
    loadData(cleared);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('ja-JP') + '円';
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
        <span className="ml-3 text-slate-400">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">業績・収支サマリ</h2>
        <p className="text-slate-400 text-sm">
          プロジェクト・案件の受注売上、発生原価（加工費・外注額・経費）、および利益率をリアルタイム集計します。
        </p>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* 合計サマリカード (US1) */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 売上カード */}
          <div className="glass-panel p-5 relative overflow-hidden" style={{ borderLeft: '4px solid #3b82f6' }}>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">売上合計</span>
            <p className="text-2xl font-bold text-white font-mono">{formatCurrency(summary.totalSales)}</p>
          </div>

          {/* 製造原価カード */}
          <div className="glass-panel p-5 relative overflow-hidden" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">製造原価合計</span>
            <p className="text-2xl font-bold text-white font-mono">{formatCurrency(summary.totalCost)}</p>
          </div>

          {/* 粗利カード */}
          <div className="glass-panel p-5 relative overflow-hidden" style={{ borderLeft: '4px solid #10b981' }}>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">粗利合計</span>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{formatCurrency(summary.totalGrossProfit)}</p>
          </div>

          {/* 全体粗利率カード */}
          <div className="glass-panel p-5 relative overflow-hidden" style={{ borderLeft: `4px solid ${summary.overallGrossProfitRate < 0 ? '#ef4444' : '#06b6d4'}` }}>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">全体粗利率</span>
            <p className={`text-2xl font-bold font-mono ${summary.overallGrossProfitRate < 0 ? 'text-red-400' : 'text-cyan-400'}`}>
              {summary.overallGrossProfitRate}%
            </p>
          </div>
        </div>
      )}

      {/* フィルタフォーム (US3) */}
      <div className="glass-panel p-6">
        <form onSubmit={handleApplyFilter} className="flex flex-col md:flex-row items-end gap-4">
          <div className="form-group mb-0 flex-1 w-full">
            <label className="form-label">プロジェクト名</label>
            <input
              type="text"
              placeholder="プロジェクト名で検索..."
              value={filterInput.projectName || ''}
              onChange={e => setFilterInput({ ...filterInput, projectName: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group mb-0 w-full md:w-44">
            <label className="form-label">開始月</label>
            <input
              type="month"
              value={filterInput.startMonth || ''}
              onChange={e => setFilterInput({ ...filterInput, startMonth: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group mb-0 w-full md:w-44">
            <label className="form-label">終了月</label>
            <input
              type="month"
              value={filterInput.endMonth || ''}
              onChange={e => setFilterInput({ ...filterInput, endMonth: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="submit"
              className="btn btn-primary w-full md:w-auto"
            >
              検索
            </button>
            <button
              type="button"
              onClick={handleClearFilter}
              className="btn btn-secondary w-full md:w-auto"
            >
              クリア
            </button>
          </div>
        </form>
      </div>

      {/* 収支明細テーブル (US2) */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>アサインID</th>
                <th>プロジェクト名 / 案件名</th>
                <th>アサイン期間</th>
                <th style={{ textAlign: 'right' }}>売上</th>
                <th style={{ textAlign: 'right' }}>工数加工費</th>
                <th style={{ textAlign: 'right' }}>発注額</th>
                <th style={{ textAlign: 'right' }}>その他経費</th>
                <th style={{ textAlign: 'right' }}>製造原価</th>
                <th style={{ textAlign: 'right' }}>粗利</th>
                <th style={{ textAlign: 'right' }}>粗利率</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    該当するデータがありません
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr
                    key={row.assignmentId}
                    style={row.isDeficit ? { backgroundColor: 'rgba(239, 68, 68, 0.1)' } : undefined}
                  >
                    <td style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                      {row.assignmentId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.projectName}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{row.caseName}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#cbd5e1', fontSize: '12px' }}>
                      <div>{row.startDate}</div>
                      <div style={{ color: '#64748b' }}>〜 {row.endDate}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 500, color: '#f8fafc' }}>
                      {formatCurrency(row.sales)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#cbd5e1' }}>
                      {formatCurrency(row.laborCost)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#cbd5e1' }}>
                      {formatCurrency(row.orderCost)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#cbd5e1' }}>
                      {formatCurrency(row.expenseCost)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#f8fafc' }}>
                      {formatCurrency(row.totalCost)}
                    </td>
                    <td className={`text-right font-mono font-bold ${row.isDeficit ? 'text-red-600' : ''}`} style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: row.isDeficit ? '#f87171' : '#34d399' }}>
                      {formatCurrency(row.grossProfit)}
                    </td>
                    <td className={`text-right font-mono font-bold ${row.isDeficit ? 'text-red-600' : ''}`} style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: row.isDeficit ? '#f87171' : '#34d399' }}>
                      {row.grossProfitRate}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
