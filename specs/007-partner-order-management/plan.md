# Implementation Plan: 発注（注文）管理

**Branch**: `007-partner-order-management` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-partner-order-management/spec.md`

## Summary

本機能は、パートナー（発注先）への月次発注契約とそれに紐づく要員の注文明細（工数・単価）を管理（CRUD）し、各アサイン期間や要員単価に基づき発注額を自動集計する。
実装アプローチとして、`PartnerOrder` を集約ルートとするドメイン駆動設計（DDD）を適用し、インメモリおよび LocalStorage でデータを永続化する。アサイン側の製造原価計算とプル型で結果整合させ、画面表示時に動的に集計結果が反映される構成とする。

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 18.x, Vite 5.x, Vitest, Testing Library

**Storage**: LocalStorage (`performance_flow_partner_orders` / `performance_flow_partner_order_details`), Memory

**Testing**: Vitest

**Target Platform**: Web Browser (Standalone SPA, `file://` スキームサポート)

**Project Type**: Web UI / Frontend Application (SPA)

**Performance Goals**: 画面再描画およびデータ変更操作（登録・更新・削除）は1秒以内に完了。

**Constraints**: 完全スタンドアロン動作（外部APIやDB等のネットワークアクセスは一切行わない）。

**Scale/Scope**: シードデータ: 6件の発注と12件の注文明細。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **アーキテクチャ標準**: ドメイン層・アプリケーション層・インフラストラクチャ層の3層構造と、外側から内側への一方向の依存関係を遵守する。
- [x] **単一集約・単一トランザクション**: 1つの書き込みユースケースで更新・保存する集約を `PartnerOrder` 単一に限定する。
- [x] **データモデル正本 (SoT) 準拠**: `.specify/memory/domain-model.md` の型および制約（発注工数は0以上1以下の人月、小数点以下1桁）をドメインモデルのコンストラクタで強制検証する。
- [x] **カプセル化と一元管理**: ドメインオブジェクト（明細の追加・削除・合計金額算出等）をエンティティクラス内にカプセル化し、リポジトリ具象クラスを直接 `new` することを禁止（`RepositoryRegistry` 経由での解決を強制）する。
- [x] **不変性の強制**: すべてのプロパティおよび配列（`readonly T[]`）に不変（Immutable）制約を適用する。
- [x] **テストの品質**: 公開インターフェースの振る舞い（Given-When-Then）を検証する。正本のシードデータ（ORD001〜ORD006）をテスト共通の初期フィクスチャとして強制適用する。

## Project Structure

### Documentation (this feature)

```text
specs/007-partner-order-management/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── PartnerOrderRepository.ts
│   └── PartnerOrderUseCase.ts
└── checklists/          # Phase 1 verification checklists
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── models/
│   │   ├── PartnerOrder.ts    # 【新規】発注・注文明細ドメインエンティティ
│   │   └── types.ts           # 読取専用インターフェース definition 追加
│   └── repositories/
│       └── PartnerOrderRepository.ts # 【新規】リポジトリ契約インターフェース
├── application/
│   ├── usecases/
│   │   └── PartnerOrderUseCase.ts    # 【新規】ユースケースコマンド契約
│   └── services/
│       └── PartnerOrderService.ts    # 【新規】CRUDユースケースサービス
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryPartnerOrderRepository.ts    # 【新規】テスト用インメモリ
    │   ├── LocalStoragePartnerOrderRepository.ts # 【新規】本番用LocalStorage
    │   └── RepositoryRegistry.ts                # 切り替え登録と取得メソッド追加
    └── ui/
        ├── PartnerOrderView.tsx      # 【新規】発注一覧・明細詳細表示
        └── PartnerOrderForm.tsx      # 【新規】発注新規・編集フォーム
```

**Structure Decision**: 単一 React/TypeScript SPA プロジェクトの規約に則り、`src/` 配下の DDD 3層（domain, application, infrastructure）にコードを配置し、`tests/` 配下に自動テストを実装する。

## Complexity Tracking

> **憲法違反や設計の複雑化の例外措置は行わないため、該当なし。**
