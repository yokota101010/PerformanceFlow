# Tasks: F04 要員マスタ管理

**Input**: Design documents from `/specs/004-staff-management/`

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

* [x] T002 ドメインオブジェクト `Staff` クラスを `src/domain/models/Staff.ts` に作成し、読取専用エンティティインターフェース `IStaff` を `src/domain/models/types.ts` に追加・エクスポートする
* [x] T003 [P] リポジトリ契約 `StaffRepository` を `src/domain/repositories/StaffRepository.ts` に作成し、バレルファイルで再エクスポートする
* [x] T004 [P] アプリケーションユースケース契約 `StaffUseCase` を `src/application/usecases/StaffUseCase.ts` に作成し、バレルファイルで再エクスポートする
* [x] T005 [P] 【仮】要員契約・注文明細存在チェックリポジトリ `StaffOrderDetailRepository` を `src/domain/repositories/StaffOrderDetailRepository.ts` に作成し、バレルファイルで再エクスポートする
* [x] T006 [P] 【仮】要員月別工数サマリ存在チェックリポジトリ `StaffMonthlySummaryRepository` を `src/domain/repositories/StaffMonthlySummaryRepository.ts` に作成し、バレルファイルで再エクスポートする
* [x] T007 [P] テストおよび初期開発用のインメモリリポジトリ `InMemoryStaffRepository` を `src/infrastructure/persistence/InMemoryStaffRepository.ts` に骨組みだけ実装する
* [x] T008 [P] 【仮】注文明細インメモリダミー `InMemoryStaffOrderDetailRepository` を `src/infrastructure/persistence/InMemoryStaffOrderDetailRepository.ts` に実装する
* [x] T009 [P] 【仮】要員サマリインメモリダミー `InMemoryStaffMonthlySummaryRepository` を `src/infrastructure/persistence/InMemoryStaffMonthlySummaryRepository.ts` に実装する
* [x] T010 [P] リポジトリレジストリ `src/infrastructure/persistence/RepositoryRegistry.ts` に `StaffRepository` 等の登録・取得ロジックを追加する
* [x] T011 `StaffUseCase` を実装する具象アプリケーションサービス `StaffService` を `src/application/services/StaffService.ts` に骨組みだけ実装する

**Checkpoint**: 基礎インフラストラクチャの定義完了。これ以降、各ユーザーストーリーの開発を並行して開始できる。

---

## Phase 3: User Story 1 - 要員一覧の表示と初期データ投入 (Priority: P1) 🎯 MVP

**Goal**: 登録されている要員の一覧をテーブル形式で画面表示し、初回起動時にはシードデータ（坂本龍馬ら4名）が自動的にロードされて表示される。

**Independent Test**: LocalStorageやメモリ上のデータが空の状態でアプリを起動し、要員マスタ画面を開いた際、初期シード要員 4名（MEM001〜MEM004）が所属会社名および単価とともに一覧テーブル上に自動で表示されること。

### US1 に対するテスト実装 (TDD推奨)
* [x] T012 [P] [US1] アプリ初回起動時のシードデータ投入および一覧取得ユースケースのユニットテストを `tests/unit/application/StaffService.list.test.ts` に作成し、失敗することを確認する
* [x] T013 [P] [US1] 要員一覧ビューの初期描画およびシードデータ表示に関するUIテストを `tests/unit/infrastructure/ui/StaffView.test.tsx` に作成し、失敗することを確認する

### US1 の実装
* [x] T014 [US1] `InMemoryStaffRepository` の初期化時に、正本に定義された4名（MEM001〜MEM004）のデータを自動投入するシードロジックを `src/infrastructure/persistence/InMemoryStaffRepository.ts` に実装する
* [x] T015 [US1] 要員IDの昇順で全データを返却するリポジトリメソッド `findAll()` を `src/infrastructure/persistence/InMemoryStaffRepository.ts` に実装する
* [x] T016 [US1] `StaffRepository.findAll()` を呼び出して一覧を返却するユースケース `StaffService.getStaffs()` を `src/application/services/StaffService.ts` に実装する
* [x] T017 [US1] 要員一覧をテーブル形式で描画するビューコンポーネント `StaffView` を `src/infrastructure/ui/StaffView.tsx` に実装する（所属会社名は `PartnerRepository` を用いて動的に表示）
* [x] T018 [US1] アプリのエントリポイント `src/App.tsx` を修正し、ナビゲーションに「要員マスタ」のタブを追加し、`StaffView` をマウントして初期一覧表示の動作確認を行う

