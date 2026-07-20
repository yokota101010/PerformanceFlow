import { EmployeeWorkTime } from '../models/EmployeeWorkTime';

/**
 * 社員工数実績（月別案件社員工数）リポジトリの抽象契約インターフェース。
 */
export interface EmployeeWorkTimeRepository {
  /**
   * すべての工数実績を取得する。
   */
  findAll(): Promise<readonly EmployeeWorkTime[]>;

  /**
   * 複合キーを指定して特定の工数実績を取得する。
   */
  findByKeys(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<EmployeeWorkTime | null>;

  /**
   * 複合キーを指定して工数実績の重複存在チェックを行う。
   */
  existsByKeys(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<boolean>;

  /**
   * 作業契約IDに関連する工数実績が存在するかを検証する (F06削除制約チェック用)。
   */
  existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean>;

  /**
   * 社員IDに関連する工数実績が存在するかを検証する (F02削除制約チェック用)。
   */
  existsByEmployeeId(employeeId: string): Promise<boolean>;

  /**
   * 作業契約IDに関連する全工数の加工費（労務原価）の合計金額を算出する (F06製造原価集計用)。
   */
  sumCostByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number>;

  /**
   * 社員IDと年月を指定して、その月における社員の合計作業時間を取得する (月合計200時間超過アラート用)。
   */
  sumByStaffAndMonth(staffId: string, targetMonth: string): Promise<number>;

  /**
   * 工数実績を永続化保存する。
   */
  save(workTime: EmployeeWorkTime): Promise<void>;

  /**
   * 複合キーを指定して工数実績を物理削除する。
   */
  delete(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<void>;
}
