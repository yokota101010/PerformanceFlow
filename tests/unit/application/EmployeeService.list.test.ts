import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeService } from '../../../src/application/services/EmployeeService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryEmployeeRepository } from '../../../src/infrastructure/persistence/InMemoryEmployeeRepository';
import { Employee } from '../../../src/domain/models';

describe('EmployeeService.getEmployees (一覧取得)', () => {
  let service: EmployeeService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    // 明示的にインメモリリポジトリを登録 (TDD・コンパイルガード)
    RepositoryRegistry.registerEmployeeRepository(new InMemoryEmployeeRepository());
    service = new EmployeeService();
  });

  it('初回起動時にシードデータ (3名) が自動的に投入されて取得できること', async () => {
    const list = await service.getEmployees();
    
    expect(list).toHaveLength(3);
    expect(list[0]).toEqual({
      id: 'EMP001',
      name: 'トム・デマルコ',
      costPerHour: 9000
    });
    expect(list[1].id).toBe('EMP002');
    expect(list[2].id).toBe('EMP003');
  });

  it('複数登録されている場合、社員IDの昇順でソートされて取得できること', async () => {
    const repo = RepositoryRegistry.getEmployeeRepository();
    
    // シードに加えて、順序を入れ替えて追加保存
    await repo.save(new Employee('EMP005', 'ジェラルド・ワインバーグ', 8500));
    await repo.save(new Employee('EMP004', 'デミ・ハリス', 7500));

    const list = await service.getEmployees();

    expect(list).toHaveLength(5);
    expect(list[0].id).toBe('EMP001');
    expect(list[1].id).toBe('EMP002');
    expect(list[2].id).toBe('EMP003');
    expect(list[3].id).toBe('EMP004');
    expect(list[4].id).toBe('EMP005');
  });
});
