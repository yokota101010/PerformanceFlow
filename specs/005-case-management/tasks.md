# Tasks: F05 案件管理

**Input**: Design documents from `/specs/005-case-management/`

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

**Purpose**: プロジェクトのディレクトリ構成の準備と共通設定。

* [x] T001 ドメインモデルインポートおよびユースケースインポートの競合を回避するため、`src/domain/models/index.ts` および `src/application/usecases/index.ts` の型・クラス再エクスポート設定を整理する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ユーザーストーリーの実装を開始する前に必須となる、クリーンアーキテクチャの基本定義、仮リポジトリ契約、およびレジストリの実装。

**⚠️ CRITICAL**: 本フェーズが完了するまで、個々のユーザーストーリーのコーディングを開始してはならない。

* [x] T002 ドメインオブジェクト `Case` クラスを `src/domain/models/Case.ts` に作成し、読取専用エンティティインターフェース `ICase` を `src/domain/models/types.ts` に追加・エクスポートする
* [x] T003 [P] リポジトリ契約 `CaseRepository` を `src/domain/repositories/CaseRepository.ts` に作成し、バレルファイルで再エクスポートする
* [x] T004 [P] アプリケーションユースケース契約 `CaseUseCase` を `src/application/usecases/CaseUseCase.ts` に作成し、バレルファイルで再エクスポートする
* [x] T005 [P] 【仮】アサイン(案件作業明細)参照チェックリポジトリ `CaseAssignmentRepository` を `src/domain/repositories/CaseAssignmentRepository.ts` に作成し、バレルファイルで再エクスポートする
* [x] T006 [P] テストおよび初期開発用のインメモリリポジトリ `InMemoryCaseRepository` を `src/infrastructure/persistence/InMemoryCaseRepository.ts` に骨組みだけ実装する
* [x] T007 [P] 【仮】アサインインメモリダミー `InMemoryCaseAssignmentRepository` を `src/infrastructure/persistence/InMemoryCaseAssignmentRepository.ts` に実装する
* [x] T008 [P] リポジトリレジストリ `src/infrastructure/persistence/RepositoryRegistry.ts` に `CaseRepository` 等の登録・取得ロジックを追加する
* [x] T009 `CaseUseCase` を実装する具象アプリケーションサービス `CaseService` を `src/application/services/CaseService.ts` に骨組みだけ実装する

**Checkpoint**: 基礎インフラストラクチャの定義完了。これ以降、各ユーザーストーリーの開発を並行して開始できる。

---

## Phase 3: User Story 1 - 案件一覧の表示と初期データ投入 (Priority: P1) 🎯 MVP

**Goal**: 登録されている案件の一覧をテーブル形式で画面表示し、初回起動時にはシードデータ（2件）が自動的にロードされて表示される。

**Independent Test**: LocalStorageやメモリ上のデータが空の状態でアプリを起動し、案件管理画面を開いた際、初期シード案件 2件がプロジェクト名および期間とともに一覧テーブル上に自動で表示されること。

### US1 に対するテスト実装 (TDD推奨)
* [x] T010 [P] [US1] アプリ初回起動時のシードデータ投入および一覧取得ユースケースのユニットテストを `tests/unit/application/CaseService.list.test.ts` に作成し、失敗することを確認する
* [x] T011 [P] [US1] 案件一覧ビューの初期描画およびシードデータ表示に関するUIテストを `tests/unit/infrastructure/ui/CaseView.test.tsx` に作成し、失敗することを確認する

### US1 の実装
* [x] T012 [US1] `InMemoryCaseRepository` の初期化時に、正本に定義された2件（PJ001にAJ001, AJ002）のデータを自動投入するシードロジックを `src/infrastructure/persistence/InMemoryCaseRepository.ts` に実装する
* [x] T013 [US1] プロジェクトIDおよび案件ID順で全データを返却するリポジトリメソッド `findAll()` と、プロジェクト別全データを取得する `findByProjectId()` を `src/infrastructure/persistence/InMemoryCaseRepository.ts` に実装する
* [x] T014 [US1] `CaseRepository.findAll()` または `findByProjectId()` を呼び出して一覧を返却するユースケース `CaseService.getCases()` および `getCasesByProject()` を `src/application/services/CaseService.ts` に実装する
* [x] T015 [US1] 案件一覧をテーブル形式で描画するビューコンポーネント `CaseView` を `src/infrastructure/ui/CaseView.tsx` に実装する（親プロジェクト名は `ProjectRepository` を用いて動的に表示）
* [x] T016 [US1] アプリのエントリポイント `src/App.tsx` を修正し、ナビゲーションに「案件管理」のタブを追加し、`CaseView` をマウントして初期一覧表示の動作確認を行う

