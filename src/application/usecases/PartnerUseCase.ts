import { Partner } from '../../domain/models';

/**
 * 発注先新規登録の入力パラメータ（Command/DTO）
 */
export interface CreatePartnerCommand {
  readonly name: string;          // 発注先名
}

/**
 * 発注先情報更新の入力パラメータ（Command/DTO）
 */
export interface UpdatePartnerCommand {
  readonly id: string;            // 対象の発注先ID
  readonly name: string;          // 変更後の発注先名
}

/**
 * 発注先マスタ管理のユースケース（書き込み/読み込み）抽象インターフェース。
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
