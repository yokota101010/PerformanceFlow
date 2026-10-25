# Tasks: その他経費の発生日対応（正本整合） (other-expense-occurrence-date)

**Input**: Design documents from `/specs/014-other-expense-occurrence-date/`
**Prerequisites**: plan.md, spec.md, domain-model.md, crud-matrix.md
**Organization**: Tasks are grouped by user story and technical layers.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story identifier (US1, US2, US3, US4)

---

## Phase 1: Setup & Domain Model (Foundational)

**Purpose**: `その他経費` ドメインエンティティおよびリポジトリインターフェースの正本準拠化

- [x] T001 [P] `src/domain/models/types.ts` の `OtherExpense` インターフェースを更新（`occurrenceDate`, `occurrenceYearMonth`, `needsReview` 追加）
- [x] T002 `src/domain/models/OtherExpense.ts` クラスを更新（複合主キー検証、実在日付チェック、`occurrenceYearMonth` 自動導出）
- [x] T003 `src/domain/repositories/OtherExpenseRepository.ts` インターフェースを更新（`findByKeys`, `delete`, `getNextLineNo`）
- [x] T004 `src/infrastructure/persistence/InMemoryOtherExpenseRepository.ts` を新インターフェースに合わせて更新

---

## Phase 2: User Story 1 - 発生日を指定した経費の登録 (Priority: P1) 🎯 MVP

**Goal**: 発生日を指定して経費を登録し、同一契約・同一発生日内での自動連番（行No）採番を実現する

- [x] T005 [US1] `src/application/usecases/OtherExpenseUseCase.ts` の登録用契約を更新
- [x] T006 [US1] `src/application/services/OtherExpenseService.ts` に発生日単位の自動連番採番ロジックを実装
- [x] T007 [US1] `src/infrastructure/ui/OtherExpenseForm.tsx` に発生日入力フィールド（YYYY-MM-DD実在日バリデーション付き）を追加

---

## Phase 3: User Story 2 - 経費一覧の発生日表示と並び順 (Priority: P1)

**Goal**: 経費一覧に発生日・行No・発生年月を表示し、発生日昇順・行No昇順でソートする

- [x] T008 [US2] `src/infrastructure/ui/OtherExpenseView.tsx` のテーブルヘッダーおよび行表示を発生日・行No・発生年月対応に更新
- [x] T009 [US2] 経費一覧のソート順（発生日昇順、同一日は行No昇順）を実装

---

## Phase 4: User Story 3 - 経費の編集・削除 (Priority: P1)

**Goal**: 登録済み経費の編集（発生日変更時の再採番含む）および削除機能の実装

- [x] T010 [US3] `OtherExpenseService.ts` に編集（発生日変更時の旧行削除・新日再採番、同日時は行No維持）を実装
- [x] T011 [US3] `OtherExpenseService.ts` に削除（欠番詰めなし）を実装
- [x] T012 [US3] `OtherExpenseForm.tsx` および `OtherExpenseView.tsx` の編集・削除連携を新キー（契約ID＋発生日＋行No）に対応

---

## Phase 5: User Story 4 - 旧データの移行と「要確認」表示 (Priority: P1)

**Goal**: 発生日を持たない旧形式データの起動時自動移行（契約開始日仮設定）と「要確認」バッジ表示

- [x] T013 [US4] `LocalStorageOtherExpenseRepository.ts` に旧データ検出・自動移行・冪等性保証ロジックを実装
- [x] T014 [US4] `OtherExpenseView.tsx` に「要確認」バッジを表示し、保存・編集時にフラグを解除する処理を追加

---

## Phase 6: Integration, Polish & Verification

**Purpose**: 既存機能（原価計算・データIO・テスト）との結合確認

- [x] T015 `src/application/services/DataIoService.ts` および初期シードデータを正本の3件（CON001〜CON003、発生日付き）に更新
- [x] T016 `src/application/services/MonthlyCaseDetailCostService.ts` で `exp.occurrenceYearMonth` を直接参照するよう整合確認
- [x] T017 `tests/unit/application/OtherExpenseOccurrenceDate.test.ts` を作成し、US1〜US4の受入シナリオを検証
- [x] T018 全テストスイート（`npm test`）を実行し、既存のテスト破綻がないことを確認
- [x] T019 `npm run build` による単一ファイルバンドル生成と型整合性を検証
