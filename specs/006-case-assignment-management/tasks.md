# Tasks: F06 案件作業契約（明細）管理

**Input**: Design documents from `/specs/006-case-assignment-management/`

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

* [x] T002 ドメインオブジェクト `CaseAssignment` クラスを `src/domain/models/CaseAssignment.ts` に作成し、読取専用エンティティインターフェース `ICaseAssignment` を `src/domain/models/types.ts` に追加・エクスポートする
* [x] T003 [P] リポジトリ契約 `CaseAssignmentRepository` を `src/domain/repositories/CaseAssignmentRepository.ts` に作成し、バレルファイルで再エクスポートする
* [x] T004 [P] アプリケーションユースケース契約 `CaseAssignmentUseCase` を `src/application/usecases/CaseAssignmentUseCase.ts` に作成し、バレルファイルで再エクスポートする
* [x] T005 [P] 【仮】その他経費リポジトリ `OtherExpenseRepository` を `src/domain/repositories/OtherExpenseRepository.ts` に作成し、バレルファイルで再エクスポートする
* [x] T006 [P] テストおよび初期開発用のインメモリリポジトリ `InMemoryCaseAssignmentRepository` を `src/infrastructure/persistence/InMemoryCaseAssignmentRepository.ts` に骨組みだけ実装する（既存の簡易スタブを置き換えて本格的なリポジトリとする）
* [x] T007 [P] 【仮】その他経費インメモリダミー `InMemoryOtherExpenseRepository` を `src/infrastructure/persistence/InMemoryOtherExpenseRepository.ts` に実装する
* [x] T008 [P] リポジトリレジストリ `src/infrastructure/persistence/RepositoryRegistry.ts` に `CaseAssignmentRepository` 等の登録・取得ロジックを追加する
* [x] T009 `CaseAssignmentUseCase` を実装する具象アプリケーションサービス `CaseAssignmentService` を `src/application/services/CaseAssignmentService.ts` に骨組みだけ実装する

**Checkpoint**: 基礎インフラストラクチャの定義完了。これ以降、各ユーザーストーリーの開発を並行して開始できる。

---

## Phase 3: User Story 1 - 案件作業明細一覧の表示と初期データ投入 (Priority: P1) 🎯 MVP

**Goal**: 登録されている案件作業明細の一覧をテーブル形式で画面表示し、初回起動時にはシードデータ（4件）が自動的にロードされて表示される。売上や粗利・粗利率が自動計算される。

**Independent Test**: LocalStorageやメモリ上のデータが空の状態でアプリを起動し、明細一覧を開いた際、初期シード明細 4件（WK001〜WK004）が売上、製造原価、粗利、粗利率とともに一覧テーブル上に自動で表示されること。

### US1 に対するテスト実装 (TDD推奨)
* [x] T010 [P] [US1] アプリ初回起動時のシードデータ投入および売上・原価・粗利の自動計算ユースケースのユニットテストを `tests/unit/application/CaseAssignmentService.list.test.ts` に作成し、失敗することを確認する
* [x] T011 [P] [US1] 明細一覧ビューの初期描画および自動計算項目の表示に関するUIテストを `tests/unit/infrastructure/ui/CaseAssignmentView.test.tsx` に作成し、失敗することを確認する

### US1 の実装
* [x] T012 [US1] `InMemoryCaseAssignmentRepository` の初期化時に、正本に定義された4件（WK001〜WK004）のデータを自動投入するシードロジックを `src/infrastructure/persistence/InMemoryCaseAssignmentRepository.ts` に実装する（製造原価計算用の発注・工数・経費のダミーデータも連動させる）
* [x] T013 [US1] プロジェクトIDおよび作業契約IDの順で全データを返却するリポジトリメソッド `findAll()` や、案件ID別データを取得する `findByCaseId()` を `src/infrastructure/persistence/InMemoryCaseAssignmentRepository.ts` に実装する
* [x] T014 [US1] `CaseAssignmentRepository.findAll()` 等を呼び出して一覧を返却するユースケース `CaseAssignmentService.getAssignments()` および `getAssignmentsByCase()` を `src/application/services/CaseAssignmentService.ts` に実装する
* [x] T015 [US1] 案件作業明細一覧をテーブル形式で描画するビューコンポーネント `CaseAssignmentView` を `src/infrastructure/ui/CaseAssignmentView.tsx` に実装する（プロジェクト名や案件名はそれぞれのマスタリポジトリを用いて動的に解決する）
* [x] T016 [US1] アプリのエントリポイント `src/App.tsx` を修正し、ナビゲーションに「アサイン契約」のタブを追加し、`CaseAssignmentView` をマウントして初期一覧表示の動作確認を行う

