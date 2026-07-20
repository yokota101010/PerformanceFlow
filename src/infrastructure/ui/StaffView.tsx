import { useEffect, useState } from 'react';
import { Staff, Partner } from '../../domain/models';
import { StaffService } from '../../application/services/StaffService';
import { StaffUseCase } from '../../application/usecases/StaffUseCase';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';
import { StaffForm } from './StaffForm';

/**
 * 要員一覧を表示し、登録・編集・削除を統合するメインビューコンポーネント (US1 / US2 / US3 / US4)。
 */
export const StaffView: React.FC = () => {
  const [staffs, setStaffs] = useState<readonly Staff[]>([]);
  const [partners, setPartners] = useState<readonly Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 編集中の要員 (US3)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const usecase: StaffUseCase = new StaffService();

  const loadData = async () => {
    try {
      setLoading(true);
      const staffList = await usecase.getStaffs();
      setStaffs(staffList);
      
      // 発注先リストもロードして、IDから会社名を引けるようにする
      const partnerRepo = RepositoryRegistry.getPartnerRepository();
      const partnerList = await partnerRepo.findAll();
      setPartners(partnerList);

      setError(null);
    } catch (err) {
      setError('要員一覧の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPartnerName = (partnerId: string): string => {
    const partner = partners.find(p => p.id === partnerId);
    return partner ? partner.name : partnerId;
  };

  const handleEditClick = (staff: Staff) => {
    setEditingStaff(staff);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (staff: Staff) => {
    const confirmed = window.confirm(`要員「${staff.name}」を削除してもよろしいですか？`);
    if (!confirmed) return;

    try {
      setError(null);
      await usecase.deleteStaff(staff.id);
      await loadData();
    } catch (err: any) {
      setError(err.message || '削除に失敗しました。');
    }
  };

  const handleFormSuccess = () => {
    setEditingStaff(null);
    loadData();
  };

  const handleFormCancel = () => {
    setEditingStaff(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">要員マスタ管理</h2>
        <p className="text-slate-400 text-sm">
          プロジェクトにアサインするパートナー要員の登録、編集、および削除を行います。
        </p>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* 登録・編集フォーム (US2 / US3) */}
      <StaffForm
        editingStaff={editingStaff}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">読み込み中...</div>
          ) : staffs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">登録されている要員はいません。</div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>要員ID</th>
                  <th>氏名</th>
                  <th>所属会社</th>
                  <th style={{ textAlign: 'right' }}>単価 (月額)</th>
                  <th style={{ textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {staffs.map((staff) => (
                  <tr key={staff.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>{staff.id}</td>
                    <td style={{ fontWeight: 500, color: '#f8fafc' }}>{staff.name}</td>
                    <td>{getPartnerName(staff.partnerId)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#34d399', fontWeight: 600 }}>
                      {staff.costPerMonth.toLocaleString()} 円
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(staff)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(staff)}
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
