# Implementation Plan: F01 プロジェクトマスタ管理

**Branch**: `main` (ブランチ作成なし) | **Date**: 2026-07-18 | **Spec**: [spec.md](file:///mnt/c/ai-code/GitHub-Spec-Kit-first-step/PerformanceFlow/specs/001-project-master-management/spec.md)

**Input**: Feature specification from `/specs/001-project-master-management/spec.md`

## Summary

本計画は、プロジェクトデータの登録・参照・更新・削除（CRUD）を行う「F01 プロジェクトマスタ管理」機能の実装計画である。
ブラウザ完結型のSPA環境において、クリーンアーキテクチャ（ドメイン、アプリケーション、インフラの3層構造）を採用し、データの一意性制約（重複禁止）および他リソースからの参照整合性を維持しつつ、LocalStorageによるデータ永続化を実現する。

## Technical Context

**Language/Version**: TypeScript

**Primary Dependencies**: React (フロントエンドUI), TypeScript

**Storage**: LocalStorage (本番用) / In-memory (テスト・初期用)

**Testing**: Vitest + React Testing Library (予定)

**Target Platform**: Web Browser

**Project Type**: web-app (Single Page Application)

**Performance Goals**: N/A (ブラウザローカル動作のため)

**Constraints**: Offline-capable (LocalStorage動作), 憲法に定めるCommand系（変更系）インターフェースの制約（プロジェクト単一集約に閉じる）、直接の `new` 禁止（`RepositoryRegistry` 経由での取得）

**Scale/Scope**: 1 画面 (プロジェクトマスタ管理), 1 ドメイン集約 (プロジェクト)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **出力言語の統一**: 設計文書およびソースコードのコメントは日本語で統一されているか？
- [x] **Command系インターフェースの制約**: 登録・変更画面は「プロジェクト」単一集約に閉じているか？（案件などをインライン編集しない）
- [x] **データモデルの正本 (SoT)**: `.specify/memory/domain-model.md` の一意性制約 (UQ1) に基づいて実装されるか？
- [x] **不変性の強制**: エンティティのプロパティに `readonly` が付与される設計になっているか？
- [x] **直接の `new` 禁止**: UIやテストからリポジトリ具象クラスを直接 `new` せず、`RepositoryRegistry` を経由して取得する設計になっているか？

## Project Structure

### Documentation (this feature)

```text
specs/001-project-master-management/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── models/
│   │   ├── Project.ts           # プロジェクトエンティティ
│   │   └── types.ts             # 読取専用型定義・インターフェース
│   ├── value-objects/
│   └── repositories/
│       └── ProjectRepository.ts # リポジトリインターフェース
├── application/
│   ├── usecases/
│   │   ├── ProjectUseCase.ts    # ユースケース抽象インターフェース
│   │   └── DTOs.ts              # Command / DTO定義（入力パラメータ等）
│   └── services/
│       └── ProjectService.ts    # ユースケース具象サービス
└── infrastructure/
    ├── persistence/
    │   ├── InMemoryProjectRepository.ts    # テスト・初期用
    │   ├── LocalStorageProjectRepository.ts # 本番永続化用
    │   └── RepositoryRegistry.ts            # リポジトリ取得レジストリ
    └── ui/
        ├── ProjectForm.tsx      # 新規登録・編集用コンポーネント
        └── ProjectView.tsx      # 一覧・削除画面コンポーネント

tests/
├── unit/
│   ├── domain/
│   └── application/
└── integration/
    └── infrastructure/
```

**Structure Decision**: 
本プロジェクトはブラウザで動作するフロントエンド完結型のSPAであるため、「Option 1: Single project」を採用し、`src/` 配下にクリーンアーキテクチャのレイヤー構造（`domain/`, `application/`, `infrastructure/`）を配置する。

## Complexity Tracking

> **憲法チェックの違反や例外的な複雑性の導入はありません。**