**Checkpoint**: 登録済み案件（初期データ含む）の一覧が画面に正しく表示され、テストがすべてパスすること。

---

## Phase 4: User Story 2 - 新しい案件の追加登録 (Priority: P1)

**Goal**: プロジェクトを選択し、案件名、開始日、終了日を入力・選択して、プロジェクト別自動採番、同一プロジェクト内重複名禁止、日付順序チェックをクリアした案件を新規登録できる。

**Independent Test**: 新規登録フォームに案件名、期間を入力し登録した際、プロジェクトID別で自動採番されること、および同一プロジェクト内での重複名登録がエラーでブロックされること。

### US2 に対するテスト実装
* [x] T017 [P] [US2] 新規登録ユースケースの単体テスト（プロジェクト別自動採番、トリミング検証、日付順序バリデーション、同一プロジェクト内重複名エラー）を `tests/unit/application/CaseService.create.test.ts` に作成し、失敗することを確認する
* [x] T018 [P] [US2] 案件登録フォームのバリデーション表示やプロジェクトリスト取得、重複エラー警告に関するUIテストを `tests/unit/infrastructure/ui/CaseForm.test.tsx` に作成し、失敗することを確認する

### US2 の実装
* [x] T019 [US2] `InMemoryCaseRepository.ts` に プロジェクト単位のID自動採番（AJnnn形式、親プロジェクト内の最大連番+1、欠番再利用なし）のロジック `nextIdentity(projectId)` を実装する
* [x] T020 [US2] `CaseService.createCase()` において、氏名の前後スペースのトリミング、開始日・終了日の日付順序チェック、同一プロジェクト内の同名チェック、プロジェクトIDの存在検証を行い、新規IDを付与してリポジトリに保存する登録処理を `src/application/services/CaseService.ts` に実装する
* [x] T021 [US2] 新規登録用の入力フォームコンポーネント `CaseForm` を `src/infrastructure/ui/CaseForm.tsx` に実装する（親プロジェクトのドロップダウン選択肢には `ProjectRepository` から取得したプロジェクト一覧を表示する）
* [x] T022 [US2] 一覧ビュー `CaseView.tsx` と登録フォーム `CaseForm.tsx` を統合し、登録成功時に一覧が再描画される連携ロジックを実装する

**Checkpoint**: 案件登録操作が正常系・異常系・プロジェクト単位採番・同一プロジェクト内重複制限を含めて正しく動作すること。

---

## Phase 5: User Story 3 - 案件情報の編集・更新 (Priority: P2)

**Goal**: 登録済みの案件の案件名、開始日、終了日を編集・変更でき、プロジェクトID固定、同一プロジェクト内重複禁止、日付順序チェックをクリアしたものを更新できる。

**Independent Test**: 既存案件の編集画面を開き、情報を書き換えて保存した際、一覧画面に即座に反映され、親プロジェクトIDフィールドが無効化（disabled）されていること。

### US3 に対するテスト実装
* [x] T023 [P] [US3] 情報更新ユースケースの単体テスト（正常更新、期間順序変更エラー、同一プロジェクト内重複名エラー、自分自身を除外する重複チェックの検証）を `tests/unit/application/CaseService.update.test.ts` に作成し、失敗することを確認する
* [x] T024 [P] [US3] 案件情報編集時の入力内容、プロジェクトIDセレクトボックスの非活性化、およびエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/CaseForm.edit.test.tsx` に作成し、失敗することを確認する

### US3 の実装
* [x] T025 [US3] `CaseService.updateCase()` において、存在確認、トリミング、必須・期間妥当性・同一プロジェクト内重複チェックを行い、イミュータブルに変更してリポジトリに保存する更新処理を `src/application/services/CaseService.ts` に実装する（プロジェクトIDの変更は不可）
* [x] T026 [US3] `CaseForm.tsx` に編集用初期値の読み込みモードを追加し、プロジェクト選択ドロップダウンの `disabled` 制御を実装し、保存時に `CaseUseCase.updateCase()` を呼び出す編集ロジックを実装する
* [x] T027 [US3] `CaseView.tsx` の各行に「編集」アクションを追加し、クリック時に選択された案件情報を `CaseForm` に引き渡して編集用のフォームを開く統合ロジックを実装する（編集開始時には画面上部へスクロールさせる）

**Checkpoint**: 登録済みの案件情報の変更が、バリデーションを含めて正しく動作すること。

---

## Phase 6: User Story 4 - 案件の物理削除 (Priority: P2)

**Goal**: 不要な案件を物理削除する。ただし、アサイン実績（案件作業明細）に対象IDが参照されている案件の削除はブロックし警告を表示する。

**Independent Test**: アサイン実績が存在する案件の削除が拒否されること、参照のない案件が正常に物理削除できること。

### US4 に対するテスト実装
* [x] T028 [P] [US4] 案件の物理削除およびアサイン契約存在チェック削除制限に関する単体テストを `tests/unit/application/CaseService.delete.test.ts` に作成し、失敗することを確認する
* [x] T029 [P] [US4] 削除確認ダイアログの表示や削除制限時におけるエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/CaseView.delete.test.tsx` に作成し、失敗することを確認する

