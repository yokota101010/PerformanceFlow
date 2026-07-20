# Tasks: その他経費入力 (other-expense-management)

**Input**: Design documents from `/specs/009-other-expense-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクトの初期設定および共有定義の確認

- [x] T001 `specs/009-other-expense-management/plan.md` に基づく共有インフラおよびディレクトリ構成の準備

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ユースケースや画面実装を開始する前に完了していなければならない、共通ドメイン・契約の定義

**⚠️ CRITICAL**: 本フェーズが完了するまで、個別のご利用ストーリーの実装は開始できません。

- [x] T002 `src/domain/models/types.ts` に `OtherExpense` 読取専用インターフェースを追加
- [x] T003 ドメイン集約ルート `src/domain/models/OtherExpense.ts` クラスモデルを実装（コンストラクタでの金額正数チェック・摘要100文字以内のバリデーション検証ロジックを内包）
- [x] T004 `src/domain/models/index.ts` に `OtherExpense` をエクスポート追加
- [x] T005 リポジトリ契約 `src/domain/repositories/OtherExpenseRepository.ts` インターフェースを定義・作成
- [x] T006 ユースケース契約 `src/application/usecases/OtherExpenseUseCase.ts` インターフェースおよび DTO 定義を作成

**Checkpoint**: 基礎設計・ドメインモデル定義が完了。これよりユーザーストーリーの実装を開始する。

---

## Phase 3: User Story 1 - その他経費の一覧表示と合計サマリ (Priority: P1) 🎯 MVP

**Goal**: 作業契約（アサイン明細）ごとに紐づくその他経費の一覧と、経費金額の合計額をサマリ表示する。

**Independent Test**: テスト用LocalStorageが初期状態のままアプリを起動し、「アサイン契約」画面の対象アサイン行の経費リンクをクリックして「その他経費入力」画面を開いた際、初期シード明細が正しい金額・摘要・合計金額とともに一覧上にロードされること。

### Tests for User Story 1
- [x] T007 [P] [US1] 読込処理単体テスト `tests/unit/application/OtherExpenseService.list.test.ts` を作成（未実装でRed）
- [x] T008 [P] [US1] UI表示テスト `tests/unit/infrastructure/ui/OtherExpenseView.test.tsx` を作成（未実装でRed）

### Implementation for User Story 1
- [x] T009 [US1] `src/infrastructure/persistence/InMemoryOtherExpenseRepository.ts` にテスト用インメモリリポジトリを実装
- [x] T010 [US1] `src/infrastructure/persistence/LocalStorageOtherExpenseRepository.ts` に本番用 LocalStorage リポジトリを実装（初回起動時の 3件の自動シードロードを内包）
- [x] T011 [US1] `src/infrastructure/persistence/RepositoryRegistry.ts` に `OtherExpenseRepository` の切り替え・登録・取得メソッドを追加
- [x] T012 [US1] ユースケースサービス `src/application/services/OtherExpenseService.ts` に `getOtherExpenses` 読込ロジックを実装
- [x] T013 [US1] 案件作業アサイン (F06) 側の原価集計 `src/application/services/CaseAssignmentService.ts` で、その他経費を `OtherExpenseRepository.sumByCaseAssignmentId` 経由で動的にプル集計して `cost` に加算する繋ぎ込みを実装
- [x] T014 [US1] UI表示用画面コンポーネント `src/infrastructure/ui/OtherExpenseView.tsx` を実装（作業契約ごとの経費一覧、および合計金額の集計表示を内包）
- [x] T015 [US1] アサイン明細画面 `src/infrastructure/ui/CaseAssignmentView.tsx` から経費入力画面（OtherExpenseView）への切り替えボタン・リンクを追加

**Checkpoint**: User Story 1 が単体で動作し、原価プル同期が自動反映されることを確認。

---

## Phase 4: User Story 2 - その他経費の新規登録 (Priority: P1)

**Goal**: 金額と摘要を指定して新しくその他経費を登録できる。

**Independent Test**: 新規登録ダイアログで正常値を入力して登録した際、行Noが自動採番され、追加保存されて一覧が更新されること。負数や100文字超の入力時にはバリデーションでブロックされること。

### Tests for User Story 2
- [x] T016 [P] [US2] 登録処理単体テスト `tests/unit/application/OtherExpenseService.create.test.ts` を作成（未実装でRed）
- [x] T017 [P] [US2] UI登録フォームテスト `tests/unit/infrastructure/ui/OtherExpenseForm.test.tsx` を作成（未実装でRed）

### Implementation for User Story 2
- [x] T018 [US2] `src/application/services/OtherExpenseService.ts` に `createOtherExpense` ユースケースコマンドを実装（行No自動採番 `getNextLineNo` およびアサイン存在確認を実装）
- [x] T019 [US2] 新規・編集用入力フォーム `src/infrastructure/ui/OtherExpenseForm.tsx` を実装（金額、摘要の入力・文字数および正数制限バリデーション）
- [x] T020 [US2] `src/infrastructure/ui/OtherExpenseView.tsx` に登録フォームポップアップとの連携を実装

**Checkpoint**: 正常値の新規登録、およびエラーバリデーションが正常に動作することを確認。

---

## Phase 5: User Story 3 - その他経費の編集・更新 (Priority: P2)

**Goal**: 登録済みの経費の金額・摘要を編集変更し、金額およびアサイン側の原価が即座に再計算されて反映される。

**Independent Test**: 編集フォームを開き、金額や摘要を変更して保存した際、一覧画面上の金額およびアサイン側の製造原価が即座に再計算され、反映されること。

### Tests for User Story 3
- [x] T021 [P] [US3] 更新処理単体テスト `tests/unit/application/OtherExpenseService.update.test.ts` を作成
- [x] T022 [P] [US3] UI編集フォームテスト `tests/unit/infrastructure/ui/OtherExpenseForm.edit.test.tsx` を作成

### Implementation for User Story 3
- [x] T023 [US3] `src/application/services/OtherExpenseService.ts` に `updateOtherExpense` ユースケースコマンドを実装
- [x] T024 [US3] `src/infrastructure/ui/OtherExpenseView.tsx` において、対象行の「編集」ボタン押下時に `OtherExpenseForm` を対象値セット済みの編集モードでポップアップ表示する連携を実装

**Checkpoint**: 既存行の編集・更新保存が再計算を伴って正常に動作することを確認。

---

## Phase 6: User Story 4 - その他経費の物理削除 (Priority: P2)

**Goal**: 不要になったその他経費データを一覧から物理削除し、合計金額およびアサイン側の製造原価を即座に再計算して反映する。

**Independent Test**: 削除ボタンをクリックし、確認ダイアログ（「この経費明細を削除しますか？」）でOKを押した際、一覧から即座に消去され、リポジトリおよびアサイン製造原価から経費金額が減算されること。

### Tests for User Story 4
- [x] T025 [P] [US4] 削除処理単体テスト `tests/unit/application/OtherExpenseService.delete.test.ts` を作成
- [x] T026 [P] [US4] UI削除操作テスト `tests/unit/infrastructure/ui/OtherExpenseView.delete.test.tsx` を作成

### Implementation for User Story 4
- [x] T027 [US4] `src/application/services/OtherExpenseService.ts` に `deleteOtherExpense` ユースケースコマンドを実装
- [x] T028 [US4] `src/infrastructure/ui/OtherExpenseView.tsx` の各行に削除ボタンを配置し、確認用ダイアログ表示と削除処理の連動を実装

**Checkpoint**: 実績データの物理削除および連動する集計の整合性を確認。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 全体整合性の検証、ビルド適合、および仕様検証シナリオのテスト

- [x] T029 すべての自動ユニットテスト・UIテスト（Vitest）を一括実行し、完全なグリーンパスを確認する
- [x] T030 `npm run build` を実行し、TypeScript of 型エラーやコンパイル時警告がないことを確認する
- [x] T031 `specs/009-other-expense-management/quickstart.md` に定義された 4つの手動受入検証シナリオを実行し、期待通りの表示・挙動であることを最終確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし。即時開始可能。
- **Foundational (Phase 2)**: Setup完了に依存。以降のユーザーストーリーすべてのブロッキング前提。
- **User Stories (Phase 3+)**: すべて Foundational（Phase 2）の完了に依存。
  - US1 (Phase 3) は他のUSへの依存なし。アサイン原価結合の観点から最優先 (MVP)。
  - US2 (Phase 4) は US1 完了に依存。
  - US3 (Phase 5) は US2 完了に依存。
  - US4 (Phase 6) は US3 完了に依存。
- **Polish (Phase 7)**: すべてのユーザーストーリーが完了していることに依存。

### Parallel Opportunities
- 各フェーズ内の `[P]` マークがついたタスク（異なるファイルに対するテストファイル作成など）は同時に並行開発が可能です。
- テスト作成タスク（T007, T008, T016, T017, T021, T022, T025, T026）は、実装の前に並行して作成することができます。

---

## Parallel Example: User Story 1

```bash
# User Story 1 のテストを並行して作成:
Task: "T007 [P] [US1] 読込処理単体テスト tests/unit/application/OtherExpenseService.list.test.ts を作成"
Task: "T008 [P] [US1] UI表示テスト tests/unit/infrastructure/ui/OtherExpenseView.test.tsx を作成"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Phase 1 (Setup) および Phase 2 (Foundational) を完了。
2. Phase 3 (User Story 1 - 一覧表示とサマリ) を実装。
3. **検証ゲート**: 一覧表示および原価プル同期が正しく機能することを単体で検証（ここでMVPとして稼働可能）。

### Incremental Delivery
1. MVP の検証完了後、Phase 4 (User Story 2 - 新規登録) を追加し、検証。
2. 続いて Phase 5 (User Story 3 - 編集更新) を追加し、検証。
3. 最後に Phase 6 (User Story 4 - 物理削除) を追加し、検証。
4. Phase 7 (Polish) で全体の自動テストと本番ビルドのグリーンを確認。
