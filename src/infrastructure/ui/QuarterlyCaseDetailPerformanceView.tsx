import React, { useEffect, useState } from 'react';
import {
  QuarterlyCaseDetailPerformanceService,
} from '../../application/services/QuarterlyCaseDetailPerformanceService';
import {
  QuarterlyCaseDetailPerformanceRowDTO,
  QuarterlyCaseDetailPerformanceSummaryDTO,
} from '../../application/usecases/QuarterlyCaseDetailPerformanceUseCase';

export const QuarterlyCaseDetailPerformanceView: React.FC = () => {
  const [data, setData] = useState<QuarterlyCaseDetailPerformanceSummaryDTO>({
    rows: [],
    totalSales: 0,
    totalManufacturingCost: 0,
    totalGrossProfit: 0,
    overallGrossProfitRate: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');

  const service = new QuarterlyCaseDetailPerformanceService();

  const loadData = async () => {
    setLoading(true);
    try {
      const filter: { fiscalYear?: string; quarterCategory?: string } = {};
      if (selectedFiscalYear !== 'all') {
        filter.fiscalYear = selectedFiscalYear;
      }
      if (selectedQuarter !== 'all') {
        filter.quarterCategory = selectedQuarter;
      }

      const result = await service.execute(filter);
      setData(result);
    } catch (err) {
      console.error('Failed to load quarterly performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFiscalYear, selectedQuarter]);

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);
  };

  const formatFiscalYear = (fy: string): string => {
    const parts = fy.split('-');
    return parts.length > 0 ? `${parts[0]}年度` : fy;
  };

  const formatRate = (rate: number): string => {
    const pct = Math.round(rate * 100);
    return `${pct}%`;
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="page-header">
        <h2 className="page-title">四半期別案件明細業績サマリ (F16)</h2>
        <p className="page-subtitle">
          案件明細の総売上・総製造原価と月別原価を基に、四半期按分売上・原価・粗利・粗利率をオンデマンド算出した業績一覧です。
        </p>
      </div>

      {/* サマリKPIカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-semibold mb-1">売上合計</span>
          <span className="text-xl md:text-2xl font-bold text-sky-400 font-mono">
            {formatCurrency(data.totalSales)}
          </span>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-semibold mb-1">製造原価合計</span>
          <span className="text-xl md:text-2xl font-bold text-slate-200 font-mono">
            {formatCurrency(data.totalManufacturingCost)}
          </span>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-semibold mb-1">粗利合計</span>
          <span
            className={`text-xl md:text-2xl font-bold font-mono ${
              data.totalGrossProfit < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(data.totalGrossProfit)}
          </span>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-semibold mb-1">全体粗利率</span>
          <span
            className={`text-xl md:text-2xl font-bold font-mono ${
              data.overallGrossProfitRate < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatRate(data.overallGrossProfitRate)}
          </span>
        </div>
      </div>

      {/* フィルタコントロール */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 flex items-center gap-3">
          <label htmlFor="filter-fy" className="text-xs font-semibold text-slate-300 whitespace-nowrap">
            会計年度:
          </label>
          <select
            id="filter-fy"
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            className="form-select text-sm w-full"
          >
            <option value="all">すべての年度</option>
            <option value="2025-04-01">2025年度</option>
            <option value="2026-04-01">2026年度</option>
            <option value="2027-04-01">2027年度</option>
          </select>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3">
          <label htmlFor="filter-quarter" className="text-xs font-semibold text-slate-300 whitespace-nowrap">
            四半期区分:
          </label>
          <select
            id="filter-quarter"
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="form-select text-sm w-full"
          >
            <option value="all">すべての四半期</option>
            <option value="1Q">第1四半期 (1Q: 4〜6月)</option>
            <option value="2Q">第2四半期 (2Q: 7〜9月)</option>
            <option value="3Q">第3四半期 (3Q: 10〜12月)</option>
            <option value="4Q">第4四半期 (4Q: 1〜3月)</option>
          </select>
        </div>
      </div>

      {/* 一覧テーブル */}
      <div className="glass-panel overflow-hidden" style={{ padding: 0 }}>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
            <span className="ml-3 text-slate-400 text-sm">オンデマンド再計算中...</span>
          </div>
        ) : data.rows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            該当する四半期業績データが存在しません。一次データの登録状況をご確認ください。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>契約ID</th>
                  <th>プロジェクト / 案件</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>年度</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>四半期</th>
                  <th style={{ textAlign: 'right' }}>売上 (按分)</th>
                  <th style={{ textAlign: 'right' }}>製造原価</th>
                  <th style={{ textAlign: 'right' }}>粗利</th>
                  <th style={{ textAlign: 'right', width: '90px' }}>粗利率</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row: QuarterlyCaseDetailPerformanceRowDTO, idx: number) => {
                  const isNegative = row.grossProfit < 0;
                  return (
                    <tr key={`${row.contractId}-${row.fiscalYear}-${row.quarterCategory}-${idx}`}>
                      <td style={{ color: '#38bdf8', fontWeight: 600, fontFamily: 'monospace' }}>
                        {row.contractId}
                      </td>
                      <td>
                        <div className="text-xs text-slate-400">{row.projectName}</div>
                        <div className="font-medium text-slate-100">{row.caseName}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                        {formatFiscalYear(row.fiscalYear)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-sky-400 border border-sky-500/20 font-mono">
                          {row.quarterCategory}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(row.sales)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(row.manufacturingCost)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          color: isNegative ? '#f87171' : '#34d399',
                        }}
                      >
                        {formatCurrency(row.grossProfit)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: isNegative ? '#f87171' : '#34d399',
                        }}
                      >
                        {formatRate(row.grossProfitRate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
