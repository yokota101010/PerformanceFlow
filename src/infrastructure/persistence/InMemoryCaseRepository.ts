import { Case } from '../../domain/models';
import { CaseRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用のインメモリデータストアを用いた案件リポジトリ実装。
 */
export class InMemoryCaseRepository implements CaseRepository {
  private cases: Case[] = [];

  constructor() {
    // シードデータの初期投入
    this.cases = [
      new Case('PJ001', 'AJ001', '案件1: Ａソフト開発支援', '2026-08-15', '2026-11-15'),
      new Case('PJ001', 'AJ002', '案件2: Ｂエンジニアリング開発支援', '2026-09-13', '2026-10-31'),
    ];
  }

  async findAll(): Promise<readonly Case[]> {
    return [...this.cases].sort((a, b) => {
      const pComp = a.projectId.localeCompare(b.projectId);
      return pComp !== 0 ? pComp : a.id.localeCompare(b.id);
    });
  }

  async findByProjectId(projectId: string): Promise<readonly Case[]> {
    return this.cases
      .filter((c) => c.projectId === projectId)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(projectId: string, id: string): Promise<Case | null> {
    return this.cases.find((c) => c.projectId === projectId && c.id === id) || null;
  }

  async save(caseObj: Case): Promise<void> {
    const index = this.cases.findIndex(
      (c) => c.projectId === caseObj.projectId && c.id === caseObj.id
    );
    if (index >= 0) {
      this.cases[index] = caseObj;
    } else {
      this.cases.push(caseObj);
    }
  }

  async delete(projectId: string, id: string): Promise<void> {
    this.cases = this.cases.filter(
      (c) => !(c.projectId === projectId && c.id === id)
    );
  }

  async nextIdentity(projectId: string): Promise<string> {
    const projectCases = this.cases.filter((c) => c.projectId === projectId);
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

  /**
   * テスト用に内部データをクリア・書き換えるヘルパー
   */
  async reset(initialList: Case[] = []): Promise<void> {
    this.cases = [...initialList];
  }
}
