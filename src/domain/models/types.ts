/**
 * プロジェクト集約エンティティのデータ定義。
 * 憲法に定める不変性を保証するため、すべてのプロパティに readonly を付与する。
 */
export interface Project {
  readonly id: string;      // プロジェクトID (形式: PJnnn, 主キー)
  readonly name: string;    // プロジェクト名 (一意)
}

/**
 * 社員集約エンティティのデータ定義。
 * 憲法に定める不変性を保証するため、すべてのプロパティに readonly を付与する。
 */
export interface Employee {
  readonly id: string;            // 社員ID (形式: EMPnnn, 主キー)
  readonly name: string;          // 社員名
  readonly costPerHour: number;  // 単価
}
