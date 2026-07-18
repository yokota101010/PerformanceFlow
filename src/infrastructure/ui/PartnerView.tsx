import { useEffect, useState } from 'react';
import { Partner } from '../../domain/models';
import { PartnerService } from '../../application/services/PartnerService';
import { PartnerUseCase } from '../../application/usecases';
import { PartnerForm } from './PartnerForm';

/**
 * 発注先一覧を表示し、登録・編集・削除を統合するメインビューコンポーネント (US1 / US2 / US3 / US4)。
 */
export const PartnerView: React.FC = () => {
  const [partners, setPartners] = useState<readonly Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 編集中の発注先 (US3)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const usecase: PartnerUseCase = new PartnerService();

  const loadPartners = async () => {
    try {
      setLoading(true);
      const list = await usecase.getPartners();
      setPartners(list);
      setError(null);
    } catch (err) {
      setError('発注先一覧の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleEditClick = (partner: Partner) => {
    setEditingPartner(partner);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (partner: Partner) => {
    const confirmed = window.confirm(`発注先「${partner.name}」を削除してもよろしいですか？`);
    if (!confirmed) return;

    try {
      setError(null);
      await usecase.deletePartner(partner.id);
      await loadPartners();
    } catch (err: any) {
      setError(err.message || '削除に失敗しました。');
    }
  };

  const handleFormSuccess = () => {
    setEditingPartner(null);
    loadPartners();
  };

  const handleFormCancel = () => {
    setEditingPartner(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 0 40px 0' }}>
      {/* 登録・編集フォームの統合 (US2 / US3) */}
      <PartnerForm
        editingPartner={editingPartner}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />

      <div style={{ maxWidth: '800px', margin: '30px auto 0 auto', padding: '0 20px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>発注先一覧</h3>

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
        ) : partners.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#64748b',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            }}
          >
            発注先が登録されていません。
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
                    発注先ID
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
                    発注先名
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
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr
                    key={partner.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#3b82f6', fontWeight: 600 }}>
                      {partner.id}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#e2e8f0' }}>{partner.name}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEditClick(partner)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          marginRight: '8px',
                        }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteClick(partner)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
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
