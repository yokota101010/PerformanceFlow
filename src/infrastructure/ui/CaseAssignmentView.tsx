import React, { useEffect, useState } from 'react';
import { CaseAssignment } from '../../domain/models';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';
import { CaseAssignmentService } from '../../application/services/CaseAssignmentService';
import { CaseAssignmentForm } from './CaseAssignmentForm';

interface CaseAssignmentViewProps {
  onSelectAssignment?: (id: string) => void;
}

/**
 * 案件作業契約（アサイン明細）管理の一覧・操作ビューコンポーネント。
 */
export const CaseAssignmentView: React.FC<CaseAssignmentViewProps> = ({ onSelectAssignment }) => {
  const [assignments, setAssignments] = useState<readonly CaseAssignment[]>([]);
  const [projects, setProjects] = useState<Map<string, string>>(new Map());
  const [cases, setCases] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);

  // 編集モードの状態管理
  const [editTarget, setEditTarget] = useState<{ projectId: string; id: string } | null>(null);

  const usecase = new CaseAssignmentService();

  const loadData = async () => {
    try {
      setError(null);
      const list = await usecase.getAssignments();
      setAssignments(list);

      // プロジェクト・案件名解決のためのマスタロード
      const projectRepo = RepositoryRegistry.getProjectRepository();
      const allProjects = await projectRepo.findAll();
      const pMap = new Map<string, string>();
      allProjects.forEach((p) => pMap.set(p.id, p.name));
      setProjects(pMap);

      const caseRepo = RepositoryRegistry.getCaseRepository();
      const allCases = await caseRepo.findAll();
      const cMap = new Map<string, string>();
      allCases.forEach((c) => cMap.set(`${c.projectId}:${c.id}`, c.name));
      setCases(cMap);
    } catch (e: any) {
      setError(e.message || 'データの取得に失敗しました。');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('ja-JP');
  };

  const handleEditClick = (projectId: string, id: string) => {
    setEditTarget({ projectId, id });
    // 編集時は画面上部へスクロール遷移
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (projectId: string, id: string) => {
    if (!window.confirm(`作業契約 ${id} を削除してよろしいですか？`)) {
      return;
    }
    try {
      setError(null);
      await usecase.deleteAssignment(projectId, id);
      await loadData();
    } catch (e: any) {
      setError(e.message || '削除に失敗しました。');
    }
  };

  const handleFormSuccess = () => {
    setEditTarget(null);
    loadData();
  };

  const handleFormCancel = () => {
    setEditTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f8fafc', borderBottom: '2px solid #0ea5e9', paddingBottom: '8px' }}>
          案件作業契約（アサイン明細）管理
        </h2>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* 登録・編集フォームをテーブル上部に配置 */}
      <div className="mb-8">
        <CaseAssignmentForm
          onSuccess={handleFormSuccess}
          onCancel={editTarget ? handleFormCancel : undefined}
          editTarget={editTarget}
        />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>作業契約ID</th>
                <th>プロジェクト名</th>
                <th>案件名</th>
                <th>開始日</th>
                <th>終了日</th>
                <th style={{ textAlign: 'right' }}>契約工数 (人月)</th>
                <th style={{ textAlign: 'right' }}>契約単価 (円)</th>
                <th style={{ textAlign: 'right' }}>売上 (円)</th>
                <th style={{ textAlign: 'right' }}>製造原価 (円)</th>
                <th style={{ textAlign: 'right' }}>粗利 (円)</th>
                <th style={{ textAlign: 'right' }}>粗利率</th>
                <th style={{ textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item) => {
                const pName = projects.get(item.projectId) || item.projectId;
                const cName = cases.get(`${item.projectId}:${item.caseId}`) || item.caseId;
                const grossProfitColor = item.grossProfit >= 0 ? '#34d399' : '#f87171';

                return (
                  <tr key={`${item.projectId}:${item.id}`}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#ffffff' }}>{item.id}</td>
                    <td style={{ color: '#cbd5e1' }}>{pName}</td>
                    <td style={{ color: '#cbd5e1' }}>{cName}</td>
                    <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{item.startDate}</td>
                    <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{item.endDate}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>{item.contractEffort.toFixed(1)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.contractPrice)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>{formatCurrency(item.sales)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.cost)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: grossProfitColor }}>{formatCurrency(item.grossProfit)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: grossProfitColor }}>{Math.round(item.grossProfitRate * 100)}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex justify-center space-x-2">
                        {onSelectAssignment && (
                          <button
                            onClick={() => onSelectAssignment(item.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '12px', borderColor: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8' }}
                            id={`input-expense-for-${item.id}-btn`}
                          >
                            経費
                          </button>
                        )}
                        <button
                          onClick={() => handleEditClick(item.projectId, item.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.projectId, item.id)}
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    作業契約明細が登録されていません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
