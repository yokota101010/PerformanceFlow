import { useEffect, useState } from 'react';
import { Project } from '../../domain/models';
import { ProjectService } from '../../application/services/ProjectService';
import { ProjectUseCase } from '../../application/usecases';
import { ProjectForm } from './ProjectForm';

/**
 * プロジェクト一覧の表示、登録/編集フォームとの統合、および削除を管理する画面コンポーネント。
 * 高級感のあるダークテーマ対応スタイリングを施している。
 */
export const ProjectView: React.FC = () => {
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const usecase: ProjectUseCase = new ProjectService();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const list = await usecase.getProjects();
      setProjects(list);
      setError(null);
    } catch (err) {
      setError('プロジェクト一覧の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
  };

  const handleFormSuccess = () => {
    setEditingProject(null);
    loadProjects();
  };

  const handleFormCancel = () => {
    setEditingProject(null);
  };

  const handleDeleteClick = async (project: Project) => {
    setError(null);
    
    const confirmed = window.confirm(`プロジェクト「${project.name}」を削除しますか？`);
    if (!confirmed) {
      return;
    }

    try {
      await usecase.deleteProject(project.id);
      loadProjects();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('削除処理中に予期しないエラーが発生しました。');
      }
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="page-header">
        <h2 className="page-title">プロジェクトマスタ管理</h2>
        <p className="page-subtitle">
          最上位組織体であるプロジェクトマスタの登録、編集、および削除を行います。
        </p>
      </div>

      {/* 登録・編集フォームの切り替え統合 */}
      <ProjectForm
        onSuccess={handleFormSuccess}
        projectToEdit={editingProject}
        onCancel={handleFormCancel}
      />

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
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
          プロジェクトが登録されていません。上のフォームから登録してください。
        </div>
      ) : (
        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'rgba(30, 41, 59, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', width: '150px' }}>
                  プロジェクトID
                </th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  プロジェクト名
                </th>
                <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', width: '160px' }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#3b82f6', fontWeight: 600 }}>{project.id}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#e2e8f0' }}>{project.name}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEditClick(project)}
                        className="btn btn-secondary btn-sm"
                      >
                        編集
                      </button>
                      <button
                        name="delete-btn"
                        onClick={() => handleDeleteClick(project)}
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
        </div>
      )}
    </div>
  );
};
