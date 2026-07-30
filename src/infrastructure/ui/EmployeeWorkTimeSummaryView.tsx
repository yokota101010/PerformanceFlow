import { useEffect, useState } from 'react';
import { EmployeeWorkTimeSummaryRow, EmployeeWorkTimeSummaryService } from '../../application/services/EmployeeWorkTimeSummaryService';

export const EmployeeWorkTimeSummaryView: React.FC = () => {
  const [rows, setRows] = useState<EmployeeWorkTimeSummaryRow[]>([]);
  const [targetYearMonth, setTargetYearMonth] = useState<string>('2026-04');
  const [loading, setLoading] = useState<boolean>(true);

  const service = new EmployeeWorkTimeSummaryService();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await service.getSummary(targetYearMonth);
      setRows(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetYearMonth]);

  const totalHours = rows.reduce((acc, r) => acc + r.totalWorkHours, 0);
  const totalCost = rows.reduce((acc, r) => acc + r.totalCost, 0);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="page-header">
        <h2 className="page-title">社員別工数サマリ</h2>
        <p className="page-subtitle">
          各社員の月別稼働工数および適用単価に基づく労務コストをリアルタイム集計します。
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '16px 24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <label style={{ fontSize: '14px', color: '#94a3b8' }}>対象年月選択:</label>
        <input
          type="month"
          value={targetYearMonth}
          onChange={(e) => setTargetYearMonth(e.target.value)}
          style={{ padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#f8fafc' }}
        />
        <span style={{ fontSize: '12px', color: '#64748b' }}>※ 一次データより最新の工数・単価からリアルタイム集計しています。</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>全社社員合計工数</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>{totalHours.toLocaleString()} 時間</div>
        </div>
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>全社社員加工原価合計</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#4ade80', marginTop: '4px' }}>¥{totalCost.toLocaleString()}</div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#94a3b8' }}>社員ID</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#94a3b8' }}>社員名</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#94a3b8' }}>年月</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>稼働工数 (時間)</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>適用月額単価</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>社員加工原価 (算出)</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>集計中...</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>該当月の工数データがありません。</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.employeeId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600 }}>{row.employeeId}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{row.employeeName}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#38bdf8' }}>{row.yearMonth}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                  {row.totalWorkHours} 時間
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right', color: '#94a3b8' }}>
                  ¥{row.unitPrice.toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right', fontWeight: 600, color: '#4ade80' }}>
                  ¥{row.totalCost.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
