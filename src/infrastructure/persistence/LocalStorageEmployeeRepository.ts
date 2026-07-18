import { Employee } from '../../domain/models';
import { EmployeeRepository } from '../../domain/repositories';

interface EmployeeSerialized {
  readonly id: string;
  readonly name: string;
  readonly costPerHour: number;
}

/**
 * ブラウザの LocalStorage を用いた本番用の社員データ永続化リポジトリ。
 */
export class LocalStorageEmployeeRepository implements EmployeeRepository {
  private readonly storageKey = 'performance_flow_employees';

  constructor() {
    // 初期データの自動投入 (T032)
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      const initialSeed: EmployeeSerialized[] = [
        { id: 'EMP001', name: 'トム・デマルコ', costPerHour: 9000 },
        { id: 'EMP002', name: 'ロバート・マーチン', costPerHour: 8000 },
        { id: 'EMP003', name: 'マーチン・ファウラー', costPerHour: 10000 },
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(initialSeed));
    }
  }

  private loadSerialized(): EmployeeSerialized[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as EmployeeSerialized[];
    } catch {
      return [];
    }
  }

  private saveSerialized(list: EmployeeSerialized[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  async findAll(): Promise<readonly Employee[]> {
    const list = this.loadSerialized();
    // ドメインモデル Employee クラスを再構築して返却
    return list
      .map((item) => new Employee(item.id, item.name, item.costPerHour))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<Employee | null> {
    const list = this.loadSerialized();
    const item = list.find((e) => e.id === id);
    if (!item) return null;
    return new Employee(item.id, item.name, item.costPerHour);
  }

  async save(employee: Employee): Promise<void> {
    const list = this.loadSerialized();
    const serialized: EmployeeSerialized = {
      id: employee.id,
      name: employee.name,
      costPerHour: employee.costPerHour,
    };

    const index = list.findIndex((e) => e.id === employee.id);
    if (index >= 0) {
      list[index] = serialized;
    } else {
      list.push(serialized);
    }

    this.saveSerialized(list);
  }

  async delete(id: string): Promise<void> {
    const list = this.loadSerialized();
    const filtered = list.filter((e) => e.id !== id);
    this.saveSerialized(filtered);
  }

  async nextIdentity(): Promise<string> {
    const list = this.loadSerialized();
    if (list.length === 0) {
      return 'EMP001';
    }

    const ids = list.map((e) => {
      const match = e.id.match(/^EMP(\d{3})$/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const maxId = Math.max(...ids);
    const nextId = maxId + 1;

    if (nextId > 999) {
      throw new Error('社員IDの発工上限に達しました。');
    }

    const formattedId = String(nextId).padStart(3, '0');
    return `EMP${formattedId}`;
  }
}
