import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { EmployeeWorkTimeService } from '../../../src/application/services/EmployeeWorkTimeService';

describe('EmployeeWorkTimeService.list (US1)', () => {
  beforeEach(() => {
    // 永続化ストレージの状態をクリアして初期化
    RepositoryRegistry.clear();
  });

  it('初期化状態で起動したとき、0件が返されること', async () => {
    const service = new EmployeeWorkTimeService();
    const list = await service.getWorkTimes();

    expect(list.length).toBe(0);
  });
});
