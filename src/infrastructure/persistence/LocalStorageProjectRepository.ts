import { Project } from '../../domain/models';
import { ProjectRepository } from '../../domain/repositories';

/**
 * ブラウザの LocalStorage を用いてプロジェクトデータの永続化を行うリポジトリ実装。
 */
export class LocalStorageProjectRepository implements ProjectRepository {
  private readonly STORAGE_KEY = 'performance_flow_projects';

  constructor() {
    // 初回起動時の自動シードデータ投入 (T034)
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingData = window.localStorage.getItem(this.STORAGE_KEY);
      if (!existingData) {
        const seedData = [
          new Project('PJ001', '次世代基幹システム開発プロジェクト')
        ];
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seedData));
      }
    }
  }

  private loadFromStorage(): Project[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const data = window.localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return [];
    }
    try {
      const parsed = JSON.parse(data) as { id: string; name: string }[];
      return parsed.map(item => new Project(item.id, item.name));
    } catch {
      return [];
    }
  }

  private saveToStorage(projects: Project[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
  }

  async findAll(): Promise<readonly Project[]> {
    const list = this.loadFromStorage();
    return list.sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<Project | null> {
    const list = this.loadFromStorage();
    return list.find(p => p.id === id) || null;
  }

  async findByName(name: string): Promise<Project | null> {
    const list = this.loadFromStorage();
    return list.find(p => p.name === name) || null;
  }

  async save(project: Project): Promise<void> {
    const list = this.loadFromStorage();
    const index = list.findIndex(p => p.id === project.id);
    if (index >= 0) {
      list[index] = project;
    } else {
      list.push(project);
    }
    this.saveToStorage(list);
  }

  async delete(id: string): Promise<void> {
    const list = this.loadFromStorage();
    const filtered = list.filter(p => p.id !== id);
    this.saveToStorage(filtered);
  }

  async nextIdentity(): Promise<string> {
    const list = this.loadFromStorage();
    let maxNum = 0;
    for (const p of list) {
      if (p.id.startsWith('PJ')) {
        const numStr = p.id.substring(2);
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNum = maxNum + 1;
    if (nextNum > 999) {
      throw new Error('プロジェクトIDの発行上限に達しました。');
    }
    return `PJ${String(nextNum).padStart(3, '0')}`;
  }
}
