# Tasks: F01 プロジェクトマスタ管理

**Input**: Design documents from `/specs/001-project-master-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: 本タスクリストには自動テスト（Vitest + React Testing Library）の実装タスクが含まれています。テストコードは、憲法および仕様書に定義されている受入条件（Given-When-Then）を保証するために必須とします。

**Organization**: タスクはユーザーストーリーごとにグループ化されており、各ストーリーが独立して実装およびテストできるように整理されています。

---

## Format: `[ID] [P?] [Story] Description`

* **[P]**: 並行実行可能（ファイルが異なり、他の未完了タスクへの依存がないもの）。
* **[Story]**: タスクが属するユーザーストーリーのラベル（US1, US2, US3, US4）。
* 説明には具体的なファイルパスを記載しています。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクトのディレクトリ構成の作成と基本初期設定。

* [x] T001 プロジェクト計画書に基づいてベースとなるフォルダ構造をリポジトリルートに作成する
* [x] T002 `package.json` を作成し、React、TypeScript、およびテストツール（Vitest, React Testing Library）の依存関係を設定する
* [x] T003 [P] ESLintおよびPrettierを導入し、TypeScriptプロジェクト用のコードフォーマット設定ファイルをリポジトリルートに作成する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ユーザーストーリーの実装を開始する前に必須となる、クリーンアーキテクチャの基本定義およびレジストリの実装。

**⚠️ CRITICAL**: 本フェーズが完了するまで、個々のユーザーストーリーのコーディングを開始してはならない。

* [x] T004 ドメインオブジェクト `Project` を `src/domain/models/Project.ts` に作成し、読取専用エンティティ定義 `types.ts` を `src/domain/models/types.ts` に作成する
* [x] T005 [P] リポジトリ契約 `ProjectRepository` を `src/domain/repositories/ProjectRepository.ts` に作成する
* [x] T006 [P] アプリケーションユースケース契約 `ProjectUseCase` および Command DTO 定義を `src/application/usecases/ProjectUseCase.ts` に作成する
* [x] T007 [P] テストおよび初期開発用のインメモリリポジトリ `InMemoryProjectRepository` を `src/infrastructure/persistence/InMemoryProjectRepository.ts` に骨組みだけ実装する
* [x] T008 [P] テスト/本番用リポジトリを一元管理し、直接の `new` を禁止するための `RepositoryRegistry` を `src/infrastructure/persistence/RepositoryRegistry.ts` に定義する
* [x] T009 抽象インターフェース `ProjectUseCase` を実装する具象アプリケーションサービス `ProjectService` を `src/application/services/ProjectService.ts` に骨組みだけ実装する

**Checkpoint**: 基礎インフラストラクチャの定義完了。これ以降、各ユーザーストーリーの開発を並行して開始できる。

---

## Phase 3: User Story 1 - プロジェクト一覧の表示 (Priority: P1) 🎯 MVP

**Goal**: 登録されているプロジェクトの一覧をテーブル形式で画面表示し、初回起動時にはシードデータ `PJ001` が自動的にロードされて表示される。

**Independent Test**: LocalStorageやメモリ上のデータが空の状態でアプリを起動した際、初期シードマスタ `PJ001: 次世代基幹システム開発プロジェクト` が一覧テーブル上に自動で表示されること。

### US1 に対するテスト実装 (TDD推奨)
* [x] T010 [P] [US1] アプリ初回起動時のシードデータ投入および一覧取得ユースケースのユニットテストを `tests/unit/application/ProjectService.list.test.ts` に作成し、失敗することを確認する
* [x] T011 [P] [US1] プロジェクト一覧ビューの初期描画およびシードデータ表示に関するUIテストを `tests/unit/infrastructure/ui/ProjectView.test.tsx` に作成し、失敗することを確認する

### US1 の実装
* [x] T012 [US1] `InMemoryProjectRepository` の初期化時に、正本のテストデータである `PJ001`（次世代基幹システム開発プロジェクト）を自動投入するシードロジックを `src/infrastructure/persistence/InMemoryProjectRepository.ts` に実装する
* [x] T013 [US1] プロジェクトIDの昇順で全データを返却するリポジトリメソッド `findAll()` を `src/infrastructure/persistence/InMemoryProjectRepository.ts` に実装する
* [x] T014 [US1] `ProjectRepository.findAll()` を呼び出して一覧を返却するユースケース `ProjectService.getProjects()` を `src/application/services/ProjectService.ts` に実装する
* [x] T015 [US1] プロジェクト一覧をテーブル形式で描画するビューコンポーネント `ProjectView` を `src/infrastructure/ui/ProjectView.tsx` に実装する（UI表示時に `ProjectUseCase.getProjects()` を呼び出す）
* [x] T016 [US1] アプリのエントリポイント `src/App.tsx` を作成または編集し、`ProjectView` をマウントして初期一覧表示 of 動作確認を行う

**Checkpoint**: 登録済みプロジェクト（初期データ含む）の一覧が画面に正しく表示され、テストがすべてパスすること。

---

## Phase 4: User Story 2 - プロジェクトの新規登録 (Priority: P1)

**Goal**: プロジェクト名を入力し、自動採番（最大値+1、欠番再利用なし）、重複チェック、前後の空白トリミングをパスしたプロジェクトを新規登録できる。

**Independent Test**: 前後にスペースが含まれる名称を入力した際にトリミングされて登録されること、スペースのみの入力が拒否されること、および既存名称と同じ名前（例: `次世代基幹システム開発プロジェクト`）での登録が重複エラーとなること。

### US2 に対するテスト実装
* [x] T017 [P] [US2] プロジェクト新規登録ユースケースの単体テスト（正常系採番、トリミング検証、必須エラー、重複エラー検証）を `tests/unit/application/ProjectService.create.test.ts` に作成し、失敗することを確認する
* [x] T018 [P] [US2] プロジェクト登録フォームのバリデーション表示やエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/ProjectForm.test.tsx` に作成し、失敗することを確認する

