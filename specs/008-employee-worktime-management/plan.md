# Implementation Plan: 社員工数実績入力 (employee-worktime-management)

**Branch**: `008-employee-worktime-management` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-employee-worktime-management/spec.md`

## Summary

本機能は、自社社員がどの案件アサイン（作業契約）に対して、対象の年月に、どれだけの稼働時間（工数）を実績として費やしたかの管理（CRUD）を行い、社員の時間単価から「加工費」を動的に自動算出する。
実装アプローチとして、`EmployeeWorkTime`（月別案件社員工数）を集約ルートとするドメイン駆動設計（DDD）を適用し、インメモリおよび LocalStorage でデータを永続化する。
案件作業アサイン (F06) 側の製造原価計算にオンデマンドでプル同期（結果整合）する。同一社員・同一月で稼働合計時間が200時間を超過した場合は、エラーブロックではなくUI上の警告（アラート）メッセージとして提示する。

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 18.x, Vite 5.x, Vitest, Testing Library

**Storage**: LocalStorage (`performance_flow_employee_work_times`), Memory

**Testing**: Vitest

**Target Platform**: Web Browser (Standalone SPA, `file://` スキームサポート)

**Project Type**: Web UI / Frontend Application (SPA)

**Performance Goals**: 画面再描画およびデータ変更操作（登録・更新・削除）は1秒以内に完了。

**Constraints**: 完全スタンドアロン動作（外部APIやDB等のネットワークアクセスは一切行わない）。

**Scale/Scope**: シードデータ: 6件の工数実績レコード。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **アーキテクチャ標準**: ドメイン層・アプリケーション層・インフラストラクチャ層の3層構造と、外側から内側への一方向の依存関係を遵守する。
- [x] **単一集約・単一トランザクション**: 1つの書き込みユースケースで更新・保存する集約を `EmployeeWorkTime` 単一に限定する。
- [x] **データモデル正本 (SoT) 準拠**: `.specify/memory/domain-model.md` の型および制約（作業時間は0以上200以下の値、年月はYYYY-MM-01形式）をドメインモデルのコンストラクタで強制検証する。
- [x] **カプセル化と一元管理**: 加工費（社員単価×作業時間）をエンティティクラス内にカプセル化し、リポジトリ具象クラスを直接 `new` することを禁止（`RepositoryRegistry` 経由での解決を強制）する。
- [x] **不変性の強制**: すべてのプロパティおよび配列（`readonly T[]`）に不変（Immutable）制約を適用する。
- [x] **テストの品質**: 公開インターフェースの振る舞い（Given-When-Then）を検証する。正本のシードデータをテスト共通の初期フィクスチャとして強制適用する。

## Project Structure

### Documentation (this feature)

```text
specs/008-employee-worktime-management/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── EmployeeWorkTimeRepository.ts
│   └── EmployeeWorkTimeUseCase.ts
└── checklists/          # Phase 1 verification checklists
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── models/
│   │   ├── EmployeeWorkTime.ts    # 【新規】月別案件社員工数ドメインエンティティ
│   │   └── types.ts               # 読取専用インターフェース definition 追加
│   └── repositories/
│       └── EmployeeWorkTimeRepository.ts # 【新規】リポジトリ契約インターフェース
├── application/
│   ├── usecases/
│   │   └── EmployeeWorkTimeUseCase.ts    # 【新規】ユースケースコマンド契約
│   └── services/
│       └── EmployeeWorkTimeService.ts    # 【新規】CRUDユースケースサービス
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryEmployeeWorkTimeRepository.ts    # 【新規】テスト用インメモリ
    │   ├── LocalStorageEmployeeWorkTimeRepository.ts # 【新規】本番用LocalStorage
    │   └── RepositoryRegistry.ts                    # 切り替え登録と取得メソッド追加
    └── ui/
        ├── EmployeeWorkTimeView.tsx      # 【新規】実績一覧・月次合計サマリー
        └── EmployeeWorkTimeForm.tsx      # 【新規】工数実績新規・編集フォーム
```

**Structure Decision**: 単一 React/TypeScript SPA プロジェクトの規約に則り、`src/` 配下の DDD 3層（domain, application, infrastructure）にコードを配置し、`tests/` 配下に自動テストを実装する。

## Complexity Tracking

> **憲法違反や設計の複雑化の例外措置は行わないため、該当なし。**
