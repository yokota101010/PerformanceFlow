import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeService } from '../../../src/application/services/EmployeeService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryEmployeeRepository } from '../../../src/infrastructure/persistence/InMemoryEmployeeRepository';

describe('EmployeeService.createEmployee (新規登録)', () => {
  let service: EmployeeService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerEmployeeRepository(new InMemoryEmployeeRepository());
    service = new EmployeeService();
  });

  it('正常な名前で登録され、自動採番 (最大値+1) が機能すること', async () => {
    // 初期状態は EMP001, EMP002, EMP003
    const newEmp = await service.createEmployee({
      name: 'デミ・ハリス',
    });

    expect(newEmp.id).toBe('EMP004');
    expect(newEmp.name).toBe('デミ・ハリス');

    // 一覧に反映されていること
    const list = await service.getEmployees();
    expect(list).toHaveLength(4);
    expect(list[3].id).toBe('EMP004');
  });

  it('社員名に入力された前後の空白 (全角・半角) が自動トリミングされること', async () => {
    const newEmp = await service.createEmployee({
      name: ' 　ジェラルド・ワインバーグ  　',
    });

    expect(newEmp.name).toBe('ジェラルド・ワインバーグ');
  });

  it('社員名が空文字、またはスペースのみの場合はエラーをスローすること', async () => {
    await expect(
      service.createEmployee({ name: '' })
    ).rejects.toThrow('社員名は必須です。');

    await expect(
      service.createEmployee({ name: ' 　 ' })
    ).rejects.toThrow('社員名は必須です。');
  });

  it('同姓同名の社員が別IDで正常に重複登録できること', async () => {
    const emp1 = await service.createEmployee({ name: 'デミ・ハリス' });
    const emp2 = await service.createEmployee({ name: 'デミ・ハリス' });

    expect(emp1.id).toBe('EMP004');
    expect(emp2.id).toBe('EMP005');
    expect(emp1.name).toBe(emp2.name);
  });
});
