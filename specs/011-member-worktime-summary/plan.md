# Implementation Plan: 要員別工数サマリ表示 (member-worktime-summary)

**Branch**: `011-member-worktime-summary` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-member-worktime-summary/spec.md`

## Summary

F11「要員別工数サマリ表示」は、SoT（真実の源泉）である注文明細データから各要員・年月ごとの合計発注工数をオンデマンドで自動計算し、物理永続化モデルである `月別要員工数サマリ` テーブルへ自動書き戻し（ライトバック）同期を行い、要員の稼働空き状況やオーバーアサイン状況（セル内文字赤太字＋⚠警告マーク表示）を年月マトリクスグリッドで画面表示する機能です。

## Technical Context

**Language/Version**: TypeScript / ES2022

**Primary Dependencies**: React 18, Vite 5, TailwindCSS

**Storage**: LocalStorage (キー: `PF_MonthlyMemberWorkHoursSummaries`, `RepositoryRegistry` 経由)

**Testing**: Vitest (jsdom テスト環境)

**Target Platform**: 主要なWebブラウザ (スタンドアロンSPA / file:// スキーム動作対応)

**Project Type**: Single Page Application (SPA)

**Performance Goals**: ロード時の自動ライトバック同期、およびマトリクス画面の描画が 0.5秒以内に完了すること

**Constraints**: オンライン不要 (オフライン完結)

**Scale/Scope**: 1つの要員別工数サマリアプリケーションビュー、1つの自動同期サービス、および関連するドメイン・リポジトリ・テストコード

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **単一トランザクション・単一集約の原則 (Gate 1)**: F11のライトバック処理は、注文明細から集計した値を `MonthlyMemberWorkHoursSummary` 集約インスタンス群として一括保存（saveAll）するため、単一集約（サマリ集約）の変更スコープ内で完結し、複数集約の同時変更違反は発生しません。 (✅ Pass)
- **集約間の結果整合性とプル型同期 (Gate 2)**: 発注（注文明細）の登録時にはサマリ側を即時更新せず、要員工数サマリ画面のロード時に自動でプル集計および `月別要員工数サマリ` テーブルへの書き戻し（ライトバック）を行うため、結果整合性のプル型同期方針に適合します。 (✅ Pass)
- **ドメインロジックのカプセル化 (Gate 3)**: 合計工数が0以上であることのバリデーション制約は、ドメインモデル `MonthlyMemberWorkHoursSummary.ts` のコンストラクタ内で検証し、カプセル化します。 (✅ Pass)

## Project Structure

### Documentation (this feature)

```text
specs/011-member-worktime-summary/
├── spec.md              # Feature Specification (確定済み)
├── plan.md              # This file (実装計画書)
├── research.md          # 技術調査結果
├── data-model.md        # ドメインエンティティおよびリポジトリインターフェース定義
└── quickstart.md        # 受入検証シナリオ・実行ガイド
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── models/
│   │   └── MonthlyMemberWorkHoursSummary.ts   # 新規ドメインエンティティ (新規)
│   └── repositories/
│       └── MonthlyMemberWorkHoursSummaryRepository.ts # リポジトリインターフェース (新規)
├── application/
│   ├── usecases/
│   │   └── MonthlyMemberWorkHoursSummaryUseCase.ts   # ユースケース定義 (新規)
│   └── services/
│       └── MonthlyMemberWorkHoursSummaryService.ts   # ライトバック集計サービス (新規)
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryMonthlyMemberWorkHoursSummaryRepository.ts   # テスト用リポジトリ (新規)
    │   ├── LocalStorageMonthlyMemberWorkHoursSummaryRepository.ts # 本番用リポジトリ (新規)
    │   └── RepositoryRegistry.ts                                 # レジストリへの追加 (更新)
    └── ui/
        ├── MonthlyMemberWorkHoursSummaryView.tsx                 # 工数マトリクス画面 (新規)
        └── App.tsx                                               # ナビゲーションタブ追加 (更新)
```

**Structure Decision**: プロジェクト憲法で定められたクリーンアーキテクチャ3層構造（Domain / Application / Infrastructure）に準拠した配置構造とします。

## Complexity Tracking

*No violations detected. Not required.*
