# Tasks: F02 社員マスタ管理

**Input**: Design documents from `/specs/002-employee-management/`

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

* [x] T001 ドメインモデルインポートの競合を回避するため、`src/domain/models/index.ts` の型・クラス再エクスポート設定を整理する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ユーザーストーリーの実装を開始する前に必須となる、クリーンアーキテクチャの基本定義およびレジストリの実装。

**⚠️ CRITICAL**: 本フェーズが完了するまで、個々のユーザーストーリーのコーディングを開始してはならない。

* [x] T002 ドメインオブジェクト `Employee` クラスを `src/domain/models/Employee.ts` に作成し、読取専用エンティティインターフェース `IEmployee` を `src/domain/models/types.ts` に追加・エクスポートする
* [x] T003 [P] リポジトリ契約 `EmployeeRepository` を `src/domain/repositories/EmployeeRepository.ts` に作成し、バレルファイルで再エクスポートする
* [x] T004 [P] アプリケーションユースケース契約 `EmployeeUseCase` を `src/application/usecases/EmployeeUseCase.ts` に作成し、バレルファイルで再エクスポートする
* [x] T005 [P] テストおよび初期開発用のインメモリリポジトリ `InMemoryEmployeeRepository` を `src/infrastructure/persistence/InMemoryEmployeeRepository.ts` に骨組みだけ実装する
* [x] T006 [P] リポジトリレジストリ `src/infrastructure/persistence/RepositoryRegistry.ts` に `EmployeeRepository` の登録・取得ロジックを追加する
* [x] T007 `EmployeeUseCase` を実装する具象アプリケーションサービス `EmployeeService` を `src/application/services/EmployeeService.ts` に骨組みだけ実装する

**Checkpoint**: 基礎インフラストラクチャの定義完了。これ以降、各ユーザーストーリーの開発を並行して開始できる。

---

## Phase 3: User Story 1 - 社員一覧の表示と初期データ投入 (Priority: P1) 🎯 MVP

**Goal**: 登録されている社員の一覧をテーブル形式で画面表示し、初回起動時にはシードデータ（トム・デマルコら3名）が自動的にロードされて表示される。

**Independent Test**: LocalStorageやメモリ上のデータが空の状態でアプリを起動した際、初期シード社員 3名（EMP001, EMP002, EMP003）が一覧テーブル上に自動で表示されること。

### US1 に対するテスト実装 (TDD推奨)
* [x] T008 [P] [US1] アプリ初回起動時のシードデータ投入および一覧取得ユースケースのユニットテストを `tests/unit/application/EmployeeService.list.test.ts` に作成し、失敗することを確認する
* [x] T009 [P] [US1] 社員一覧ビューの初期描画およびシードデータ表示に関するUIテストを `tests/unit/infrastructure/ui/EmployeeView.test.tsx` に作成し、失敗することを確認する

### US1 の実装
* [x] T010 [US1] `InMemoryEmployeeRepository` の初期化時に、正本に定義された3名（EMP001, EMP002, EMP003）のデータを自動投入するシードロジックを `src/infrastructure/persistence/InMemoryEmployeeRepository.ts` に実装する
* [x] T011 [US1] 社員IDの昇順で全データを返却するリポジトリメソッド `findAll()` を `src/infrastructure/persistence/InMemoryEmployeeRepository.ts` に実装する
* [x] T012 [US1] `EmployeeRepository.findAll()` を呼び出して一覧を返却するユースケース `EmployeeService.getEmployees()` を `src/application/services/EmployeeService.ts` に実装する
* [x] T013 [US1] 社員一覧をテーブル形式で描画するビューコンポーネント `EmployeeView` を `src/infrastructure/ui/EmployeeView.tsx` に実装する（UI表示時に `EmployeeUseCase.getEmployees()` を呼び出す）
* [x] T014 [US1] アプリのエントリポイント `src/App.tsx` を修正し、`EmployeeView` をマウントして初期一覧表示の動作確認を行う

**Checkpoint**: 登録済み社員（初期データ含む）の一覧が画面に正しく表示され、テストがすべてパスすること。

