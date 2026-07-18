# Tasks: F03 発注先マスタ管理

**Input**: Design documents from `/specs/003-partner-management/`

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

* [ ] T001 ドメインモデルインポートの競合を回避するため、`src/domain/models/index.ts` の型・クラス再エクスポート設定を整理する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ユーザーストーリーの実装を開始する前に必須となる、クリーンアーキテクチャの基本定義、仮リポジトリ契約、およびレジストリの実装。

**⚠️ CRITICAL**: 本フェーズが完了するまで、個々のユーザーストーリーのコーディングを開始してはならない。

* [ ] T002 ドメインオブジェクト `Partner` クラスを `src/domain/models/Partner.ts` に作成し、読取専用エンティティインターフェース `IPartner` を `src/domain/models/types.ts` に追加・エクスポートする
* [ ] T003 [P] リポジトリ契約 `PartnerRepository` を `src/domain/repositories/PartnerRepository.ts` に作成し、バレルファイルで再エクスポートする
* [ ] T004 [P] アプリケーションユースケース契約 `PartnerUseCase` を `src/application/usecases/PartnerUseCase.ts` に作成し、バレルファイルで再エクスポートする
* [ ] T005 [P] 【仮】要員所属存在チェックリポジトリ `PartnerStaffRepository` を `src/domain/repositories/PartnerStaffRepository.ts` に作成し、バレルファイルで再エクスポートする
* [ ] T006 [P] 【仮】発注実績存在チェックリポジトリ `PartnerOrderRepository` を `src/domain/repositories/PartnerOrderRepository.ts` に作成し、バレルファイルで再エクスポートする
* [ ] T007 [P] テストおよび初期開発用のインメモリリポジトリ `InMemoryPartnerRepository` を `src/infrastructure/persistence/InMemoryPartnerRepository.ts` に骨組みだけ実装する
* [ ] T008 [P] 【仮】要員所属インメモリダミー `InMemoryPartnerStaffRepository` を `src/infrastructure/persistence/InMemoryPartnerStaffRepository.ts` に実装する
* [ ] T009 [P] 【仮】発注実績インメモリダミー `InMemoryPartnerOrderRepository` を `src/infrastructure/persistence/InMemoryPartnerOrderRepository.ts` に実装する
* [ ] T010 [P] リポジトリレジストリ `src/infrastructure/persistence/RepositoryRegistry.ts` に `PartnerRepository` 等の登録・取得ロジックを追加する
* [ ] T011 `PartnerUseCase` を実装する具象アプリケーションサービス `PartnerService` を `src/application/services/PartnerService.ts` に骨組みだけ実装する

**Checkpoint**: 基礎インフラストラクチャの定義完了。これ以降、各ユーザーストーリーの開発を並行して開始できる。

---

## Phase 3: User Story 1 - 発注先一覧の表示と初期データ投入 (Priority: P1) 🎯 MVP

**Goal**: 登録されている発注先の一覧をテーブル形式で画面表示し、初回起動時にはシードデータ（Ａソフトウェアら2社）が自動的にロードされて表示される。

**Independent Test**: LocalStorageやメモリ上のデータが空の状態でアプリを起動し、発注先マスタ画面を開いた際、初期シード発注先 2社（BP001, BP002）が一覧テーブル上に自動で表示されること。

### US1 に対するテスト実装 (TDD推奨)
* [ ] T012 [P] [US1] アプリ初回起動時のシードデータ投入および一覧取得ユースケースのユニットテストを `tests/unit/application/PartnerService.list.test.ts` に作成し、失敗することを確認する
* [ ] T013 [P] [US1] 発注先一覧ビューの初期描画およびシードデータ表示に関するUIテストを `tests/unit/infrastructure/ui/PartnerView.test.tsx` に作成し、失敗することを確認する

