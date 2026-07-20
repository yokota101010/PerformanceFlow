import { PartnerOrder } from '../../../src/domain/models/PartnerOrder';

export interface CreateOrderCommand {
  caseAssignmentId: string;
  partnerId: string;
  targetMonth: string; // YYYY-MM-01形式
}

export interface UpdateOrderDetailsCommand {
  orderId: string;
  details: {
    staffId: string;
    orderEffort: number;
  }[];
}

export interface PartnerOrderUseCase {
  getOrders(): Promise<readonly PartnerOrder[]>;
  getOrderById(id: string): Promise<PartnerOrder | null>;
  createOrder(command: CreateOrderCommand): Promise<string>;
  updateOrderDetails(command: UpdateOrderDetailsCommand): Promise<void>;
  deleteOrder(id: string): Promise<void>;
}
