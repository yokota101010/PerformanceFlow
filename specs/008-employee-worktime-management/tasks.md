# Tasks: 社員工数実績入力 (employee-worktime-management)

**Input**: Design documents from `/specs/008-employee-worktime-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクトの初期設定および共有定義の確認

- [x] T001 `specs/008-employee-worktime-management/plan.md` に基づく共有インフラおよびディレクトリ構成の準備

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ユースケースや画面実装を開始する前に完了していなければならない、共通ドメイン・契約の定義

**⚠️ CRITICAL**: 本フェーズが完了するまで、個別のユーザーストーリーの実装は開始できません。

- [x] T002 `src/domain/models/types.ts` に `IEmployeeWorkTime` および `IEmployeeWorkTimeSummary` 読取専用インターフェースを追加
- [x] T003 ドメイン集約ルート `src/domain/models/EmployeeWorkTime.ts` クラスモデルを実装（コンストラクタでの `0 <= workHours <= 200` および `targetMonth` 形式検証ロジックを内包）
- [x] T004 `src/domain/models/index.ts` に `EmployeeWorkTime` をエクスポート追加
- [x] T005 リポジトリ契約 `src/domain/repositories/EmployeeWorkTimeRepository.ts` インターフェースを定義・作成
- [x] T006 ユースケース契約 `src/application/usecases/EmployeeWorkTimeUseCase.ts` インターフェースおよび DTO 定義を作成

**Checkpoint**: 基礎設計・ドメインモデル定義が完了。これよりユーザーストーリーの実装を開始する。

---

## Phase 3: User Story 1 - 社員工数実績の一覧表示と合計サマリ (Priority: P1) 🎯 MVP

**Goal**: システムに初期登録されている工数実績データを一覧にロードし、社員ごとの月間合計時間をサマリ表示する。

**Independent Test**: テスト用DB/LocalStorageが空の状態でアプリを起動し、「社員工数実績入力」画面を開いた際、初期シード明細 6件が正しい加工費、合計時間とともに一覧上にロードされること。

### Tests for User Story 1
- [x] T007 [P] [US1] 読込処理単体テスト `tests/unit/application/EmployeeWorkTimeService.list.test.ts` を作成（未実装でRed）
- [x] T008 [P] [US1] UI表示テスト `tests/unit/infrastructure/ui/EmployeeWorkTimeView.test.tsx` を作成（未実装でRed）

### Implementation for User Story 1
- [x] T009 [US1] `src/infrastructure/persistence/InMemoryEmployeeWorkTimeRepository.ts` にテスト用インメモリリポジトリを実装
- [x] T010 [US1] `src/infrastructure/persistence/LocalStorageEmployeeWorkTimeRepository.ts` に本番用 LocalStorage リポジトリを実装（初回起動時の 6件の自動シードロードを内包）
- [x] T011 [US1] `src/infrastructure/persistence/RepositoryRegistry.ts` に `EmployeeWorkTimeRepository` の切り替え・登録・取得メソッドを追加
- [x] T012 [US1] ユースケースサービス `src/application/services/EmployeeWorkTimeService.ts` に `getWorkTimes` 読込ロジックを実装
- [x] T013 [US1] 案件作業アサイン (F06) 側の原価集計 `src/application/services/CaseAssignmentService.ts` で、社員加工費を `EmployeeWorkTimeRepository.sumCostByCaseAssignmentId` 経由で動的にプル集計して `cost` に加算する繋ぎ込みを実装
- [x] T014 [US1] UI表示用画面コンポーネント `src/infrastructure/ui/EmployeeWorkTimeView.tsx` を実装（年月絞り込み・社員ごとの月間合計作業時間の集計表示を内包）
- [x] T015 [US1] メイン画面 `src/infrastructure/ui/App.tsx` またはルーティング定義に実績入力画面への切り替えボタン・リンクを追加

**Checkpoint**: User Story 1 が単体で動作し、原価プル同期が自動反映されることを確認。

---

## Phase 4: User Story 2 - 工数実績の新規登録 (Priority: P1)

**Goal**: 新規登録フォームから作業契約、社員、年月、作業実績時間を指定して新しく工数実績を登録できる。

**Independent Test**: 新規登録ダイアログで正常値を入力して登録した際、一意性制約エラーやアサイン期間外エラー、作業時間超過（200時間超）がバリデーションでブロックされ、正常データのみが追加保存されて一覧が更新されること。

### Tests for User Story 2
- [x] T016 [P] [US2] 登録処理単体テスト `tests/unit/application/EmployeeWorkTimeService.create.test.ts` を作成（未実装でRed）
- [x] T017 [P] [US2] UI登録フォームテスト `tests/unit/infrastructure/ui/EmployeeWorkTimeForm.test.tsx` を作成（未実装でRed）

### Implementation for User Story 2
- [x] T018 [US2] `src/application/services/EmployeeWorkTimeService.ts` に `createWorkTime` ユースケースコマンドを実装（同一複合キーの存在有無、アサイン契約期間内チェックを実装）
- [x] T019 [US2] 新規・編集用入力フォーム `src/infrastructure/ui/EmployeeWorkTimeForm.tsx` を実装（セレクトボックスによる契約・社員選択、作業時間の入力）
- [x] T020 [US2] `src/infrastructure/ui/EmployeeWorkTimeView.tsx` に登録フォームポップアップとの連携および合計作業時間200時間超過時の警告表示（UIアラート）を実装

**Checkpoint**: 正常値の新規登録、およびエラーバリデーションが正常に動作することを確認。

---

## Phase 5: User Story 3 - 工数実績の編集・更新 (Priority: P2)

**Goal**: 一覧画面から選択した登録済みの実績の作業時間を編集変更し、加工費および合計時間が即座に再計算されて反映される。

**Independent Test**: 編集フォームを開き、作業時間を変更して保存した際、一覧画面上の「加工費」および合計時間が即座に再計算され、200時間超過時には警告メッセージが表示されること。

### Tests for User Story 3
- [x] T021 [P] [US3] 更新処理単体テスト `tests/unit/application/EmployeeWorkTimeService.update.test.ts` を作成
- [x] T022 [P] [US3] UI編集フォームテスト `tests/unit/infrastructure/ui/EmployeeWorkTimeForm.edit.test.tsx` を作成

### Implementation for User Story 3
- [x] T023 [US3] `src/application/services/EmployeeWorkTimeService.ts` に `updateWorkHours` ユースケースコマンドを実装（作業時間の上限・下限値バリデーション）
- [x] T024 [US3] `src/infrastructure/ui/EmployeeWorkTimeView.tsx` において、対象行の「編集」ボタン押下時に `EmployeeWorkTimeForm` を対象値セット済みの編集モードでポップアップ表示する連携を実装

**Checkpoint**: 既存行の編集・更新保存が再計算を伴って正常に動作することを確認。

---

## Phase 6: User Story 4 - 工数実績の物理削除 (Priority: P2)

**Goal**: 不要になった工数実績データを一覧から物理削除し、合計時間およびアサイン側の製造原価を即座に再計算して反映する。

**Independent Test**: 削除を実行した際、一覧から即座に消去され、リポジトリおよび合計稼働時間からそのレコードの時間が減算されること。

### Tests for User Story 4
- [x] T025 [P] [US4] 削除処理単体テスト `tests/unit/application/EmployeeWorkTimeService.delete.test.ts` を作成
- [x] T026 [P] [US4] UI削除操作テスト `tests/unit/infrastructure/ui/EmployeeWorkTimeView.delete.test.tsx` を作成

### Implementation for User Story 4
- [x] T027 [US4] `src/application/services/EmployeeWorkTimeService.ts` に `deleteWorkTime` ユースケースコマンドを実装
- [x] T028 [US4] `src/infrastructure/ui/EmployeeWorkTimeView.tsx` の各行に削除ボタンを配置し、確認用ダイアログ表示と削除処理の連動を実装

**Checkpoint**: 実績データの物理削除および連動する集計の整合性を確認。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 全体整合性の検証、ビルド適合、および仕様検証シナリオのテスト

- [x] T029 すべての自動ユニットテスト・UIテスト（Vitest）を一括実行し、完全なグリーンパスを確認する
- [x] T030 `npm run build` を実行し、TypeScriptの型エラーやコンパイル時警告がないことを確認する
- [x] T031 `specs/008-employee-worktime-management/quickstart.md` に定義された 4つの手動受入検証シナリオを実行し、期待通りの表示・挙動であることを最終確認するx` に登録フォームポップアップとの連携および合計作業時間200時間超過時の警告表示（UIアラート）を実装

