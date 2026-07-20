import React, { useEffect, useState } from 'react';
import { PartnerOrder } from '../../domain/models';
import { RepositoryRegistry } from '../persistence/RepositoryRegistry';
import { PartnerOrderService } from '../../application/services/PartnerOrderService';
import { PartnerOrderForm } from './PartnerOrderForm';

/**
 * 発注（注文）管理の一覧・操作ビューコンポーネント。
 */
export const PartnerOrderView: React.FC = () => {
  const [orders, setOrders] = useState<readonly PartnerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // マスタ解決用の状態マップ
  const [partners, setPartners] = useState<Map<string, string>>(new Map());
  const [staffs, setStaffs] = useState<Map<string, { name: string; partnerId: string }>>(new Map());
  const [error, setError] = useState<string | null>(null);

  // 新規・編集フォームの連携用状態
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const usecase = new PartnerOrderService();

  const loadData = async () => {
    try {
      setError(null);
      const list = await usecase.getOrders();
      setOrders(list);

      // 発注先マスタ解決
      const partnerRepo = RepositoryRegistry.getPartnerRepository();
      const allPartners = await partnerRepo.findAll();
      const pMap = new Map<string, string>();
      allPartners.forEach(p => pMap.set(p.id, p.name));
      setPartners(pMap);

      // 要員マスタ解決
      const staffRepo = RepositoryRegistry.getStaffRepository();
      const allStaffs = await staffRepo.findAll();
      const sMap = new Map<string, { name: string; partnerId: string }>();
      allStaffs.forEach(s => sMap.set(s.id, { name: s.name, partnerId: s.partnerId }));
      setStaffs(sMap);
    } catch (e: any) {
      setError(e.message || 'データのロードに失敗しました。');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('ja-JP');
  };

  const handleDetailClick = (orderId: string) => {
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
  };

  const handleEditClick = (orderId: string) => {
    setEditOrderId(orderId);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (orderId: string) => {
    if (!window.confirm(`発注データ ${orderId} を削除してよろしいですか？（紐づく注文明細もすべて削除されます）`)) {
      return;
    }
    try {
      setError(null);
      await usecase.deleteOrder(orderId);
      if (selectedOrderId === orderId) {
        setSelectedOrderId(null);
      }
      await loadData();
    } catch (e: any) {
      setError(e.message || '削除に失敗しました。');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditOrderId(null);
    loadData();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditOrderId(null);
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f8fafc', borderBottom: '2px solid #0ea5e9', paddingBottom: '8px' }}>
          発注管理
        </h2>
        {!isFormOpen && (
          <button onClick={() => { setEditOrderId(null); setIsFormOpen(true); }} className="btn btn-primary">
            新規発注登録
          </button>
        )}
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {isFormOpen && (
        <div style={{ marginBottom: '32px' }}>
          <PartnerOrderForm
            editOrderId={editOrderId || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>注文ID</th>
              <th>作業契約ID</th>
              <th>発注先名</th>
              <th>年月</th>
              <th style={{ textAlign: 'right' }}>合計工数 (人月)</th>
              <th style={{ textAlign: 'right' }}>合計発注額 (円)</th>
              <th style={{ textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => {
              const partnerName = partners.get(item.partnerId) || item.partnerId;
              const isSelected = selectedOrderId === item.id;
              
              return (
                <tr key={item.id} style={{ backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#ffffff' }}>{item.id}</td>
                  <td>{item.caseAssignmentId}</td>
                  <td>{partnerName}</td>
                  <td>{item.targetMonth.substring(0, 7)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{item.totalEffort.toFixed(1)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>{formatCurrency(item.totalAmount)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleDetailClick(item.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        {isSelected ? '詳細を閉じる' : '詳細'}
                      </button>
                      <button onClick={() => handleEditClick(item.id)} className="btn btn-warning" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        編集
                      </button>
                      <button onClick={() => handleDeleteClick(item.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  発注データが登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="glass-panel" style={{ borderLeft: '4px solid #38bdf8' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px 0', color: '#ffffff', display: 'flex', justifyContent: 'space-between' }}>
            <span>注文明細詳細 ({selectedOrder.id})</span>
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 400 }}>
              年月: {selectedOrder.targetMonth.substring(0, 7)} | 発注先: {partners.get(selectedOrder.partnerId) || selectedOrder.partnerId}
            </span>
          </h3>

          <table className="modern-table">
            <thead>
              <tr>
                <th>要員ID</th>
                <th>要員名</th>
                <th style={{ textAlign: 'right' }}>発注工数 (人月)</th>
                <th style={{ textAlign: 'right' }}>発注単価 (円)</th>
                <th style={{ textAlign: 'right' }}>発注額 (円)</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.details.map((detail) => {
                const staffInfo = staffs.get(detail.staffId);
                const staffName = staffInfo ? staffInfo.name : detail.staffId;
                
                return (
                  <tr key={detail.staffId}>
                    <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{detail.staffId}</td>
                    <td style={{ color: '#ffffff', fontWeight: 500 }}>{staffName}</td>
                    <td style={{ textAlign: 'right' }}>{detail.orderEffort.toFixed(1)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(detail.orderPrice)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>{formatCurrency(detail.orderAmount)}</td>
                  </tr>
                );
              })}
              {selectedOrder.details.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                    注文明細が追加されていません。右上の「編集」から明細を追加してください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
