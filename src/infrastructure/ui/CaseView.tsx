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
        <div className="alert-error">
          {error}
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
            <table className="modern-table">
              <thead>
                <tr>
                  <th>親プロジェクト</th>
                  <th>案件ID</th>
                  <th>案件名</th>
                  <th style={{ textAlign: 'center' }}>稼働期間</th>
                  <th style={{ textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={`${c.projectId}:${c.id}`}>
                    <td style={{ color: '#cbd5e1' }}>{getProjectName(c.projectId)}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>{c.id}</td>
                    <td style={{ fontWeight: 500, color: '#f8fafc' }}>{c.name}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#cbd5e1' }}>
                      {c.startDate} 〜 {c.endDate}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c)}
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
