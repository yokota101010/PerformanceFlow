import React, { useEffect, useState } from 'react';
import { PartnerOrder, Staff, CaseAssignment } from '../../domain/models';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';
import { PartnerOrderService } from '../../application/services/PartnerOrderService';

interface PartnerOrderFormProps {
  editOrderId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface DetailInput {
  staffId: string;
  orderEffort: number;
}

export const PartnerOrderForm: React.FC<PartnerOrderFormProps> = ({ editOrderId, onSuccess, onCancel }) => {
  const [caseAssignments, setCaseAssignments] = useState<readonly CaseAssignment[]>([]);
  const [partners, setPartners] = useState<readonly { id: string; name: string }[]>([]);
  const [allStaffs, setAllStaffs] = useState<readonly Staff[]>([]);
  
  // フォーム基本入力値 (新規登録用)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [targetMonth, setTargetMonth] = useState<string>('');

  // 編集モード用の既存発注情報
  const [existingOrder, setExistingOrder] = useState<PartnerOrder | null>(null);

  // 明細編集用のローカルステート
  const [details, setDetails] = useState<DetailInput[]>([]);
  const [newStaffId, setNewStaffId] = useState<string>('');
  const [newEffort, setNewEffort] = useState<string>('0.5');

  const [error, setError] = useState<string | null>(null);

  const usecase = new PartnerOrderService();

  useEffect(() => {
    const loadMasters = async () => {
      try {
        setError(null);
        // 各種マスタデータの読み込み
        const assignmentRepo = RepositoryRegistry.getCaseAssignmentRepository();
        const list = await assignmentRepo.findAll();
        setCaseAssignments(list);

        const partnerRepo = RepositoryRegistry.getPartnerRepository();
        const pList = await partnerRepo.findAll();
        setPartners(pList);

        const staffRepo = RepositoryRegistry.getStaffRepository();
        const sList = await staffRepo.findAll();
        setAllStaffs(sList);

        // 編集モードの場合、既存発注データを読み込む
        if (editOrderId) {
          const order = await usecase.getOrderById(editOrderId);
          if (order) {
            setExistingOrder(order);
            setDetails(order.details.map(d => ({ staffId: d.staffId, orderEffort: d.orderEffort })));
          } else {
            setError('編集対象の発注データが見つかりません。');
          }
        }
      } catch (e: any) {
        setError(e.message || 'マスタデータのロードに失敗しました。');
      }
    };
    loadMasters();
  }, [editOrderId]);

  // 新規登録の処理
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId || !selectedPartnerId || !targetMonth) {
      setError('すべての必須項目を入力してください。');
      return;
    }
    try {
      setError(null);
      // targetMonth は "YYYY-MM" から "YYYY-MM-01" 形式にする
      const formattedMonth = `${targetMonth}-01`;
      await usecase.createOrder({
        caseAssignmentId: selectedAssignmentId,
        partnerId: selectedPartnerId,
        targetMonth: formattedMonth
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || '発注の作成に失敗しました。');
    }
  };

