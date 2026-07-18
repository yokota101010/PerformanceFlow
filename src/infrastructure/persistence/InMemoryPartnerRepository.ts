import { Partner } from '../../domain/models';
import { PartnerRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用のインメモリデータストアを用いた発注先リポジトリ実装。
 * 初期化時に仕様で定められたシードデータ（2社）を自動投入する (T014)。
 */
export class InMemoryPartnerRepository implements PartnerRepository {
  private partners: Partner[] = [];

  constructor() {
    // シードデータの自動投入 (T014)
    this.partners.push(new Partner('BP001', 'Ａソフトウェア'));
    this.partners.push(new Partner('BP002', 'Ｂエンジニアリング'));
  }

  async findAll(): Promise<readonly Partner[]> {
    return [...this.partners].sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<Partner | null> {
    return this.partners.find((p) => p.id === id) || null;
  }

  async findByName(name: string): Promise<Partner | null> {
    return this.partners.find((p) => p.name === name) || null;
  }

  async save(partner: Partner): Promise<void> {
    const index = this.partners.findIndex((p) => p.id === partner.id);
    if (index >= 0) {
      this.partners[index] = partner;
    } else {
      this.partners.push(partner);
    }
  }

  async delete(id: string): Promise<void> {
    this.partners = this.partners.filter((p) => p.id !== id);
  }

  /**
   * 自動採番ロジック (T021)
   * 形式: BPnnn (nnn は 001〜999)
   * 既存IDの最大値 + 1 で生成。999 を超える場合はエラーをスロー。
   */
  async nextIdentity(): Promise<string> {
    if (this.partners.length === 0) {
      return 'BP001';
    }

    const ids = this.partners.map((p) => {
      const match = p.id.match(/^BP(\d{3})$/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const maxId = Math.max(...ids);
    const nextId = maxId + 1;

    if (nextId > 999) {
      throw new Error('発注先IDの発行上限に達しました。');
    }

    const formattedId = String(nextId).padStart(3, '0');
    return `BP${formattedId}`;
  }

  /**
   * テスト用に内部データを直接クリア・書き換えるヘルパー
   */
  async reset(initialList: Partner[] = []): Promise<void> {
    this.partners = [...initialList];
  }
}
