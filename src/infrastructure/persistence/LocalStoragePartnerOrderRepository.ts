import { PartnerOrder, OrderDetail } from '../../domain/models';
import { PartnerOrderRepository } from '../../domain/repositories';

interface SerializedDetail {
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
  details: SerializedDetail[];
}

/**
 * 本番用のブラウザ LocalStorage による発注・注文明細永続化リポジトリ。
 */
export class LocalStoragePartnerOrderRepository implements PartnerOrderRepository {
  private readonly STORAGE_KEY = 'performance_flow_partner_orders';

  constructor() {
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

  async findAll(): Promise<readonly PartnerOrder[]> {
    const map = this.loadSerialized();
    return Array.from(map.values())
      .map(o => this.toDomainModel(o))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<PartnerOrder | null> {
    const map = this.loadSerialized();
    const found = map.get(id);
    return found ? this.toDomainModel(found) : null;
  }

  async findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly PartnerOrder[]> {
    const map = this.loadSerialized();
    return Array.from(map.values())
      .filter(o => o.caseAssignmentId === caseAssignmentId)
      .map(o => this.toDomainModel(o))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async findByPartnerId(partnerId: string): Promise<readonly PartnerOrder[]> {
    const map = this.loadSerialized();
    return Array.from(map.values())
      .filter(o => o.partnerId === partnerId)
      .map(o => this.toDomainModel(o))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async existsByKeys(caseAssignmentId: string, targetMonth: string, partnerId: string): Promise<boolean> {
    const map = this.loadSerialized();
    return Array.from(map.values()).some(
      o => o.caseAssignmentId === caseAssignmentId && o.targetMonth === targetMonth && o.partnerId === partnerId
    );
  }

  async existsByPartnerId(partnerId: string): Promise<boolean> {
    const map = this.loadSerialized();
    return Array.from(map.values()).some(o => o.partnerId === partnerId);
  }

  async existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean> {
    void projectId;
    const map = this.loadSerialized();
    return Array.from(map.values()).some(o => o.caseAssignmentId === caseAssignmentId);
  }

  async sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number> {
    void projectId;
    const map = this.loadSerialized();
    const orders = Array.from(map.values())
      .filter(o => o.caseAssignmentId === caseAssignmentId)
      .map(o => this.toDomainModel(o));
    return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }

  async save(order: PartnerOrder): Promise<void> {
    const map = this.loadSerialized();
    const serialized: SerializedPartnerOrder = {
      id: order.id,
      caseAssignmentId: order.caseAssignmentId,
      partnerId: order.partnerId,
      targetMonth: order.targetMonth,
      details: order.details.map(d => ({
        orderId: d.orderId,
        staffId: d.staffId,
        orderEffort: d.orderEffort,
        orderPrice: d.orderPrice,
        targetMonth: d.targetMonth,
        partnerId: d.partnerId,
      })),
    };

    map.set(order.id, serialized);
    this.saveSerialized(map);
  }

  async delete(id: string): Promise<void> {
    const map = this.loadSerialized();
    map.delete(id);
    this.saveSerialized(map);
  }

  async nextIdentity(): Promise<string> {
    const map = this.loadSerialized();
    const keys = Array.from(map.keys());
    if (keys.length === 0) {
      return 'ORD001';
    }

    const nums = keys
      .map(id => {
        const match = id.match(/^ORD(\d{3})$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);

    const max = nums.length > 0 ? Math.max(...nums) : 0;
    const nextNum = max + 1;

    if (nextNum > 999) {
      throw new Error('発注IDの発行上限に達しました。');
    }

    return `ORD${String(nextNum).padStart(3, '0')}`;
  }

  private toDomainModel(s: SerializedPartnerOrder): PartnerOrder {
    const domainDetails = s.details.map(
      d => new OrderDetail(d.orderId, d.staffId, d.orderEffort, d.orderPrice, d.targetMonth, d.partnerId, d.partnerId)
    );
    return new PartnerOrder(s.id, s.caseAssignmentId, s.partnerId, s.targetMonth, domainDetails);
  }
}
