# Implementation Plan: F03 発注先マスタ管理

**Branch**: `main` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-partner-management/spec.md`

## Summary
本機能は、取引先である発注先情報（企業名など）を管理する画面およびデータアクセス機能を提供する。フロントエンド完結型のアーキテクチャ（ブラウザローカルストレージ永続化）を採用し、シードデータの初期ロード、自動採番（BPnnn）、発注先名の一意性（重複登録禁止）チェック、要員所属および発注実績の双方をチェックする削除制限、およびグラスモルフィズムUIを実装する。

## Technical Context

**Language/Version**: TypeScript 5.x / ESNext

**Primary Dependencies**: React 18, `vite-plugin-singlefile` (インライン化用)

**Storage**: Browser LocalStorage (キー: `performance_flow_partners`)

**Testing**: Vitest + React Testing Library + jsdom

**Target Platform**: Modern Browser (file:// スキーム起動をサポートするスタンドアローン構成)

**Project Type**: Web SPA (Frontend only)

**Performance Goals**: 画面描画、登録・更新・削除などの操作完了および再描画は1秒以内に完了。

**Constraints**: 
- 完全にローカルで動作する単一HTMLアセットとしてのビルド。
- データ構造とドメイン制約（名前の必須・文字長・トリミング）の厳格なドメイン層カプセル化。

**Scale/Scope**: 発注先数最大999、1画面（発注先マスタ管理画面）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **レイヤー構造と依存ルールの遵守**: UI/永続化 (インフラ) → ユースケース/サービス (アプリケーション) → エンティティ/リポジトリインターフェース (ドメイン) の一方向の依存関係を厳守すること。
- [x] **ドメインロジックのカプセル化**: 発注先の属性制約バリデーション（名前の必須トリミング長、BPnnnの形式等）を `Partner` エンティティクラスの内部（コンストラクタ）に強制させ、サービスやUIへの流出を防ぐこと。
- [x] **単一集約・単一トランザクション**: 1つのユースケース（登録・更新・削除）で変更する集約は `Partner`（発注先）単一のみとすること。
- [x] **一意性制約の検証**: 発注先名の一意性（UQ1）は、アプリケーションサービス層においてリポジトリを検索することで検証し、ドメインの整合性を担保すること。
- [x] **削除制限の参照検証**: 発注先を削除する際、他集約（要員、発注）から参照されているかどうかの検証を、アプリケーションサービス層において仮定義されたリポジトリ経由で安全に実行すること。
- [x] **リポジトリの直接 new 禁止**: 具象クラス（`LocalStoragePartnerRepository`, `InMemoryPartnerRepository`）を直接 `new` してはならず、リポジトリインスタンスの取得は必ず `RepositoryRegistry` を経由すること。
- [x] **不変性 (Immutability)**: `Partner` のすべてのプロパティを `readonly` とし、更新時はイミュータブルに再構築してリポジトリに保存すること。
- [x] **バレルファイルの活用**: ドメインおよびアプリケーションの各フォルダに `index.ts` を配置し、公開する型とクラスをカプセル化して再エクスポートすること。
- [x] **配信形態**: ビルド成果物は単一の `dist/index.html` にインライン化され、`file://` スキームでのダブルクリック起動を公式にサポートすること。
- [x] **言語ルール**: ドキュメント、ソースコード内のコメント、警告警告メッセージはすべて「日本語」に統一すること。

## Project Structure

### Documentation (this feature)

```text
specs/003-partner-management/
├── plan.md              # This file
├── research.md          # Technical decisions and rationale
├── data-model.md        # Entities, validation, and lifecycle
├── quickstart.md        # Step-by-step verification scenario guide
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

F01/F02で構築したフォルダ構造を拡張し、発注先マスタ用のモデル、ユースケース、永続化クラス、UIを追加する。

```text
src/
├── domain/
│   ├── models/
│   │   ├── Project.ts
│   │   ├── Employee.ts
│   │   ├── Partner.ts           # 発注先エンティティクラス
│   │   ├── types.ts             # 読取専用インターフェース (IPartner等)
│   │   └── index.ts             # 整理された再エクスポート
│   └── repositories/
│       ├── ProjectRepository.ts
│       ├── EmployeeRepository.ts
│       ├── PartnerRepository.ts  # 発注先リポジトリインターフェース
│       ├── EmployeeWorkTimeRepository.ts
│       ├── EmployeeWorkTimeRepository.ts
│       ├── PartnerStaffRepository.ts # 【仮】要員所属存在チェック契約
│       ├── PartnerOrderRepository.ts # 【仮】発注データ存在チェック契約
│       └── index.ts
├── application/
│   ├── usecases/
│   │   ├── ProjectUseCase.ts
│   │   ├── EmployeeUseCase.ts
│   │   ├── PartnerUseCase.ts    # 発注先ユースケース・コマンド定義
│   │   └── index.ts
│   └── services/
│       ├── ProjectService.ts
│       ├── EmployeeService.ts
│       └── PartnerService.ts    # 発注先アプリケーションサービス
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryProjectRepository.ts
    │   ├── InMemoryEmployeeRepository.ts
    │   ├── InMemoryPartnerRepository.ts  # インメモリ発注先リポジトリ
    │   ├── InMemoryPartnerStaffRepository.ts # 【仮】要員所属チェックダミー実装
    │   ├── InMemoryPartnerOrderRepository.ts # 【仮】発注実績チェックダミー実装
    │   ├── LocalStorageProjectRepository.ts
    │   ├── LocalStorageEmployeeRepository.ts
    │   ├── LocalStoragePartnerRepository.ts  # LocalStorage発注先リポジトリ
    │   └── RepositoryRegistry.ts         # 発注先リポジトリ追加、シングルトン管理
    └── ui/
        ├── ProjectView.tsx
        ├── ProjectForm.tsx
        ├── EmployeeView.tsx
        ├── EmployeeForm.tsx
        ├── PartnerView.tsx      # 発注先一覧ビュー (削除制御・編集統合)
        └── PartnerForm.tsx      # 発注先追加・編集フォーム
```

**Structure Decision**: 既存のクリーンアーキテクチャ階層構造（src/domain, src/application, src/infrastructure）を踏襲し、対応する発注先マスタモジュールを適切に配置する。

## Complexity Tracking

*違反事項および複雑性の導入はありません。憲法を100%遵守します。*
