# Tasks: 要員別工数サマリ表示 (member-worktime-summary)

**Input**: Design documents from `/specs/011-member-worktime-summary/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクトの初期設定および共有定義の確認

- [x] T001 `specs/011-member-worktime-summary/plan.md` に基づく共有インフラおよびディレクトリ構成の準備

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ユースケースや画面実装を開始する前に完了していなければならない、共通ドメイン・契約の定義

**⚠️ CRITICAL**: 本フェーズが完了するまで、個別のユーザーストーリーの実装は開始できません。

- [x] T002 ドメインモデル `src/domain/models/MonthlyMemberWorkHoursSummary.ts` を作成（合計工数>=0のバリデーションチェックをコンストラクタに内包）
- [x] T003 リポジトリインターフェース `src/domain/repositories/MonthlyMemberWorkHoursSummaryRepository.ts` を定義・作成
- [x] T004 ユースケースインターフェース `src/application/usecases/MonthlyMemberWorkHoursSummaryUseCase.ts` を定義・作成

**Checkpoint**: 基礎設計・インターフェース定義が完了。これよりユーザーストーリーの実装を開始する。

---

## Phase 3: User Story 1 - 要員別月別合計工数の一覧表示 (Priority: P1) 🎯 MVP

**Goal**: 要員ごと・年月ごとの合計工数をグリッド形式で一覧表示し、要員の空き状況やアサイン状況を可視化する。

**Independent Test**: 本画面を開いた際、LocalStorageのシードデータから各要員の年月ごとの合計工数がマトリクス形式で表示されていること。

### Tests for User Story 1
- [x] T005 [P] [US1] 読込処理単体テスト `tests/unit/application/MonthlyMemberWorkHoursSummaryService.list.test.ts` を作成
- [x] T006 [P] [US1] UI一覧表示テスト `tests/unit/infrastructure/ui/MonthlyMemberWorkHoursSummaryView.test.tsx` を作成

### Implementation for User Story 1
- [x] T007 [US1] インメモリリポジトリ `src/infrastructure/persistence/InMemoryMonthlyMemberWorkHoursSummaryRepository.ts` を実装
- [x] T008 [US1] LocalStorageリポジトリ `src/infrastructure/persistence/LocalStorageMonthlyMemberWorkHoursSummaryRepository.ts` を実装（12件の初期シードロードを内包）
- [x] T009 [US1] リポジトリレジストリ `src/infrastructure/persistence/RepositoryRegistry.ts` に `MonthlyMemberWorkHoursSummaryRepository` の登録・取得処理を追加
- [x] T010 [US1] サービス `src/application/services/MonthlyMemberWorkHoursSummaryService.ts` を作成し、マトリクス表示用の工数一覧取得メソッドを実装
- [x] T011 [US1] マトリクスUI画面 `src/infrastructure/ui/MonthlyMemberWorkHoursSummaryView.tsx` を作成し、要員名と年月マトリクスグリッドでの合計工数一覧を表示
- [x] T012 [US1] メイン画面 `src/App.tsx` のタブに「要員工数サマリ」タブを追加してルーティングを結合

**Checkpoint**: User Story 1 が単体で動作し、初期シードから工数サマリマトリクスが正しく表示されることを確認。

---

## Phase 4: User Story 2 - 工数集計のオンデマンド同期（ライトバック） (Priority: P1)

**Goal**: 画面起動時に、注文明細から要員ごと・年月ごとの合計工数を自動で集計し、`月別要員工数サマリ` テーブルへ書き戻し同期（ライトバック）および LocalStorage 永続化を実行する。

**Independent Test**: 発注データを変更した後に「要員工数サマリ」画面を開き、LocalStorage の `PF_MonthlyMemberWorkHoursSummaries` 内の合計工数が正しく再集計され、書き戻されていることを確認すること。

### Tests for User Story 2
- [x] T013 [P] [US2] 同期処理単体テスト `tests/unit/application/MonthlyMemberWorkHoursSummaryService.sync.test.ts` を作成

### Implementation for User Story 2
- [x] T014 [US2] サービス `src/application/services/MonthlyMemberWorkHoursSummaryService.ts` に、SoTである `注文明細` の `発注工数` からオンデマンド集計し、サマリテーブルへ書き戻す（ライトバック）同期処理ロジックを実装
- [x] T015 [US2] UI画面 `src/infrastructure/ui/MonthlyMemberWorkHoursSummaryView.tsx` において、`useEffect` による画面ロード時に自動同期（ライトバック）が走るよう連動を実装

**Checkpoint**: 画面ロード時の自動集計・ライトバック同期が正常に動作することを確認。

---

## Phase 5: User Story 3 - オーバーアサイン警告表示 (Priority: P2)

**Goal**: 合計工数が `1.0` を超過しているセル内のテキストを赤太字にし、警告アイコン（⚠）を表示する。

**Independent Test**: 工数合計が `1.0` を超えているセル値について、警告アイコン（⚠）が付いて赤太字で強調表示されていること。

### Tests for User Story 3
- [x] T016 [P] [US3] UIオーバーアサイン警告表示テスト `tests/unit/infrastructure/ui/MonthlyMemberWorkHoursSummaryView.warning.test.tsx` を作成

### Implementation for User Story 3
- [x] T017 [US3] UI画面 `src/infrastructure/ui/MonthlyMemberWorkHoursSummaryView.tsx` において、合計工数が `1.0` を超過しているセル内のテキストを赤太字にし、かつ横に警告アイコン（⚠）を表示する警告装飾を実装

**Checkpoint**: オーバーアサイン発生月の警告装飾（赤太字＋⚠）が正しく表示されることを確認。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全体整合性の検証、ビルド適合、および仕様検証シナリオのテスト

- [x] T018 すべての自動ユニットテスト・UIテスト（Vitest）を一括実行し、完全なグリーンパスを確認する
- [x] T019 `npm run build` を実行し、TypeScriptの型エラーやコンパイル時警告がないことを確認する
- [x] T020 `specs/011-member-worktime-summary/quickstart.md` に定義された 2つの手動受入検証シナリオを実行し、期待通りの表示・挙動であることを最終確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし。即時開始可能。
- **Foundational (Phase 2)**: Setup完了に依存。以降のユーザーストーリーすべてのブロッキング前提。
- **User Stories (Phase 3+)**: すべて Foundational（Phase 2）の完了に依存。
  - US1 (Phase 3 - 一覧表示) は他のUSへの依存なし。最優先 (MVP)。
  - US2 (Phase 4 - 自動同期) は US1 完了に依存。
  - US3 (Phase 5 - 警告表示) は US2 完了に依存。
- **Polish (Phase 6)**: すべてのユーザーストーリーが完了していることに依存。
