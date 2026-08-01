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
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="page-header">
        <h2 className="page-title">発注先マスタ管理</h2>
        <p className="page-subtitle">
          取引先・パートナー会社（パートナーID・会社名等）の登録、編集、および削除を行います。
        </p>
      </div>

      {/* 登録・編集フォームの統合 (US2 / US3) */}
      <PartnerForm
        editingPartner={editingPartner}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />

      {error && <div className="alert-error">{error}</div>}

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>発注先一覧</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>読み込み中...</div>
          ) : partners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
              発注先が登録されていません。
            </div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>発注先ID</th>
                  <th>発注先名</th>
                  <th style={{ textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id}>
                    <td style={{ color: '#38bdf8', fontWeight: 600, fontFamily: 'monospace' }}>
                      {partner.id}
                    </td>
                    <td style={{ color: '#f8fafc', fontWeight: 500 }}>{partner.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex justify-center space-x-2" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditClick(partner)}
                          className="btn btn-secondary btn-sm"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(partner)}
                          className="btn btn-danger btn-sm"
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