---

## Phase 4: User Story 2 - 新しい社員の追加登録 (Priority: P1)

**Goal**: 社員名と単価を入力し、自動採番（最大値+1、欠番再利用なし）、同姓同名の許可、前後の空白トリミングをパスした社員を新規登録できる。

**Independent Test**: 前後にスペースが含まれる名称を入力した際にトリミングされて登録されること、および同姓同名の社員が別のIDで正常に登録されること。

### US2 に対するテスト実装
* [x] T015 [P] [US2] 社員新規登録ユースケースの単体テスト（正常系採番、トリミング検証、必須エラー、単価負数エラー、同姓同名許可検証）を `tests/unit/application/EmployeeService.create.test.ts` に作成し、失敗することを確認する
* [x] T016 [P] [US2] 社員登録フォームのバリデーション表示やエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/EmployeeForm.test.tsx` に作成し、失敗することを確認する

### US2 の実装
* [x] T017 [US2] `InMemoryEmployeeRepository.ts` に ID自動採番（EMPnnn形式、最大値+1、欠番再利用なし）のロジック `nextIdentity()` を実装する
* [x] T018 [US2] `EmployeeService.createEmployee()` において、名前の前後スペースのトリミング、必須チェック、単価が0以上の整数であることのバリデーションを行い、新規IDを付与してリポジトリに保存する登録処理を `src/application/services/EmployeeService.ts` に実装する
* [x] T019 [US2] 新規登録用の入力フォームコンポーネント `EmployeeForm` を `src/infrastructure/ui/EmployeeForm.tsx` に実装する（登録成功時の更新通知、バリデーションエラーのメッセージ表示を制御）
* [x] T020 [US2] 一覧ビュー `EmployeeView.tsx` と登録フォーム `EmployeeForm.tsx` を統合し、登録成功時に一覧が再描画される連携ロジックを実装する

**Checkpoint**: 新規社員登録操作が正常系・異常系・エッジケースを含めて正しく動作すること。

---

## Phase 5: User Story 3 - 社員情報の編集・更新 (Priority: P2)

**Goal**: 登録済みの社員の名前および単価を編集・変更でき、トリミングとバリデーションをパスしたものを更新できる。

**Independent Test**: 既存社員の編集画面を開き、単価を書き換えて保存した際、一覧画面に更新後の単価が即座に反映されること。

### US3 に対するテスト実装
* [x] T021 [P] [US3] 社員情報更新ユースケースの単体テスト（正常更新、トリミング検証、エラー検証）を `tests/unit/application/EmployeeService.update.test.ts` に作成し、失敗することを確認する
* [x] T022 [P] [US3] 社員名・単価編集時の入力内容およびエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/EmployeeForm.edit.test.tsx` に作成し、失敗することを確認する

### US3 の実装
* [x] T023 [US3] `EmployeeService.updateEmployee()` において、存在確認、トリミング、必須/単価バリデーションを行い、イミュータブルに変更してリポジトリに保存する更新処理を `src/application/services/EmployeeService.ts` に実装する
* [x] T024 [US3] `EmployeeForm.tsx` に編集用初期値の読み込みモードを追加し、更新実行ボタンクリック時に `EmployeeUseCase.updateEmployee()` を呼び出す編集ロジックを実装する
* [x] T025 [US3] `EmployeeView.tsx` の各行に「編集」アクションを追加し、クリック時に選択された社員情報を `EmployeeForm` に引き渡して編集用のフォームを開く統合ロジックを実装する

**Checkpoint**: 登録済みの社員情報の変更が、正常系・異常系を含めて正しく動作すること。

---

## Phase 6: User Story 4 - 社員の物理削除 (Priority: P2)

**Goal**: 不要な社員を物理削除する。ただし、過去に工数実績が登録されている社員IDの削除はブロックし警告を表示する。

**Independent Test**: 工数実績が紐づいていない社員が削除可能であること、および工数実績レコード（作業時間0であっても）が存在する社員の削除を試みた際にエラーでブロックされること。

