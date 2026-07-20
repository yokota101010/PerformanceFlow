import { useEffect, useState } from 'react';
import { Staff, Partner } from '../../domain/models';
import { StaffService } from '../../application/services/StaffService';
import { StaffUseCase } from '../../application/usecases/StaffUseCase';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';

interface StaffFormProps {
  editingStaff?: Staff | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * 要員の新規登録および編集更新を行うインプットフォームコンポーネント (US2 / US3)。
 */
export const StaffForm: React.FC<StaffFormProps> = ({ editingStaff, onSuccess, onCancel }) => {
  const [name, setName] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string>('');
  const [costPerMonth, setCostPerMonth] = useState<string>('');
  const [partners, setPartners] = useState<readonly Partner[]>([]);
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const usecase: StaffUseCase = new StaffService();

  useEffect(() => {
    // 所属会社（発注先）の一覧をロード
    const loadPartners = async () => {
      const partnerRepo = RepositoryRegistry.getPartnerRepository();
      const list = await partnerRepo.findAll();
      setPartners(list);
      if (list.length > 0 && !partnerId) {
        setPartnerId(list[0].id);
      }
    };
    loadPartners();
  }, []);

  // 編集中の要員の変更を検知してロード、または新規登録用のクリア
  useEffect(() => {
    if (editingStaff) {
      setName(editingStaff.name);
      setPartnerId(editingStaff.partnerId);
      setCostPerMonth(String(editingStaff.costPerMonth));
    } else {
      setName('');
      setCostPerMonth('');
      if (partners.length > 0) {
        setPartnerId(partners[0].id);
      }
    }
    setValidationError(null);
  }, [editingStaff]);

  // 発注先リストの非同期ロードが完了した際のデフォルト値設定
  useEffect(() => {
    if (!editingStaff && partners.length > 0 && !partnerId) {
      setPartnerId(partners[0].id);
    }
  }, [partners, editingStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('氏名は必須です。');
      return;
    }

    if (!partnerId) {
      setValidationError('所属会社は必須です。');
      return;
    }

    const costNum = parseInt(costPerMonth, 10);
    if (isNaN(costNum) || costNum < 0) {
      setValidationError('単価は0以上の整数で入力してください。');
      return;
    }

    try {
      if (editingStaff) {
        await usecase.updateStaff({
          id: editingStaff.id,
          name: trimmedName,
          partnerId,
          costPerMonth: costNum,
        });
      } else {
        await usecase.createStaff({
          name: trimmedName,
          partnerId,
          costPerMonth: costNum,
        });
      }
      onSuccess();
    } catch (err: any) {
      setValidationError(err.message || '保存に失敗しました。');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
        {editingStaff ? '要員情報の編集' : '新規要員の登録'}
      </h3>

      {validationError && (
        <div className="alert-error">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-group mb-0">
          <label htmlFor="staff-name" className="form-label">
            氏名
          </label>
          <input
            id="staff-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="例: 岡田以蔵"
          />
        </div>

        <div className="form-group mb-0">
          <label htmlFor="staff-partner" className="form-label">
            所属会社
          </label>
          <select
            id="staff-partner"
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="form-select"
          >
            {partners.length === 0 ? (
              <option value="">(発注先がありません)</option>
            ) : (
              partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group mb-0">
          <label htmlFor="staff-cost" className="form-label">
            単価 (月額)
          </label>
          <input
            id="staff-cost"
            type="number"
            value={costPerMonth}
            onChange={(e) => setCostPerMonth(e.target.value)}
            className="form-input"
            placeholder="金額を数値で入力"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {editingStaff && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
        >
          {editingStaff ? '保存' : '登録'}
        </button>
      </div>
    </form>
  );
};
