import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';

export interface StorageTableInfo {
  key: string;
  name: string;
  count: number;
}

export interface BackupPayload {
  app: string;
  version: string;
  exportedAt: string;
  data: Record<string, any[]>;
}

export const ALL_STORAGE_KEYS: Array<{ key: string; name: string }> = [
  { key: 'performance_flow_projects', name: 'プロジェクトマスタ' },
  { key: 'performance_flow_cases', name: '案件マスタ' },
  { key: 'performance_flow_case_assignments', name: '案件明細 (アサイン契約)' },
  { key: 'performance_flow_partner_orders', name: '発注管理' },
  { key: 'performance_flow_employee_work_times', name: '社員工数実績' },
  { key: 'performance_flow_other_expenses', name: 'その他経費' },
  { key: 'performance_flow_employees', name: '社員マスタ' },
  { key: 'performance_flow_partners', name: '発注先マスタ' },
  { key: 'performance_flow_staffs', name: '要員マスタ' },
  { key: 'performance_flow_employee_unit_prices', name: '社員単価設定' },
  { key: 'performance_flow_staff_unit_prices', name: '要員単価設定' },
  { key: 'performance_flow_quarter_categories', name: '四半期区分設定' },
  { key: 'performance_flow_monthly_member_work_hours_summary', name: '要員工数サマリ' },
];

export class DataIoService {
  /**
   * 現在の全LocalStorageデータを取得してサマリ情報を返す
   */
  getDataSummary(): StorageTableInfo[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return ALL_STORAGE_KEYS.map((item) => ({ key: item.key, name: item.name, count: 0 }));
    }

    return ALL_STORAGE_KEYS.map((item) => {
      let count = 0;
      try {
        const raw = window.localStorage.getItem(item.key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            count = parsed.length;
          }
        }
      } catch (e) {
        console.error(`Failed to read ${item.key}`, e);
      }
      return { key: item.key, name: item.name, count };
    });
  }

  /**
   * 全データをバックアップ用JSONオブジェクトとして構成
   */
  exportBackupPayload(): BackupPayload {
    const dataObj: Record<string, any[]> = {};

    if (typeof window !== 'undefined' && window.localStorage) {
      for (const item of ALL_STORAGE_KEYS) {
        const raw = window.localStorage.getItem(item.key);
        if (raw) {
          try {
            dataObj[item.key] = JSON.parse(raw);
          } catch (e) {
            dataObj[item.key] = [];
          }
        } else {
          dataObj[item.key] = [];
        }
      }
    }

    return {
      app: 'PerformanceFlow',
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      data: dataObj,
    };
  }

  /**
   * バックアップJSONをファイルとしてブラウザダウンロード
   */
  downloadExportFile(): void {
    const payload = this.exportBackupPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const nowStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `PerformanceFlow_backup_${nowStr}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * バックアップJSON文字列を読み込み、検証した上でLocalStorageへ復元
   */
  importBackupJson(jsonStr: string): { success: boolean; message: string; importedCounts?: Record<string, number> } {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, message: 'LocalStorageが利用できない環境です。' };
    }

    let payload: any;
    try {
      payload = JSON.parse(jsonStr);
    } catch (e) {
      return { success: false, message: 'JSONファイルの解析（パース）に失敗しました。正しいJSONファイルを選択してください。' };
    }

    // 簡易データバリデーション
    if (!payload || typeof payload !== 'object' || !payload.data || typeof payload.data !== 'object') {
      return { success: false, message: 'バックアップファイルの形式が不正です（dataプロパティが存在しません）。' };
    }

    const importedCounts: Record<string, number> = {};

    try {
      // 復元前にレジストリをクリア
      RepositoryRegistry.clear();

      for (const item of ALL_STORAGE_KEYS) {
        if (Array.isArray(payload.data[item.key])) {
          const list = payload.data[item.key];
          window.localStorage.setItem(item.key, JSON.stringify(list));
          importedCounts[item.name] = list.length;
        }
      }

      // レジストリを再クリアして最新データを反映させる準備
      RepositoryRegistry.clear();

      return {
        success: true,
        message: 'データのインポート（復元）が正常に完了しました。',
        importedCounts,
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'データ復元処理中にエラーが発生しました。' };
    }
  }

  /**
   * データを全消去し初期状態（データ無しの状態）へリセット
   */
  resetToDefaultSeed(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      for (const item of ALL_STORAGE_KEYS) {
        window.localStorage.removeItem(item.key);
      }
    }
    RepositoryRegistry.clear();
  }
}
