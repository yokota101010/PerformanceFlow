# Implementation Plan: 案件明細 原価・業績サマリ表示 (case-cost-performance-summary)

**Branch**: `013-case-cost-performance-summary` | **Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/013-case-cost-performance-summary/spec.md`

## Summary

`domain-model.md`（集約#14 `月別案件明細原価`、#15 `四半期別案件明細業績`）および `crud-matrix.md`（機能 F15・F16）に準拠したオンデマンド集計クエリ機能および参照画面を実装します。一次データ（案件明細、発注、月別案件社員工数、社員単価、その他経費）からプル型動的集計を行い、単一トランザクション・単一集約原則を損なわずに結果整合性を確立します。

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 18+, Vite, Lucide-react

**Storage**: Browser LocalStorage（一次データ参照）

**Testing**: Vitest / React Testing Library

**Target Platform**: Standalone Web App（Browser / SPA、`file://` スキーム起動サポート）

**Project Type**: Web Application (Single SPA)

**Performance Goals**: サマリ算出および画面描画 < 1秒

**Constraints**: クエリ専用（一次データ変更なし）、プル型結果整合性、ブラウザ完結型

**Scale/Scope**: 2集約（`月別案件明細原価`, `四半期別案件明細業績`）、2画面（F15, F16）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **1. ドメイン層・アプリケーション層・インフラ層の3層依存ルール**: PASS（ドメインモデル、ユースケース・サービス、UI/リポジトリの分離遵守）
- **2. 単一トランザクション・単一集約の原則**: PASS（Query 専用機能であり、一次集約へのマルチ書き込みは行わない）
- **3. 結果整合性の許容とプル型同期（オンデマンド再計算）**: PASS（画面起動・フィルタ変更時に一次データから動的集計）
- **4. ブラウザ完結型（スタンドアロンSPA）**: PASS（LocalStorage から同期読み込み・ブラウザ内計算）
- **5. エンティティのクラス化と強制的制約検証**: PASS（`MonthlyCaseDetailCost`、`QuarterlyCaseDetailPerformance` のドメインクラス内で導出項目・正負制約をカプセル化）

*Gate Result*: ALL PASSED

## Project Structure

### Documentation (this feature)

```text
specs/013-case-cost-performance-summary/
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
│   └── models/
│       ├── types.ts                                # Model interfaces
│       ├── MonthlyCaseDetailCost.ts                # Monthly cost aggregate
│       └── QuarterlyCaseDetailPerformance.ts       # Quarterly performance aggregate
├── application/
│   ├── usecases/
│   │   ├── MonthlyCaseDetailCostUseCase.ts         # Query contract (F15)
│   │   └── QuarterlyCaseDetailPerformanceUseCase.ts# Query contract (F16)
│   └── services/
│       ├── MonthlyCaseDetailCostService.ts         # Query implementation (F15)
│       └── QuarterlyCaseDetailPerformanceService.ts# Query implementation (F16)
├── infrastructure/
│   └── ui/
│       ├── MonthlyCaseDetailCostView.tsx           # F15 React View
│       └── QuarterlyCaseDetailPerformanceView.tsx  # F16 React View
└── App.tsx                                         # Navigation & Routing integration

tests/
└── CaseDetailCostAndPerformance.test.ts            # Domain & Query unit tests
```

## Complexity Tracking

> Violationなしのため項目記入不要
