# Tasks: 案件明細 原価・業績サマリ表示 (case-cost-performance-summary)

**Input**: Design documents from `/specs/013-case-cost-performance-summary/`
**Prerequisites**: plan.md, spec.md, domain-model.md, crud-matrix.md
**Organization**: Tasks are grouped by user story and technical layers.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story identifier (US1, US2, US3, US4)

---

## Phase 1: Setup & Domain Model Types

**Purpose**: 型定義および CRUD マトリクスの整合性確立

- [x] T001 [P] `crud-matrix.md` に F15（月別案件明細原価表示）および F16（四半期別案件明細業績表示）の Query 操作権限を追加
- [x] T002 [P] `src/domain/models/types.ts` に `MonthlyCaseDetailCost` および `QuarterlyCaseDetailPerformance` のインターフェース定義を追加
- [x] T003 `src/domain/models/index.ts` に関連型およびモデルのエクスポートを追加

---

## Phase 2: Foundational (Domain Aggregate Classes)

**Purpose**: 製造原価・四半期業績の導出ロジックをカプセル化したドメインモデルの実装

- [x] T004 [P] [US1] `src/domain/models/MonthlyCaseDetailCost.ts` を作成（製造原価合計、会計年度、四半期区分の自動導出）
- [x] T005 [P] [US2] `src/domain/models/QuarterlyCaseDetailPerformance.ts` を作成（四半期売上按分、製造原価、粗利、粗利率の自動導出）

---

## Phase 3: User Story 1 - 案件明細別・月別製造原価サマリ表示 (Priority: P1) 🎯 MVP

**Goal**: 一次データ（発注・社員工数・その他経費）から契約ID・年月ごとの製造原価をオンデマンド集計し表示する

- [x] T006 [US1] `src/application/usecases/MonthlyCaseDetailCostUseCase.ts` にクエリインターフェースおよび DTO を定義
- [x] T007 [US1] `src/application/services/MonthlyCaseDetailCostService.ts` にプル型動的集計ロジックを実装
- [x] T008 [US1] `src/infrastructure/ui/MonthlyCaseDetailCostView.tsx` を作成し、月別原価グリッドおよび製造原価合計カードを実装

---

## Phase 4: User Story 2 - 案件明細別・四半期別業績サマリ表示 (Priority: P1)

**Goal**: 月別原価と案件明細（契約）情報から四半期ごとの売上按分・製造原価・粗利・粗利率をオンデマンド算出して表示する

- [x] T009 [US2] `src/application/usecases/QuarterlyCaseDetailPerformanceUseCase.ts` にクエリインターフェースおよび DTO を定義
- [x] T010 [US2] `src/application/services/QuarterlyCaseDetailPerformanceService.ts` に四半期按分業績の動的集計ロジックを実装
- [x] T011 [US2] `src/infrastructure/ui/QuarterlyCaseDetailPerformanceView.tsx` を作成し、KPIカード（売上・原価・粗利・粗利率）および業績一覧グリッドを実装

---

## Phase 5: User Story 3 & 4 - 絞り込み・オンデマンド再計算・ナビゲーション統合 (Priority: P2)

**Goal**: 年度・四半期フィルタリング、画面切り替え時のオンデマンド再計算、メイン画面ナビゲーションへの統合

- [x] T012 [US3] `MonthlyCaseDetailCostView.tsx` および `QuarterlyCaseDetailPerformanceView.tsx` に会計年度・四半期の絞り込みドロップダウンを実装
- [x] T013 [US4] 画面表示・条件変更時に常に一次データから再計算するプル型同期（結果整合性）を保証
- [x] T014 `src/App.tsx` の機能選択ドロップダウンに「―― 原価・業績分析 ――」グループを追加し、F15・F16 の画面ルーティングを統合

---

## Phase 6: Verification & Polish

**Purpose**: テスト検証およびビルド健全性の確認

- [x] T015 `tests/CaseDetailCostAndPerformance.test.ts` を作成し、`domain-model.md` の AI検証用シードデータ（PJ001, ANK001, CON001）に基づく計算値の完全一致を検証
- [x] T016 全テストスイート（83 テストファイル / 193 テスト）を実行し全件 PASS を確認
- [x] T017 `npm run build`（`tsc && vite build`）を実行し、TypeScript コンパイルおよび単一HTMLバンドル生成の正常完了を確認
