# Data Model: 要員別工数サマリ表示 (member-worktime-summary)

F11「要員別工数サマリ表示」で使用する物理テーブル `月別要員工数サマリ` およびドメインエンティティを定義する。

## ドメインエンティティ

### 1. `MonthlyMemberWorkHoursSummary` (月別要員工数サマリ)
要員ごと・年月ごとの合計発注工数を保持する集約ルート。

| カラム名 (物理) | データ型 | PK | 説明 |
| :--- | :--- | :---: | :--- |
| `staffId` | `string` | ✅ | 要員ID (`MEMnnn`) |
| `yearMonth` | `string` | ✅ | 対象年月 (YYYY-MM-01形式) |
| `totalEffort` | `number` |  | 同一要員・年月における注文明細の発注工数の合算値 |

#### バリデーション制約:
- `totalEffort` は `0` 以上の実数でなければならない（マイナスの工数は不可）。
- コンストラクタで制約を検証し、違反時には `Error` をスローする。
- 導出項目としての合計工数の値は、 SoT である `注文明細` の `発注工数` 合計と完全に一致しなければならない。

---

## リポジトリ契約

### `MonthlyMemberWorkHoursSummaryRepository`

```typescript
export interface MonthlyMemberWorkHoursSummaryRepository {
  findByKeys(staffId: string, yearMonth: string): Promise<MonthlyMemberWorkHoursSummary | null>;
  findAll(): Promise<readonly MonthlyMemberWorkHoursSummary[]>;
  save(summary: MonthlyMemberWorkHoursSummary): Promise<void>;
  saveAll(summaries: MonthlyMemberWorkHoursSummary[]): Promise<void>;
  delete(staffId: string, yearMonth: string): Promise<void>;
  deleteAll(): Promise<void>;
}
```
