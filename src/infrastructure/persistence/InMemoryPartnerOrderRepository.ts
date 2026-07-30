import { PartnerOrder } from '../../domain/models/PartnerOrder';
import { OrderDetail } from '../../domain/models/PartnerOrder';
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
    // ORD001: BP001, 2026-08-01, CON001
    const d1 = [
      new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-08-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM002', 0.5, 1000000, '2026-08-01', 'BP001', 'BP001')
    ];
    const o1 = new PartnerOrder('ORD001', 'CON001', 'BP001', '2026-08-01', d1);
    this.orders.set(o1.id, o1);

    // ORD002: BP001, 2026-09-01, CON001
    const d2 = [
      new OrderDetail('ORD002', 'MEM001', 1.0, 1000000, '2026-09-01', 'BP001', 'BP001'),
      new OrderDetail('ORD002', 'MEM002', 1.0, 1000000, '2026-09-01', 'BP001', 'BP001')
    ];
    const o2 = new PartnerOrder('ORD002', 'CON001', 'BP001', '2026-09-01', d2);
    this.orders.set(o2.id, o2);

    // ORD003: BP001, 2026-10-01, CON002
    const d3 = [
      new OrderDetail('ORD003', 'MEM001', 1.0, 1050000, '2026-10-01', 'BP001', 'BP001'),
      new OrderDetail('ORD003', 'MEM002', 1.0, 1050000, '2026-10-01', 'BP001', 'BP001')
    ];
    const o3 = new PartnerOrder('ORD003', 'CON002', 'BP001', '2026-10-01', d3);
    this.orders.set(o3.id, o3);

    // ORD004: BP001, 2026-11-01, CON002
    const d4 = [
      new OrderDetail('ORD004', 'MEM001', 0.8, 1050000, '2026-11-01', 'BP001', 'BP001')
    ];
    const o4 = new PartnerOrder('ORD004', 'CON002', 'BP001', '2026-11-01', d4);
    this.orders.set(o4.id, o4);

    // ORD005: BP002, 2026-10-01, CON003
    const d5 = [
      new OrderDetail('ORD005', 'MEM003', 1.0, 1050000, '2026-10-01', 'BP002', 'BP002')
    ];
    const o5 = new PartnerOrder('ORD005', 'CON003', 'BP002', '2026-10-01', d5);
    this.orders.set(o5.id, o5);

    // ORD006: BP002, 2026-11-01, CON003
    const d6 = [
      new OrderDetail('ORD006', 'MEM003', 1.0, 1050000, '2026-11-01', 'BP002', 'BP002')
    ];
    const o6 = new PartnerOrder('ORD006', 'CON003', 'BP002', '2026-11-01', d6);
    this.orders.set(o6.id, o6);

    // ORD007: BP002, 2026-12-01, CON003
    const d7 = [
      new OrderDetail('ORD007', 'MEM003', 1.0, 1050000, '2026-12-01', 'BP002', 'BP002')
    ];
    const o7 = new PartnerOrder('ORD007', 'CON003', 'BP002', '2026-12-01', d7);
    this.orders.set(o7.id, o7);

    // ORD008: BP002, 2027-01-01, CON003
    const d8 = [
      new OrderDetail('ORD008', 'MEM003', 1.0, 1050000, '2027-01-01', 'BP002', 'BP002')
    ];
    const o8 = new PartnerOrder('ORD008', 'CON003', 'BP002', '2027-01-01', d8);
    this.orders.set(o8.id, o8);
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
    this.initializeSeeds();
  }
}
