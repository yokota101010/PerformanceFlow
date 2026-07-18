/**
 * プロジェクト集約エンティティのデータ定義。
 * 憲法に定める不変性を保証するため、すべてのプロパティに readonly を付与する。
 */
export interface Project {
  readonly id: string;      // プロジェクトID (形式: PJnnn, 主キー)
  readonly name: string;    // プロジェクト名 (一意)
}
