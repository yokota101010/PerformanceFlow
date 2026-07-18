import { Project } from '../../domain/models';
import { ProjectRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用のインメモリデータストアを用いたリポジトリ実装。
 * 初期化時に仕様で定められたシードデータ (PJ001) を自動投入する。
 */
export class InMemoryProjectRepository implements ProjectRepository {
  private projects: Project[] = [];

  constructor() {
    // 初期データの自動シード投入 (T012)
    this.projects.push(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
  }

  async findAll(): Promise<readonly Project[]> {
    return [...this.projects].sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<Project | null> {
    return this.projects.find((p) => p.id === id) || null;
  }

  async findByName(name: string): Promise<Project | null> {
    return this.projects.find((p) => p.name === name) || null;
  }

  async save(project: Project): Promise<void> {
    const index = this.projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      this.projects[index] = project;
    } else {
      this.projects.push(project);
    }
  }

  async delete(id: string): Promise<void> {
    this.projects = this.projects.filter((p) => p.id !== id);
  }

  async nextIdentity(): Promise<string> {
    let maxNum = 0;
    for (const p of this.projects) {
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

  /**
   * テスト用に内部データを直接クリア・書き換えるヘルパーメソッド
   */
  async reset(initialProjects: Project[] = []): Promise<void> {
    this.projects = [...initialProjects];
  }
}
