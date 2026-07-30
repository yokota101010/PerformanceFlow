import { useEffect, useState } from 'react';
import { Employee, EmployeeUnitPrice, MonthlyEmployeeUnitPrice } from '../../domain/models';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';

export const EmployeeUnitPriceView: React.FC = () => {
  const [employees, setEmployees] = useState<readonly Employee[]>([]);
  const [unitPrices, setUnitPrices] = useState<readonly EmployeeUnitPrice[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [startYearMonth, setStartYearMonth] = useState<string>('2026-04');
  const [price, setPrice] = useState<number>(800000);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const employeeRepo = RepositoryRegistry.getEmployeeRepository();
  const unitPriceRepo = RepositoryRegistry.getEmployeeUnitPriceRepository();

  const loadData = async () => {
    try {
      const empList = await employeeRepo.findAll();
      setEmployees(empList);
      if (empList.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(empList[0].id);
      }
      const priceList = await unitPriceRepo.findAll();
      setUnitPrices(priceList);
    } catch {
      setError('データの読み込みに失敗しました。');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedEmployeeId) {
      setError('社員を選択してください。');
      return;
    }

    try {
      const existing = await unitPriceRepo.findByEmployeeId(selectedEmployeeId);
      const unitPriceId = existing ? existing.id : `EUP_${selectedEmployeeId}`;
      const currentMonthly: MonthlyEmployeeUnitPrice[] = existing
        ? existing.monthlyPrices.map((m) => ({
            unitPriceId,
            startYearMonth: m.startYearMonth || (m as any).yearMonth,
            endYearMonth: m.endYearMonth,
            price: m.price,
          }))
        : [];

      const index = currentMonthly.findIndex((m) => m.startYearMonth === startYearMonth);
      const newMonthlyItem: MonthlyEmployeeUnitPrice = {
        unitPriceId,
        startYearMonth: startYearMonth,
        price,
      };

      if (index >= 0) {
        currentMonthly[index] = newMonthlyItem;
      } else {
        currentMonthly.push(newMonthlyItem);
      }

      const updatedEntity = new EmployeeUnitPrice(unitPriceId, selectedEmployeeId, currentMonthly);
      await unitPriceRepo.save(updatedEntity);

      setMessage(`社員単価を保存しました（${startYearMonth}〜 適用開始 : ¥${price.toLocaleString()}）。`);
      loadData();
    } catch (err: any) {
      setError(err.message || '単価の保存に失敗しました。');
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="page-header">
        <h2 className="page-title" id="f08-title">
          社員単価設定
        </h2>
        <p className="page-subtitle">
          社員単価テーブルの設定および表示を行います。月別社員単価は単価保存時にあわせて自動更新されます。
        </p>
      </div>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSave} className="glass-panel space-y-3">
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          社員単価テーブルの設定・改定
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">対象社員</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="form-select"
              id="employee-select"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.id} : {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">適用開始年月 (YYYY-MM)</label>
            <input
              type="month"
              value={startYearMonth}
              onChange={(e) => setStartYearMonth(e.target.value)}
              className="form-input"
              id="start-year-month-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">月額/標準単価 (円)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="form-input"
              id="price-input"
            />
          </div>

          <button type="submit" className="btn btn-primary" id="save-btn">
            単価改定を保存
          </button>
        </div>
      </form>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
            社員単価テーブル (設定・表示)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>社員</th>
                <th style={{ textAlign: 'center' }}>適用開始年月</th>
                <th style={{ textAlign: 'center' }}>適用終了年月</th>
                <th style={{ textAlign: 'right' }}>設定単価</th>
              </tr>
            </thead>
            <tbody>
              {unitPrices.flatMap((up) => {
                const emp = employees.find((e) => e.id === up.employeeId);
                const empName = emp ? emp.name : up.employeeId;
                return up.monthlyPrices.map((mp) => (
                  <tr key={`${up.id}_${mp.startYearMonth}`}>
                    <td>{up.employeeId} ({empName})</td>
                    <td style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 600 }}>{mp.startYearMonth}</td>
                    <td style={{ textAlign: 'center', color: mp.endYearMonth === '9999-12' ? '#a855f7' : '#cbd5e1' }}>
                      {mp.endYearMonth === '9999-12' ? '継続中 (最終改定)' : mp.endYearMonth}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#4ade80' }}>
                      ¥{mp.price.toLocaleString()}
                    </td>
                  </tr>
                ));
              })}
              {unitPrices.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                    社員単価データが登録されていません。
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
