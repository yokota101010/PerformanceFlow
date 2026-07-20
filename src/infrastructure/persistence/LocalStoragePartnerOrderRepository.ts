import { PartnerOrder } from '../../domain/models/PartnerOrder';
import { OrderDetail } from '../../domain/models/PartnerOrder';
import { PartnerOrderRepository } from '../../domain/repositories';

interface SerializedOrderDetail {
  orderId: string;
  staffId: string;
  orderEffort: number;
  orderPrice: number;
  targetMonth: string;
  partnerId: string;
}

interface SerializedPartnerOrder {
  id: string;
  caseAssignmentId: string;
  partnerId: string;
  targetMonth: string;
  details: SerializedOrderDetail[];
}

/**
 * 本番用のブラウザ LocalStorage による発注・注文明細永続化リポジトリ。
 */
export class LocalStoragePartnerOrderRepository implements PartnerOrderRepository {
  private readonly STORAGE_KEY = 'performance_flow_partner_orders';

  constructor() {
    this.initializeSeedsIfEmpty();
  }

  private loadSerialized(): Map<string, SerializedPartnerOrder> {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) {
      return new Map();
    }
    try {
      const parsed = JSON.parse(json) as SerializedPartnerOrder[];
      const map = new Map<string, SerializedPartnerOrder>();
      parsed.forEach(o => map.set(o.id, o));
      return map;
    } catch {
      return new Map();
    }
  }

  private saveSerialized(map: Map<string, SerializedPartnerOrder>): void {
    const list = Array.from(map.values());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  private initializeSeedsIfEmpty(): void {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (json) {
      return; // すでにデータが存在する場合は初期化しない
    }

    const seeds: SerializedPartnerOrder[] = [
      {
        id: 'ORD001',
        caseAssignmentId: 'WK001',
        partnerId: 'BP001',
        targetMonth: '2026-08-01',
        details: [
          { orderId: 'ORD001', staffId: 'MEM001', orderEffort: 0.8, orderPrice: 1000000, targetMonth: '2026-08-01', partnerId: 'BP001' },
          { orderId: 'ORD001', staffId: 'MEM002', orderEffort: 0.5, orderPrice: 700000, targetMonth: '2026-08-01', partnerId: 'BP001' }
        ]
      },
      {
        id: 'ORD002',
        caseAssignmentId: 'WK001',
        partnerId: 'BP001',
        targetMonth: '2026-09-01',
        details: [
          { orderId: 'ORD002', staffId: 'MEM001', orderEffort: 0.8, orderPrice: 1000000, targetMonth: '2026-09-01', partnerId: 'BP001' },
          { orderId: 'ORD002', staffId: 'MEM002', orderEffort: 0.5, orderPrice: 700000, targetMonth: '2026-09-01', partnerId: 'BP001' }
        ]
      },
      {
        id: 'ORD003',
        caseAssignmentId: 'WK002',
        partnerId: 'BP001',
        targetMonth: '2026-10-01',
        details: [
          { orderId: 'ORD003', staffId: 'MEM001', orderEffort: 0.8, orderPrice: 1000000, targetMonth: '2026-10-01', partnerId: 'BP001' },
          { orderId: 'ORD003', staffId: 'MEM002', orderEffort: 0.5, orderPrice: 700000, targetMonth: '2026-10-01', partnerId: 'BP001' }
        ]
      },
      {
        id: 'ORD004',
        caseAssignmentId: 'WK002',
        partnerId: 'BP001',
        targetMonth: '2026-11-01',
        details: [
          { orderId: 'ORD004', staffId: 'MEM001', orderEffort: 0.8, orderPrice: 1000000, targetMonth: '2026-11-01', partnerId: 'BP001' },
          { orderId: 'ORD004', staffId: 'MEM002', orderEffort: 0.5, orderPrice: 700000, targetMonth: '2026-11-01', partnerId: 'BP001' }
        ]
      },
      {
        id: 'ORD005',
        caseAssignmentId: 'WK003',
        partnerId: 'BP002',
        targetMonth: '2026-09-01',
        details: [
          { orderId: 'ORD005', staffId: 'MEM003', orderEffort: 1.0, orderPrice: 850000, targetMonth: '2026-09-01', partnerId: 'BP002' },
          { orderId: 'ORD005', staffId: 'MEM004', orderEffort: 0.6, orderPrice: 600000, targetMonth: '2026-09-01', partnerId: 'BP002' }
        ]
      },
      {
        id: 'ORD006',
        caseAssignmentId: 'WK004',
        partnerId: 'BP002',
        targetMonth: '2026-10-01',
        details: [
          { orderId: 'ORD006', staffId: 'MEM003', orderEffort: 1.0, orderPrice: 850000, targetMonth: '2026-10-01', partnerId: 'BP002' },
          { orderId: 'ORD006', staffId: 'MEM004', orderEffort: 0.6, orderPrice: 600000, targetMonth: '2026-10-01', partnerId: 'BP002' }
        ]
      }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seeds));
  }

  private deserialize(s: SerializedPartnerOrder): PartnerOrder {
    const details = s.details.map(d => new OrderDetail(
      d.orderId,
      d.staffId,
      d.orderEffort,
      d.orderPrice,
      d.targetMonth,
      d.partnerId,
      d.partnerId // 所属会社IDと発注先IDが一致しているためそのまま渡す
    ));
    return new PartnerOrder(s.id, s.caseAssignmentId, s.partnerId, s.targetMonth, details);
  }

  private serialize(o: PartnerOrder): SerializedPartnerOrder {
    return {
      id: o.id,
      caseAssignmentId: o.caseAssignmentId,
      partnerId: o.partnerId,
      targetMonth: o.targetMonth,
      details: o.details.map(d => ({
        orderId: d.orderId,
        staffId: d.staffId,
        orderEffort: d.orderEffort,
        orderPrice: d.orderPrice,
        targetMonth: d.targetMonth,
        partnerId: d.partnerId
      }))
    };
  }

  async findAll(): Promise<readonly PartnerOrder[]> {
    const map = this.loadSerialized();
    return Array.from(map.values()).map(s => this.deserialize(s));
  }

  async findById(id: string): Promise<PartnerOrder | null> {
    const map = this.loadSerialized();
    const s = map.get(id);
    return s ? this.deserialize(s) : null;
  }

  async findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly PartnerOrder[]> {
    const list = await this.findAll();
    return list.filter(o => o.caseAssignmentId === caseAssignmentId);
  }

  async existsByKeys(caseAssignmentId: string, targetMonth: string, partnerId: string): Promise<boolean> {
    const list = await this.findAll();
    return list.some(o => 
      o.caseAssignmentId === caseAssignmentId &&
      o.targetMonth === targetMonth &&
      o.partnerId === partnerId
    );
  }

  async existsByPartnerId(partnerId: string): Promise<boolean> {
    const list = await this.findAll();
    return list.some(o => o.partnerId === partnerId);
  }

  async existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean> {
    void projectId;
    const list = await this.findAll();
    return list.some(o => o.caseAssignmentId === caseAssignmentId);
  }

  async sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number> {
    void projectId;
    const list = await this.findAll();
    const relevant = list.filter(o => o.caseAssignmentId === caseAssignmentId);
    return relevant.reduce((sum, o) => sum + o.totalAmount, 0);
  }

  async save(order: PartnerOrder): Promise<void> {
    const map = this.loadSerialized();
    map.set(order.id, this.serialize(order));
    this.saveSerialized(map);
  }

  async delete(id: string): Promise<void> {
    const map = this.loadSerialized();
    map.delete(id);
    this.saveSerialized(map);
  }

  async nextIdentity(): Promise<string> {
    const map = this.loadSerialized();
    const ids = Array.from(map.keys())
      .map(id => {
        const numPart = id.replace('ORD', '');
        return parseInt(numPart, 10);
      })
      .filter(num => !isNaN(num));
    
    const maxNum = ids.length > 0 ? Math.max(...ids) : 0;
    const nextNum = maxNum + 1;
    return `ORD${nextNum.toString().padStart(3, '0')}`;
  }
}