**Checkpoint**: 登録済み要員（初期データ含む）の一覧が画面に正しく表示され、テストがすべてパスすること。

---

## Phase 4: User Story 2 - 新しい要員の追加登録 (Priority: P1)

**Goal**: 要員の氏名、所属会社、単価を入力・選択し、自動採番（最大値+1、欠番再利用なし）、前後の空白トリミングをパスした要員を新規登録できる。

**Independent Test**: 新規登録フォームに氏名、所属、単価を入力し登録した際、正常に自動採番されること、および同姓同名の重複登録が正常に許可されること。

### US2 に対するテスト実装
* [x] T019 [P] [US2] 新規登録ユースケースの単体テスト（正常系採番、トリミング検証、必須氏名エラー、負数単価エラー、同姓同名の許可検証）を `tests/unit/application/StaffService.create.test.ts` に作成し、失敗することを確認する
* [x] T020 [P] [US2] 要員登録フォームのバリデーション表示や会社リスト取得に関するUIテストを `tests/unit/infrastructure/ui/StaffForm.test.tsx` に作成し、失敗することを確認する

### US2 の実装
* [x] T021 [US2] `InMemoryStaffRepository.ts` に ID自動採番（MEMnnn形式、最大値+1、欠番再利用なし）のロジック `nextIdentity()` を実装する
* [x] T022 [US2] `StaffService.createStaff()` において、氏名の前後スペースのトリミング、必須チェック、単価の0以上チェック、所属会社IDの存在検証を行い、新規IDを付与してリポジトリに保存する登録処理を `src/application/services/StaffService.ts` に実装する
* [x] T023 [US2] 新規登録用の入力フォームコンポーネント `StaffForm` を `src/infrastructure/ui/StaffForm.tsx` に実装する（所属会社のドロップダウン選択肢には `PartnerRepository` から取得した発注先一覧を表示する）
* [x] T024 [US2] 一覧ビュー `StaffView.tsx` と登録フォーム `StaffForm.tsx` を統合し、登録成功時に一覧が再描画される連携ロジックを実装する

**Checkpoint**: 要員登録操作が正常系・異常系・同姓同名許可を含めて正しく動作すること。

---

## Phase 5: User Story 3 - 要員情報の編集・更新 (Priority: P2)

**Goal**: 登録済みの要員の氏名、所属会社、単価を編集・変更でき、トリミング、単価0以上のバリデーションをパスしたものを更新できる。

**Independent Test**: 既存要員の編集画面を開き、情報を書き換えて保存した際、一覧画面に即座に反映されること。

### US3 に対するテスト実装
* [x] T025 [P] [US3] 情報更新ユースケースの単体テスト（正常更新、トリミング検証、単価エラー、存在しない会社IDのエラー検証）を `tests/unit/application/StaffService.update.test.ts` に作成し、失敗することを確認する
* [x] T026 [P] [US3] 要員情報編集時の入力内容およびエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/StaffForm.edit.test.tsx` に作成し、失敗することを確認する

### US3 の実装
* [x] T027 [US3] `StaffService.updateStaff()` において、存在確認、トリミング、必須・単価チェック、所属会社IDの存在検証を行い、イミュータブルに変更してリポジトリに保存する更新処理を `src/application/services/StaffService.ts` に実装する
* [x] T028 [US3] `StaffForm.tsx` に編集用初期値の読み込みモードを追加し、更新実行ボタンクリック時に `StaffUseCase.updateStaff()` を呼び出す編集ロジックを実装する
* [x] T029 [US3] `StaffView.tsx` の各行に「編集」アクションを追加し、クリック時に選択された要員情報を `StaffForm` に引き渡して編集用のフォームを開く統合ロジックを実装する（編集開始時には画面上部へスクロールさせる）

**Checkpoint**: 登録済みの要員情報の変更が、バリデーションを含めて正しく動作すること。

---

## Phase 6: User Story 4 - 要員の物理削除 (Priority: P2)

**Goal**: 不要な要員を物理削除する。ただし、発注（注文明細実績）や工数サマリに対象IDが参照されている要員の削除はブロックし警告を表示する。

**Independent Test**: 実績データ（注文明細等）が存在する要員の削除が拒否されること、参照のない要員が正常に物理削除できること。

### US4 に対するテスト実装
* [x] T030 [P] [US4] 要員の物理削除および削除制限に関する単体テストを `tests/unit/application/StaffService.delete.test.ts` に作成し、失敗することを確認する
* [x] T031 [P] [US4] 削除確認ダイアログの表示や削除制限時におけるエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/StaffView.delete.test.tsx` に作成し、失敗することを確認する

