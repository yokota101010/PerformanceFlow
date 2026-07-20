import React, { useState, useEffect } from 'react';
import { EmployeeWorkTime } from '../../domain/models/EmployeeWorkTime';
import { Employee, CaseAssignment } from '../../domain/models/types';
import { EmployeeWorkTimeService } from '../../application/services/EmployeeWorkTimeService';

export interface EmployeeWorkTimeFormProps {
  editingItem: EmployeeWorkTime | null;
  employees: readonly Employee[];
  assignments: readonly CaseAssignment[];
  onSuccess: () => void;
  onClose: () => void;
  getMonthlyTotal: (staffId: string, monthVal: string) => number;
}

export const EmployeeWorkTimeForm: React.FC<EmployeeWorkTimeFormProps> = ({
  editingItem,
  employees,
  assignments,
  onSuccess,
  onClose,
  getMonthlyTotal,
}) => {
  const [caseAssignmentId, setCaseAssignmentId] = useState<string>('');
  const [staffId, setStaffId] = useState<string>('');
  const [targetMonth, setTargetMonth] = useState<string>(''); // YYYY-MM形式
  const [workHours, setWorkHours] = useState<number>(160);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const service = new EmployeeWorkTimeService();

  useEffect(() => {
    if (editingItem) {
      setCaseAssignmentId(editingItem.caseAssignmentId);
      setStaffId(editingItem.staffId);
      // YYYY-MM-01 -> YYYY-MM
      setTargetMonth(editingItem.targetMonth.substring(0, 7));
      setWorkHours(editingItem.workHours);
    } else {
      setCaseAssignmentId(assignments[0]?.id || '');
      setStaffId(employees[0]?.id || '');
      // デフォルト年月: 現在の年月
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setTargetMonth(monthStr);
      setWorkHours(160);
    }
  }, [editingItem, employees, assignments]);

  // 入力値変更に応じた動的な月合計超過アラートチェック
  const currentTotal = getMonthlyTotal(staffId, targetMonth);
  // 編集時は、現在の入力時間と元の入力時間の差分を計算する
  const baseHours = editingItem && editingItem.targetMonth.startsWith(targetMonth) ? editingItem.workHours : 0;
  const projectedTotal = currentTotal - baseHours + (Number(workHours) || 0);
  const isOverLimit = projectedTotal > 200;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const monthValue = `${targetMonth}-01`; // YYYY-MM-01 形式に補完

    try {
      if (editingItem) {
        await service.updateWorkHours({
          caseAssignmentId,
          staffId,
          targetMonth: monthValue,
          workHours: Number(workHours),
        });
      } else {
        await service.createWorkTime({
          caseAssignmentId,
          staffId,
          targetMonth: monthValue,
          workHours: Number(workHours),
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || '保存に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel max-w-md w-full p-6">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
          {editingItem ? '工数実績編集' : '新規工数実績登録'}
        </h3>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {isOverLimit && (
          <div className="alert-error" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', borderColor: 'rgba(217, 119, 6, 0.3)', color: '#fde047' }}>
            ⚠️ <strong>警告:</strong> この登録/更新により、この社員の対象月における合計稼働時間が 200時間 を超過します (合計: {projectedTotal}時間)。
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group mb-0">
            <label htmlFor="caseAssignmentId" className="form-label">
              作業契約
            </label>
            <select
              id="caseAssignmentId"
              value={caseAssignmentId}
              onChange={(e) => setCaseAssignmentId(e.target.value)}
              disabled={!!editingItem}
              className="form-select"
              style={editingItem ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} ({a.startDate} 〜 {a.endDate})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-0">
            <label htmlFor="staffId" className="form-label">
              社員
            </label>
            <select
              id="staffId"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              disabled={!!editingItem}
              className="form-select"
              style={editingItem ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-0">
            <label htmlFor="targetMonth" className="form-label">
              対象年月
            </label>
            <input
              id="targetMonth"
              type="month"
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              disabled={!!editingItem}
              required
              className="form-input"
              style={editingItem ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            />
          </div>

          <div className="form-group mb-0">
            <label htmlFor="workHours" className="form-label">
              作業時間 (時間, 0〜200)
            </label>
            <input
              id="workHours"
              type="number"
              min="0"
              max="200"
              value={workHours}
              onChange={(e) => setWorkHours(Number(e.target.value))}
              required
              className="form-input"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            >
              {submitting ? '保存中...' : editingItem ? '保存' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
