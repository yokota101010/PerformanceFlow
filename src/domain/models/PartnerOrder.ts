import { PartnerOrder as IPartnerOrder, OrderDetail as IOrderDetail } from './types';

/**
 * 注文明細ドメインエンティティ（集約メンバー）。
 */
export class OrderDetail implements IOrderDetail {
  readonly orderAmount: number;

  constructor(
    readonly orderId: string,
    readonly staffId: string,
    readonly orderEffort: number,
    readonly orderPrice: number,
    readonly targetMonth: string,
    readonly partnerId: string,
    staffPartnerId: string // 要員の所属会社ID（バリデーション用）
  ) {
    if (orderEffort < 0 || orderEffort > 1) {
      throw new Error('発注工数は0以上1以下の範囲で入力してください。');
    }
    
    // 小数点第2位以下が存在するか検証
    // 小数点以下1桁であることを保証（浮動小数点の誤差を考慮して差分を小さく許容する）
    const effortStr = orderEffort.toString();
    const decPart = effortStr.split('.')[1];
    if (decPart && decPart.length > 1) {
      throw new Error('発注工数は小数点以下1桁までで入力してください。');
    }

    if (partnerId !== staffPartnerId) {
      throw new Error('要員の所属会社と発注先が一致しません。');
    }

    this.orderAmount = Math.round(orderEffort * orderPrice);
  }
}

/**
 * 発注ドメインエンティティ（集約ルート）。
 */
export class PartnerOrder implements IPartnerOrder {
  readonly details: readonly OrderDetail[];

  constructor(
    readonly id: string,
    readonly caseAssignmentId: string,
    readonly partnerId: string,
    readonly targetMonth: string,
    details?: readonly OrderDetail[]
  ) {
    if (!id) {
      throw new Error('注文IDは必須です。');
    }
    if (!caseAssignmentId) {
      throw new Error('作業契約IDは必須です。');
    }
    if (!partnerId) {
      throw new Error('発注先IDは必須です。');
    }
    if (!targetMonth) {
      throw new Error('年月は必須です。');
    }
    
    this.details = details ? [...details] : [];
  }

  get totalEffort(): number {
    // 浮動小数点の加算誤差を避けるため、10倍して加算したのち10で割る
    const sum10 = this.details.reduce((sum, d) => sum + Math.round(d.orderEffort * 10), 0);
    return sum10 / 10;
  }

  get totalAmount(): number {
    return this.details.reduce((sum, d) => sum + d.orderAmount, 0);
  }

  /**
   * 明細を更新した新しい発注オブジェクトのコピーを返す（イミュータブルパターン）。
   */
  copyWithDetails(newDetails: readonly OrderDetail[]): PartnerOrder {
    return new PartnerOrder(
      this.id,
      this.caseAssignmentId,
      this.partnerId,
      this.targetMonth,
      newDetails
    );
  }
}
