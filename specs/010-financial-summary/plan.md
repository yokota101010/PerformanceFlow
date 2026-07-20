# Implementation Plan: 業績・収支サマリ表示 (financial-summary)

**Branch**: `010-financial-summary` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-financial-summary/spec.md`

## Summary

F10「業績・収支サマリ表示」は、登録されている全案件作業明細（アサイン契約）の収支実績（売上、製造原価、粗利、粗利率）を一括でロードし、全社サマリカードおよびプロジェクト別収支一覧テーブルとして画面表示する機能です。本機能は完全な参照専用（Query）であり、製造原価の内訳（工数加工費、発注額、その他経費）をテーブルのカラムとして常時表示し、赤字案件の強調警告およびプロジェクト名や期間でのメモリ上フィルタリングを実装します。

## Technical Context

**Language/Version**: TypeScript / ES2022

**Primary Dependencies**: React 18, Vite 5, TailwindCSS

**Storage**: LocalStorage (読込のみ, `RepositoryRegistry` 経由)

**Testing**: Vitest (jsdom テスト環境)

**Target Platform**: 主要なWebブラウザ (スタンドアロンSPA / file:// スキーム動作対応)

**Project Type**: Single Page Application (SPA)

**Performance Goals**: データのロード、集計計算、および画面描画が 0.5秒以内に完了すること

**Constraints**: オンライン不要 (オフライン完結)、データの直接変更不可（参照専用）

**Scale/Scope**: 1つの業績・収支サマリビュー（画面）、1つの集計条件フィルタフォーム、および関連するユースケースとテスト

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **単一トランザクション・単一集約の原則 (Gate 1)**: F10は完全な参照専用（Query）機能であり、LocalStorageなどの物理永続ストアへの書き込みを行わないため、複数集約の同時変更違反は一切発生しません。 (✅ Pass)
- **集約間の結果整合性とプル型同期 (Gate 2)**: 売上合計や原価合計、個々のアサイン粗利などはキャッシュ（状態永続化）されず、画面表示時およびフィルター適用時に一次リポジトリからオンデマンドでデータをプルしてメモリ上で再計算します。 (✅ Pass)
- **ドメインロジックのカプセル化 (Gate 3)**: 個々のアサインに対する売上・原価・粗利などの導出項目は、`CaseAssignment` モデルや既存の `CaseAssignmentService` 内のロジックにカプセル化されているものを安全に再利用します。 (✅ Pass)

## Project Structure

### Documentation (this feature)

```text
specs/010-financial-summary/
├── spec.md              # Feature Specification (確定済み)
├── plan.md              # This file (実装計画書)
├── research.md          # 技術調査結果
├── data-model.md        # 画面表示用データプロジェクションモデル定義
└── quickstart.md        # 受入検証シナリオ・実行ガイド
```

### Source Code (repository root)

```text
src/
├── application/
│   ├── usecases/
│   │   └── FinancialSummaryUseCase.ts   # 収支集計ユースケース契約 (新規)
│   └── services/
│       └── FinancialSummaryService.ts   # 収支集計サービス (新規)
└── infrastructure/
    └── ui/
        ├── FinancialSummaryView.tsx     # 業績・収支サマリ画面コンポーネント (新規)
        └── App.tsx                      # 「収支サマリ」ナビゲーションタブの追加 (更新)
```

**Structure Decision**: プロジェクト憲法で定められたクリーンアーキテクチャ3層構造（Domain / Application / Infrastructure）に準拠した配置構造とします。

## Complexity Tracking

*No violations detected. Not required.*
