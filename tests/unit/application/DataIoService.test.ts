import { describe, it, expect, beforeEach } from 'vitest';
import { DataIoService } from '../../../src/application/services/DataIoService';

describe('DataIoService (データバックアップ・復元)', () => {
  let service: DataIoService;

  beforeEach(() => {
    localStorage.clear();
    service = new DataIoService();
  });

  it('初期状態で全テーブルのサマリ情報が正しく取得できること', () => {
    const summary = service.getDataSummary();
    expect(summary.length).toBeGreaterThan(0);
    const projSummary = summary.find((s) => s.key === 'performance_flow_projects');
    expect(projSummary).toBeDefined();
    expect(projSummary?.count).toBe(0);
  });

  it('データが存在する場合、JSONバックアップペイロードを生成できること', () => {
    localStorage.setItem(
      'performance_flow_projects',
      JSON.stringify([{ id: 'PJ001', name: '基幹システム刷新' }])
    );

    const payload = service.exportBackupPayload();
    expect(payload.app).toBe('PerformanceFlow');
    expect(payload.data['performance_flow_projects']).toHaveLength(1);
    expect(payload.data['performance_flow_projects'][0].id).toBe('PJ001');
  });

  it('妥当なバックアップJSON文字列を入力してインポートが成功すること', () => {
    const backupJson = JSON.stringify({
      app: 'PerformanceFlow',
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      data: {
        performance_flow_projects: [{ id: 'PJ001', name: 'テストプロジェクト' }],
        performance_flow_employees: [{ id: 'EMP001', name: 'テスト社員' }],
      },
    });

    const result = service.importBackupJson(backupJson);
    expect(result.success).toBe(true);
    expect(result.importedCounts?.['プロジェクトマスタ']).toBe(1);

    const storedProjects = JSON.parse(localStorage.getItem('performance_flow_projects') || '[]');
    expect(storedProjects).toHaveLength(1);
    expect(storedProjects[0].id).toBe('PJ001');
  });

  it('不正なJSON文字列が入力された場合、エラーレスポンスを返すこと', () => {
    const result = service.importBackupJson('INVALID JSON');
    expect(result.success).toBe(false);
    expect(result.message).toContain('パース');
  });

  it('dataプロパティが存在しない不完全なJSONデータの場合、エラーを返すこと', () => {
    const result = service.importBackupJson(JSON.stringify({ app: 'Invalid' }));
    expect(result.success).toBe(false);
    expect(result.message).toContain('不正');
  });

  it('resetToDefaultSeed実行時に全キーが消去されること', () => {
    localStorage.setItem('performance_flow_projects', JSON.stringify([{ id: 'PJ001' }]));
    service.resetToDefaultSeed();

    const summary = service.getDataSummary();
    const projSummary = summary.find((s) => s.key === 'performance_flow_projects');
    expect(projSummary?.count).toBe(0);
  });
});
