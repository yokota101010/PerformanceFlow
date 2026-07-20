# Implementation Plan: その他経費入力 (other-expense-management)

**Branch**: `009-other-expense-management` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-other-expense-management/spec.md`

## Summary

F09「その他経費入力」は、作業契約（アサイン明細）ごとに発生するその他経費（旅費交通費、会議費など）を金額と摘要を入力して管理（登録・編集・削除・一覧表示）する機能です。本機能は `LocalStorage` でデータを保持し、入力された経費額はアサイン明細管理（F06）の製造原価集計時にオンデマンド（プル型）で自動的に加算・反映されます。

## Technical Context

**Language/Version**: TypeScript / ES2022

**Primary Dependencies**: React 18, Vite 5, TailwindCSS

**Storage**: LocalStorage (`PF_OtherExpenses` キーでの永続化)

**Testing**: Vitest (jsdom テスト環境)

**Target Platform**: 主要なWebブラウザ (スタンドアロンSPA / file:// スキーム動作対応)

**Project Type**: Single Page Application (SPA)

**Performance Goals**: 経費の変更・集計が 0.5秒以内に完了し、原価計算が即座に同期されること

**Constraints**: オンライン不要 (オフライン完結)、LocalStorage 自動保存、ID採番原則の適用

**Scale/Scope**: 1つのその他経費ビュー（画面）、1つの経費登録・編集モーダルフォーム、および関連するドメイン・リポジトリ・ユースケース

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **単一トランザクション・単一集約の原則 (Gate 1)**: その他経費の登録・更新・削除は、`OtherExpense` 集約内でのみ完結し、他マスタや集約を同一トランザクション内で編集しません。 (✅ Pass)
- **集約間の結果整合性とプル型同期 (Gate 2)**: 経費合計額は、アサイン明細管理側が原価を集計するタイミングでその他経費リポジトリからオンデマンド取得・再計算されます。 (✅ Pass)
- **ドメインロジックのカプセル化 (Gate 3)**: 金額の正数バリデーション（`amount >= 0`）および摘要の文字数バリデーション（1〜100文字）は、すべて `OtherExpense` クラスのコンストラクタで例外スローにより検証を強制します。 (✅ Pass)
- **ID採番原則の適用 (Gate 4)**: `lineNo` の採番は、リポジトリ契約 `OtherExpenseRepository.getNextLineNo` に基づき、永続化層内で安全に解決します。 (✅ Pass)
- **リポジトリの直接のnew禁止 (Gate 5)**: リポジトリインスタンスは具象クラスを直接 `new` せず、`RepositoryRegistry` 経由で取得します。 (✅ Pass)

## Project Structure

### Documentation (this feature)

```text
specs/009-other-expense-management/
├── spec.md              # Feature Specification (確定済み)
├── plan.md              # This file (実装計画書)
├── research.md          # 技術調査結果
├── data-model.md        # データモデル定義
└── quickstart.md        # 受入検証シナリオ・実行ガイド
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── models/
│   │   ├── OtherExpense.ts             # その他経費ドメインエンティティ
│   │   └── types.ts                    # IOtherExpense 等の型定義追加
│   └── repositories/
│       └── OtherExpenseRepository.ts   # リポジトリインターフェース
├── application/
│   ├── usecases/
│   │   └── OtherExpenseUseCase.ts      # ユースケース抽象契約
│   └── services/
│       └── OtherExpenseService.ts      # ユースケース具象サービス
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryOtherExpenseRepository.ts   # テスト用インメモリリポジトリ
    │   ├── LocalStorageOtherExpenseRepository.ts # 本番用 LocalStorage リポジトリ
    │   └── RepositoryRegistry.ts       # リポジトリ登録紐付け（更新）
    └── ui/
        ├── OtherExpenseView.tsx        # その他経費一覧ビュー
        ├── OtherExpenseForm.tsx        # その他経費登録・編集フォーム
        └── CaseAssignmentView.tsx      # 経費入力画面へのリンク・遷移追加（更新）
```

**Structure Decision**: プロジェクト憲法で定められたクリーンアーキテクチャ3層構造（Domain / Application / Infrastructure）に完全に適合する構成とします。

## Complexity Tracking

*No violations detected. Not required.*
