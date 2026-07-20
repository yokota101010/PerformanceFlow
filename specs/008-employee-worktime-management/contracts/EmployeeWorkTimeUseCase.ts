import { EmployeeWorkTime } from '../../../src/domain/models/EmployeeWorkTime';

export interface CreateWorkTimeCommand {
  readonly caseAssignmentId: string;
  readonly staffId: string;
  readonly targetMonth: string;
  readonly workHours: number;
}

export interface UpdateWorkHoursCommand {
  readonly caseAssignmentId: string;
  readonly staffId: string;
  readonly targetMonth: string;
  readonly workHours: number;
}

/**
 * 社員工数実績（月別案件社員工数）ユースケースの抽象契約インターフェース。
 */
export interface EmployeeWorkTimeUseCase {
  /**
   * すべての工数実績をロードして取得する。
   */
  getWorkTimes(): Promise<readonly EmployeeWorkTime[]>;

  /**
   * 新規工数実績を登録する。
   */
  createWorkTime(command: CreateWorkTimeCommand): Promise<void>;

  /**
   * 工数実績の作業時間を編集更新する。
   */
  updateWorkHours(command: UpdateWorkHoursCommand): Promise<void>;

  /**
   * 複合キーを指定して工数実績を物理削除する。
   */
  deleteWorkTime(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<void>;
}
