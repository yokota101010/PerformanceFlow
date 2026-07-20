import React, { useState, useEffect } from 'react';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';
import { OtherExpense } from '../../domain/models/OtherExpense';
import { CaseAssignment } from '../../domain/models/types';
import { OtherExpenseService } from '../../application/services/OtherExpenseService';
import { OtherExpenseForm } from './OtherExpenseForm';

interface OtherExpenseViewProps {
  initialCaseAssignmentId?: string;
  onBack?: () => void; // 戻るボタンが押された時のコールバック (案件作業明細一覧等へ戻るため)
}

export const OtherExpenseView: React.FC<OtherExpenseViewProps> = ({
  initialCaseAssignmentId = '',
  onBack
}) => {
  const [assignments, setAssignments] = useState<readonly CaseAssignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(initialCaseAssignmentId);
  const [expenses, setExpenses] = useState<readonly OtherExpense[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<OtherExpense | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const service = new OtherExpenseService();

  // アサイン契約一覧の取得
  const loadAssignments = async () => {
    try {
      const assignRepo = RepositoryRegistry.getCaseAssignmentRepository();
      const list = await assignRepo.findAll();
      setAssignments(list);

      // 初期アサインIDが未指定かつリストが空でない場合、最初のアサインをデフォルト選択
      if (!selectedAssignmentId && list.length > 0) {
        setSelectedAssignmentId(list[0].id);
      }
    } catch (e) {
      console.error('アサイン情報の取得に失敗しました。', e);
    }
  };

  // 選択中のアサインIDに紐づく経費一覧の取得
  const loadExpenses = async () => {
    if (!selectedAssignmentId) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await service.getOtherExpenses(selectedAssignmentId);
      setExpenses(list);
      setErrorMsg('');
    } catch (e: any) {
      setErrorMsg(e.message || '経費データのロードに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [selectedAssignmentId]);

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAssignmentId(e.target.value);
  };

  const handleCreateClick = () => {
    if (!selectedAssignmentId) {
      alert('作業契約を選択してください。');
      return;
    }
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditClick = (item: OtherExpense) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteClick = async (item: OtherExpense) => {
    if (window.confirm('この経費明細を削除しますか？')) {
      try {
        await service.deleteOtherExpense(item.caseAssignmentId, item.lineNo);
        await loadExpenses();
      } catch (e: any) {
        alert(e.message || '削除に失敗しました。');
      }
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingItem(null);
    await loadExpenses();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  // 合計金額の計算
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  // 選択中のアサイン明細オブジェクト
  const activeAssignment = assignments.find(a => a.id === selectedAssignmentId);

  return (
    <div className="space-y-6">
      {/* ヘッダーエリア */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="btn btn-secondary"
              id="back-to-assignments-btn"
            >
              ← 戻る
            </button>
          )}
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f8fafc', borderBottom: '2px solid #0ea5e9', paddingBottom: '8px' }}>
            その他経費入力
          </h2>
        </div>
        <button
          onClick={handleCreateClick}
          disabled={!selectedAssignmentId}
          className="btn btn-primary"
          style={!selectedAssignmentId ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          id="open-expense-form-btn"
        >
          ＋ 経費追加
        </button>
      </div>

      {/* セレクターおよびサマリ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel flex flex-col justify-between p-4">
          <label className="form-label mb-2">
            作業契約 (アサイン) 選択
          </label>
          <select
            value={selectedAssignmentId}
            onChange={handleAssignmentChange}
            className="form-select"
            id="assignment-selector"
          >
            <option value="">-- 作業契約を選択してください --</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {a.id} ({a.startDate} 〜 {a.endDate})
              </option>
            ))}
          </select>
        </div>

        {activeAssignment && (
          <div className="glass-panel p-4">
            <span className="form-label mb-1">
              契約情報
            </span>
            <div className="text-sm space-y-1">
              <p><span className="text-slate-400">案件ID:</span> {activeAssignment.caseId}</p>
              <p><span className="text-slate-400">売上単価:</span> {activeAssignment.contractPrice.toLocaleString()} 円</p>
              <p><span className="text-slate-400">アサイン工数:</span> {activeAssignment.contractEffort} 人月</p>
            </div>
          </div>
        )}

        <div className="glass-panel p-4 flex flex-col justify-center" style={{ borderLeft: '4px solid #38bdf8' }}>
          <span className="form-label mb-1" style={{ color: '#38bdf8' }}>
            その他経費合計
          </span>
          <span className="text-3xl font-extrabold text-white" id="expense-total-amount">
            {totalAmount.toLocaleString()} <span className="text-lg font-normal text-slate-300">円</span>
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-error">
          {errorMsg}
        </div>
      )}

      {/* 経費一覧テーブル */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">読み込み中...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            登録されているその他経費はありません。上の「経費追加」ボタンから登録してください。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>行No</th>
                  <th>摘要</th>
                  <th style={{ textAlign: 'right' }}>金額 (円)</th>
                  <th style={{ textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(item => (
                  <tr key={item.lineNo}>
                    <td style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{item.lineNo}</td>
                    <td style={{ fontWeight: 500, color: '#f8fafc' }}>{item.memo}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                      {item.amount.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                          id={`edit-expense-${item.lineNo}-btn`}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="btn btn-danger"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                          id={`delete-expense-${item.lineNo}-btn`}
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

      {/* フォームダイアログ (モーダル) */}
      {showForm && (
        <OtherExpenseForm
          caseAssignmentId={selectedAssignmentId}
          editingItem={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};
