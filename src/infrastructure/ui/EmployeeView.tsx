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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 0 40px 0' }}>
      {/* 登録・編集フォームの統合 (US2 / US3) */}
      <EmployeeForm
        onSuccess={handleFormSuccess}
        editingEmployee={editingEmployee}
        onCancel={() => setEditingEmployee(null)}
      />

      <div style={{ maxWidth: '800px', margin: '30px auto 0 auto', padding: '0 20px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>社員一覧</h3>

        {error && (
          <div
            role="alert"
            style={{
              color: '#ef4444',
              padding: '12px 16px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>読み込み中...</div>
        ) : employees.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#64748b',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            }}
          >
            社員が登録されていません。
          </div>
        ) : (
          <div
            style={{
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'rgba(30, 41, 59, 0.25)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '16px 20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      width: '120px',
                    }}
                  >
                    社員ID
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '16px 20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    社員名
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '16px 20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      width: '150px',
                    }}
                  >
                    単価 (円/時間)
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '16px 20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      width: '150px',
                    }}
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#3b82f6', fontWeight: 600 }}>
                      {employee.id}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#e2e8f0' }}>{employee.name}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#e2e8f0', textAlign: 'right' }}>
                      {employee.costPerHour.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEditClick(employee)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        削除
                      </button>
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