### US2 の実装
* [x] T019 [US2] `ProjectRepository` に重複確認用メソッド `findByName(name: string)` を追加し、`InMemoryProjectRepository.ts` に ID自動採番（最大値+1）および `findByName` のロジックを実装する
* [x] T020 [US2] `ProjectService.createProject()` において、前後の空白のトリミング、必須チェック、および `findByName` による重複確認を行い、新規IDを付与してリポジトリに保存する登録ユースケースロジックを `src/application/services/ProjectService.ts` に実装する
* [x] T021 [US2] 新規登録用の入力フォームコンポーネント `ProjectForm` を `src/infrastructure/ui/ProjectForm.tsx` に実装する（登録成功時の更新通知、バリデーションエラーや重複エラーのメッセージ表示を制御）
* [x] T022 [US2] 一覧ビュー `ProjectView.tsx` と登録フォーム `ProjectForm.tsx` を統合し、一覧画面から登録フォームを開いて登録を完了し、一覧が再描画される連携ロジックを実装する

**Checkpoint**: 新規登録操作が正常系・異常系・エッジケース（重複・スペースのみ・文字長超過）を含めて正しく動作すること。

---

## Phase 5: User Story 3 - プロジェクト名の変更・更新 (Priority: P1)

**Goal**: 登録済みのプロジェクトの名称を編集・変更でき、重複チェックとトリミングをパスしたものを更新できる。

**Independent Test**: 既存プロジェクトの編集画面を開き、自分自身の名前以外の既存名称と衝突する名称を設定した場合に重複エラーが表示されて保存がブロックされること。

### US3 に対するテスト実装
* [x] T023 [P] [US3] プロジェクト更新ユースケースの単体テスト（正常更新、自分と同名は許可、他と同名はエラー、トリミング検証）を `tests/unit/application/ProjectService.update.test.ts` に作成し、失敗することを確認する
* [x] T024 [P] [US3] プロジェクト名編集時の入力内容およびエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/ProjectForm.edit.test.tsx` に作成し、失敗することを確認する

### US3 の実装
* [x] T025 [US3] `ProjectService.updateProject()` において、トリミング、必須チェック、および「自身のID以外のレコードで同一名がすでに登録されていないか」の重複チェックを行い、リポジトリに上書き保存する更新ユースケースロジックを `src/application/services/ProjectService.ts` に実装する
* [x] T026 [US3] `ProjectForm.tsx` に編集用初期値の読み込みモードを追加し、更新実行ボタンクリック時に `ProjectUseCase.updateProject()` を呼び出す編集ロジックを実装する
* [x] T027 [US3] `ProjectView.tsx` の各行に「編集」アクションを追加し、クリック時に選択されたプロジェクト情報を `ProjectForm` に引き渡して編集用のダイアログまたはフォームを開く統合ロジックを実装する

**Checkpoint**: 登録済みのプロジェクト名称の変更が、正常系・異常系（同一の他プロジェクトとの重複）を含めて正しく動作すること。

---

## Phase 6: User Story 4 - プロジェクトの削除 (Priority: P1)

**Goal**: 不要なプロジェクトを物理削除する。ただし、案件（他集約）に紐づいているプロジェクトIDの削除はブロックし警告を表示する。

**Independent Test**: 案件が紐づいていないプロジェクトが削除可能であること、および案件（AJ001など）が登録されている `PJ001` の削除を試みた際にエラーでブロックされること。

### US4 に対するテスト実装
* [x] T028 [P] [US4] プロジェクト物理削除および削除制限に関する単体テストを `tests/unit/application/ProjectService.delete.test.ts` に作成し、失敗することを確認する
* [x] T029 [P] [US4] 削除確認ダイアログの表示や削除制限時におけるエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/ProjectView.delete.test.tsx` に作成し、失敗することを確認する

