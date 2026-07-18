# Implementation Plan: F04 要員マスタ管理

**Branch**: `main` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-staff-management/spec.md`

## Summary
本機能は、外部の取引先企業に所属する要員情報（氏名、所属会社、単価など）を管理する画面およびデータアクセス機能を提供する。フロントエンド完結型のアーキテクチャ（ブラウザローカルストレージ永続化）を採用し、シードデータの初期ロード（4名）、自動採番（MEMnnn）、同姓同名の重複許可、所属会社IDのFK整合性バリデーション、注文実績および工数サマリの双方をチェックする削除制限、およびグラスモルフィズムUIを実装する。

## Technical Context

**Language/Version**: TypeScript 5.x / ESNext

**Primary Dependencies**: React 18, `vite-plugin-singlefile` (インライン化用)

**Storage**: Browser LocalStorage (キー: `performance_flow_staffs`)

**Testing**: Vitest + React Testing Library + jsdom

**Target Platform**: Modern Browser (file:// スキーム起動をサポートするスタンドアローン構成)

**Project Type**: Web SPA (Frontend only)

**Performance Goals**: 画面描画、登録・更新・削除などの操作完了および再描画は1秒以内に完了。

**Constraints**: 
- 完全にローカルで動作する単一HTMLアセットとしてのビルド。
- データ構造とドメイン制約（名前の必須・文字長・トリミング、単価の0以上）の厳格なドメイン層カプセル化。

**Scale/Scope**: 要員数最大999、1画面（要員マスタ管理画面）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **レイヤー構造と依存ルールの遵守**: UI/永続化 (インフラ) → ユースケース/サービス (アプリケーション) → エンティティ/リポジトリインターフェース (ドメイン) の一方向の依存関係を厳守すること。
- [x] **ドメインロジックのカプセル化**: 要員の属性制約バリデーション（名前の必須トリミング長、単価の0以上、MEMnnnの形式等）を `Staff` エンティティクラスの内部（コンストラクタ）に強制させ、サービスやUIへの流出を防ぐこと。
- [x] **単一集約・単一トランザクション**: 1つのユースケース（登録・更新・削除）で変更する集約は `Staff`（要員）単一のみとすること。
- [x] **一意性制約の挙動**: 同姓同名の重複は許可する（FR-006）が、所属会社IDのFK検証（存在する発注先であること）はアプリケーション層で厳密に検証すること。
- [x] **削除制限の参照検証**: 要員を削除する際、他集約（注文明細、要員サマリ）から参照されているかどうかの検証を、アプリケーションサービス層において仮定義されたリポジトリ経由で安全に実行すること。
- [x] **リポジトリの直接 new 禁止**: 具象クラス（`LocalStorageStaffRepository`, `InMemoryStaffRepository`）を直接 `new` してはならず、リポジトリインスタンスの取得は必ず `RepositoryRegistry` を経由すること。
- [x] **不変性 (Immutability)**: `Staff` のすべてのプロパティを `readonly` とし、更新時はイミュータブルに再構築してリポジトリに保存すること。
- [x] **バレルファイルの活用**: ドメインおよびアプリケーションの各フォルダに `index.ts` を配置し、公開する型とクラスをカプセル化して再エクスポートすること。
- [x] **配信形態**: ビルド成果物は単一の `dist/index.html` にインライン化され、`file://` スキームでのダブルクリック起動を公式にサポートすること。
- [x] **言語ルール**: ドキュメント、ソースコード内のコメント、警告警告メッセージはすべて「日本語」に統一すること。

## Project Structure

### Documentation (this feature)

```text
specs/004-staff-management/
├── plan.md              # This file
├── research.md          # Technical decisions and rationale
├── data-model.md        # Entities, validation, and lifecycle
├── quickstart.md        # Step-by-step verification scenario guide
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

既存のクリーンアーキテクチャ階層構造（src/domain, src/application, src/infrastructure）を踏襲し、対応する要員マスタモジュールを適切に配置する。

```text
src/
├── domain/
│   ├── models/
│   │   ├── Project.ts
│   │   ├── Employee.ts
│   │   ├── Partner.ts
│   │   ├── Staff.ts             # 要員エンティティクラス
│   │   ├── types.ts             # 読取専用インターフェース (IStaff等)
│   │   └── index.ts             # 整理された再エクスポート
│   └── repositories/
│       ├── ProjectRepository.ts
│       ├── EmployeeRepository.ts
│       ├── PartnerRepository.ts
│       ├── StaffRepository.ts   # 要員リポジトリインターフェース
│       ├── StaffOrderDetailRepository.ts    # 【仮】注文明細存在チェック契約
│       ├── StaffMonthlySummaryRepository.ts # 【仮】要員工数サマリ存在チェック契約
│       └── index.ts
├── application/
│   ├── usecases/
│   │   ├── ProjectUseCase.ts
│   │   ├── EmployeeUseCase.ts
│   │   ├── PartnerUseCase.ts
│   │   ├── StaffUseCase.ts      # 要員ユースケース・コマンド定義
│   │   └── index.ts
│   └── services/
│       ├── ProjectService.ts
│       ├── EmployeeService.ts
│       ├── PartnerService.ts
│       └── StaffService.ts      # 要員アプリケーションサービス
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryProjectRepository.ts
    │   ├── InMemoryEmployeeRepository.ts
    │   ├── InMemoryPartnerRepository.ts
    │   ├── InMemoryStaffRepository.ts    # インメモリ要員リポジトリ
    │   ├── InMemoryStaffOrderDetailRepository.ts    # 【仮】注文明細ダミー実装
    │   ├── InMemoryStaffMonthlySummaryRepository.ts # 【仮】工数サマリダミー実装
    │   ├── LocalStorageProjectRepository.ts
    │   ├── LocalStorageEmployeeRepository.ts
    │   ├── LocalStoragePartnerRepository.ts
    │   ├── LocalStorageStaffRepository.ts    # LocalStorage要員リポジトリ
    │   └── RepositoryRegistry.ts         # 要員リポジトリ追加、シングルトン管理
    └── ui/
        ├── ProjectView.tsx
        ├── ProjectForm.tsx
        ├── EmployeeView.tsx
        ├── EmployeeForm.tsx
        ├── PartnerView.tsx
        ├── PartnerForm.tsx
        ├── StaffView.tsx        # 要員一覧ビュー (削除制御・編集統合)
        └── StaffForm.tsx        # 要員追加・編集フォーム
```

**Structure Decision**: 既存の構造に要員マスタのファイルを綺麗にマッピングします。

## Complexity Tracking

*違反事項および複雑性の導入はありません。憲法を100%遵守します。*
