# Data Model: その他経費入力 (other-expense-management)

F09「その他経費入力」で導入するデータ構造、バリデーションルール、および永続化インターフェースを定義する。

## ドメインモデル

### 1. `OtherExpense` （エンティティ・集約ルート）

その他経費を表現するイミュータブルなドメインオブジェクト。

#### 属性定義

| 属性名 (論理) | 属性名 (物理) | 型 | 制約・検証ルール |
| :--- | :--- | :--- | :--- |
| 作業契約ID | `caseAssignmentId` | `string` | 必須。形式: `WKnnn` |
| 行No | `lineNo` | `number` | 必須。1以上の整数。 |
| 金額 | `amount` | `number` | 必須。0以上の整数。 |
| 摘要 | `memo` | `string` | 必須。1文字以上100文字以下。 |

#### バリデーションルール (ドメイン層でのカプセル化)
- コンストラクタで以下の条件を検証し、違反している場合は `Error` をスローする。
  - `caseAssignmentId` が空である、または指定の形式を満たさない場合はエラー。
  - `lineNo` が 1 未満、または整数でない場合はエラー。
  - `amount` が 0 未満（負数）、または整数でない場合はエラー。
  - `memo` が空、または100文字を超える場合はエラー。

---

## リポジトリ契約 (`OtherExpenseRepository`)

データアクセス層を抽象化するインターフェース契約。

```typescript
export interface OtherExpenseRepository {
  /**
   * 指定した作業契約IDに関連するすべてのその他経費を取得する
   */
  findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly OtherExpense[]>;

  /**
   * システム内のすべてのその他経費を取得する
   */
  findAll(): Promise<readonly OtherExpense[]>;

  /**
   * 複合キーを指定して1件のその他経費を取得する
   */
  findByKeys(caseAssignmentId: string, lineNo: number): Promise<OtherExpense | null>;

  /**
   * 新しい、または更新されたその他経費を保存する
   */
  save(otherExpense: OtherExpense): Promise<void>;

  /**
   * 指定したその他経費を物理削除する
   */
  delete(caseAssignmentId: string, lineNo: number): Promise<void>;

  /**
   * 指定した作業契約IDのその他経費の合計金額を算出する
   */
  sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number>;

  /**
   * 次の行Noを取得する
   */
  getNextLineNo(caseAssignmentId: string): Promise<number>;
}
```
