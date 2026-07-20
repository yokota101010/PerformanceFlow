import React, { useEffect, useState } from 'react';
import { Project, Case } from '../../domain/models';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';
import { CaseAssignmentService } from '../../application/services/CaseAssignmentService';

interface CaseAssignmentFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  editTarget?: { projectId: string; id: string } | null;
}

/**
 * 案件作業契約（アサイン契約）新規登録・編集用のフォームコンポーネント。
 */
export const CaseAssignmentForm: React.FC<CaseAssignmentFormProps> = ({
  onSuccess,
  onCancel,
  editTarget,
}) => {
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [cases, setCases] = useState<readonly Case[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [contractEffort, setContractEffort] = useState<string>('');
  const [contractPrice, setContractPrice] = useState<string>('');

  const [error, setError] = useState<string | null>(null);

  const usecase = new CaseAssignmentService();

  useEffect(() => {
    const loadMasters = async () => {
      const pRepo = RepositoryRegistry.getProjectRepository();
      const cRepo = RepositoryRegistry.getCaseRepository();

      const pList = await pRepo.findAll();
      setProjects(pList);

      const cList = await cRepo.findAll();
      setCases(cList);
    };
    loadMasters();
  }, []);

  // 編集対象が渡された場合の初期値ロード
  useEffect(() => {
    if (editTarget) {
      const loadTarget = async () => {
        const repo = RepositoryRegistry.getCaseAssignmentRepository();
        const item = await repo.findById(editTarget.id);
        if (item) {
          setSelectedProjectId(item.projectId);
          setSelectedCaseId(item.caseId);
          setStartDate(item.startDate);
          setContractEffort(item.contractEffort.toString());
          setContractPrice(item.contractPrice.toString());
        }
      };
      loadTarget();
    } else {
      setSelectedProjectId('');
      setSelectedCaseId('');
      setStartDate('');
      setContractEffort('');
      setContractPrice('');
    }
    setError(null);
  }, [editTarget]);

  // 選択されたプロジェクトIDに紐づく案件のみにフィルタリング
  const filteredCases = cases.filter((c) => c.projectId === selectedProjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      const effortNum = parseFloat(contractEffort);
      const priceNum = parseInt(contractPrice, 10);

      if (isNaN(effortNum)) {
        throw new Error('契約工数は数値を入力してください。');
      }
      if (isNaN(priceNum)) {
        throw new Error('契約単価は整数を入力してください。');
      }

      if (editTarget) {
        // 更新処理
        await usecase.updateAssignment({
          projectId: selectedProjectId,
          id: editTarget.id,
          startDate,
          contractEffort: effortNum,
          contractPrice: priceNum,
        });
      } else {
        // 新規登録
        await usecase.createAssignment({
          projectId: selectedProjectId,
          caseId: selectedCaseId,
          startDate,
          contractEffort: effortNum,
          contractPrice: priceNum,
        });
      }

      // 成功時のクリア・通知
      if (!editTarget) {
        setStartDate('');
        setContractEffort('');
        setContractPrice('');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || '保存に失敗しました。');
    }
  };

  return (
    <div className="glass-panel p-6 mt-6 max-w-xl mx-auto shadow-2xl">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
        {editTarget ? `作業契約の編集 (ID: ${editTarget.id})` : '新しい作業契約の追加'}
      </h3>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group mb-0">
          <label htmlFor="projectId" className="form-label">プロジェクト</label>
          <select
            id="projectId"
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedCaseId('');
            }}
            disabled={!!editTarget}
            required
            className="form-select"
            style={editTarget ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          >
            <option value="">-- プロジェクトを選択してください --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group mb-0">
          <label htmlFor="caseId" className="form-label">案件</label>
          <select
            id="caseId"
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            disabled={!!editTarget || !selectedProjectId}
            required
            className="form-select"
            style={(editTarget || !selectedProjectId) ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          >
            <option value="">-- 案件を選択してください --</option>
            {filteredCases.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group mb-0">
          <label htmlFor="startDate" className="form-label">開始日</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-group mb-0">
          <label htmlFor="contractEffort" className="form-label">契約工数 (人月)</label>
          <input
            type="number"
            step="0.1"
            id="contractEffort"
            value={contractEffort}
            onChange={(e) => setContractEffort(e.target.value)}
            placeholder="例: 1.0"
            required
            className="form-input"
            style={{ textAlign: 'right' }}
          />
        </div>

        <div className="form-group mb-0">
          <label htmlFor="contractPrice" className="form-label">契約単価 (円)</label>
          <input
            type="number"
            id="contractPrice"
            value={contractPrice}
            onChange={(e) => setContractPrice(e.target.value)}
            placeholder="例: 800000"
            required
            className="form-input"
            style={{ textAlign: 'right' }}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
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
            {editTarget ? '保存' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
};