### US4 の実装
* [x] T030 [US4] `RepositoryRegistry` またはユースケース層から他集約（案件など）のリポジトリやダミーデータ等にアクセスし、削除対象IDの参照有無を検証する参照整合性チェックロジックを `src/application/services/ProjectService.ts` に実装する
* [x] T031 [US4] 参照制約をクリアした場合にのみ、データストアから該当レコードを物理削除するリポジトリメソッド `delete()` のロジックを `InMemoryProjectRepository.ts` に実装する
* [x] T032 [US4] `ProjectView.tsx` の各プロジェクト行に「削除」アクションを追加し、確認ダイアログを挟んで `ProjectUseCase.deleteProject()` を呼び出し、削除完了後のリスト再ロードおよび制約エラー発生時の警告表示ロジックを実装する

**Checkpoint**: 他集約から参照されているプロジェクトの削除制限、および参照のないプロジェクトの物理削除が正しく動作すること。

---

## Phase 7: LocalStorage 永続化の実装 (LocalStorage Persistence)

**Purpose**: ブラウザリロード後もプロジェクトデータが保持されるように、本番用の LocalStorage リポジトリを実装し差し替える。

* [x] T033 本番用の `LocalStorageProjectRepository` を `src/infrastructure/persistence/LocalStorageProjectRepository.ts` に実装する（`findAll`, `findById`, `findByName`, `save`, `delete` をすべて実装）
* [x] T034 `LocalStorageProjectRepository.ts` において、LocalStorageが完全に空の場合に限り、初期シードデータ（PJ001）を初期登録する自動シード化ロジックを実装する
* [x] T035 `RepositoryRegistry.ts` 内で返却するリポジトリを、ブラウザ環境では `LocalStorageProjectRepository` に、テスト環境では `InMemoryProjectRepository` に動的に切り替えるロジックを実装する

**Checkpoint**: ブラウザの localStorage 内にJSON形式でデータが永続化され、リロード後もデータが完全に維持されること。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント、デザインの微調整、および受入検証シナリオの最終確認。

* [x] T036 [P] `README.md` およびドキュメント類の更新（プロジェクト全体の起動方法や構成についてのまとめ）
* [x] T037 UI画面のCSS/スタイリング調整（エラー通知、ローディング、テーブルの見た目等の微調整）
* [x] T038 `quickstart.md` に定義された全受入検証シナリオを手動で実演し、すべての検証項目をクリアすることを確認する
* [x] T039 [P] 未使用コードのクリーンアップ、TypeScriptコンパイルおよびテストがエラーなしで通ることを確認する

---

## Dependencies & Execution Order

### Phase Dependencies
* **Setup (Phase 1)**: 依存関係なし。直ちに開始可能。
* **Foundational (Phase 2)**: Setup完了に依存。以降の全ユーザーストーリー開発をブロックする。
* **User Stories (Phase 3〜6)**: すべてFoundational（Phase 2）の完了に依存。
  * ユーザーストーリーは、優先度および機能の基礎性から「一覧表示（US1）→ 新規登録（US2）→ 更新（US3）→ 削除（US4）」の順で順次実装・検証を進める。
* **LocalStorage 実装 (Phase 7)**: すべてのユーザーストーリーロジックの定義に依存（インメモリでのテストがすべて完了している状態で結合する）。
* **Polish (Phase 8)**: 全ユーザーストーリーおよび永続化の実装が完了していることに依存。

### Parallel Opportunities
* Phase 1 (Setup) および Phase 2 (Foundational) 内の `[P]` マーク付きタスクは並行実行可能。
* 各ユーザーストーリー内における、ユースケーステスト (`ProjectService.*.test.ts`) と UIテスト (`Project*.test.tsx`) の作成タスク `[P]` は並行実行可能。
* 基礎部分が完了した後は、各ユーザーストーリー自体を個別の開発者が並行して進めることが可能（ただしインメモリ実装とUIの干渉に配慮する）。

---

## Parallel Example: User Story 2

```bash
# US2におけるテスト作成タスクの同時実行（並行可能）：
Task 1: "T017 [P] [US2] プロジェクト新規登録ユースケースの単体テストを tests/unit/application/ProjectService.create.test.ts に作成"
Task 2: "T018 [P] [US2] プロジェクト登録フォームのUIテストを tests/unit/infrastructure/ui/ProjectForm.test.tsx に作成"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. **Phase 1: Setup** を完了する。
2. **Phase 2: Foundational** を完了する。
3. **Phase 3: User Story 1**（一覧表示・初期データ表示）を実装する。
4. **検証**: テストを実行し、初期状態で画面に `PJ001` が表示されることを確認する。これが最初の実用インクリメント（MVP）となる。

### Incremental Delivery
1. 一覧表示（US1）の完了後、新規登録（US2）を実装し、動的なデータ追加を可能にする。
2. 登録ができるようになった後、名称変更（US3）を実装し、データの編集を可能にする。
3. 最後に、不要なデータの物理削除および制限（US4）を実装し、安全なデータのクリーンアップを可能にする。
4. 最終的に LocalStorage に結合し、ブラウザをリロードしても上記CRUD機能が永続化される状態を完成させる。
