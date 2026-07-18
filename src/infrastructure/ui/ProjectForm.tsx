import { useState, useEffect } from 'react';
import { ProjectService } from '../../application/services/ProjectService';
import { ProjectUseCase } from '../../application/usecases';

interface ProjectFormProps {
  onSuccess: () => void;
  projectToEdit?: { id: string; name: string } | null;
  onCancel?: () => void;
}

/**
 * プロジェクトの新規登録および編集・更新を行う入力フォームコンポーネント。
 * グラスモルフィズム調のダークテーマに合わせた高級感のあるスタイリングを施している。
 */
export const ProjectForm: React.FC<ProjectFormProps> = ({
  onSuccess,
  projectToEdit = null,
  onCancel,
}) => {
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const usecase: ProjectUseCase = new ProjectService();

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
    } else {
      setName('');
    }
    setError(null);
  }, [projectToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (projectToEdit) {
        await usecase.updateProject({ id: projectToEdit.id, name });
      } else {
        await usecase.createProject({ name });
      }
      setName('');
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('は既に登録されています')) {
          setError('既に登録されています。');
        } else {
          setError(err.message);
        }
      } else {
        setError('処理中に予期しないエラーが発生しました。');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: '30px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
        {projectToEdit ? 'プロジェクトの編集' : '新しいプロジェクトの追加'}
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="projectName"
          style={{ display: 'block', fontWeight: 500, fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}
        >
          プロジェクト名
        </label>
        <input
          id="projectName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '15px',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          placeholder="例: 新規製品開発プロジェクト"
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{
            color: '#ef4444',
            fontSize: '13px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '8px 12px',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {submitting ? '処理中...' : projectToEdit ? '保存' : '登録'}
        </button>

        {projectToEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: '#475569',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
};
