import { Partner } from '../../../src/domain/models';

/**
 * 発注先新規登録の入力コマンド (DTO)
 */
export interface CreatePartnerCommand {
  readonly name: string;          // 発注先名
}

/**
 * 発注先情報更新の入力コマンド (DTO)
 */
export interface UpdatePartnerCommand {
  readonly id: string;            // 発注先ID
  readonly name: string;          // 発注先名
}

/**
 * 発注先マスタ管理のユースケースを処理するアプリケーションサービスの抽象契約。
 */
export interface PartnerUseCase {
  /**
   * 発注先の一覧を取得する。
   * @returns 発注先ID昇順の発注先一覧
   */
  getPartners(): Promise<readonly Partner[]>;

  /**
   * 新しい発注先を登録する。
   * @param command 新規登録パラメータ
   * @returns 登録されたPartnerインスタンス
   */
  createPartner(command: CreatePartnerCommand): Promise<Partner>;

  /**
   * 既存の発注先情報を更新する。
   * @param command 更新パラメータ
   */
  updatePartner(command: UpdatePartnerCommand): Promise<void>;

  /**
   * 発注先を物理削除する。
   * @param id 削除対象の発注先ID
   */
  deletePartner(id: string): Promise<void>;
}
