import { Case as ICase } from './types';

/**
 * 案件集約ルートの具象クラス。
 * コンストラクタ内で、ドメインモデルに定められたビジネスルール・属性制約を強制検証する。
 */
export class Case implements ICase {
  readonly projectId: string;
  readonly id: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;

  constructor(projectId: string, id: string, name: string, startDate: string, endDate: string) {
    // 1. プロジェクトIDの必須チェック
    if (!projectId) {
      throw new Error('プロジェクトIDは必須です。');
    }

    // 2. 案件ID形式のバリデーション (AJnnn形式)
    if (!id || !/^AJ\d{3}$/.test(id)) {
      throw new Error('不正な案件ID形式です。');
    }

    // 3. 案件名の必須・文字長バリデーション (前後の空白トリミング)
    const trimmedName = name ? name.replace(/^[\s　]+|[\s　]+$/g, '') : '';
    if (!trimmedName) {
      throw new Error('案件名は必須です。');
    }
    if (trimmedName.length > 255) {
      throw new Error('案件名は255文字以内で入力してください。');
    }

    // 4. 日付の妥当性・形式チェック (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!startDate || !dateRegex.test(startDate)) {
      throw new Error('開始日はYYYY-MM-DD形式で入力してください。');
    }
    if (!endDate || !dateRegex.test(endDate)) {
      throw new Error('終了日はYYYY-MM-DD形式で入力してください。');
    }

    // 日付順序チェック
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('不正な日付形式です。');
    }
    if (start > end) {
      throw new Error('開始日は終了日以前の日付で入力してください。');
    }

    this.projectId = projectId;
    this.id = id;
    this.name = trimmedName;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}
