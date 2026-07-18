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

/**
 * 発注先集約エンティティのデータ定義。
 * すべてのプロパティに readonly を付与する。
 */
export interface Partner {
  readonly id: string;            // 発注先ID (形式: BPnnn, 主キー)
  readonly name: string;          // 発注先名
}

/**
 * 要員集約エンティティのデータ定義。
 * すべてのプロパティに readonly を付与する。
 */
export interface Staff {
  readonly id: string;            // 要員ID (形式: MEMnnn, 主キー)
  readonly partnerId: string;     // 所属会社ID (発注先.発注先ID)
  readonly name: string;          // 氏名
  readonly costPerMonth: number;  // 単価 (月額)
}

/**
 * 案件集約エンティティのデータ定義。
 * 主キーは projectId と id の複合キー。すべてのプロパティに readonly を付与する。
 */
export interface Case {
  readonly projectId: string;     // プロジェクトID (プロジェクト.プロジェクトID, 複合主キー)
  readonly id: string;            // 案件ID (形式: AJnnn, 複合主キー)
  readonly name: string;          // 案件名
  readonly startDate: string;     // 開始日 (YYYY-MM-DD)
  readonly endDate: string;       // 終了日 (YYYY-MM-DD)
}
