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
      costPerHour: 8500
    });

    const list = await service.getEmployees();
    const updated = list.find((e) => e.id === 'EMP002');
    
    expect(updated).toBeDefined();
    expect(updated?.name).toBe('ロバート・C・マーチン');
    expect(updated?.costPerHour).toBe(8500);
  });

  it('更新時に前後の空白が自動トリミングされること', async () => {
    await service.updateEmployee({
      id: 'EMP002',
      name: '  ロバート・マーチン  ',
      costPerHour: 8000
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
        costPerHour: 5000
      })
    ).rejects.toThrow('指定された社員が見つかりません。');
  });

  it('更新時に入力値制約（名前空欄、単価マイナス値）でエラーになること', async () => {
    await expect(
      service.updateEmployee({
        id: 'EMP002',
        name: '',
        costPerHour: 8000
      })
    ).rejects.toThrow('社員名は必須です。');

    await expect(
      service.updateEmployee({
        id: 'EMP002',
        name: 'ロバート・マーチン',
        costPerHour: -100
      })
    ).rejects.toThrow('単価は0以上の整数で入力してください。');
  });
});
