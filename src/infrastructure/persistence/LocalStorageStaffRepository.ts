import { Staff } from '../../domain/models';
import { StaffRepository } from '../../domain/repositories';

/**
 * ブラウザの LocalStorage を用いてデータを永続化する要員リポジトリの具象クラス。
 */
export class LocalStorageStaffRepository implements StaffRepository {
  private readonly storageKey = 'performance_flow_staffs';

  constructor() {
  }

  private loadStaffs(): Staff[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const parsed = JSON.parse(data) as any[];
      return parsed.map(
        (item) => new Staff(item.id, item.partnerId, item.name)
      );
    } catch (e) {
      console.error('LocalStorageStaffRepository: データの読み込みに失敗しました。', e);
      return [];
    }
  }


  private saveStaffs(staffs: Staff[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(staffs));
    } catch (e) {
      console.error('LocalStorageStaffRepository: データの保存に失敗しました。', e);
      throw new Error('データの保存に失敗しました。');
    }
  }

  async findAll(): Promise<readonly Staff[]> {
    const list = this.loadStaffs();
    return list.sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<Staff | null> {
    const list = this.loadStaffs();
    return list.find((s) => s.id === id) || null;
  }

  async save(staff: Staff): Promise<void> {
    const list = this.loadStaffs();
    const index = list.findIndex((s) => s.id === staff.id);
    if (index >= 0) {
      list[index] = staff;
    } else {
      list.push(staff);
    }
    this.saveStaffs(list);
  }

  async delete(id: string): Promise<void> {
    const list = this.loadStaffs();
    const filtered = list.filter((s) => s.id !== id);
    this.saveStaffs(filtered);
  }

  async nextIdentity(): Promise<string> {
    const list = this.loadStaffs();
    if (list.length === 0) {
      return 'MEM001';
    }

    const nums = list
      .map((s) => {
        const match = s.id.match(/^MEM(\d{3})$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const max = nums.length > 0 ? Math.max(...nums) : 0;
    const nextNum = max + 1;

    if (nextNum > 999) {
      throw new Error('要員IDの発行上限に達しました。');
    }

    return `MEM${String(nextNum).padStart(3, '0')}`;
  }
}
