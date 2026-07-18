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
      <h3 className="text-lg font-bold text-slate-200">
        {editingCase ? '案件情報の編集' : '新規案件の登録'}
      </h3>

      {validationError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded text-sm flex items-center space-x-2 animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 親プロジェクト */}
        <div className="space-y-1">
          <label htmlFor="case-project-id" className="block text-sm font-semibold text-slate-300">
            親プロジェクト
          </label>
          <select
            id="case-project-id"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={!!editingCase}
            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* 案件名 */}
        <div className="space-y-1">
          <label htmlFor="case-name" className="block text-sm font-semibold text-slate-300">
            案件名
          </label>
          <input
            id="case-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="例: 開発支援フェーズ2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 開始日 */}
        <div className="space-y-1">
          <label htmlFor="case-start-date" className="block text-sm font-semibold text-slate-300">
            開始日
          </label>
          <input
            id="case-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* 終了日 */}
        <div className="space-y-1">
          <label htmlFor="case-end-date" className="block text-sm font-semibold text-slate-300">
            終了日
          </label>
          <input
            id="case-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        {editingCase && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-all text-sm font-medium"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 transition-all text-sm font-semibold"
        >
          {editingCase ? '保存' : '登録'}
        </button>
      </div>
    </form>
  );
};
