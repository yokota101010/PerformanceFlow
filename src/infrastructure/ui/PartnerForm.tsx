import { useEffect, useState } from 'react';
import { Partner } from '../../domain/models';
import { PartnerService } from '../../application/services/PartnerService';
import { PartnerUseCase } from '../../application/usecases';

interface PartnerFormProps {
  editingPartner?: Partner | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

/**
 * 発注先の登録・編集フォームコンポーネント (US2 / US3)。
 */
export const PartnerForm: React.FC<PartnerFormProps> = ({
  editingPartner,
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const usecase: PartnerUseCase = new PartnerService();

  // 編集モード時の初期値ロード (T029)
  useEffect(() => {
    if (editingPartner) {
      setName(editingPartner.name);
      setError(null);
    } else {
      setName('');
    }
  }, [editingPartner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSubmitting(true);

      if (editingPartner) {
        // 更新処理 (US3)
        await usecase.updatePartner({
          id: editingPartner.id,
          name,
        });
      } else {
        // 新規登録 (US2)
        await usecase.createPartner({ name });
      }

      setName('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || '保存に失敗しました。');
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
          {editingPartner ? `発注先編集 (${editingPartner.id})` : '発注先登録'}
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
              htmlFor="partner-name"
              style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}
            >
              発注先名
            </label>
            <input
              type="text"
              id="partner-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: Ｃシステムズ"
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
                minWidth: '100px',
              }}
            >
              {submitting ? '保存中...' : editingPartner ? '保存' : '登録'}
            </button>

            {editingPartner && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '11px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
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
