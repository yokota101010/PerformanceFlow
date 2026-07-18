import { Staff } from '../../../src/domain/models';

/**
 * 要員新規登録の入力コマンド (DTO)
 */
export interface CreateStaffCommand {
  readonly partnerId: string;     // 所属会社ID
  readonly name: string;          // 氏名
  readonly costPerMonth: number;  // 単価 (月額)
}

/**
 * 要員情報更新の入力コマンド (DTO)
 */
export interface UpdateStaffCommand {
  readonly id: string;            // 要員ID
  readonly partnerId: string;     // 所属会社ID
  readonly name: string;          // 氏名
  readonly costPerMonth: number;  // 単価 (月額)
}

/**
 * 要員マスタ管理のユースケースを処理するアプリケーションサービスの抽象契約。
 */
export interface StaffUseCase {
  /**
   * 要員の一覧を取得する。
   * @returns 要員ID昇順の要員一覧
   */
  getStaffs(): Promise<readonly Staff[]>;

  /**
   * 新しい要員を登録する。
   * @param command 新規登録パラメータ
   * @returns 登録されたStaffインスタンス
   */
  createStaff(command: CreateStaffCommand): Promise<Staff>;

  /**
   * 既存の要員情報を更新する。
   * @param command 更新パラメータ
   */
  updateStaff(command: UpdateStaffCommand): Promise<void>;

  /**
   * 要員を物理削除する。
   * @param id 削除対象の要員ID
   */
  deleteStaff(id: string): Promise<void>;
}