### US4 の実装
* [x] T030 [US4] `CaseService.deleteCase()` 内で、案件作業明細（`CaseAssignmentRepository`）の参照整合性チェックを行い、存在する場合に削除を拒否し例外スローするチェックロジックを `src/application/services/CaseService.ts` に実装する
* [x] T031 [US4] 参照制約をクリアした場合にのみ、データストアから該当レコードを物理削除するリポジトリメソッド `delete()` のロジックを `InMemoryCaseRepository.ts` に実装する
* [x] T032 [US4] `CaseView.tsx` の各行に「削除」アクションを追加し、確認ダイアログを挟んで `CaseUseCase.deleteCase()` を呼び出し、削除完了後のリスト再ロードおよび制約エラー発生時の警告表示ロジックを実装する

**Checkpoint**: 案件作業明細参照アサインがある案件の削除制限、および参照のない案件の物理削除が正しく動作すること。

---

## Phase 7: LocalStorage 永続化の実装 (LocalStorage Persistence)

**Purpose**: ブラウザリロード後も案件データが保持されるように、本番用の LocalStorage リポジトリを実装し差し替える。

* [x] T033 本番用の `LocalStorageCaseRepository` を `src/infrastructure/persistence/LocalStorageCaseRepository.ts` に実装する（`findAll`, `findByProjectId`, `findById`, `save`, `delete`, `nextIdentity` をすべて実装。空の時は自動シード化）
* [x] T034 `RepositoryRegistry.ts` 内で返却するリポジトリを、ブラウザ環境では `LocalStorageCaseRepository` に、テスト環境では `InMemoryCaseRepository` に動的に切り替えるロジックを実装する

**Checkpoint**: ブラウザの localStorage 内にJSON形式でデータが永続化され、リロード後もデータが完全に維持されること。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント、デザインの微調整、および受入検証シナリオの最終確認。

* [x] T035 `quickstart.md` に定義された全受入検証シナリオを実演し、すべての検証項目をクリアすることを確認する（`npm run build` による単一HTMLの直接起動確認も含む）
* [x] T036 UIのスタイリング調整（他マスタとグラスモルフィズムデザインの一貫性を高める調整）
* [x] T037 `README.md` の更新（案件管理に関する起動方法、テスト手順の追記）
* [x] T038 [P] 未使用コードのクリーンアップ、TypeScriptコンパイルおよびテストがエラーなしで通ることを確認する

---

## Dependencies & Execution Order

### Phase Dependencies
* **Setup (Phase 1)**: 依存関係なし。直ちに開始可能。
* **Foundational (Phase 2)**: Setup完了に依存。以降の全ユーザーストーリー開発をブロックする。
* **User Stories (Phase 3〜6)**: すべてFoundational（Phase 2）の完了に依存。
  * ユーザーストーリーは、優先度および機能の基礎性から「一覧表示（US1）→ 新規登録（US2）→ 更新（US3）→ 削除（US4）」の順で順次実装・検証を進める。
* **LocalStorage 実装 (Phase 7)**: すべてのユーザーストーリーロジックの定義に依存。
* **Polish (Phase 8)**: 全ユーザーストーリーおよび永続化の実装が完了していることに依存。

### Parallel Opportunities
* 各フェーズ内の `[P]` マーク付きタスクは並行実行可能。
* 各ユーザーストーリー内における、ユースケーステストと UIテストの作成タスク `[P]` は並行実行可能。

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. **Phase 1: Setup** を完了する。
2. **Phase 2: Foundational** を完了する。
3. **Phase 3: User Story 1**（一覧表示・初期データ表示）を実装する。
4. **検証**: テストを実行し、初期状態で画面に 2件のシード案件が表示されることを確認する。これが最初の実用インクリメント（MVP）となる。

### Incremental Delivery
1. 一覧表示（US1）の完了後、新規登録（US2）を実装し、動的なデータ追加を可能にする。
2. 登録ができるようになった後、情報変更（US3）を実装し、データの編集を可能にする。
3. 最後に、不要なデータの物理削除および制限（US4）を実装し、安全なデータのクリーンアップを可能にする。
4. 最終的に LocalStorage に結合し、ブラウザをリロードしても上記CRUD機能が永続化される状態を完成させる。