### US1 の実装
* [ ] T014 [US1] `InMemoryPartnerRepository` の初期化時に、正本に定義された2社（BP001, BP002）のデータを自動投入するシードロジックを `src/infrastructure/persistence/InMemoryPartnerRepository.ts` に実装する
* [ ] T015 [US1] 発注先IDの昇順で全データを返却するリポジトリメソッド `findAll()` を `src/infrastructure/persistence/InMemoryPartnerRepository.ts` に実装する
* [ ] T016 [US1] `PartnerRepository.findAll()` を呼び出して一覧を返却するユースケース `PartnerService.getPartners()` を `src/application/services/PartnerService.ts` に実装する
* [ ] T017 [US1] 発注先一覧をテーブル形式で描画するビューコンポーネント `PartnerView` を `src/infrastructure/ui/PartnerView.tsx` に実装する（UI表示時に `PartnerUseCase.getPartners()` を呼び出す）
* [ ] T018 [US1] アプリのエントリポイント `src/App.tsx` を修正し、ナビゲーションに「発注先マスタ」のタブを追加し、`PartnerView` をマウントして初期一覧表示の動作確認を行う

**Checkpoint**: 登録済み発注先（初期データ含む）の一覧が画面に正しく表示され、テストがすべてパスすること。

---

## Phase 4: User Story 2 - 新しい発注先の追加登録 (Priority: P1)

**Goal**: 発注先名を入力し、自動採番（最大値+1、欠番再利用なし）、重複登録禁止（一意制約）、前後の空白トリミングをパスした発注先を新規登録できる。

**Independent Test**: 新規登録フォームにすでに存在する発注先名を入力した際にエラーでブロックされること、前後にスペースが含まれる名称を入力した際にトリミングされて登録されること。

### US2 に対するテスト実装
* [ ] T019 [P] [US2] 新規登録ユースケースの単体テスト（正常系採番、トリミング検証、必須エラー、重複名禁止エラー検証）を `tests/unit/application/PartnerService.create.test.ts` に作成し、失敗することを確認する
* [ ] T020 [P] [US2] 発注先登録フォームのバリデーション表示やエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/PartnerForm.test.tsx` に作成し、失敗することを確認する

### US2 の実装
* [ ] T021 [US2] `InMemoryPartnerRepository.ts` に ID自動採番（BPnnn形式、最大値+1、欠番再利用なし）のロジック `nextIdentity()` を実装する
* [ ] T022 [US2] `InMemoryPartnerRepository.ts` に名前による検索メソッド `findByName()` を実装する（一意性検証用）
* [ ] T023 [US2] `PartnerService.createPartner()` において、名前の前後スペースのトリミング、必須チェック、およびリポジトリ検索による名前の重複チェックを行い、新規IDを付与してリポジトリに保存する登録処理を `src/application/services/PartnerService.ts` に実装する
* [ ] T024 [US2] 新規登録用の入力フォームコンポーネント `PartnerForm` を `src/infrastructure/ui/PartnerForm.tsx` に実装する（登録成功時の更新通知、バリデーション・重複エラーのメッセージ表示を制御）
* [ ] T025 [US2] 一覧ビュー `PartnerView.tsx` と登録フォーム `PartnerForm.tsx` を統合し、登録成功時に一覧が再描画される連携ロジックを実装する

**Checkpoint**: 取引先登録操作が正常系・異常系・重複ブロックを含めて正しく動作すること。

---

## Phase 5: User Story 3 - 発注先情報の編集・更新 (Priority: P2)

**Goal**: 登録済みの発注先の名前を編集・変更でき、トリミング、自分以外の重複名禁止のバリデーションをパスしたものを更新できる。

**Independent Test**: 既存発注先の編集画面を開き、すでに存在する別の発注先名に書き換えて保存しようとした際にエラーで拒否されること。

### US3 に対するテスト実装
* [ ] T026 [P] [US3] 情報更新ユースケースの単体テスト（正常更新、トリミング検証、自分以外の重複名エラー検証）を `tests/unit/application/PartnerService.update.test.ts` に作成し、失敗することを確認する
* [ ] T027 [P] [US3] 発注先名編集時の入力内容およびエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/PartnerForm.edit.test.tsx` に作成し、失敗することを確認する

### US3 の実装
* [ ] T028 [US3] `PartnerService.updatePartner()` において、存在確認、トリミング、必須チェック、および自分以外のIDでの名前重複チェックを行い、イミュータブルに変更してリポジトリに保存する更新処理を `src/application/services/PartnerService.ts` に実装する
* [ ] T029 [US3] `PartnerForm.tsx` に編集用初期値の読み込みモードを追加し、更新実行ボタンクリック時に `PartnerUseCase.updatePartner()` を呼び出す編集ロジックを実装する
* [ ] T030 [US3] `PartnerView.tsx` の各行に「編集」アクションを追加し、クリック時に選択された発注先情報を `PartnerForm` に引き渡して編集用のフォームを開く統合ロジックを実装する

