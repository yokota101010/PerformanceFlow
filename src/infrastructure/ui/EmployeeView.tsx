import { useEffect, useState } from 'react';
import { Employee } from '../../domain/models';
import { EmployeeService } from '../../application/services/EmployeeService';
import { EmployeeUseCase } from '../../application/usecases';
import { EmployeeForm } from './EmployeeForm';

/**
 * 社員一覧を表示し、登録・編集・削除アクションを統合するメインビューコンポーネント (US1 / US2 / US3 / US4)。
 */
export const EmployeeView: React.FC = () => {
  const [employees, setEmployees] = useState<readonly Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const usecase: EmployeeUseCase = new EmployeeService();

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const list = await usecase.getEmployees();
      setEmployees(list);
      setError(null);
    } catch (err) {
      setError('社員一覧の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: string) => {
    const confirmed = window.confirm('本当に削除しますか？');
    if (!confirmed) return;

    try {
      setError(null);
      await usecase.deleteEmployee(id);
      loadEmployees();
    } catch (err: any) {
      setError(err.message || '削除に失敗しました。');
    }
  };

  const handleFormSuccess = () => {
    setEditingEmployee(null);
    loadEmployees();
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="page-header">
        <h2 className="page-title">社員マスタ管理</h2>
        <p className="page-subtitle">
          自社社員の情報（社員ID・氏名等）の登録、編集、および削除を行います。
        </p>
      </div>

      {/* 登録・編集フォームの統合 (US2 / US3) */}
      <EmployeeForm
        onSuccess={handleFormSuccess}
        editingEmployee={editingEmployee}
        onCancel={() => setEditingEmployee(null)}
      />

      {error && <div className="alert-error">{error}</div>}

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>社員一覧</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>読み込み中...</div>
          ) : employees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
              社員が登録されていません。
            </div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>社員ID</th>
                  <th>社員名</th>
                  <th style={{ textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td style={{ color: '#38bdf8', fontWeight: 600, fontFamily: 'monospace' }}>
                      {employee.id}
                    </td>
                    <td style={{ color: '#f8fafc', fontWeight: 500 }}>{employee.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex justify-center space-x-2" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditClick(employee)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee.id)}
                          className="btn btn-danger"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