**Checkpoint**: 登録済み明細（初期データ含む）の一覧および自動計算項目が画面に正しく表示され、テストがすべてパスすること。

---

## Phase 4: User Story 2 - 新しい案件作業明細の追加登録 (Priority: P1)

**Goal**: プロジェクトと案件を選択し、開始日、契約工数、契約単価を入力して、プロジェクト別自動採番、期間重複・隙間なし検証をクリアした作業明細を新規登録できる。

**Independent Test**: 新規登録フォームに値を入力し登録した際、プロジェクト別でIDが自動採番されること、および期間に重複や隙間が存在する場合にエラーでブロックされること。

### US2 に対するテスト実装
* [x] T017 [P] [US2] 新規登録ユースケースの単体テスト（プロジェクト別自動採番、終了日の自動前日計算、工数・単価バリデーション、期間重複・隙間エラー）を `tests/unit/application/CaseAssignmentService.create.test.ts` に作成し、失敗することを確認する
* [x] T018 [P] [US2] 明細登録フォームのバリデーション表示や、期間隙間警告に関するUIテストを `tests/unit/infrastructure/ui/CaseAssignmentForm.test.tsx` に作成し、失敗することを確認する

### US2 の実装
* [x] T019 [US2] `InMemoryCaseAssignmentRepository.ts` に プロジェクト単位のID自動採番（WKnnn形式、最大値+1、欠番再利用なし）のロジック `nextIdentity(projectId)` を実装する
* [x] T020 [US2] `CaseAssignmentService.createAssignment()` において、案件存在検証、契約工数(>0)・単価(>=0)チェック、終了日の自動算出、期間重複・隙間バリデーション（全明細が案件の全期間を隙間なくカバーする検証）を行い、新規IDを付与して保存する登録処理を `src/application/services/CaseAssignmentService.ts` に実装する
* [x] T021 [US2] 新規登録用の入力フォームコンポーネント `CaseAssignmentForm` を `src/infrastructure/ui/CaseAssignmentForm.tsx` に実装する（親プロジェクトおよび案件の連動セレクトドロップダウンリストを表示する）
* [x] T022 [US2] 一覧ビュー `CaseAssignmentView.tsx` と登録フォーム `CaseAssignmentForm.tsx` を統合し、登録成功時に一覧が再描画される連携ロジックを実装する

**Checkpoint**: 明細登録操作が正常系・異常系・期間重複・隙間バリデーションを含めて正しく動作すること。

---

## Phase 5: User Story 3 - 案件作業明細の編集・更新 (Priority: P2)

**Goal**: 登録済みの明細の開始日、工数、単価を編集・変更でき、イミュータブル再構築、重複・隙間バリデーションをクリアしたものを更新できる。

**Independent Test**: 既存明細の編集画面を開き、情報を書き換えて保存した際、一覧画面に即座に反映され、親プロジェクトID・案件IDが非活性化されていること。

### US3 に対するテスト実装
* [x] T023 [P] [US3] 情報更新ユースケースの単体テスト（正常更新、プロジェクトID変更不可、期間重複エラー、隙間エラー、更新時の粗利率再計算検証）を `tests/unit/application/CaseAssignmentService.update.test.ts` に作成し、失敗することを確認する
* [x] T024 [P] [US3] 情報編集時の入力内容、IDフィールド非活性化、およびエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/CaseAssignmentForm.edit.test.tsx` に作成し、失敗することを確認する

### US3 の実装
* [x] T025 [US3] `CaseAssignmentService.updateAssignment()` において、存在確認、トリミング、工数・単価バリデーション、期間重複・隙間チェックを行い、イミュータブルに変更してリポジトリに保存する更新処理を `src/application/services/CaseAssignmentService.ts` に実装する（プロジェクトID、案件IDの変更は不可）
* [x] T026 [US3] `CaseAssignmentForm.tsx` に編集用初期値の読み込みモードを追加し、プロジェクト/案件セレクトの `disabled` 制御を実装し、保存時に `CaseAssignmentUseCase.updateAssignment()` を呼び出す編集ロジックを実装する
* [x] T027 [US3] `CaseAssignmentView.tsx` の各行に「編集」アクションを追加し、クリック時に選択された明細情報を `CaseAssignmentForm` に引き渡して編集用のフォームを開く統合ロジックを実装する（編集開始時には画面上部へスクロールさせる）

**Checkpoint**: 登録済みの明細情報の変更が、バリデーションを含めて正しく動作すること。

---

## Phase 6: User Story 4 - 案件作業明細の物理削除 (Priority: P2)

**Goal**: 不要な作業明細を物理削除する。ただし、発注、社員工数実績、その他経費に対象IDが参照されている明細の削除はブロックし警告を表示する。

**Independent Test**: 参照データが存在する明細の削除が拒否されること、参照のない明細が正常に物理削除できること。

### US4 に対するテスト実装
* [x] T028 [P] [US4] 明細の物理削除および参照整合性存在チェック削除制限に関する単体テストを `tests/unit/application/CaseAssignmentService.delete.test.ts` に作成し、失敗することを確認する
* [x] T029 [P] [US4] 削除確認ダイアログの表示や削除制限時におけるエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/CaseAssignmentView.delete.test.tsx` に作成し、失敗することを確認する