**Checkpoint**: 正常値の新規登録、およびエラーバリデーションが正常に動作することを確認。

---

## Phase 5: User Story 3 - 工数実績の編集・更新 (Priority: P2)

**Goal**: 一覧画面から選択した登録済みの実績の作業時間を編集変更し、加工費および合計時間が即座に再計算されて反映される。

**Independent Test**: 編集フォームを開き、作業時間を変更して保存した際、一覧画面上の「加工費」および合計時間が即座に再計算され、200時間超過時には警告メッセージが表示されること。

### Tests for User Story 3
- [ ] T021 [P] [US3] 更新処理単体テスト `tests/unit/application/EmployeeWorkTimeService.update.test.ts` を作成
- [ ] T022 [P] [US3] UI編集フォームテスト `tests/unit/infrastructure/ui/EmployeeWorkTimeForm.edit.test.tsx` を作成

### Implementation for User Story 3
- [ ] T023 [US3] `src/application/services/EmployeeWorkTimeService.ts` に `updateWorkHours` ユースケースコマンドを実装（作業時間の上限・下限値バリデーション）
- [ ] T024 [US3] `src/infrastructure/ui/EmployeeWorkTimeView.tsx` において、対象行の「編集」ボタン押下時に `EmployeeWorkTimeForm` を対象値セット済みの編集モードでポップアップ表示する連携を実装

