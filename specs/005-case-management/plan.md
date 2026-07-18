# Implementation Plan: F05 案件管理

**Branch**: `main` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-case-management/spec.md`

## Summary
本機能は、プロジェクトに紐づく作業の単位（案件情報）を管理する画面およびデータアクセス機能を提供する。フロントエンド完結型のアーキテクチャ（ブラウザローカルストレージ永続化）を採用し、シードデータの初期ロード（2件）、プロジェクト単位での個別自動採番（AJnnn）、同一プロジェクト内での案件名重複登録・更新禁止（FR-008）、開始日・終了日の順序整合性検証、および案件作業明細（アサイン契約）が紐づいている案件の一律物理削除ブロックを実装する。

## Technical Context

**Language/Version**: TypeScript 5.x / ESNext

**Primary Dependencies**: React 18, `vite-plugin-singlefile` (インライン化用)

**Storage**: Browser LocalStorage (キー: `performance_flow_cases`)

**Testing**: Vitest + React Testing Library + jsdom

**Target Platform**: Modern Browser (file:// スキーム起動をサポートするスタンドアローン構成)

**Project Type**: Web SPA (Frontend only)

**Performance Goals**: 画面描画、登録・更新・削除などの操作完了および再描画は1秒以内に完了。

**Constraints**: 
- 完全にローカルで動作する単一HTMLアセットとしてのビルド。
- データ構造とドメイン制約（プロジェクトID+案件IDの複合キー、開始日 <= 終了日、同一プロジェクト内一意、名前の必須トリミング長）の厳格なドメイン層カプセル化。

**Scale/Scope**: プロジェクトあたり最大999案件、1画面（案件管理画面）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **レイヤー構造と依存ルールの遵守**: UI/永続化 (インフラ) → ユースケース/サービス (アプリケーション) → エンティティ/リポジトリインターフェース (ドメイン) の一方向の依存関係を厳守すること。
- [x] **ドメインロジックのカプセル化**: 案件の属性制約および整合性バリデーション（プロジェクトID必須、開始日終了日順序、案件名の必須トリミング長、AJnnn ID形式等）を `Case` エンティティクラスの内部（コンストラクタ）に強制させ、サービスやUIへの流出を防ぐこと。
- [x] **複合キーによる一意性識別**: `projectId` と `id`（案件ID）の組み合わせを主キーとし、イミュータブル再構築してリポジトリに保存すること。
- [x] **単一集約・単一トランザクション**: 1つのユースケース（登録・更新・削除）で変更する集約は `Case`（案件）単一のみとすること。
- [x] **一意性制約の挙動**: 同一プロジェクト内での案件名重複登録はアプリケーション層で厳密に検証し拒否すること。異なるプロジェクト間では同名案件の共存を許可すること。
- [x] **削除制限の参照検証**: 案件を削除する際、他集約（案件作業明細）から参照されているかどうかの検証を、アプリケーションサービス層において仮定義されたリポジトリ経由で安全に実行すること。
- [x] **リポジトリの直接 new 禁止**: 具象クラス（`LocalStorageCaseRepository`, `InMemoryCaseRepository`）を直接 `new` してはならず、リポジトリインスタンスの取得は必ず `RepositoryRegistry` を経由すること。
- [x] **不変性 (Immutability)**: `Case` のすべてのプロパティを `readonly` とし、更新時はイミュータブルに再構築してリポジトリに保存すること。
- [x] **バレルファイルの活用**: ドメインおよびアプリケーションの各フォルダに `index.ts` を配置し、公開する型とクラスをカプセル化して再エクスポートすること。
- [x] **配信形態**: ビルド成果物は単一の `dist/index.html` にインライン化され、`file://` スキームでのダブルクリック起動を公式にサポートすること。
- [x] **言語ルール**: ドキュメント、ソースコード内のコメント、警告警告メッセージはすべて「日本語」に統一すること。

## Project Structure

### Documentation (this feature)

```text
specs/005-case-management/
├── plan.md              # This file
├── research.md          # Technical decisions and rationale
├── data-model.md        # Entities, validation, and lifecycle
├── quickstart.md        # Step-by-step verification scenario guide
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

既存のクリーンアーキテクチャ階層構造（src/domain, src/application, src/infrastructure）を踏襲し、対応する案件マスタモジュールを適切に配置する。

```text
src/
├── domain/
│   ├── models/
│   │   ├── Project.ts
│   │   ├── Employee.ts
│   │   ├── Partner.ts
│   │   ├── Staff.ts
│   │   ├── Case.ts              # 案件エンティティクラス
│   │   ├── types.ts             # 読取専用インターフェース (ICase等)
│   │   └── index.ts             # 整理された再エクスポート
│   └── repositories/
│       ├── ProjectRepository.ts
│       ├── EmployeeRepository.ts
│       ├── PartnerRepository.ts
│       ├── StaffRepository.ts
│       ├── CaseRepository.ts    # 案件リポジトリインターフェース
│       ├── CaseAssignmentRepository.ts   # 【仮】アサイン(案件作業明細)参照チェック契約
│       └── index.ts
├── application/
│   ├── usecases/
│   │   ├── ProjectUseCase.ts
│   │   ├── EmployeeUseCase.ts
│   │   ├── PartnerUseCase.ts
│   │   ├── StaffUseCase.ts
│   │   ├── CaseUseCase.ts       # 案件ユースケース・コマンド定義
│   │   └── index.ts
│   └── services/
│       ├── ProjectService.ts
│       ├── EmployeeService.ts
│       ├── PartnerService.ts
│       ├── StaffService.ts
│       └── CaseService.ts       # 案件アプリケーションサービス
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryProjectRepository.ts
    │   ├── InMemoryEmployeeRepository.ts
    │   ├── InMemoryPartnerRepository.ts
    │   ├── InMemoryStaffRepository.ts
    │   ├── InMemoryCaseRepository.ts     # インメモリ案件リポジトリ
    │   ├── InMemoryCaseAssignmentRepository.ts  # 【仮】アサインダミー実装
    │   ├── LocalStorageProjectRepository.ts
    │   ├── LocalStorageEmployeeRepository.ts
    │   ├── LocalStoragePartnerRepository.ts
    │   ├── LocalStorageStaffRepository.ts
    │   ├── LocalStorageCaseRepository.ts     # LocalStorage案件リポジトリ
    │   └── RepositoryRegistry.ts         # 案件リポジトリ追加、シングルトン管理
    └── ui/
        ├── ProjectView.tsx
        ├── EmployeeView.tsx
        ├── PartnerView.tsx
        ├── StaffView.tsx
        ├── CaseView.tsx         # 案件一覧ビュー (削除制御・編集統合)
        └── CaseForm.tsx         # 案件追加・編集フォーム
```

**Structure Decision**: 既存の構造に案件管理のファイルを綺麗にマッピングします。

## Complexity Tracking

*違反事項および複雑性の導入はありません。憲法を100%遵守します。*
