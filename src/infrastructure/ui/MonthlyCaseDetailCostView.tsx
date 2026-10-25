import React, { useEffect, useState } from 'react';
import {
  MonthlyCaseDetailCostService,
} from '../../application/services/MonthlyCaseDetailCostService';
import {
  MonthlyCaseDetailCostRowDTO,
  MonthlyCaseDetailCostSummaryDTO,
} from '../../application/usecases/MonthlyCaseDetailCostUseCase';

export const MonthlyCaseDetailCostView: React.FC = () => {
  const [data, setData] = useState<MonthlyCaseDetailCostSummaryDTO>({
    rows: [],
    totalManufacturingCost: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');

  const service = new MonthlyCaseDetailCostService();

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
      console.error('Failed to load monthly case detail cost:', err);
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

  const formatYearMonth = (ym: string): string => {
    const parts = ym.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}年${parts[1]}月`;
    }
    return ym;
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="page-header">
        <h2 className="page-title">月別案件明細原価サマリ (F15)</h2>
        <p className="page-subtitle">
          各案件明細（契約）ごとの月次外注費・社員加工費・その他経費を一次データからオンデマンド集計した製造原価一覧です。
        </p>
      </div>

      {/* フィルタおよびサマリカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-semibold mb-1">製造原価合計</span>
          <span className="text-2xl font-bold text-sky-400 font-mono">
            {formatCurrency(data.totalManufacturingCost)}
          </span>
        </div>

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
            該当する月別原価データが存在しません。一次データ（発注・工数・経費）の登録状況をご確認ください。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>契約ID</th>
                  <th>プロジェクト / 案件</th>
                  <th style={{ textAlign: 'center', width: '110px' }}>対象年月</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>区分</th>
                  <th style={{ textAlign: 'right' }}>外注原価 (発注)</th>
                  <th style={{ textAlign: 'right' }}>社員加工費</th>
                  <th style={{ textAlign: 'right' }}>その他経費</th>
                  <th style={{ textAlign: 'right', color: '#38bdf8' }}>製造原価合計</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row: MonthlyCaseDetailCostRowDTO, idx: number) => (
                  <tr key={`${row.contractId}-${row.yearMonth}-${idx}`}>
                    <td style={{ color: '#38bdf8', fontWeight: 600, fontFamily: 'monospace' }}>
                      {row.contractId}
                    </td>
                    <td>
                      <div className="text-xs text-slate-400">{row.projectName}</div>
                      <div className="font-medium text-slate-100">{row.caseName}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                      {formatYearMonth(row.yearMonth)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-sky-400 border border-sky-500/20 font-mono">
                        {row.quarterCategory}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatCurrency(row.outsourcingCost)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatCurrency(row.employeeCost)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatCurrency(row.otherExpenses)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                      {formatCurrency(row.manufacturingCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
