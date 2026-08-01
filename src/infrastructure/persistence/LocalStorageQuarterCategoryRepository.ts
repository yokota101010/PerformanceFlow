import { QuarterCategory } from '../../domain/models';
import { QuarterCategoryRepository } from '../../domain/repositories/QuarterCategoryRepository';

interface SerializedQuarterCategory {
  quarterCode: string;
  fiscalYear: number;
  quarterName: string;
  startYearMonth: string;
  endYearMonth: string;
}

export class LocalStorageQuarterCategoryRepository implements QuarterCategoryRepository {
  private readonly storageKey = 'performance_flow_quarter_categories';

  constructor() {
  }

  private loadSerialized(): SerializedQuarterCategory[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private saveSerialized(list: SerializedQuarterCategory[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  async findAll(): Promise<readonly QuarterCategory[]> {
    const list = this.loadSerialized();
    return list.map(
      (item) => new QuarterCategory(item.quarterCode, item.fiscalYear, item.quarterName, item.startYearMonth, item.endYearMonth)
    );
  }

  async findByQuarterCode(quarterCode: string): Promise<QuarterCategory | null> {
    const list = this.loadSerialized();
    const item = list.find((e) => e.quarterCode === quarterCode);
    if (!item) return null;
    return new QuarterCategory(item.quarterCode, item.fiscalYear, item.quarterName, item.startYearMonth, item.endYearMonth);
  }

  async save(entity: QuarterCategory): Promise<void> {
    const list = this.loadSerialized();
    const serialized: SerializedQuarterCategory = {
      quarterCode: entity.quarterCode,
      fiscalYear: entity.fiscalYear,
      quarterName: entity.quarterName,
      startYearMonth: entity.startYearMonth,
      endYearMonth: entity.endYearMonth,
    };

    const index = list.findIndex((e) => e.quarterCode === entity.quarterCode);
    if (index >= 0) {
      list[index] = serialized;
    } else {
      list.push(serialized);
    }

    this.saveSerialized(list);
  }

  async delete(quarterCode: string): Promise<void> {
    const list = this.loadSerialized();
    const filtered = list.filter((e) => e.quarterCode !== quarterCode);
    this.saveSerialized(filtered);
  }
}
