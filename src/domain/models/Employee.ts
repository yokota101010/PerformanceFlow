import { Employee as IEmployee } from './types';

/**
 * 社員集約ルートの具象クラス。
 * コンストラクタ内で、ドメインモデルに定められたビジネスルール・属性制約を強制検証する。
 */
export class Employee implements IEmployee {
  readonly id: string;
  readonly name: string;
  readonly costPerHour: number;

  constructor(id: string, name: string, costPerHour: number) {
    // 1. ID形式のバリデーション (EMPnnn形式)
    if (!id || !/^EMP\d{3}$/.test(id)) {
      throw new Error('不正な社員ID形式です。');
    }

    // 2. 名前の必須・文字長バリデーション (前後の空白トリミング)
    const trimmedName = name.replace(/^[\s　]+|[\s　]+$/g, '');
    if (!trimmedName) {
      throw new Error('社員名は必須です。');
    }
    if (trimmedName.length > 255) {
      throw new Error('社員名は255文字以内で入力してください。');
    }

    // 3. 単価のバリデーション (0以上の整数値、上限設定)
    if (costPerHour === undefined || costPerHour === null || isNaN(costPerHour)) {
      throw new Error('単価は必須です。');
    }
    if (!Number.isInteger(costPerHour) || costPerHour < 0) {
      throw new Error('単価は0以上の整数で入力してください。');
    }
    if (costPerHour > 9999999) {
      throw new Error('単価の上限値は9,999,999です。');
    }

    this.id = id;
    this.name = trimmedName;
    this.costPerHour = costPerHour;
  }
}
