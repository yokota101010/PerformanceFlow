import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeService } from '../../../src/application/services/EmployeeService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryEmployeeRepository } from '../../../src/infrastructure/persistence/InMemoryEmployeeRepository';

describe('EmployeeService.updateEmployee (情報更新)', () => {
  let service: EmployeeService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerEmployeeRepository(new InMemoryEmployeeRepository());
    service = new EmployeeService();
  });

  it('正常な変更パラメータで登録済みの社員情報が更新されること', async () => {
    await service.updateEmployee({
      id: 'EMP002',
      name: 'ロバート・C・マーチン',
    });

    const list = await service.getEmployees();
    const updated = list.find((e) => e.id === 'EMP002');
    
    expect(updated).toBeDefined();
    expect(updated?.name).toBe('ロバート・C・マーチン');
  });

  it('更新時に前後の空白が自動トリミングされること', async () => {
    await service.updateEmployee({
      id: 'EMP002',
      name: '  ロバート・マーチン  ',
    });

    const list = await service.getEmployees();
    const updated = list.find((e) => e.id === 'EMP002');
    expect(updated?.name).toBe('ロバート・マーチン');
  });

  it('存在しない社員IDを指定した場合、エラーをスローすること', async () => {
    await expect(
      service.updateEmployee({
        id: 'EMP999',
        name: '未知の社員',
      })
    ).rejects.toThrow('指定された社員が見つかりません。');
  });

  it('更新時に入力値制約（名前空欄）でエラーになること', async () => {
    await expect(
      service.updateEmployee({
        id: 'EMP002',
        name: '',
      })
    ).rejects.toThrow('社員名は必須です。');
  });
});
