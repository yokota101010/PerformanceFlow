import { Employee } from '../../../src/domain/models';

/**
 * 社員新規登録の入力コマンド (DTO)
 */
export interface CreateEmployeeCommand {
  readonly name: string;          // 社員名
  readonly costPerHour: number;  // 単価
}

/**
 * 社員情報更新の入力コマンド (DTO)
 */
export interface UpdateEmployeeCommand {
  readonly id: string;            // 社員ID
  readonly name: string;          // 社員名
  readonly costPerHour: number;  // 単価
}

/**
 * 社員マスタ管理のユースケースを処理するアプリケーションサービスの抽象契約。
 */
export interface EmployeeUseCase {
  /**
   * 社員の一覧を取得する。
   * @returns 社員ID昇順の社員一覧
   */
  getEmployees(): Promise<readonly Employee[]>;

  /**
   * 新しい社員を登録する。
   * @param command 新規登録パラメータ
   * @returns 登録されたEmployeeインスタンス
   */
  createEmployee(command: CreateEmployeeCommand): Promise<Employee>;

  /**
   * 既存の社員情報を更新する。
   * @param command 更新パラメータ
   */
  updateEmployee(command: UpdateEmployeeCommand): Promise<void>;

  /**
   * 社員を物理削除する。
   * @param id 削除対象の社員ID
   */
  deleteEmployee(id: string): Promise<void>;
}
