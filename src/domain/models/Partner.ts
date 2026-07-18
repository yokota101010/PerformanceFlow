import { Partner as IPartner } from './types';

/**
 * 発注先集約ルートの具象クラス。
 * コンストラクタ内で、ドメインモデルに定められたビジネスルール・属性制約を強制検証する。
 */
export class Partner implements IPartner {
  readonly id: string;
  readonly name: string;

  constructor(id: string, name: string) {
    // 1. ID形式のバリデーション (BPnnn形式)
    if (!id || !/^BP\d{3}$/.test(id)) {
      throw new Error('不正な発注先ID形式です。');
    }

    // 2. 名前の必須・文字長バリデーション (前後の空白トリミング)
    const trimmedName = name.replace(/^[\s　]+|[\s　]+$/g, '');
    if (!trimmedName) {
      throw new Error('発注先名は必須です。');
    }
    if (trimmedName.length > 255) {
      throw new Error('発注先名は255文字以内で入力してください。');
    }

    this.id = id;
    this.name = trimmedName;
  }
}
