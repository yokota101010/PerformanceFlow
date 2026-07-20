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

/**
 * 案件作業明細（アサイン契約）エンティティのデータ定義。
 * 主キーは projectId と id の複合キー。すべてのプロパティに readonly を付与する。
 */
export interface CaseAssignment {
  readonly projectId: string;      // プロジェクトID (複合主キー)
  readonly id: string;             // 作業契約ID (形式: WKnnn, 複合主キー)
  readonly caseId: string;         // 案件ID (案件.案件ID)
  readonly startDate: string;      // 開始日 (YYYY-MM-DD)
  readonly endDate: string;        // 終了日 (YYYY-MM-DD, 自動算出)
  readonly contractEffort: number; // 契約工数 (人月)
  readonly contractPrice: number;  // 契約単価
  readonly sales: number;          // 売上 (契約工数 * 契約単価, 導出)
  readonly cost: number;           // 製造原価 (発注 + 社員加工費 + 経費, 導出)
  readonly grossProfit: number;    // 粗利 (売上 - 製造原価, 導出)
  readonly grossProfitRate: number;// 粗利率 (粗利 / 売上, 導出)
}

/**
 * 発注集約（集約ルート）のデータ定義。
 * すべてのプロパティに readonly を付与する。
 */
export interface PartnerOrder {
  readonly id: string;                 // 注文ID (形式: ORDnnn, 主キー)
  readonly caseAssignmentId: string;   // 作業契約ID (案件作業明細.作業契約ID)
  readonly partnerId: string;          // 発注先ID (発注先.発注先ID)
  readonly targetMonth: string;        // 年月 (YYYY-MM-01形式)
  readonly totalEffort: number;        // 合計工数 (導出)
  readonly totalAmount: number;        // 合計発注額 (導出)
  readonly details: readonly OrderDetail[]; // 注文明細リスト
}

/**
 * 注文明細エンティティのデータ定義。
 * すべてのプロパティに readonly を付与する。
 */
export interface OrderDetail {
  readonly orderId: string;            // 注文ID (複合主キー)
  readonly staffId: string;            // 要員ID (複合主キー)
  readonly orderEffort: number;        // 発注工数 (人月、0.0〜1.0)
  readonly orderPrice: number;         // 発注単価 (要員の単価、導出)
  readonly targetMonth: string;        // 年月 (親発注の年月、導出)
  readonly partnerId: string;          // 発注先ID (親発注の発注先ID、導出)
  readonly orderAmount: number;        // 発注額 (発注工数 * 発注単価、導出)
}

/**
 * 月別案件社員工数（集約ルート）のデータ定義。
 * すべてのプロパティに readonly を付与する。
 */
export interface IEmployeeWorkTime {
  readonly caseAssignmentId: string;   // 作業契約ID (案件作業明細.作業契約ID, 複合主キー)
  readonly staffId: string;            // 社員ID (社員.社員ID, 複合主キー)
  readonly targetMonth: string;        // 年月 (YYYY-MM-01形式, 複合主キー)
  readonly workHours: number;          // 作業時間 (0〜200)
  readonly laborCost: number;          // 加工費 (単価 * 作業時間, 導出)
}

/**
 * 月別社員工数サマリのデータ定義。
 * すべてのプロパティに readonly を付与する。
 */
export interface IEmployeeWorkTimeSummary {
  readonly staffId: string;            // 社員ID (複合主キー)
  readonly targetMonth: string;        // 年月 (複合主キー)
  readonly totalWorkHours: number;     // 作業時間合計 (導出)
}

/**
 * その他経費（経費データ）のデータ定義。
 * すべてのプロパティに readonly を付与する。
 */
export interface OtherExpense {
  readonly caseAssignmentId: string;   // 作業契約ID (案件作業明細.作業契約ID, 複合主キー)
  readonly lineNo: number;             // 行No (1以上の連番, 複合主キー)
  readonly amount: number;             // 金額 (0以上の整数)
  readonly memo: string;               // 摘要 (1〜100文字)
}


