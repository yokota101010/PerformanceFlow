import { useState, useEffect } from 'react';
import { Employee } from '../../domain/models';
import { EmployeeService } from '../../application/services/EmployeeService';
import { EmployeeUseCase } from '../../application/usecases';

interface EmployeeFormProps {
  onSuccess: () => void;
  editingEmployee?: Employee | null;
  onCancel?: () => void;
}

/**
 * 社員登録・編集用フォームコンポーネント (US2 / US3)。
 */
export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSuccess,
  editingEmployee = null,
  onCancel,
}) => {
  const [name, setName] = useState<string>('');
  const [costPerHour, setCostPerHour] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const usecase: EmployeeUseCase = new EmployeeService();

  // 編集対象の変更を検知して状態を設定 (US3)
  useEffect(() => {
    if (editingEmployee) {
      setName(editingEmployee.name);
      setCostPerHour(editingEmployee.costPerHour);
    } else {
      setName('');
      setCostPerHour(0);
    }
    setError(null);
  }, [editingEmployee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSubmitting(true);

      if (editingEmployee) {
        // 情報更新の実行 (US3)
        await usecase.updateEmployee({
          id: editingEmployee.id,
          name,
          costPerHour,
        });
      } else {
        // 新規登録の実行 (US2)
        await usecase.createEmployee({ name, costPerHour });
      }

      // フォームのクリア (新規時のみ)
      if (!editingEmployee) {
        setName('');
        setCostPerHour(0);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || '処理に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto 30px auto', padding: '0 20px' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '24px',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
          {editingEmployee ? `社員情報の編集 (${editingEmployee.id})` : '社員登録'}
        </h3>

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

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label
              htmlFor="employee-name"
              style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}
            >
              社員名
            </label>
            <input
              type="text"
              id="employee-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: デミ・ハリス"
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <label
              htmlFor="employee-cost"
              style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}
            >
              単価 (円/時間)
            </label>
            <input
              type="number"
              id="employee-cost"
              value={costPerHour}
              onChange={(e) => setCostPerHour(Number(e.target.value))}
              placeholder="例: 7500"
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '11px 24px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                height: '42px',
                minWidth: '90px',
              }}
            >
              {submitting ? '処理中...' : editingEmployee ? '保存' : '登録'}
            </button>

            {editingEmployee && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '11px 20px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '42px',
                }}
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
