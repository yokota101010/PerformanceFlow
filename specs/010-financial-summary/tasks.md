# Tasks: 業績・収支サマリ表示 (financial-summary)

**Input**: Design documents from `/specs/010-financial-summary/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクトの初期設定および共有定義の確認

- [x] T001 `specs/010-financial-summary/plan.md` に基づく共有インフラおよびディレクトリ構成の準備

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ユースケースや画面実装を開始する前に完了していなければならない、共通ドメイン・契約の定義

**⚠️ CRITICAL**: 本フェーズが完了するまで、個別のユーザーストーリーの実装は開始できません。

- [x] T002 ユースケース契約 `src/application/usecases/FinancialSummaryUseCase.ts` インターフェースおよび DTO 定義を作成

**Checkpoint**: 基礎設計・インターフェース定義が完了。これよりユーザーストーリーの実装を開始する。

---

## Phase 3: User Story 1 - 全社収支サマリカードの表示 (Priority: P1) 🎯 MVP

**Goal**: システム全体の売上合計、製造原価合計、粗利合計、および全体の粗利率を視覚的なサマリカードとして画面上部に表示する。

**Independent Test**: 本画面を開いた際、全アサイン明細の売上、製造原価が集計され、画面上部のサマリカードに正しい値（売上: 18.8M, 原価: 15.4M, 粗利: 3.3M, 粗利率: 18%）で表示されること。

### Tests for User Story 1
- [x] T003 [P] [US1] 読込サマリ処理単体テスト `tests/unit/application/FinancialSummaryService.test.ts` を作成（未実装でRed）
- [x] T004 [P] [US1] UIサマリ表示テスト `tests/unit/infrastructure/ui/FinancialSummaryView.test.tsx` を作成（未実装でRed）

### Implementation for User Story 1
- [x] T005 [US1] ユースケースサービス `src/application/services/FinancialSummaryService.ts` を作成し、全アサインの売上・原価の合計サマリ集計ロジックを実装
- [x] T006 [US1] 収支サマリ表示画面 `src/infrastructure/ui/FinancialSummaryView.tsx` を作成し、上部に売上合計、製造原価合計、粗利合計、全体粗利率のサマリカードを表示するUIを実装
- [x] T007 [US1] ナビゲーションメニューおよびルーティング `src/App.tsx` に「収支サマリ」タブを追加して `FinancialSummaryView` を結合

**Checkpoint**: User Story 1 が単体で動作し、全社サマリカードが正しく表示されることを確認。

---

## Phase 4: User Story 2 - プロジェクト・案件別収支明細テーブルの表示 (Priority: P1)

**Goal**: 各アサイン契約ごとの売上、製造原価、粗利、粗利率に加えて、製造原価の独立した内訳カラム（加工費、発注額、その他経費）をテーブル上で常時表示し、赤字（粗利率マイナス）の行を薄い赤色（警告色）で強調表示する。

**Independent Test**: テーブル上の各行に、売上、加工費、発注額、その他経費、製造原価、粗利、粗利率が並んで常時表示され、WK003 と WK004 の赤字行全体の背景色が薄い赤色で強調表示されていること。

### Tests for User Story 2
- [x] T008 [P] [US2] テーブル詳細行・原価内訳取得テスト `tests/unit/application/FinancialSummaryService.detail.test.ts` を作成（未実装でRed）
- [x] T009 [P] [US2] UIテーブル明細・赤字警告表示テスト `tests/unit/infrastructure/ui/FinancialSummaryView.table.test.tsx` を作成（未実装でRed）

### Implementation for User Story 2
- [x] T010 [US2] ユースケースサービス `src/application/services/FinancialSummaryService.ts` に各アサイン契約のブレイクダウン（加工費、発注額、その他経費）を含む詳細な収支一覧取得メソッドを追加実装
- [x] T011 [US2] 画面 `src/infrastructure/ui/FinancialSummaryView.tsx` のテーブル内にアサイン一覧を表示するグリッドを実装し、加工費・発注額・その他経費の内訳を常時個別カラムで出力
- [x] T012 [US2] 画面 `src/infrastructure/ui/FinancialSummaryView.tsx` のテーブルで、粗利率がマイナス（赤字）のアサイン行に対してテキストを赤字化し、かつ行背景色を薄赤色（警告色）にする強調警告表示を実装

**Checkpoint**: 収支明細テーブル、原価の個別列常時表示、および赤字行の薄赤強調が正しく動作することを確認。

---

## Phase 5: User Story 3 - 条件フィルタリング機能 (Priority: P2)

**Goal**: プロジェクト名の一部や契約期間（開始月〜終了月）を指定して、合計サマリカードおよび明細テーブルをメモリ上で瞬時にフィルタリング再計算して更新する。

**Independent Test**: フィルター検索フォームでプロジェクト名を入力、または開始/終了月を指定して検索をかけた際、サマリカードおよび明細テーブルが即座に再集計されて同期更新されること。

### Tests for User Story 3
- [x] T013 [P] [US3] フィルタリング処理単体テスト `tests/unit/application/FinancialSummaryService.filter.test.ts` を作成
- [x] T014 [P] [US3] UIフィルタ操作・再集計テスト `tests/unit/infrastructure/ui/FinancialSummaryView.filter.test.tsx` を作成

### Implementation for User Story 3
- [x] T015 [US3] 画面 `src/infrastructure/ui/FinancialSummaryView.tsx` に「プロジェクト名（部分一致）」および「契約期間（開始月〜終了月）」のフィルタリング入力フォームを実装し、適用時にメモリ上で即座にフィルタリング・再計算を実行してサマリカードおよびテーブルが同期更新されるロジックを構成

**Checkpoint**: 条件フィルタリング適用に伴う再計算および表示の同期が正常に動作することを確認。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全体整合性の検証、ビルド適合、および仕様検証シナリオのテスト

- [x] T016 すべての自動ユニットテスト・UIテスト（Vitest）を一括実行し、完全なグリーンパスを確認する
- [x] T017 `npm run build` を実行し、TypeScriptの型エラーやコンパイル時警告がないことを確認する
- [x] T018 `specs/010-financial-summary/quickstart.md` に定義された 2つの手動受入検証シナリオを実行し、期待通りの表示・挙動であることを最終確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし。即時開始可能。
- **Foundational (Phase 2)**: Setup完了に依存。以降のユーザーストーリーすべてのブロッキング前提。
- **User Stories (Phase 3+)**: すべて Foundational（Phase 2）の完了に依存。
  - US1 (Phase 3 - 全社サマリ) は他のUSへの依存なし。最優先 (MVP)。
  - US2 (Phase 4 - 明細テーブル) は US1 完了に依存。
  - US3 (Phase 5 - フィルター) は US2 完了に依存。
- **Polish (Phase 6)**: すべてのユーザーストーリーが完了していることに依存。

### Parallel Opportunities
- 各フェーズ内の `[P]` マークがついたタスク（異なるファイルに対するテストファイル作成など）は同時に並行開発が可能です。
- テスト作成タスク（T003, T004, T008, T009, T013, T014）は、実装の前に並行して作成することができます。

---

## Parallel Example: User Story 1

```bash
# User Story 1 のテストを並行して作成:
Task: "T003 [P] [US1] 読込サマリ処理単体テスト tests/unit/application/FinancialSummaryService.test.ts を作成"
Task: "T004 [P] [US1] UIサマリ表示テスト tests/unit/infrastructure/ui/FinancialSummaryView.test.tsx を作成"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Phase 1 (Setup) および Phase 2 (Foundational) を完了。
2. Phase 3 (User Story 1 - 全社収支サマリカード) を実装。
3. **検証ゲート**: 全社サマリ集計が正しく機能することを単体で検証（ここでMVPとして稼働可能）。

### Incremental Delivery
1. MVP の検証完了後、Phase 4 (User Story 2 - 明細テーブル・原価内訳常時カラム化・赤字薄赤警告) を追加し、検証。
2. 続いて Phase 5 (User Story 3 - 条件フィルタリング機能) を追加し、検証。
3. Phase 6 (Polish) で全体の自動テストと本番ビルドのグリーンを確認。
