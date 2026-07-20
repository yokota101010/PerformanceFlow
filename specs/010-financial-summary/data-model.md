# Data Model: 業績・収支サマリ表示 (financial-summary)

F10「業績・収支サマリ表示」で使用する、画面表示・集計用のデータプロジェクションモデルを定義する（※永続化ストアへの直接の追加・変更は行わない参照専用モデル）。

## 表示用データプロジェクションモデル

### 1. `FinancialSummary` (全社サマリ集計値)

全社またはフィルタリングされた全明細の合算収支オブジェクト。

| 属性名 (物理) | 型 | 計算式・説明 |
| :--- | :--- | :--- |
| `totalSales` | `number` | 対象アサイン明細の `sales` の合算値 |
| `totalCost` | `number` | 対象アサイン明細の `cost` の合算値 |
| `totalGrossProfit` | `number` | `totalSales` － `totalCost` |
| `overallGrossProfitRate` | `number` | `totalGrossProfit` ÷ `totalSales` （パーセント値, 小数点以下第3位を四捨五入） |

---

### 2. `CaseAssignmentFinancialRow` (アサイン収支明細行)

テーブルの各行にバインドする、原価内訳を含む詳細な収支オブジェクト。

| 属性名 (物理) | 型 | データ取得元・導出式 |
| :--- | :--- | :--- |
| `assignmentId` | `string` | アサイン契約ID (`WKnnn`) |
| `projectName` | `string` | プロジェクトマスタから引き当てたプロジェクト名 |
| `caseName` | `string` | 案件マスタから引き当てた案件名 |
| `startDate` | `string` | アサイン開始日 |
| `endDate` | `string` | アサイン終了日 |
| `sales` | `number` | `contractEffort` × `contractPrice` |
| `laborCost` | `number` | `EmployeeWorkTimeRepository.sumCostByCaseAssignmentId` の合計額 (工数加工費) |
| `orderCost` | `number` | `PartnerOrderRepository.sumByCaseAssignmentId` の合計額 (発注額) |
| `expenseCost` | `number` | `OtherExpenseRepository.sumByCaseAssignmentId` の合計額 (その他経費) |
| `totalCost` | `number` | `laborCost` ＋ `orderCost` ＋ `expenseCost` (製造原価) |
| `grossProfit` | `number` | `sales` － `totalCost` (粗利) |
| `grossProfitRate` | `number` | `grossProfit` ÷ `sales` (粗利率) |
| `isDeficit` | `boolean` | `grossProfitRate < 0` (粗利率がマイナスの場合に `true`, 警告行の判定に使用) |
