import { PartnerOrder } from '../../domain/models/PartnerOrder';
import { PartnerOrderRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用の発注・注文明細インメモリリポジトリ。
 */
export class InMemoryPartnerOrderRepository implements PartnerOrderRepository {
  private orders: Map<string, PartnerOrder> = new Map();

  constructor() {
    this.initializeSeeds();
  }

  private initializeSeeds(): void {
  }

  async findAll(): Promise<readonly PartnerOrder[]> {
    return Array.from(this.orders.values());
  }

  async findById(id: string): Promise<PartnerOrder | null> {
    return this.orders.get(id) || null;
  }

  async findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly PartnerOrder[]> {
    return Array.from(this.orders.values()).filter(o => o.caseAssignmentId === caseAssignmentId);
  }

  async existsByKeys(caseAssignmentId: string, targetMonth: string, partnerId: string): Promise<boolean> {
    return Array.from(this.orders.values()).some(o => 
      o.caseAssignmentId === caseAssignmentId &&
      o.targetMonth === targetMonth &&
      o.partnerId === partnerId
    );
  }

  async existsByPartnerId(partnerId: string): Promise<boolean> {
    return Array.from(this.orders.values()).some(o => o.partnerId === partnerId);
  }

  async existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean> {
    void projectId;
    return Array.from(this.orders.values()).some(o => o.caseAssignmentId === caseAssignmentId);
  }

  async sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number> {
    void projectId;
    const relevantOrders = Array.from(this.orders.values()).filter(o => o.caseAssignmentId === caseAssignmentId);
    return relevantOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }

  async save(order: PartnerOrder): Promise<void> {
    this.orders.set(order.id, order);
  }

  async delete(id: string): Promise<void> {
    this.orders.delete(id);
  }

  setHasOrders(partnerId: string, hasOrders: boolean): void {
    if (hasOrders) {
      const dummy = new PartnerOrder(`DUMMY_${partnerId}`, 'CON001', partnerId, '2026-08-01');
      this.orders.set(dummy.id, dummy);
    } else {
      for (const [id, order] of this.orders.entries()) {
        if (order.partnerId === partnerId) {
          this.orders.delete(id);
        }
      }
    }
  }

  setHasCaseAssignmentOrder(projectId: string, caseAssignmentId: string, hasOrder: boolean, amount: number = 0): void {
    void projectId;
    const dummyId = `DUMMY_${caseAssignmentId}`;
    if (hasOrder) {
      const dummyDetails = [
        {
          orderId: dummyId,
          staffId: 'DUMMY_STAFF',
          orderEffort: 1.0,
          orderPrice: amount,
          targetMonth: '2026-08-01',
          partnerId: 'DUMMY_PARTNER',
          orderAmount: amount
        }
      ];
      const dummy = new PartnerOrder(dummyId, caseAssignmentId, 'DUMMY_PARTNER', '2026-08-01', dummyDetails as any);
      this.orders.set(dummy.id, dummy);
    } else {
      this.orders.delete(dummyId);
    }
  }

  async nextIdentity(): Promise<string> {
    const ids = Array.from(this.orders.keys())
      .map(id => {
        const numPart = id.replace('ORD', '');
        return parseInt(numPart, 10);
      })
      .filter(num => !isNaN(num));
    
    const maxNum = ids.length > 0 ? Math.max(...ids) : 0;
    const nextNum = maxNum + 1;
    return `ORD${nextNum.toString().padStart(3, '0')}`;
  }

  clear(): void {
    this.orders.clear();
  }
}
