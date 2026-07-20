import { PartnerOrder, OrderDetail } from '../../domain/models/PartnerOrder';
import { PartnerOrderRepository } from '../../domain/repositories';
import { CreateOrderCommand, PartnerOrderUseCase, UpdateOrderDetailsCommand } from '../usecases/PartnerOrderUseCase';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';

/**
 * 発注（注文）管理ユースケースのアプリケーションサービス実装。
 */
export class PartnerOrderService implements PartnerOrderUseCase {
  constructor(
    private readonly orderRepository: PartnerOrderRepository = RepositoryRegistry.getPartnerOrderRepository()
  ) {}

  async getOrders(): Promise<readonly PartnerOrder[]> {
    return this.orderRepository.findAll();
  }

  async getOrderById(id: string): Promise<PartnerOrder | null> {
    return this.orderRepository.findById(id);
  }

  async createOrder(command: CreateOrderCommand): Promise<string> {
    const { caseAssignmentId, partnerId, targetMonth } = command;

    // 1. UQ1 重複チェック
    const isDuplicate = await this.orderRepository.existsByKeys(caseAssignmentId, targetMonth, partnerId);
    if (isDuplicate) {
      throw new Error('同一の年月、発注先に対する発注が既に登録されています。');
    }

    // 2. 契約期間との重なりチェック
    const assignmentRepo = RepositoryRegistry.getCaseAssignmentRepository();
    const allAssignments = await assignmentRepo.findAll();
    const assignment = allAssignments.find(a => a.id === caseAssignmentId);
    if (!assignment) {
      throw new Error('指定された作業契約が見つかりません。');
    }

    // 月初日と月末日を算出
    const [yStr, mStr] = targetMonth.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const lastDay = new Date(y, m, 0).getDate();
    const startOfMonth = targetMonth; // YYYY-MM-01
    const endOfMonth = `${y}-${m.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    // 部分重複条件: startOfMonth <= endDate 且つ endOfMonth >= startDate
    const isOverlap = (startOfMonth <= assignment.endDate) && (endOfMonth >= assignment.startDate);
    if (!isOverlap) {
      throw new Error('選択された年月は作業契約の対象期間外です。');
    }

    // 3. 自動採番と保存
    const nextId = await this.orderRepository.nextIdentity();
    const newOrder = new PartnerOrder(nextId, caseAssignmentId, partnerId, targetMonth);
    await this.orderRepository.save(newOrder);

    return nextId;
  }

  async updateOrderDetails(command: UpdateOrderDetailsCommand): Promise<void> {
    const { orderId, details } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('発注データが見つかりません。');
    }

    const staffRepo = RepositoryRegistry.getStaffRepository();
    const domainDetails: OrderDetail[] = [];

    for (const d of details) {
      const staff = await staffRepo.findById(d.staffId);
      if (!staff) {
        throw new Error('指定された要員が見つかりません。');
      }

      // OrderDetail コンストラクタで、工数範囲、小数点、および所属会社IDの一致を強制検証
      const detail = new OrderDetail(
        orderId,
        d.staffId,
        d.orderEffort,
        staff.costPerMonth, // 単価 (月額)
        order.targetMonth,
        order.partnerId,
        staff.partnerId // バリデーションチェック用の要員所属会社ID
      );
      domainDetails.push(detail);
    }

    const updatedOrder = order.copyWithDetails(domainDetails);
    await this.orderRepository.save(updatedOrder);
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('発注データが見つかりません。');
    }
    await this.orderRepository.delete(id);
  }
}