### US4 の実装
* [x] T032 [US4] `StaffService.deleteStaff()` 内で、契約・注文明細（`StaffOrderDetailRepository`）および要員工数サマリ（`StaffMonthlySummaryRepository`）の参照整合性チェックを行い、いずれかが存在する場合（一律）に削除を拒否し例外スローするチェックロジックを `src/application/services/StaffService.ts` に実装する
* [x] T033 [US4] 参照制約をクリアした場合にのみ、データストアから該当レコードを物理削除するリポジトリメソッド `delete()` のロジックを `InMemoryStaffRepository.ts` に実装する
* [x] T034 [US4] `StaffView.tsx` の各行に「削除」アクションを追加し、確認ダイアログを挟んで `StaffUseCase.deleteStaff()` を呼び出し、削除完了後のリスト再ロードおよび制約エラー発生時の警告表示ロジックを実装する

**Checkpoint**: 注文明細実績または工数サマリがある要員の削除制限、および参照のない要員の物理削除が正しく動作すること。

---

## Phase 7: LocalStorage 永続化の実装 (LocalStorage Persistence)

**Purpose**: ブラウザリロード後も要員データが保持されるように、本番用の LocalStorage リポジトリを実装し差し替える。

* [x] T035 本番用の `LocalStorageStaffRepository` を `src/infrastructure/persistence/LocalStorageStaffRepository.ts` に実装する（`findAll`, `findById`, `save`, `delete`, `nextIdentity` をすべて実装。空の時は自動シード化）
* [x] T036 `RepositoryRegistry.ts` 内で返却するリポジトリを、ブラウザ環境では `LocalStorageStaffRepository` に、テスト環境では `InMemoryStaffRepository` に動的に切り替えるロジックを実装する

**Checkpoint**: ブラウザの localStorage 内にJSON形式でデータが永続化され、リロード後もデータが完全に維持されること。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント、デザインの微調整、および受入検証シナリオの最終確認。

* [x] T037 `quickstart.md` に定義された全受入検証シナリオを実演し、すべての検証項目をクリアすることを確認する（`npm run build` による単一HTMLの直接起動確認も含む）
* [x] T038 UIのスタイリング調整（他マスタとグラスモルフィズムデザインの一貫性を高める調整）
* [x] T039 `README.md` の更新（要員マスタに関する起動方法、テスト手順の追記）
* [x] T040 [P] 未使用コードのクリーンアップ、TypeScriptコンパイルおよびテストがエラーなしで通ることを確認する

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
4. **検証**: テストを実行し、初期状態で画面に 4名のシード要員が表示されることを確認する。これが最初の実用インクリメント（MVP）となる。

### Incremental Delivery
1. 一覧表示（US1）の完了後、新規登録（US2）を実装し、動的なデータ追加を可能にする。
2. 登録ができるようになった後、情報変更（US3）を実装し、データの編集を可能にする。
3. 最後に、不要なデータの物理削除および制限（US4）を実装し、安全なデータのクリーンアップを可能にする。
4. 最終的に LocalStorage に結合し、ブラウザをリロードしても上記CRUD機能が永続化される状態を完成させる。