### US4 に対するテスト実装
* [x] T026 [P] [US4] 社員の物理削除および削除制限に関する単体テストを `tests/unit/application/EmployeeService.delete.test.ts` に作成し、失敗することを確認する
* [x] T027 [P] [US4] 削除確認ダイアログの表示や削除制限時におけるエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/EmployeeView.delete.test.tsx` に作成し、失敗することを確認する

### US4 の実装
* [x] T028 [US4] `EmployeeService.deleteEmployee()` 内で、削除対象社員が工数実績データ（`月別案件社員工数` 等）に参照されているかを検証する参照整合性チェック（TDD用にインメモリ工数リポジトリも考慮）を `src/application/services/EmployeeService.ts` に実装する
* [x] T029 [US4] 参照制約をクリアした場合にのみ、データストアから該当レコードを物理削除するリポジトリメソッド `delete()` のロジックを `InMemoryEmployeeRepository.ts` に実装する
* [x] T030 [US4] `EmployeeView.tsx` の各社員行に「削除」アクションを追加し、確認ダイアログを挟んで `EmployeeUseCase.deleteEmployee()` を呼び出し、削除完了後のリスト再ロードおよび制約エラー発生時の警告表示ロジックを実装する

**Checkpoint**: 工数実績から参照されている社員の削除制限、および参照のない社員の物理削除が正しく動作すること。

---

## Phase 7: LocalStorage 永続化の実装 (LocalStorage Persistence)

**Purpose**: ブラウザリロード後も社員データが保持されるように、本番用の LocalStorage リポジトリを実装し差し替える。

* [x] T031 本番用の `LocalStorageEmployeeRepository` を `src/infrastructure/persistence/LocalStorageEmployeeRepository.ts` に実装する（`findAll`, `findById`, `save`, `delete` をすべて実装）
* [x] T032 `LocalStorageEmployeeRepository.ts` において、LocalStorageが完全に空の場合に限り、初期シードデータ（トム・デマルコ他3名）を初期登録する自動シード化ロジックを実装する
* [x] T033 `RepositoryRegistry.ts` 内で返却するリポジトリを、ブラウザ環境では `LocalStorageEmployeeRepository` に、テスト環境では `InMemoryEmployeeRepository` に動的に切り替えるロジックを実装する

**Checkpoint**: ブラウザの localStorage 内にJSON形式でデータが永続化され、リロード後もデータが完全に維持されること。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント、デザインの微調整、および受入検証シナリオの最終確認。

* [x] T034 `quickstart.md` に定義された全受入検証シナリオを実演し、すべての検証項目をクリアすることを確認する（`npm run build` による単一HTMLの直接起動確認も含む）
* [x] T035 UIのスタイリング調整（F01のプロジェクトマスタとカラー・レイアウト等のデザインの一貫性を高める調整）
* [x] T036 `README.md` の更新（社員マスタに関する起動方法、テスト手順の追記）
* [x] T037 [P] 未使用コードのクリーンアップ、TypeScriptコンパイルおよびテストがエラーなしで通ることを確認する

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
* 各フェーズ内の `[P]` マーク付きタスクは並行実行可能。
* 各ユーザーストーリー内における、ユースケーステストと UIテストの作成タスク `[P]` は並行実行可能。

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. **Phase 1: Setup** を完了する。
2. **Phase 2: Foundational** を完了する。
3. **Phase 3: User Story 1**（一覧表示・初期データ表示）を実装する。
4. **検証**: テストを実行し、初期状態で画面に 3名のシード社員が表示されることを確認する。これが最初の実用インクリメント（MVP）となる。

### Incremental Delivery
1. 一覧表示（US1）の完了後、新規登録（US2）を実装し、動的なデータ追加を可能にする。
2. 登録ができるようになった後、名称変更（US3）を実装し、データの編集を可能にする。
3. 最後に、不要なデータの物理削除および制限（US4）を実装し、安全なデータのクリーンアップを可能にする。
4. 最終的に LocalStorage に結合し、ブラウザをリロードしても上記CRUD機能が永続化される状態を完成させる。
