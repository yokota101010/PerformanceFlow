import { EmployeeUnitPrice } from '../../domain/models';
import { EmployeeUnitPriceRepository } from '../../domain/repositories/EmployeeUnitPriceRepository';

interface SerializedPrice {
  unitPriceId: string;
  startYearMonth: string;
  endYearMonth?: string;
  price: number;
}

interface SerializedEmployeeUnitPrice {
  id: string;
  employeeId: string;
  monthlyPrices: SerializedPrice[];
}

export class LocalStorageEmployeeUnitPriceRepository implements EmployeeUnitPriceRepository {
  private readonly storageKey = 'performance_flow_employee_unit_prices';

  constructor() {
  }

  private loadSerialized(): SerializedEmployeeUnitPrice[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      // 旧フォーマット (yearMonth) からの互換変換
      return parsed.map((item: any) => ({
        id: item.id,
        employeeId: item.employeeId,
        monthlyPrices: (item.monthlyPrices || []).map((p: any) => ({
          unitPriceId: p.unitPriceId || item.id,
          startYearMonth: p.startYearMonth || p.yearMonth || '2026-04',
          endYearMonth: p.endYearMonth,
          price: p.price,
        })),
      }));
    } catch {
      return [];
    }
  }

  private saveSerialized(list: SerializedEmployeeUnitPrice[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  async findAll(): Promise<readonly EmployeeUnitPrice[]> {
    const list = this.loadSerialized();
    return list.map(
      (item) => new EmployeeUnitPrice(item.id, item.employeeId, item.monthlyPrices as any)
    );
  }

  async findByEmployeeId(employeeId: string): Promise<EmployeeUnitPrice | null> {
    const list = this.loadSerialized();
    const item = list.find((e) => e.employeeId === employeeId);
    if (!item) return null;
    return new EmployeeUnitPrice(item.id, item.employeeId, item.monthlyPrices as any);
  }

  async save(entity: EmployeeUnitPrice): Promise<void> {
    const list = this.loadSerialized();
    const serialized: SerializedEmployeeUnitPrice = {
      id: entity.id,
      employeeId: entity.employeeId,
      monthlyPrices: entity.monthlyPrices.map((p) => ({
        unitPriceId: p.unitPriceId,
        startYearMonth: p.startYearMonth,
        endYearMonth: p.endYearMonth,
        price: p.price,
      })),
    };

    const index = list.findIndex((e) => e.employeeId === entity.employeeId || e.id === entity.id);
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
}