### US4 の実装
* [x] T030 [US4] `CaseAssignmentService.deleteAssignment()` 内で、発注（`PartnerOrderRepository`）、社員工数実績（`EmployeeWorkTimeRepository`）、その他経費（`OtherExpenseRepository`）の参照整合性チェックを行い、いずれかが存在する場合に削除を拒否し例外スローするチェックロジックを `src/application/services/CaseAssignmentService.ts` に実装する
* [x] T031 [US4] 参照制約をクリアした場合にのみ、データストアから該当レコードを物理削除するリポジトリメソッド `delete()` のロジックを `InMemoryCaseAssignmentRepository.ts` に実装する
* [x] T032 [US4] `CaseAssignmentView.tsx` の各行に「削除」アクションを追加し、確認ダイアログを挟んで `CaseAssignmentUseCase.deleteAssignment()` を呼び出し、削除完了後のリスト再ロードおよび制約エラー発生時の警告表示ロジックを実装する

**Checkpoint**: 発注・工数等がある明細の削除制限、および参照のない明細の物理削除が正しく動作すること。

---

## Phase 7: LocalStorage 永続化の実装 (LocalStorage Persistence)

**Purpose**: ブラウザリロード後もアサインデータが保持されるように、本番用の LocalStorage リポジトリを実装し差し替える。

* [x] T033 本番用の `LocalStorageCaseAssignmentRepository` を `src/infrastructure/persistence/LocalStorageCaseAssignmentRepository.ts` に実装する（`findAll`, `findByProjectId`, `findByCaseId`, `findById`, `save`, `delete`, `nextIdentity` をすべて実装。空の時は自動シード化）
* [x] T034 `RepositoryRegistry.ts` 内で返却するリポジトリを、ブラウザ環境では `LocalStorageCaseAssignmentRepository` に、テスト環境では `InMemoryCaseAssignmentRepository` に動的に切り替えるロジックを実装する

**Checkpoint**: ブラウザの localStorage 内にJSON形式でデータが永続化され、リロード後もデータが完全に維持されること。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント、デザインの微調整、および受入検証シナリオの最終確認。

* [x] T035 `quickstart.md` に定義された全受入検証シナリオを実演し、すべての検証項目をクリアすることを確認する（`npm run build` による単一HTMLの直接起動確認も含む）
* [x] T036 UIのスタイリング調整（他マスタとグラスモルフィズムデザインの一貫性を高める調整）
* [x] T037 `README.md` の更新（アサイン契約明細管理に関する起動方法、テスト手順の追記）
* [x] T038 [P] 未使用コード of クリーンアップ、TypeScriptコンパイルおよびテストがエラーなしで通ることを確認する

---

## Dependencies & Execution Order

### Phase Dependencies
* **Setup (Phase 1)**: 依存関係なし。
* **Foundational (Phase 2)**: Setup完了に依存。以降の全ユーザーストーリー開発をブロックする。
* **User Stories (Phase 3〜6)**: すべてFoundational（Phase 2）の完了に依存。
  * ユーザーストーリーは「一覧（US1）→ 新規登録（US2）→ 更新（US3）→ 削除（US4）」の順で順次実装・検証を進める。
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
4. **検証**: テストを実行し、初期状態で画面に 4件のシード明細が表示されることを確認する。これが最初の実用インクリメント（MVP）となる。

### Incremental Delivery
1. 一覧表示（US1）の完了後、新規登録（US2）を実装し、動的なデータ追加を可能にする。
2. 登録ができるようになった後、情報変更（US3）を実装し、データの編集を可能にする。
3. 最後に、不要なデータの物理削除および制限（US4）を実装し、安全なデータのクリーンアップを可能にする。
4. 最終的に LocalStorage に結合し、ブラウザをリロードしても上記CRUD機能が永続化される状態を完成させる。
