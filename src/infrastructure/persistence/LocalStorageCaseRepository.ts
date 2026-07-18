import { Case } from '../../domain/models';
import { CaseRepository } from '../../domain/repositories';

/**
 * 本番用のブラウザ LocalStorage 永続化を伴う案件リポジトリ実装。
 */
export class LocalStorageCaseRepository implements CaseRepository {
  private readonly STORAGE_KEY = 'performance_flow_cases';

  constructor() {
    this.initializeSeedData();
  }

  private initializeSeedData(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        const seed = [
          new Case('PJ001', 'AJ001', '案件1: Ａソフト開発支援', '2026-08-15', '2026-11-15'),
          new Case('PJ001', 'AJ002', '案件2: Ｂエンジニアリング開発支援', '2026-09-13', '2026-10-31'),
        ];
        this.saveAll(seed);
      }
    } catch (e) {
      console.error('LocalStorage initialization error:', e);
    }
  }

  private loadAll(): Case[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(
        (item: any) =>
          new Case(item.projectId, item.id, item.name, item.startDate, item.endDate)
      );
    } catch (e) {
      console.error('Failed to load cases from localStorage:', e);
      return [];
    }
  }

  private saveAll(list: Case[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save cases to localStorage:', e);
    }
  }

  async findAll(): Promise<readonly Case[]> {
    return this.loadAll().sort((a, b) => {
      const pComp = a.projectId.localeCompare(b.projectId);
      return pComp !== 0 ? pComp : a.id.localeCompare(b.id);
    });
  }

  async findByProjectId(projectId: string): Promise<readonly Case[]> {
    return this.loadAll()
      .filter((c) => c.projectId === projectId)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(projectId: string, id: string): Promise<Case | null> {
    return this.loadAll().find((c) => c.projectId === projectId && c.id === id) || null;
  }

  async save(caseObj: Case): Promise<void> {
    const list = this.loadAll();
    const index = list.findIndex(
      (c) => c.projectId === caseObj.projectId && c.id === caseObj.id
    );
    if (index >= 0) {
      list[index] = caseObj;
    } else {
      list.push(caseObj);
    }
    this.saveAll(list);
  }

  async delete(projectId: string, id: string): Promise<void> {
    const list = this.loadAll();
    const updated = list.filter((c) => !(c.projectId === projectId && c.id === id));
    this.saveAll(updated);
  }

  async nextIdentity(projectId: string): Promise<string> {
    const list = this.loadAll();
    const projectCases = list.filter((c) => c.projectId === projectId);
    if (projectCases.length === 0) {
      return 'AJ001';
    }

    const nums = projectCases
      .map((c) => {
        const match = c.id.match(/^AJ(\d{3})$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const max = nums.length > 0 ? Math.max(...nums) : 0;
    const nextNum = max + 1;

    if (nextNum > 999) {
      throw new Error('案件IDの発行上限に達しました。');
    }

    return `AJ${String(nextNum).padStart(3, '0')}`;
  }
}
