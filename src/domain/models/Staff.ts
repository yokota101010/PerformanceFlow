import { Staff as IStaff } from './types';

/**
 * 要員集約ルートの具象クラス。
 * コンストラクタ内で、ドメインモデルに定められたビジネスルール・属性制約を強制検証する。
 */
export class Staff implements IStaff {
  readonly id: string;
  readonly partnerId: string;
  readonly name: string;
  readonly costPerMonth: number;

  constructor(id: string, partnerId: string, name: string, costPerMonth: number) {
    // 1. ID形式のバリデーション (MEMnnn形式)
    if (!id || !/^MEM\d{3}$/.test(id)) {
      throw new Error('不正な要員ID形式です。');
    }

    // 2. 所属会社IDの必須チェック
    if (!partnerId) {
      throw new Error('所属会社IDは必須です。');
    }

    // 3. 氏名の必須・文字長バリデーション (前後の空白トリミング)
    const trimmedName = name ? name.replace(/^[\s　]+|[\s　]+$/g, '') : '';
    if (!trimmedName) {
      throw new Error('氏名は必須です。');
    }
    if (trimmedName.length > 255) {
      throw new Error('氏名は255文字以内で入力してください。');
    }

    // 4. 単価の0以上数値チェック
    if (typeof costPerMonth !== 'number' || isNaN(costPerMonth) || costPerMonth < 0) {
      throw new Error('単価は0以上の整数で入力してください。');
    }

    this.id = id;
    this.partnerId = partnerId;
    this.name = trimmedName;
    this.costPerMonth = Math.floor(costPerMonth);
  }
}
