import { Employee } from '../../domain/models';
import { EmployeeRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用のインメモリデータストアを用いた社員リポジトリ実装。
 * 初期化時に仕様で定められたシードデータ（3名）を自動投入する (T010)。
 */
export class InMemoryEmployeeRepository implements EmployeeRepository {
  private employees: Employee[] = [];

  constructor() {
    // シードデータの自動投入 (T010)
    this.employees.push(new Employee('EMP001', 'トム・デマルコ', 9000));
    this.employees.push(new Employee('EMP002', 'ロバート・マーチン', 8000));
    this.employees.push(new Employee('EMP003', 'マーチン・ファウラー', 10000));
  }

  async findAll(): Promise<readonly Employee[]> {
    return [...this.employees].sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<Employee | null> {
    return this.employees.find((e) => e.id === id) || null;
  }

  async save(employee: Employee): Promise<void> {
    const index = this.employees.findIndex((e) => e.id === employee.id);
    if (index >= 0) {
      this.employees[index] = employee;
    } else {
      this.employees.push(employee);
    }
  }

  async delete(id: string): Promise<void> {
    this.employees = this.employees.filter((e) => e.id !== id);
  }

  /**
   * 自動採番ロジック (T017)
   * 形式: EMPnnn (nnn は 001〜999)
   * 既存IDの最大値 + 1 で生成。999 を超える場合はエラーをスロー。
   */
  async nextIdentity(): Promise<string> {
    if (this.employees.length === 0) {
      return 'EMP001';
    }

    // 既存IDから連番部分を抽出
    const ids = this.employees.map((e) => {
      const match = e.id.match(/^EMP(\d{3})$/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const maxId = Math.max(...ids);
    const nextId = maxId + 1;

    if (nextId > 999) {
      throw new Error('社員IDの発行上限に達しました。');
    }

    const formattedId = String(nextId).padStart(3, '0');
    return `EMP${formattedId}`;
  }

  /**
   * テスト用に内部データを直接クリア・書き換えるヘルパー
   */
  async reset(initialList: Employee[] = []): Promise<void> {
    this.employees = [...initialList];
  }
}
