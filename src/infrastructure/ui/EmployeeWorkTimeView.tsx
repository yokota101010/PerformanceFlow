import React, { useState, useEffect } from 'react';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';
import { EmployeeWorkTime } from '../../domain/models/EmployeeWorkTime';
import { Employee, CaseAssignment } from '../../domain/models/types';
import { EmployeeWorkTimeService } from '../../application/services/EmployeeWorkTimeService';
import { EmployeeWorkTimeForm } from './EmployeeWorkTimeForm';

export const EmployeeWorkTimeView: React.FC = () => {
  const [workTimes, setWorkTimes] = useState<readonly EmployeeWorkTime[]>([]);
  const [employees, setEmployees] = useState<readonly Employee[]>([]);
  const [assignments, setAssignments] = useState<readonly CaseAssignment[]>([]);
  
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // YYYY-MM形式
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<EmployeeWorkTime | null>(null);

  const service = new EmployeeWorkTimeService();

  const loadData = async () => {
    setLoading(true);
    try {
      const times = await service.getWorkTimes();
      const emps = await RepositoryRegistry.getEmployeeRepository().findAll();
      const assigns = await RepositoryRegistry.getCaseAssignmentRepository().findAll();

      setWorkTimes(times);
      setEmployees(emps);
      setAssignments(assigns);
    } catch (e) {
      console.error('データのロードに失敗しました。', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClick = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditClick = (item: EmployeeWorkTime) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteClick = async (item: EmployeeWorkTime) => {
    if (window.confirm('この工数実績を削除しますか？')) {
      try {
        await service.deleteWorkTime(item.caseAssignmentId, item.staffId, item.targetMonth);
        await loadData();
      } catch (e: any) {
        alert(e.message || '削除に失敗しました。');
      }
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingItem(null);
    await loadData();
  };

  // 表示フィルタリング
  const filteredWorkTimes = workTimes.filter(w => {
    if (!selectedMonth) return true;
    // targetMonth は YYYY-MM-01 形式、selectedMonth は YYYY-MM 形式
    return w.targetMonth.startsWith(selectedMonth);
  });

  // 社員名引き当て
  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : id;
  };

  // 案件アサイン名/契約期間引き当て
  const getAssignmentLabel = (id: string) => {
    const assign = assignments.find(a => a.id === id);
    return assign ? `${assign.id} (${assign.startDate} 〜 ${assign.endDate})` : id;
  };

  // 年月選択用リスト抽出 (シード値＋登録データから)
  const uniqueMonths = Array.from(
    new Set(workTimes.map(w => w.targetMonth.substring(0, 7)))
  ).sort();

  // 月間合計稼働時間の警告集計 (社員ID + 年月ごとに200時間を超えるか)
  // 月別での合計時間を算出して超過しているものをマップ化
  interface OverLimitMap {
    [key: string]: number; // "staffId:YYYY-MM" -> totalHours
  }
  const monthlyTotals = workTimes.reduce<OverLimitMap>((acc, cur) => {
    const monthKey = cur.targetMonth.substring(0, 7);
    const key = `${cur.staffId}:${monthKey}`;
    acc[key] = (acc[key] || 0) + cur.workHours;
    return acc;
  }, {});

  const getMonthlyTotal = (staffId: string, monthVal: string) => {
    const key = `${staffId}:${monthVal.substring(0, 7)}`;
    return monthlyTotals[key] || 0;
  };

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f8fafc', borderBottom: '2px solid #0ea5e9', paddingBottom: '8px' }}>
          社員工数入力
        </h2>
        <button
          onClick={handleCreateClick}
          className="btn btn-primary"
        >
          新規登録
        </button>
      </div>

      {/* 警告サマリー表示 (月間合計200時間超えの社員) */}
      {Object.entries(monthlyTotals).map(([key, total]) => {
        if (total > 200) {
          const [staffId, monthStr] = key.split(':');
          return (
            <div key={key} className="alert-error" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', borderColor: 'rgba(217, 119, 6, 0.3)', color: '#fde047' }}>
              <span className="font-semibold">⚠️ 警告:</span>
              <span>
                {getEmployeeName(staffId)} の {monthStr} における合計稼働時間が 200時間 を超過しています (合計: {total}時間)。
              </span>
            </div>
          );
        }
        return null;
      })}

      {/* 絞り込みフィルター */}
      <div className="glass-panel flex gap-4 items-center p-4">
        <div className="form-group mb-0 flex items-center gap-3">
          <label htmlFor="filterMonth" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
            対象年月
          </label>
          <select
            id="filterMonth"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="">すべて</option>
            {uniqueMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 実績一覧テーブル */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>作業契約ID</th>
                <th>社員名</th>
                <th>年月</th>
                <th>作業時間 (時間)</th>
                <th style={{ textAlign: 'right' }}>単価 (時間給)</th>
                <th style={{ textAlign: 'right' }}>加工費</th>
                <th style={{ textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkTimes.map((item, idx) => {
                const monthKey = item.targetMonth.substring(0, 7);
                const totalHours = getMonthlyTotal(item.staffId, monthKey);
                const isOverLimit = totalHours > 200;

                return (
                  <tr key={`${item.caseAssignmentId}-${item.staffId}-${item.targetMonth}-${idx}`}>
                    <td style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>
                      {getAssignmentLabel(item.caseAssignmentId)}
                    </td>
                    <td style={{ fontWeight: 500, color: '#f8fafc' }}>
                      {getEmployeeName(item.staffId)}
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{monthKey}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span>{item.workHours}</span>
                        {isOverLimit && (
                          <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
                            ! 超過 ({totalHours}h)
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{item.staffPrice.toLocaleString()}円</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                      {item.laborCost.toLocaleString()}円
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="btn btn-danger"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新規・編集ポップアップフォーム */}
      {showForm && (
        <EmployeeWorkTimeForm
          editingItem={editingItem}
          employees={employees}
          assignments={assignments}
          onSuccess={handleFormSuccess}
          onClose={() => setShowForm(false)}
          getMonthlyTotal={getMonthlyTotal}
        />
      )}
    </div>
  );
};
