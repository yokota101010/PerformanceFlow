import { Staff } from '../../domain/models';
import { StaffRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用のインメモリデータストアを用いた要員リポジトリ実装。
 */
export class InMemoryStaffRepository implements StaffRepository {
  private staffs: Staff[] = [];

  constructor() {
    // シードデータの初期投入
    this.staffs = [
      new Staff('MEM001', 'BP001', '坂本龍馬', 1000000),
      new Staff('MEM002', 'BP001', '高杉晋作', 700000),
      new Staff('MEM003', 'BP002', '西郷隆盛', 850000),
      new Staff('MEM004', 'BP002', '勝海舟', 600000),
    ];
  }

  async findAll(): Promise<readonly Staff[]> {
    return [...this.staffs].sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<Staff | null> {
    return this.staffs.find((s) => s.id === id) || null;
  }

  async save(staff: Staff): Promise<void> {
    const index = this.staffs.findIndex((s) => s.id === staff.id);
    if (index >= 0) {
      this.staffs[index] = staff;
    } else {
      this.staffs.push(staff);
    }
  }

  async delete(id: string): Promise<void> {
    this.staffs = this.staffs.filter((s) => s.id !== id);
  }

  async nextIdentity(): Promise<string> {
    if (this.staffs.length === 0) {
      return 'MEM001';
    }

    // 既存IDから数値を抽出して最大値を探す
    const nums = this.staffs
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

  /**
   * テスト用に内部データを直接クリア・書き換えるヘルパー
   */
  async reset(initialList: Staff[] = []): Promise<void> {
    this.staffs = [...initialList];
  }
}
