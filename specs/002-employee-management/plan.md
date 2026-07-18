# Implementation Plan: F02 社員マスタ管理

**Branch**: `main` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-employee-management/spec.md`

## Summary
本機能は、システム内の社員マスタ情報（名前、時間単価）を管理する画面およびデータアクセス機能を提供する。フロントエンド完結型のアーキテクチャ（ブラウザローカルストレージ永続化）を採用し、シードデータの初期ロード、自動採番（EMPnnn）、同姓同名の許可、単価の遡及再計算、案件工数実績の紐づきチェックを伴う削除制限、およびグラスモルフィズムUIを実装する。

## Technical Context

**Language/Version**: TypeScript 5.x / ESNext

**Primary Dependencies**: React 18, `vite-plugin-singlefile` (インライン化用)

**Storage**: Browser LocalStorage (キー: `performance_flow_employees`)

**Testing**: Vitest + React Testing Library + jsdom

**Target Platform**: Modern Browser (file:// スキーム起動をサポートするスタンドアローン構成)

**Project Type**: Web SPA (Frontend only)

**Performance Goals**: 画面描画、登録・更新・削除などの操作完了および再描画は1秒以内に完了。

**Constraints**: 
- 完全にローカルで動作する単一HTMLアセットとしてのビルド。
- データ構造とドメイン制約（0以上の整数単価、トリミング、最大255文字）の厳格なドメイン層カプセル化。

**Scale/Scope**: 社員数最大999名、1画面（社員マスタ管理画面）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **レイヤー構造と依存ルールの遵守**:UI/永続化 (インフラ) → ユースケース/サービス (アプリケーション) → エンティティ/リポジトリインターフェース (ドメイン) の一方向の依存関係を厳守すること。
- [x] **ドメインロジックのカプセル化**: 社員の属性制約バリデーション（単価の0以上、トリミング後の名前長、EMPnnnの形式等）を `Employee` エンティティクラスの内部（コンストラクタ）に強制させ、サービスやUIへの流出を防ぐこと。
- [x] **単一集約・単一トランザクション**: 1つのユースケース（登録・更新・削除）で変更する集約は `Employee`（社員）単一のみとすること。
- [x] **結果整合性（プル型オンデマンド同期）**: 単価更新時の過去の加工費算出の遡及適用は、書き込み処理時の他集約への伝搬（プッシュ）を避け、表示時や集計時のオンデマンド（プル型）で再計算して一貫性を担保すること。
- [x] **リポジトリの直接 new 禁止**: 具象クラス（`LocalStorageEmployeeRepository`, `InMemoryEmployeeRepository`）を直接 `new` してはならず、リポジトリインスタンスの取得は必ず `RepositoryRegistry` を経由すること。
- [x] **不変性 (Immutability)**: `Employee` のすべてのプロパティを `readonly` とし、更新時はイミュータブルに再構築してリポジトリに保存すること。
- [x] **バレルファイルの活用**: ドメインおよびアプリケーションの各フォルダに `index.ts` を配置し、公開する型とクラスをカプセル化して再エクスポートすること。
- [x] **配信形態**: ビルド成果物は単一の `dist/index.html` にインライン化され、`file://` スキームでのダブルクリック起動を公式にサポートすること。
- [x] **言語ルール**: ドキュメント、ソースコード内のコメント、警告警告メッセージはすべて「日本語」に統一すること。

## Project Structure

### Documentation (this feature)

```text
specs/002-employee-management/
├── plan.md              # This file
├── research.md          # Technical decisions and rationale
├── data-model.md        # Entities, validation, and lifecycle
├── quickstart.md        # Step-by-step verification scenario guide
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

F01で構築したフォルダ構造を拡張し、社員マスタ用のモデル、ユースケース、永続化クラス、UIを追加する。

```text
src/
├── domain/
│   ├── models/
│   │   ├── Project.ts
│   │   ├── Employee.ts          # 社員エンティティクラス
│   │   ├── types.ts             # 読取専用インターフェース (IEmployee等)
│   │   └── index.ts             # 整理された再エクスポート
│   └── repositories/
│       ├── ProjectRepository.ts
│       ├── EmployeeRepository.ts # 社員リポジトリインターフェース
│       └── index.ts
├── application/
│   ├── usecases/
│   │   ├── ProjectUseCase.ts
│   │   ├── EmployeeUseCase.ts   # 社員ユースケース・コマンド定義
│   │   └── index.ts
│   └── services/
│       ├── ProjectService.ts
│       └── EmployeeService.ts   # 社員アプリケーションサービス
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryProjectRepository.ts
    │   ├── InMemoryEmployeeRepository.ts  # インメモリ社員リポジトリ
    │   ├── LocalStorageProjectRepository.ts
    │   ├── LocalStorageEmployeeRepository.ts # LocalStorage社員リポジトリ
    │   └── RepositoryRegistry.ts         # 社員リポジトリ追加、シングルトン管理
    └── ui/
        ├── ProjectView.tsx
        ├── ProjectForm.tsx
        ├── EmployeeView.tsx     # 社員一覧ビュー (削除制御・編集統合)
        └── EmployeeForm.tsx     # 社員追加・編集フォーム
```

**Structure Decision**: 既存のクリーンアーキテクチャ階層構造（src/domain, src/application, src/infrastructure）を踏襲し、対応する社員マスタモジュールを適切に配置する。

## Complexity Tracking

*違反事項および複雑性の導入はありません。憲法を100%遵守します。*
