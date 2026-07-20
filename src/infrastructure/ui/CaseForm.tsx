import { useEffect, useState } from 'react';
import { Case, Project } from '../../domain/models';
import { CaseService } from '../../application/services/CaseService';
import { CaseUseCase } from '../../application/usecases/CaseUseCase';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';

interface CaseFormProps {
  editingCase: Case | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * 案件の登録・編集用のインプットフォームコンポーネント (US2 / US3)。
 */
export const CaseForm: React.FC<CaseFormProps> = ({ editingCase, onSuccess, onCancel }) => {
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const usecase: CaseUseCase = new CaseService();

  useEffect(() => {
    const loadProjects = async () => {
      const projectRepo = RepositoryRegistry.getProjectRepository();
      const list = await projectRepo.findAll();
      setProjects(list);
      if (list.length > 0 && !projectId) {
        setProjectId(list[0].id);
      }
    };
    loadProjects();
  }, []);

  // 編集データの検知・同期 (US3)
  useEffect(() => {
    if (editingCase) {
      setProjectId(editingCase.projectId);
      setName(editingCase.name);
      setStartDate(editingCase.startDate);
      setEndDate(editingCase.endDate);
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
      if (projects.length > 0) {
        setProjectId(projects[0].id);
      }
    }
    setValidationError(null);
  }, [editingCase]);

  // プロジェクトリストが非同期ロードされた時のデフォルト値
  useEffect(() => {
    if (!editingCase && projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, editingCase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('案件名は必須です。');
      return;
    }
    if (!startDate || !endDate) {
      setValidationError('稼働期間を選択してください。');
      return;
    }

    try {
      if (editingCase) {
        // 更新 (US3)
        await usecase.updateCase({
          projectId: editingCase.projectId,
          id: editingCase.id,
          name: trimmedName,
          startDate,
          endDate,
        });
      } else {
        // 新規登録 (US2)
        await usecase.createCase({
          projectId,
          name: trimmedName,
          startDate,
          endDate,
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
        {editingCase ? '案件情報の編集' : '新規案件の登録'}
      </h3>

      {validationError && (
        <div className="alert-error">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 親プロジェクト */}
        <div className="form-group mb-0">
          <label htmlFor="case-project-id" className="form-label">
            親プロジェクト
          </label>
          <select
            id="case-project-id"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={!!editingCase}
            className="form-select"
            style={editingCase ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* 案件名 */}
        <div className="form-group mb-0">
          <label htmlFor="case-name" className="form-label">
            案件名
          </label>
          <input
            id="case-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="例: 開発支援フェーズ2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 開始日 */}
        <div className="form-group mb-0">
          <label htmlFor="case-start-date" className="form-label">
            開始日
          </label>
          <input
            id="case-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
          />
        </div>

        {/* 終了日 */}
        <div className="form-group mb-0">
          <label htmlFor="case-end-date" className="form-label">
            終了日
          </label>
          <input
            id="case-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {editingCase && (
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
          {editingCase ? '保存' : '登録'}
        </button>
      </div>
    </form>
  );
};
