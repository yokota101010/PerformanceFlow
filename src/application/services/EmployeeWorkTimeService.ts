import { EmployeeWorkTimeUseCase, CreateWorkTimeCommand, UpdateWorkHoursCommand } from '../usecases/EmployeeWorkTimeUseCase';
import { EmployeeWorkTime } from '../../domain/models/EmployeeWorkTime';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';

/**
 * 社員工数実績（月別案件社員工数）ユースケースの具象アプリケーションサービス。
 */
export class EmployeeWorkTimeService implements EmployeeWorkTimeUseCase {
  async getWorkTimes(): Promise<readonly EmployeeWorkTime[]> {
    const repo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    return repo.findAll();
  }

  async createWorkTime(command: CreateWorkTimeCommand): Promise<void> {
    const repo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const assignRepo = RepositoryRegistry.getCaseAssignmentRepository();
    const empRepo = RepositoryRegistry.getEmployeeRepository();

    // 1. 重複チェック
    const exists = await repo.existsByKeys(command.caseAssignmentId, command.staffId, command.targetMonth);
    if (exists) {
      throw new Error('同一の年月、作業契約、社員に対する工数実績が既に登録されています。');
    }

    // 2. アサイン存在・期間内チェック (FR-004)
    // プロジェクトIDの代わりに dummy または registry 経由で取得
    // assignments は findAll から引き当てるか、findById があればそれを使う
    const assigns = await assignRepo.findAll();
    const assign = assigns.find(a => a.id === command.caseAssignmentId);
    if (!assign) {
      throw new Error('指定された作業契約が存在しません。');
    }

    if (!this.isMonthOverlapWithAssignment(command.targetMonth, assign.startDate, assign.endDate)) {
      throw new Error('選択された年月は作業契約の対象期間外です。');
    }

    // 3. 単価取得
    const emp = await empRepo.findById(command.staffId);
    if (!emp) {
      throw new Error('指定された社員が存在しません。');
    }

    // 4. ドメインオブジェクト作成（バリデーション強制）
    const workTime = new EmployeeWorkTime({
      caseAssignmentId: command.caseAssignmentId,
      staffId: command.staffId,
      targetMonth: command.targetMonth,
      workHours: command.workHours,
      staffPrice: emp.costPerHour,
    });

    await repo.save(workTime);
  }

  async updateWorkHours(command: UpdateWorkHoursCommand): Promise<void> {
    const repo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const empRepo = RepositoryRegistry.getEmployeeRepository();

    // 1. 存在確認
    const existing = await repo.findByKeys(command.caseAssignmentId, command.staffId, command.targetMonth);
    if (!existing) {
      throw new Error('対象の工数実績データが存在しません。');
    }

    // 2. 単価取得
    const emp = await empRepo.findById(command.staffId);
    if (!emp) {
      throw new Error('指定された社員が存在しません。');
    }

    // 3. 更新ドメインオブジェクト作成（バリデーション適用）
    const updated = new EmployeeWorkTime({
      caseAssignmentId: command.caseAssignmentId,
      staffId: command.staffId,
      targetMonth: command.targetMonth,
      workHours: command.workHours,
      staffPrice: emp.costPerHour,
    });

    await repo.save(updated);
  }

  async deleteWorkTime(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<void> {
    const repo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    await repo.delete(caseAssignmentId, staffId, targetMonth);
  }

  private isMonthOverlapWithAssignment(targetMonth: string, startDateStr: string, endDateStr: string): boolean {
    const startOfMonth = new Date(targetMonth);
    // 月末日を算出
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    const assignmentStart = new Date(startDateStr);
    const assignmentEnd = new Date(endDateStr);

    return startOfMonth <= assignmentEnd && endOfMonth >= assignmentStart;
  }
}