  // 編集保存の処理
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingOrder) return;
    try {
      setError(null);
      await usecase.updateOrderDetails({
        orderId: existingOrder.id,
        details: details.map(d => ({ staffId: d.staffId, orderEffort: d.orderEffort }))
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || '発注額明細の保存に失敗しました。');
    }
  };

  // 明細追加処理 (ローカルステート)
  const handleAddDetail = () => {
    if (!newStaffId) {
      setError('要員を選択してください。');
      return;
    }
    const effortVal = parseFloat(newEffort);
    if (isNaN(effortVal) || effortVal < 0 || effortVal > 1) {
      setError('発注工数は0以上1以下の範囲で入力してください。');
      return;
    }
    
    // 小数点第2位以下の入力制限
    const effortStr = newEffort.toString();
    const decPart = effortStr.split('.')[1];
    if (decPart && decPart.length > 1) {
      setError('発注工数は小数点以下1桁までで入力してください。');
      return;
    }

    // 重複チェック
    const isExist = details.some(d => d.staffId === newStaffId);
    if (isExist) {
      setError('この要員は既に明細に追加されています。');
      return;
    }

    // ドメイン層所属チェックをフォーム上でもガード（選択肢をフィルタするため通常発生しないが安全策）
    const selectedStaff = allStaffs.find(s => s.id === newStaffId);
    const partnerId = existingOrder ? existingOrder.partnerId : selectedPartnerId;
    if (selectedStaff && selectedStaff.partnerId !== partnerId) {
      setError('要員の所属会社と発注先が一致しません。');
      return;
    }

    setError(null);
    setDetails([...details, { staffId: newStaffId, orderEffort: effortVal }]);
    setNewStaffId('');
    setNewEffort('0.5');
  };

  // 明細削除処理 (ローカルステート)
  const handleRemoveDetail = (staffId: string) => {
    setDetails(details.filter(d => d.staffId !== staffId));
  };

  // 明細の工数変更処理 (ローカルステート)
  const handleEffortChange = (staffId: string, value: string) => {
    const effortVal = parseFloat(value);
    setDetails(details.map(d => {
      if (d.staffId === staffId) {
        return { ...d, orderEffort: isNaN(effortVal) ? 0 : effortVal };
      }
      return d;
    }));
  };

  // 発注先企業に所属する要員のみにフィルタリング
  const activePartnerId = existingOrder ? existingOrder.partnerId : selectedPartnerId;
  const filteredStaffs = allStaffs.filter(s => s.partnerId === activePartnerId);

  const getStaffName = (staffId: string) => {
    const s = allStaffs.find(x => x.id === staffId);
    return s ? s.name : staffId;
  };

  const getStaffPrice = (staffId: string) => {
    const s = allStaffs.find(x => x.id === staffId);
    return s ? s.costPerMonth : 0;
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('ja-JP');
  };

  // 新規登録モードのマークアップ
  if (!editOrderId) {
    return (
      <div className="glass-panel">
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px 0', color: '#ffffff' }}>新規発注登録</h3>
        {error && <div className="alert-error">{error}</div>}
        
        <form onSubmit={handleCreateSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="caseAssignment" className="form-label">作業契約 (アサイン)</label>
              <select
                id="caseAssignment"
                className="form-select"
                value={selectedAssignmentId}
                onChange={e => setSelectedAssignmentId(e.target.value)}
              >
                <option value="">選択してください</option>
                {caseAssignments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.id} ({a.startDate} 〜 {a.endDate})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="partner" className="form-label">発注先企業</label>
              <select
                id="partner"
                className="form-select"
                value={selectedPartnerId}
                onChange={e => setSelectedPartnerId(e.target.value)}
              >
                <option value="">選択してください</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="targetMonth" className="form-label">対象年月</label>
              <input
                id="targetMonth"
                type="month"
                className="form-input"
                value={targetMonth}
                onChange={e => setTargetMonth(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              登録する
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 編集・明細追加モードのマークアップ
  if (!existingOrder) {
    return (
      <div className="glass-panel">
        <div style={{ color: '#94a3b8', textAlign: 'center' }}>読み込み中...</div>
      </div>
    );
  }

  const partnerName = partners.find(p => p.id === existingOrder.partnerId)?.name || existingOrder.partnerId;

  // 動的な合計計算
  const calcTotalEffort = () => {
    const sum10 = details.reduce((sum, d) => sum + Math.round(d.orderEffort * 10), 0);
    return sum10 / 10;
  };

  const calcTotalAmount = () => {
    return details.reduce((sum, d) => sum + Math.round(d.orderEffort * getStaffPrice(d.staffId)), 0);
  };

  return (
    <div className="glass-panel" style={{ borderLeft: '4px solid #eab308' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px 0', color: '#ffffff' }}>
        発注編集・明細追加 ({existingOrder.id})
      </h3>
      {error && <div className="alert-error">{error}</div>}

      {/* 発注親基本情報 (リードオンリー) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>作業契約ID</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{existingOrder.caseAssignmentId}</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>発注先企業</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{partnerName}</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>対象年月</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{existingOrder.targetMonth.substring(0, 7)}</span>
        </div>
      </div>

      <form onSubmit={handleEditSubmit}>
        {/* 明細追加フォーム */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 16px 0', color: '#38bdf8' }}>新しい要員の追加</h4>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <label className="form-label">所属要員 (所属: {partnerName})</label>
              <select
                className="form-select"
                value={newStaffId}
                onChange={e => setNewStaffId(e.target.value)}
              >
                <option value="">要員を選択してください</option>
                {filteredStaffs.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (単価: {formatCurrency(s.costPerMonth)}円)</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">発注工数 (人月)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="form-input"
                value={newEffort}
                onChange={e => setNewEffort(e.target.value)}
              />
            </div>
            <button type="button" onClick={handleAddDetail} className="btn btn-secondary" style={{ height: '40px' }}>
              明細追加
            </button>
          </div>
        </div>

        {/* 明細グリッド一覧 */}
        <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0', color: '#f8fafc' }}>明細一覧</h4>
        <table className="modern-table" style={{ marginBottom: '24px' }}>
          <thead>
            <tr>
              <th>要員ID</th>
              <th>要員名</th>
              <th style={{ textAlign: 'right' }}>発注単価 (円)</th>
              <th style={{ width: '150px', textAlign: 'right' }}>発注工数 (人月)</th>
              <th style={{ textAlign: 'right' }}>発注額 (円)</th>
              <th style={{ textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {details.map(item => {
              const price = getStaffPrice(item.staffId);
              const amount = Math.round(item.orderEffort * price);
              
              return (
                <tr key={item.staffId}>
                  <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{item.staffId}</td>
                  <td style={{ color: '#ffffff', fontWeight: 500 }}>{getStaffName(item.staffId)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(price)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      className="form-input"
                      style={{ textAlign: 'right', padding: '6px 10px', width: '100px', display: 'inline-block' }}
                      value={item.orderEffort}
                      onChange={e => handleEffortChange(item.staffId, e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>{formatCurrency(amount)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button type="button" onClick={() => handleRemoveDetail(item.staffId)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                      除外
                    </button>
                  </td>
                </tr>
              );
            })}
            {details.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                  明細がありません。上のフォームから要員を追加してください。
                </td>
              </tr>
            )}
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderTop: '2px solid rgba(255, 255, 255, 0.1)' }}>
              <td colSpan={3} style={{ fontWeight: 600, color: '#ffffff', textAlign: 'right' }}>合計値</td>
              <td style={{ fontWeight: 600, color: '#38bdf8', textAlign: 'right' }}>{calcTotalEffort().toFixed(1)} 人月</td>
              <td style={{ fontWeight: 700, color: '#0ea5e9', textAlign: 'right' }}>{formatCurrency(calcTotalAmount())} 円</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            キャンセル
          </button>
          <button type="submit" className="btn btn-primary">
            明細変更を保存
          </button>
        </div>
      </form>
    </div>
  );
};
