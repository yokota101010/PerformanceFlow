import { Partner } from '../../domain/models';
import { PartnerRepository } from '../../domain/repositories';

/**
 * 本番用のブラウザLocalStorageを利用した発注先リポジトリ実装 (T036)。
 * キー名: 'performance_flow_partners'
 */
export class LocalStoragePartnerRepository implements PartnerRepository {
  private readonly STORAGE_KEY = 'performance_flow_partners';

  constructor() {
    this.initSeeds();
  }

  /**
   * 初回起動時にシードデータをロードする (T036)
   */
  private initSeeds(): void {
    if (typeof window === 'undefined') return; // SSR or テスト環境での窓未定義エラー回避

    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const seeds = [
        new Partner('BP001', 'Ａソフトウェア'),
        new Partner('BP002', 'Ｂエンジニアリング'),
      ];
      this.saveAll(seeds);
    }
  }

  private loadAll(): Partner[] {
    if (typeof window === 'undefined') return [];
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) return [];
    try {
      const raw = JSON.parse(json) as Array<{ id: string; name: string }>;
      return raw.map((r) => new Partner(r.id, r.name));
    } catch {
      return [];
    }
  }

  private saveAll(partners: Partner[]): void {
    if (typeof window === 'undefined') return;
    const raw = partners.map((p) => ({ id: p.id, name: p.name }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(raw));
  }

  async findAll(): Promise<readonly Partner[]> {
    return this.loadAll().sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<Partner | null> {
    return this.loadAll().find((p) => p.id === id) || null;
  }

  async findByName(name: string): Promise<Partner | null> {
    return this.loadAll().find((p) => p.name === name) || null;
  }

  async save(partner: Partner): Promise<void> {
    const list = this.loadAll();
    const index = list.findIndex((p) => p.id === partner.id);
    if (index >= 0) {
      list[index] = partner;
    } else {
      list.push(partner);
    }
    this.saveAll(list);
  }

  async delete(id: string): Promise<void> {
    const list = this.loadAll().filter((p) => p.id !== id);
    this.saveAll(list);
  }

  async nextIdentity(): Promise<string> {
    const list = this.loadAll();
    if (list.length === 0) {
      return 'BP001';
    }

    const ids = list.map((p) => {
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
}
