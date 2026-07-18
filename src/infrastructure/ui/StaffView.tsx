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
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center space-x-2 animate-fade-in">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">要員ID</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">氏名</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">所属会社</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">単価 (月額)</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {staffs.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-700/10 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono text-cyan-400">{staff.id}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-200">{staff.name}</td>
                    <td className="py-4 px-6 text-sm text-slate-300">{getPartnerName(staff.partnerId)}</td>
                    <td className="py-4 px-6 text-sm font-mono text-emerald-400 text-right">
                      {staff.costPerMonth.toLocaleString()} 円
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(staff)}
                          className="px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all text-xs"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(staff)}
                          className="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs"
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
