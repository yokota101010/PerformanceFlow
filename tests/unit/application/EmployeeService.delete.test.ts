import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeService } from '../../../src/application/services/EmployeeService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryEmployeeRepository } from '../../../src/infrastructure/persistence/InMemoryEmployeeRepository';
import { InMemoryEmployeeWorkTimeRepository } from '../../../src/infrastructure/persistence/InMemoryEmployeeWorkTimeRepository';

describe('EmployeeService.deleteEmployee (物理削除と制約)', () => {
  let service: EmployeeService;
  let workTimeRepo: InMemoryEmployeeWorkTimeRepository;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerEmployeeRepository(new InMemoryEmployeeRepository());
    
    workTimeRepo = new InMemoryEmployeeWorkTimeRepository();
    RepositoryRegistry.registerEmployeeWorkTimeRepository(workTimeRepo);
    
    service = new EmployeeService();
  });

  it('工数実績が紐づいていない社員は、正常に物理削除できること', async () => {
    // 新しく社員を登録 (工数実績なし)
    const emp = await service.createEmployee({ name: '新規 社員', costPerHour: 5000 });
    
    // 登録されたことの確認
    let list = await service.getEmployees();
    expect(list.find((e) => e.id === emp.id)).toBeDefined();

    // 削除の実行
    await service.deleteEmployee(emp.id);

    // 削除が反映されたことの確認 (物理削除)
    list = await service.getEmployees();
    expect(list.find((e) => e.id === emp.id)).toBeUndefined();
  });

  it('工数実績が紐づいている社員 (シードデータなど) は削除がエラーでブロックされること', async () => {
    // EMP001は初期値で紐づきあり
    await expect(
      service.deleteEmployee('EMP001')
    ).rejects.toThrow('この社員には案件工数実績が登録されているため削除できません。');

    // 削除されていないことの確認
    const list = await service.getEmployees();
    expect(list.find((e) => e.id === 'EMP001')).toBeDefined();
  });

  it('存在しない社員IDを削除しようとした場合、エラーをスローすること', async () => {
    await expect(
      service.deleteEmployee('EMP999')
    ).rejects.toThrow('指定された社員が見つかりません。');
  });
});