**Checkpoint**: 登録済みの取引先情報の変更が、重複検証を含めて正しく動作すること。

---

## Phase 6: User Story 4 - 発注先の物理削除 (Priority: P2)

**Goal**: 不要な発注先を物理削除する。ただし、要員（所属会社）や発注（注文実績）に対象IDが参照されている発注先の削除はブロックし警告を表示する。

**Independent Test**: 要員が所属しているか、または発注レコードが存在する発注先の削除が拒否されること、いずれの参照もない発注先が正常に物理削除できること。

### US4 に対するテスト実装
* [ ] T031 [P] [US4] 社員の物理削除および削除制限に関する単体テストを `tests/unit/application/PartnerService.delete.test.ts` に作成し、失敗することを確認する
* [ ] T032 [P] [US4] 削除確認ダイアログの表示や削除制限時におけるエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/PartnerView.delete.test.tsx` に作成し、失敗することを確認する

### US4 の実装
* [ ] T033 [US4] `PartnerService.deletePartner()` 内で、所属要員（`PartnerStaffRepository`）および発注（`PartnerOrderRepository`）の参照整合性チェックを行い、いずれかが存在する場合（一律）に削除を拒否し例外スローするチェックロジックを `src/application/services/PartnerService.ts` に実装する
* [ ] T034 [US4] 参照制約をクリアした場合にのみ、データストアから該当レコードを物理削除するリポジトリメソッド `delete()` のロジックを `InMemoryPartnerRepository.ts` に実装する
* [ ] T035 [US4] `PartnerView.tsx` の各行に「削除」アクションを追加し、確認ダイアログを挟んで `PartnerUseCase.deletePartner()` を呼び出し、削除完了後のリスト再ロードおよび制約エラー発生時の警告表示ロジックを実装する

**Checkpoint**: 要員所属または発注実績がある発注先の削除制限、および参照のない発注先の物理削除が正しく動作すること。

---

## Phase 7: LocalStorage 永続化の実装 (LocalStorage Persistence)

**Purpose**: ブラウザリロード後も発注先データが保持されるように、本番用の LocalStorage リポジトリを実装し差し替える。

* [ ] T036 本番用の `LocalStoragePartnerRepository` を `src/infrastructure/persistence/LocalStoragePartnerRepository.ts` に実装する（`findAll`, `findById`, `findByName`, `save`, `delete`, `nextIdentity` をすべて実装。空の時は自動シード化）
* [ ] T037 `RepositoryRegistry.ts` 内で返却するリポジトリを、ブラウザ環境では `LocalStoragePartnerRepository` に、テスト環境では `InMemoryPartnerRepository` に動的に切り替えるロジックを実装する

**Checkpoint**: ブラウザの localStorage 内にJSON形式でデータが永続化され、リロード後もデータが完全に維持されること。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント、デザインの微調整、および受入検証シナリオの最終確認。

* [ ] T038 `quickstart.md` に定義された全受入検証シナリオを実演し、すべての検証項目をクリアすることを確認する（`npm run build` による単一HTMLの直接起動確認も含む）
* [ ] T039 UIのスタイリング調整（プロジェクト・社員マスタとグラスモルフィズムデザインの一貫性を高める調整）
* [ ] T040 `README.md` の更新（発注先マスタに関する起動方法、テスト手順の追記）
* [ ] T041 [P] 未使用コードのクリーンアップ、TypeScriptコンパイルおよびテストがエラーなしで通ることを確認する

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
4. **検証**: テストを実行し、初期状態で画面に 2社のシード発注先が表示されることを確認する。これが最初の実用インクリメント（MVP）となる。

### Incremental Delivery
1. 一覧表示（US1）の完了後、新規登録（US2）を実装し、動的なデータ追加を可能にする。
2. 登録ができるようになった後、名称変更（US3）を実装し、データの編集を可能にする。
3. 最後に、不要なデータの物理削除および制限（US4）を実装し、安全なデータのクリーンアップを可能にする。
4. 最終的に LocalStorage に結合し、ブラウザをリロードしても上記CRUD機能が永続化される状態を完成させる。
