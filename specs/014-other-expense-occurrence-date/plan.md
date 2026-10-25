# Implementation Plan: その他経費の発生日対応（正本整合） (other-expense-occurrence-date)

**Branch**: `014-other-expense-occurrence-date` | **Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/014-other-expense-occurrence-date/spec.md`

## Summary

正本 `domain-model.md`（集約#10 `その他経費`）に準拠し、主キーを「契約ID（`caseAssignmentId`）＋ 発生日（`occurrenceDate`）＋ 行No（`lineNo`）」に更新し、導出項目「発生年月（`occurrenceYearMonth`）」をカプセル化します。行No は「同じ契約・同じ発生日」の中で自動採番（1始まり）し、発生日を持たない旧保存データの自動移行（契約開始日を仮設定・「要確認」フラグ付与）および UI 画面（F10）の改修を行います。

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 18+, Vite, Lucide-react

**Storage**: Browser LocalStorage (`performance_flow_other_expenses`)

**Testing**: Vitest / React Testing Library

**Target Platform**: Standalone Web App (Browser / SPA, `file://` スキーム起動サポート)

**Project Type**: Web Application (Single SPA)

**Performance Goals**: 経費登録・編集・削除処理 < 100ms

**Constraints**: 単一トランザクション・単一集約原則の遵守、旧データ自動移行（冪等性保証）

**Scale/Scope**: 1集約（`その他経費`）、1画面（F10 その他経費入力）、関連クエリ（F15 月別案件明細原価）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **1. ドメイン層・アプリケーション層・インフラ層の3層依存ルール**: PASS（ドメインクラス、ユースケース・サービス、リポジトリ/UIの3層分離を維持）
- **2. 単一トランザクション・単一集約の原則**: PASS（Command は `その他経費` 集約のみを変更・永続化）
- **3. 結果整合性の許容とプル型同期（オンデマンド再計算）**: PASS（F15 などのサマリは発生年月からオンデマンド集計）
- **4. ブラウザ完結型（スタンドアロンSPA）**: PASS（LocalStorage 内での移行と自動永続化）
- **5. エンティティのクラス化と強制的制約検証**: PASS（`OtherExpense` クラス内で実在日付・行No正数・発生年月導出・金額・摘要のバリデーションを強制）

*Gate Result*: ALL PASSED

## Architecture & Design Decisions

### 1. 主キーと採番ルール
* **複合主キー**: `(caseAssignmentId, occurrenceDate, lineNo)`
* **行No 採番範囲**: 同じ `caseAssignmentId` かつ同じ `occurrenceDate` の中で連番（`max(lineNo) + 1`、初期値 1）。日付が変わると 1 に戻る。
* **削除時の欠番**: 詰め直しは行わない。
* **編集時の発生日変更**: 発生日が変更された場合、旧日付の行を削除し、新日付での最大行No + 1 で再採番する。

### 2. 導出項目と要確認フラグ
* **`occurrenceYearMonth`**: `occurrenceDate` の YYYY-MM から `YYYY-MM-01` 形式で自動導出。外部からの直接変更不可。
* **`needsReview`**: 旧形式データ（発生日なし）からの移行時に `true` を設定。ユーザーが編集・保存した時点で `false`（または未定義）に更新。

### 3. 旧データ移行（マイグレーション）
* LocalStorage ロード時、`occurrenceDate` を持たないレコードを検出した場合：
  1. `CaseAssignment` リポジトリから該当契約の `startDate`（YYYY-MM-DD）を取得。
  2. 取得した `startDate` を仮の `occurrenceDate` とし、同契約・同日の行No を採番して `needsReview = true` で保存。
  3. 案件明細が見つからない孤立データは移行せず、スキップ通知を保持。

## Project Structure

### Documentation

```text
specs/014-other-expense-occurrence-date/
├── spec.md              # Feature specification
├── plan.md              # This file
├── checklists/          # Checklists
│   └── requirements.md
└── tasks.md             # Implementation tasks
```

### Source Code

```text
src/
├── domain/
│   ├── models/
│   │   ├── types.ts                                # OtherExpense interface update
│   │   └── OtherExpense.ts                         # OtherExpense class update (PK & validations)
│   └── repositories/
│       └── OtherExpenseRepository.ts               # Interface update (findByKeys, delete, etc.)
├── application/
│   ├── usecases/
│   │   └── OtherExpenseUseCase.ts                  # UseCase interface update
│   └── services/
│       └── OtherExpenseService.ts                  # Service implementation with auto-lineNo logic
├── infrastructure/
│   ├── persistence/
│   │   ├── LocalStorageOtherExpenseRepository.ts   # LocalStorage implementation & migration
│   │   └── InMemoryOtherExpenseRepository.ts       # Test InMemory implementation
│   └── ui/
│       ├── OtherExpenseForm.tsx                    # Form with occurrenceDate input & validations
│       └── OtherExpenseView.tsx                    # List view with occurrenceDate & needsReview badge
tests/
└── unit/application/OtherExpenseOccurrenceDate.test.ts # Unit & integration tests
```

## Complexity Tracking

> Violationなしのため項目記入不要
