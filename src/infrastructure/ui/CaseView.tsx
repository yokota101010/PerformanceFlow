import { useEffect, useState } from 'react';
import { Case, Project } from '../../domain/models';
import { CaseService } from '../../application/services/CaseService';
import { CaseUseCase } from '../../application/usecases/CaseUseCase';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';
import { CaseForm } from './CaseForm';

/**
 * 案件一覧を表示し、登録・編集・削除を統合するメインビューコンポーネント (US1 / US2 / US3 / US4)。
 */
export const CaseView: React.FC = () => {
  const [cases, setCases] = useState<readonly Case[]>([]);
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 編集中の案件 (US3)
  const [editingCase, setEditingCase] = useState<Case | null>(null);

  const usecase: CaseUseCase = new CaseService();

  const loadData = async () => {
    try {
      setLoading(true);
      const caseList = await usecase.getCases();
      setCases(caseList);
      
      // プロジェクト一覧もロードして、IDからプロジェクト名を解決できるようにする
      const projectRepo = RepositoryRegistry.getProjectRepository();
      const projectList = await projectRepo.findAll();
      setProjects(projectList);

      setError(null);
    } catch (err) {
      setError('案件一覧の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : projectId;
  };

  const handleEditClick = (caseObj: Case) => {
    setEditingCase(caseObj);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (caseObj: Case) => {
    const confirmed = window.confirm(`案件「${caseObj.name}」を削除してもよろしいですか？`);
    if (!confirmed) return;

    try {
      setError(null);
      await usecase.deleteCase(caseObj.projectId, caseObj.id);
      await loadData();
    } catch (err: any) {
      setError(err.message || '削除に失敗しました。');
    }
  };

  const handleFormSuccess = () => {
    setEditingCase(null);
    loadData();
  };

  const handleFormCancel = () => {
    setEditingCase(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">案件管理</h2>
        <p className="text-slate-400 text-sm">
          プロジェクトに紐づく作業アサイン先（案件マスタ）の登録、編集、および削除を行います。
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

      <CaseForm
        editingCase={editingCase}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">読み込み中...</div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-slate-400">登録されている案件はいません。</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">親プロジェクト</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">案件ID</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">案件名</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-center">稼働期間</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {cases.map((c) => (
                  <tr key={`${c.projectId}:${c.id}`} className="hover:bg-slate-700/10 transition-colors">
                    <td className="py-4 px-6 text-sm text-slate-300">{getProjectName(c.projectId)}</td>
                    <td className="py-4 px-6 text-sm font-mono text-cyan-400">{c.id}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-200">{c.name}</td>
                    <td className="py-4 px-6 text-sm font-mono text-slate-300 text-center">
                      {c.startDate} 〜 {c.endDate}
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all text-xs"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c)}
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
