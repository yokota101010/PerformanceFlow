import { StaffUnitPrice } from '../../domain/models';
import { StaffUnitPriceRepository } from '../../domain/repositories/StaffUnitPriceRepository';

interface SerializedPrice {
  unitPriceId: string;
  startYearMonth: string;
  endYearMonth?: string;
  price: number;
}

interface SerializedStaffUnitPrice {
  id: string;
  staffId: string;
  monthlyPrices: SerializedPrice[];
}

export class LocalStorageStaffUnitPriceRepository implements StaffUnitPriceRepository {
  private readonly storageKey = 'performance_flow_staff_unit_prices';

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored || (JSON.parse(stored) && JSON.parse(stored).length === 0)) {
      const initialSeed: SerializedStaffUnitPrice[] = [
        {
          id: 'SUP001',
          staffId: 'MEM001',
          monthlyPrices: [
            { unitPriceId: 'SUP001', startYearMonth: '2026-04', endYearMonth: '2026-09', price: 1000000 },
            { unitPriceId: 'SUP001', startYearMonth: '2026-10', endYearMonth: '9999-12', price: 1050000 },
          ],
        },
        {
          id: 'SUP002',
          staffId: 'MEM002',
          monthlyPrices: [
            { unitPriceId: 'SUP002', startYearMonth: '2026-04', endYearMonth: '2026-09', price: 1000000 },
            { unitPriceId: 'SUP002', startYearMonth: '2026-10', endYearMonth: '9999-12', price: 1050000 },
          ],
        },
        {
          id: 'SUP003',
          staffId: 'MEM003',
          monthlyPrices: [
            { unitPriceId: 'SUP003', startYearMonth: '2026-04', endYearMonth: '2026-09', price: 1000000 },
            { unitPriceId: 'SUP003', startYearMonth: '2026-10', endYearMonth: '9999-12', price: 1050000 },
          ],
        },
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(initialSeed));
    }
  }

  private loadSerialized(): SerializedStaffUnitPrice[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        id: item.id,
        staffId: item.staffId,
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

  private saveSerialized(list: SerializedStaffUnitPrice[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  async findAll(): Promise<readonly StaffUnitPrice[]> {
    const list = this.loadSerialized();
    return list.map(
      (item) => new StaffUnitPrice(item.id, item.staffId, item.monthlyPrices as any)
    );
  }

  async findByStaffId(staffId: string): Promise<StaffUnitPrice | null> {
    const list = this.loadSerialized();
    const item = list.find((e) => e.staffId === staffId);
    if (!item) return null;
    return new StaffUnitPrice(item.id, item.staffId, item.monthlyPrices as any);
  }

  async save(entity: StaffUnitPrice): Promise<void> {
    const list = this.loadSerialized();
    const serialized: SerializedStaffUnitPrice = {
      id: entity.id,
      staffId: entity.staffId,
      monthlyPrices: entity.monthlyPrices.map((p) => ({
        unitPriceId: p.unitPriceId,
        startYearMonth: p.startYearMonth,
        endYearMonth: p.endYearMonth,
        price: p.price,
      })),
    };

    const index = list.findIndex((e) => e.staffId === entity.staffId || e.id === entity.id);
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
