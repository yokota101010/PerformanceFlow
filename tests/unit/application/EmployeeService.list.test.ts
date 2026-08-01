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

  it('初期状態ではデータ無しの状態（0件）であること', async () => {
    const list = await service.getEmployees();
    expect(list).toHaveLength(0);
  });

  it('複数登録されている場合、社員IDの昇順でソートされて取得できること', async () => {
    const repo = RepositoryRegistry.getEmployeeRepository();
    
    await repo.save(new Employee('EMP001', 'トム・デマルコ'));
    await repo.save(new Employee('EMP002', 'ロバート・マーチン'));
    await repo.save(new Employee('EMP003', 'マーチン・ファウラー'));
    await repo.save(new Employee('EMP005', 'ジェラルド・ワインバーグ'));
    await repo.save(new Employee('EMP004', 'デミ・ハリス'));

    const list = await service.getEmployees();

    expect(list).toHaveLength(5);
    expect(list[0].id).toBe('EMP001');
    expect(list[1].id).toBe('EMP002');
    expect(list[2].id).toBe('EMP003');
    expect(list[3].id).toBe('EMP004');
    expect(list[4].id).toBe('EMP005');
  });
});
