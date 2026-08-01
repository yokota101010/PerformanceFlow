# Application UseCase & Query Contracts

## Command UseCases (Single Aggregate Operations)

```typescript
// F01: プロジェクトマスタ管理
export interface SaveProjectUseCase {
  execute(command: { id?: string; name: string; clientName: string }): Promise<void>;
}

// F05: 案件管理 (案件ルート + 案件明細メンバー)
export interface SaveCaseUseCase {
  execute(command: {
    id?: string;
    projectId: string;
    name: string;
    details: Array<{ id?: string; partnerId: string; contractAmount: number }>;
  }): Promise<void>;
}

// F08: 社員単価設定 (社員単価ルート + 月別社員単価メンバー)
export interface SaveEmployeeUnitPriceUseCase {
  execute(command: {
    id?: string;
    employeeId: string;
    monthlyPrices: Array<{ yearMonth: string; price: number }>;
  }): Promise<void>;
}

// F11: 四半期区分設定
export interface SaveQuarterCategoryUseCase {
  execute(command: {
    quarterCode: string; // e.g. "2026-Q1"
    fiscalYear: number;
    startYearMonth: string;
    endYearMonth: string;
  }): Promise<void>;
}
```

## Query Services (On-Demand Summary Projections)

```typescript

// F13: 社員別工数サマリ表示
export interface GetEmployeeWorktimeSummaryQuery {
  execute(params: { yearMonth: string }): Promise<{
    summaries: Array<{
      employeeId: string;
      employeeName: string;
      totalWorktime: number;
      totalCost: number;
    }>;
  }>;
}
```