**Checkpoint**: 既存行の編集・更新保存が再計算を伴って正常に動作することを確認。

---

## Phase 6: User Story 4 - 工数実績の物理削除 (Priority: P2)

**Goal**: 不要になった工数実績データを一覧から物理削除し、合計時間およびアサイン側の製造原価を即座に再計算して反映する。

**Independent Test**: 削除を実行した際、一覧から即座に消去され、リポジトリおよび合計稼働時間からそのレコードの時間が減算されること。

### Tests for User Story 4
- [ ] T025 [P] [US4] 削除処理単体テスト `tests/unit/application/EmployeeWorkTimeService.delete.test.ts` を作成
- [ ] T026 [P] [US4] UI削除操作テスト `tests/unit/infrastructure/ui/EmployeeWorkTimeView.delete.test.tsx` を作成

### Implementation for User Story 4
- [ ] T027 [US4] `src/application/services/EmployeeWorkTimeService.ts` に `deleteWorkTime` ユースケースコマンドを実装
- [ ] T028 [US4] `src/infrastructure/ui/EmployeeWorkTimeView.tsx` の各行に削除ボタンを配置し、確認用ダイアログ表示と削除処理の連動を実装

**Checkpoint**: 実績データの物理削除および連動する集計の整合性を確認。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 全体整合性の検証、ビルド適合、および仕様検証シナリオのテスト

- [ ] T029 すべての自動ユニットテスト・UIテスト（Vitest）を一括実行し、完全なグリーンパスを確認する
- [ ] T030 `npm run build` を実行し、TypeScriptの型エラーやコンパイル時警告がないことを確認する
- [ ] T031 `specs/008-employee-worktime-management/quickstart.md` に定義された 4つの手動受入検証シナリオを実行し、期待通りの表示・挙動であることを最終確認する

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
- 各フェーズ内の `[P]` マークがついたタスク（異なるファイルに対するテストファイル作成やモデル構築など）は同時に並行開発が可能です。
- テスト作成タスク（T007, T008, T016, T017, T021, T022, T025, T026）は、実装の前に並行して作成することができます。

---

## Parallel Example: User Story 1

```bash
# User Story 1 のテストを並行して作成:
Task: "T007 [P] [US1] 読込処理単体テスト tests/unit/application/EmployeeWorkTimeService.list.test.ts を作成"
Task: "T008 [P] [US1] UI表示テスト tests/unit/infrastructure/ui/EmployeeWorkTimeView.test.tsx を作成"
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
