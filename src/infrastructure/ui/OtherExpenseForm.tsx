import React, { useState, useEffect } from 'react';
import { OtherExpense, isValidDateString } from '../../domain/models/OtherExpense';
import { OtherExpenseService } from '../../application/services/OtherExpenseService';

interface OtherExpenseFormProps {
  caseAssignmentId: string;
  editingItem: OtherExpense | null; // 編集時はデータが渡され、新規時は null
  onSuccess: () => void;
  onCancel: () => void;
}

export const OtherExpenseForm: React.FC<OtherExpenseFormProps> = ({
  caseAssignmentId,
  editingItem,
  onSuccess,
  onCancel,
}) => {
  const [occurrenceDate, setOccurrenceDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const service = new OtherExpenseService();
  const isEdit = !!editingItem;

  // 初期値のロード（編集モード時）
  useEffect(() => {
    if (editingItem) {
      setOccurrenceDate(editingItem.occurrenceDate || '');
      setAmount(editingItem.amount.toString());
      setMemo(editingItem.memo);
    } else {
      setOccurrenceDate('');
      setAmount('');
      setMemo('');
    }
    setErrorMsg('');
  }, [editingItem, caseAssignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 発生日のバリデーション (FR-003)
    if (!occurrenceDate.trim()) {
      setErrorMsg('発生日は必須です。');
      return;
    }

    if (!isValidDateString(occurrenceDate.trim())) {
      setErrorMsg('発生日は YYYY-MM-DD 形式の有効な日付で入力してください。');
      return;
    }

    // 金額のバリデーション (FR-007)
    const amountVal = parseInt(amount, 10);
    if (isNaN(amountVal) || amountVal < 0) {
      setErrorMsg('金額は0以上の整数でなければなりません。');
      return;
    }

    // 摘要のバリデーション (FR-008)
    if (!memo.trim()) {
      setErrorMsg('摘要は必須項目です。');
      return;
    }

    if (memo.length > 100) {
      setErrorMsg('摘要は100文字以内でなければなりません。');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit && editingItem) {
        await service.updateOtherExpense({
          caseAssignmentId: editingItem.caseAssignmentId,
          oldOccurrenceDate: editingItem.occurrenceDate,
          lineNo: editingItem.lineNo,
          occurrenceDate: occurrenceDate.trim(),
          amount: amountVal,
          memo: memo.trim(),
        });
      } else {
        await service.createOtherExpense({
          caseAssignmentId,
          occurrenceDate: occurrenceDate.trim(),
          amount: amountVal,
          memo: memo.trim(),
        });
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || '保存に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="glass-panel w-full max-w-md p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
            {isEdit
              ? `経費編集 (${editingItem?.occurrenceDate} / 行No: ${editingItem?.lineNo})`
              : '新規経費追加'}
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* エラーメッセージ */}
        {errorMsg && (
          <div className="alert-error mb-4">
            {errorMsg}
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group mb-0">
            <label 
              htmlFor="expense-occurrence-date-input" 
              className="form-label"
            >
              発生日 (YYYY-MM-DD)
            </label>
            <input
              type="date"
              id="expense-occurrence-date-input"
              value={occurrenceDate}
              onChange={(e) => setOccurrenceDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="form-input"
              disabled={submitting}
            />
          </div>

          <div className="form-group mb-0">
            <label 
              htmlFor="expense-amount-input" 
              className="form-label"
            >
              金額 (円)
            </label>
            <input
              type="number"
              id="expense-amount-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="例: 15000"
              className="form-input"
              disabled={submitting}
            />
          </div>

          <div className="form-group mb-0">
            <label 
              htmlFor="expense-memo-input" 
              className="form-label"
            >
              摘要
            </label>
            <input
              type="text"
              id="expense-memo-input"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="例: 開発環境クラウド利用料"
              className="form-input"
              disabled={submitting}
            />
            <span className="block text-right text-[10px] text-slate-400 mt-1">
              {memo.length} / 100 文字
            </span>
          </div>

          {/* フッターアクション */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={submitting}
              id="cancel-expense-btn"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="save-expense-btn"
              style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            >
              {submitting ? '保存中...' : isEdit ? '保存' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
