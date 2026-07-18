# Implementation Plan: F06 案件作業契約（明細）管理

**Branch**: `main` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-case-assignment-management/spec.md`

## Summary
本機能は、案件に紐づく作業アサイン契約（案件作業明細）を管理する画面およびデータアクセス機能を提供する。フロントエンド完結型のアーキテクチャ（ブラウザLocalStorage永続化）を採用し、シードデータの初期ロード（4件）、プロジェクト単位での個別自動採番（WKnnn）、期間の重複・隙間チェック（案件全体の期間を隙間なくカバーするバリデーション）、売上・粗利率の動的自動計算、および発注や工数実績が紐づいている明細の一律物理削除ブロックを実装する。

## Technical Context

**Language/Version**: TypeScript 5.x / ESNext

**Primary Dependencies**: React 18, `vite-plugin-singlefile` (インライン化用)

**Storage**: Browser LocalStorage (キー: `performance_flow_case_assignments`)

**Testing**: Vitest + React Testing Library + jsdom

**Target Platform**: Modern Browser (file:// スキーム起動をサポートするスタンドアローン構成)

**Project Type**: Web SPA (Frontend only)

**Performance Goals**: 画面描画、登録・更新・削除などの操作完了および再描画は1秒以内に完了。

**Constraints**: 
- 完全にローカルで動作する単一HTMLアセットとしてのビルド。
- データ構造とドメイン制約（プロジェクトID+作業契約IDの複合キー、案件ID必須、工数>0、単価>=0、売上・原価・粗利の自動計算、粗利率四捨五入）の厳格なドメイン層カプセル化。

**Scale/Scope**: プロジェクトあたり最大999契約、1画面（案件作業契約管理画面）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **レイヤー構造と依存ルールの遵守**: UI/永続化 (インフラ) → ユースケース/サービス (アプリケーション) → エンティティ/リポジトリインターフェース (ドメイン) の一方向の依存関係を厳守すること。
- [x] **ドメインロジックのカプセル化**: 案件作業明細の属性制約および整合性バリデーション（工数・単価の正数制約、売上や粗利率等の自動計算ロジック）を `CaseAssignment` エンティティクラスの内部（コンストラクタおよびゲッター等）に強制させ、サービスやUIへの流出を防ぐこと。
- [x] **複合キーによる一意性識別**: `projectId` と `id`（作業契約ID）の組み合わせを主キーとし、イミュータブル再構築して保存すること。
- [x] **期間隙間なし・重複禁止バリデーション**: 指定案件の全アサイン明細をロードし、隙間や重複がないかをドメイン/サービス層で厳密に検証すること。
- [x] **直接の new 禁止**: 具象リポジトリ（`LocalStorageCaseAssignmentRepository`, `InMemoryCaseAssignmentRepository`）を直接 `new` してはならず、必ず `RepositoryRegistry` を経由すること。
- [x] **不変性 (Immutability)**: `CaseAssignment` のすべてのプロパティを `readonly` とし、更新時はイミュータブルに再構築してリポジトリに保存すること。
- [x] **バレルファイルの活用**: ドメインおよびアプリケーションの各フォルダに `index.ts` を配置し、再エクスポートすること。
- [x] **粗利率の算出**: `粗利 ÷ 売上` を小数点以下第3位で四捨五入し、小数点以下2桁表示とすること。売上0時は0.00。
- [x] **言語ルール**: ドキュメント、ソースコード内のコメント、警告警告メッセージはすべて「日本語」に統一すること。

## Project Structure

### Documentation (this feature)

```text
specs/006-case-assignment-management/
├── plan.md              # This file
├── research.md          # Technical decisions and rationale
├── data-model.md        # Entities, validation, and lifecycle
├── quickstart.md        # Step-by-step verification scenario guide
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

既存のクリーンアーキテクチャ階層構造（src/domain, src/application, src/infrastructure）を踏襲し、対応する案件作業契約明細モジュールを適切に配置する。

```text
src/
├── domain/
│   ├── models/
│   │   ├── Case.ts
│   │   ├── CaseAssignment.ts    # 案件作業明細エンティティクラス
│   │   ├── types.ts             # 読取専用インターフェース (ICaseAssignment等)
│   │   └── index.ts             # 整理された再エクスポート
│   └── repositories/
│       ├── CaseRepository.ts
│       ├── CaseAssignmentRepository.ts   # 案件作業明細リポジトリ契約
│       ├── OtherExpenseRepository.ts      # 【仮】その他経費参照リポジトリ契約
│       └── index.ts
├── application/
│   ├── usecases/
│   │   ├── CaseUseCase.ts
│   │   ├── CaseAssignmentUseCase.ts      # 案件作業明細ユースケース・コマンド定義
│   │   └── index.ts
│   └── services/
│       ├── CaseService.ts
│       └── CaseAssignmentService.ts      # 案件作業明細アプリケーションサービス
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryCaseRepository.ts
    │   ├── InMemoryCaseAssignmentRepository.ts  # インメモリ明細リポジトリ
    │   ├── LocalStorageCaseRepository.ts
    │   ├── LocalStorageCaseAssignmentRepository.ts  # LocalStorage明細リポジトリ
    │   └── RepositoryRegistry.ts         # 案件作業明細、その他経費リポジトリ追加、シングルトン管理
    └── ui/
        ├── CaseView.tsx
        ├── CaseAssignmentView.tsx        # 案件作業明細一覧ビュー (削除制御・編集統合)
        └── CaseAssignmentForm.tsx        # 案件作業明細追加・編集フォーム
```

**Structure Decision**: 既存の構造に案件作業契約明細管理のファイルを綺麗にマッピングします。

## Complexity Tracking

*違反事項および複雑性の導入はありません。憲法を100%遵守します。*
