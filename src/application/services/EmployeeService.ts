import { Employee } from '../../domain/models';
import { EmployeeRepository } from '../../domain/repositories';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';
import {
  CreateEmployeeCommand,
  EmployeeUseCase,
  UpdateEmployeeCommand,
} from '../usecases/EmployeeUseCase';

/**
 * 社員マスタ管理のユースケースを処理する具象アプリケーションサービス。
 */
export class EmployeeService implements EmployeeUseCase {
  private getRepository(): EmployeeRepository {
    return RepositoryRegistry.getEmployeeRepository();
  }

  async getEmployees(): Promise<readonly Employee[]> {
    return this.getRepository().findAll();
  }

  /**
   * 社員を新規登録する (T018)。
   */
  async createEmployee(command: CreateEmployeeCommand): Promise<Employee> {
    const repo = this.getRepository();

    // 入力値のトリミング
    const trimmedName = command.name ? command.name.replace(/^[\s　]+|[\s　]+$/g, '') : '';

    // 自動採番の取得
    const nextId = await repo.nextIdentity();

    // ドメイン層のEmployeeクラス構築時に属性バリデーションが強制スローされる (T002)
    const employee = new Employee(nextId, trimmedName, command.costPerHour);

    // リポジトリに永続化
    await repo.save(employee);

    return employee;
  }

  /**
   * 既存の社員情報を更新する (T023)。
   */
  async updateEmployee(command: UpdateEmployeeCommand): Promise<void> {
    const repo = this.getRepository();

    // 存在確認
    const existing = await repo.findById(command.id);
    if (!existing) {
      throw new Error('指定された社員が見つかりません。');
    }

    // 入力値のトリミング
    const trimmedName = command.name ? command.name.replace(/^[\s　]+|[\s　]+$/g, '') : '';

    // イミュータブルに再構築することで属性バリデーションを強制実行
    const updated = new Employee(command.id, trimmedName, command.costPerHour);

    // 上書き保存
    await repo.save(updated);
  }

  /**
   * 社員を物理削除する (T028)。
   * 工数実績（他集約）が紐づいている場合は、整合性エラーをスローしてブロックする。
   */
  async deleteEmployee(id: string): Promise<void> {
    const repo = this.getRepository();

    // 1. 存在確認
    const existing = await repo.findById(id);
    if (!existing) {
      throw new Error('指定された社員が見つかりません。');
    }

    // 2. 参照整合性の検証 (他集約: 工数実績データの紐づきチェック) (T028)
    const workTimeRepo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const hasWorkTime = await workTimeRepo.existsByEmployeeId(id);
    if (hasWorkTime) {
      throw new Error('この社員には案件工数実績が登録されているため削除できません。');
    }

    // 3. 物理削除の実行 (T029)
    await repo.delete(id);
  }
}
