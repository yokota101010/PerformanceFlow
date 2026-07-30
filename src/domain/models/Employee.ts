import { Employee as IEmployee } from './types';

/**
 * 社員集約ルートの具象クラス。
 * コンストラクタ内で、ドメインモデルに定められたビジネスルール・属性制約を強制検証する。
 */
export class Employee implements IEmployee {
  readonly id: string;
  readonly name: string;

  constructor(id: string, name: string) {
    // 1. ID形式のバリデーション (EMPnnn形式)
    if (!id || !/^EMP\d{3}$/.test(id)) {
      throw new Error('不正な社員ID形式です。');
    }

    // 2. 名前の必須・文字長バリデーション (前後の空白トリミング)
    const trimmedName = name ? name.replace(/^[\s　]+|[\s　]+$/g, '') : '';
    if (!trimmedName) {
      throw new Error('社員名は必須です。');
    }
    if (trimmedName.length > 255) {
      throw new Error('社員名は255文字以内で入力してください。');
    }

    this.id = id;
    this.name = trimmedName;
  }
}

