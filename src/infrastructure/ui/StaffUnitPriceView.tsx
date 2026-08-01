import { useEffect, useState } from 'react';
import { Staff, StaffUnitPrice, MonthlyStaffUnitPrice } from '../../domain/models';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';

export const StaffUnitPriceView: React.FC = () => {
  const [staffs, setStaffs] = useState<readonly Staff[]>([]);
  const [unitPrices, setUnitPrices] = useState<readonly StaffUnitPrice[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [startYearMonth, setStartYearMonth] = useState<string>('2026-04');
  const [price, setPrice] = useState<number>(1000000);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const staffRepo = RepositoryRegistry.getStaffRepository();
  const unitPriceRepo = RepositoryRegistry.getStaffUnitPriceRepository();

  const loadData = async () => {
    try {
      const staffList = await staffRepo.findAll();
      setStaffs(staffList);
      if (staffList.length > 0 && !selectedStaffId) {
        setSelectedStaffId(staffList[0].id);
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

  const handleEditClick = (staffId: string, mp: MonthlyStaffUnitPrice) => {
    setError(null);
    setMessage(null);
    setSelectedStaffId(staffId);
    setStartYearMonth(mp.startYearMonth);
    setPrice(mp.price);
    setEditingKey(`${staffId}_${mp.startYearMonth}`);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setError(null);
    setMessage(null);
  };

  const handleDeleteClick = async (staffId: string, mp: MonthlyStaffUnitPrice) => {
    setError(null);
    setMessage(null);

    const st = staffs.find((s) => s.id === staffId);
    const stName = st ? st.name : staffId;

    if (!window.confirm(`【${stName}】の適用開始年月 ${mp.startYearMonth} の単価設定（¥${mp.price.toLocaleString()}）を削除しますか？`)) {
      return;
    }

    try {
      const existing = await unitPriceRepo.findByStaffId(staffId);
      if (!existing) {
        setError('該当の単価データが見つかりません。');
        return;
      }

      const remainingMonthly = existing.monthlyPrices.filter((m) => m.startYearMonth !== mp.startYearMonth);

      if (remainingMonthly.length === 0) {
        await unitPriceRepo.delete(existing.id);
      } else {
        const updatedEntity = new StaffUnitPrice(existing.id, staffId, remainingMonthly);
        await unitPriceRepo.save(updatedEntity);
      }

      if (editingKey === `${staffId}_${mp.startYearMonth}`) {
        setEditingKey(null);
      }

      setMessage(`要員単価設定（${stName} / ${mp.startYearMonth}〜）を削除しました。`);
      await loadData();
    } catch (err: any) {
      setError(err.message || '単価の削除に失敗しました。');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedStaffId) {
      setError('要員を選択してください。');
      return;
    }

    try {
      const existing = await unitPriceRepo.findByStaffId(selectedStaffId);
      const unitPriceId = existing ? existing.id : `SUP_${selectedStaffId}`;
      const currentMonthly: MonthlyStaffUnitPrice[] = existing
        ? existing.monthlyPrices.map((m) => ({
            unitPriceId,
            startYearMonth: m.startYearMonth || (m as any).yearMonth,
            endYearMonth: m.endYearMonth,
            price: m.price,
          }))
        : [];

      const index = currentMonthly.findIndex((m) => m.startYearMonth === startYearMonth);
      const newMonthlyItem: MonthlyStaffUnitPrice = {
        unitPriceId,
        startYearMonth: startYearMonth,
        price,
      };

      if (index >= 0) {
        currentMonthly[index] = newMonthlyItem;
      } else {
        currentMonthly.push(newMonthlyItem);
      }

      const updatedEntity = new StaffUnitPrice(unitPriceId, selectedStaffId, currentMonthly);
      await unitPriceRepo.save(updatedEntity);

      setMessage(`要員単価を保存しました（${startYearMonth}〜 適用開始 : ¥${price.toLocaleString()}）。`);
      setEditingKey(null);
      loadData();
    } catch (err: any) {
      setError(err.message || '単価の保存に失敗しました。');
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="page-header">
        <h2 className="page-title">
          要員単価設定
        </h2>
        <p className="page-subtitle">
          設定した適用開始年月以降、次の単価改定が発生するまでの全期間で同一単価が継続適用されます。
        </p>
      </div>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSave} className="glass-panel space-y-3">
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          {editingKey ? '要員単価設定の編集' : '適用開始単価の登録・改定'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">対象要員</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="form-select"
              disabled={!!editingKey}
            >
              {staffs.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.id} : {staff.name}
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
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">月額単価 (円)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="form-input"
            />
          </div>

          <div className="flex space-x-2" style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary">
              {editingKey ? '変更を保存' : '単価改定を保存'}
            </button>
            {editingKey && (
              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                キャンセル
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
            単価適用期間・改定履歴
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>要員</th>
                <th style={{ textAlign: 'center' }}>適用開始年月</th>
                <th style={{ textAlign: 'center' }}>適用終了年月</th>
                <th style={{ textAlign: 'right' }}>設定単価</th>
                <th style={{ textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {unitPrices.flatMap((up) => {
                const st = staffs.find((s) => s.id === up.staffId);
                const stName = st ? st.name : up.staffId;
                return up.monthlyPrices.map((mp) => {
                  const key = `${up.staffId}_${mp.startYearMonth}`;
                  const isEditing = editingKey === key;

                  return (
                    <tr key={`${up.id}_${mp.startYearMonth}`} style={isEditing ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : undefined}>
                      <td>{up.staffId} ({stName})</td>
                      <td style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 600 }}>{mp.startYearMonth}</td>
                      <td style={{ textAlign: 'center', color: mp.endYearMonth === '9999-12' ? '#a855f7' : '#cbd5e1' }}>
                        {mp.endYearMonth === '9999-12' ? '継続中 (最終改定)' : mp.endYearMonth}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#4ade80' }}>
                        ¥{mp.price.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="flex justify-center space-x-2" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleEditClick(up.staffId, mp)}
                            className="btn btn-secondary btn-sm"
                            id={`edit-staff-price-${up.staffId}-${mp.startYearMonth}`}
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteClick(up.staffId, mp)}
                            className="btn btn-danger btn-sm"
                            id={`delete-staff-price-${up.staffId}-${mp.startYearMonth}`}
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })}
              {unitPrices.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                    単価履歴データが登録されていません。
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
