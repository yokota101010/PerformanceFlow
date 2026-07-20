# Tasks: F07 発注（注文）管理

**Input**: Design documents from `/specs/007-partner-order-management/`

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

* [x] T001 ドメインモデルインポートおよびリポジトリインポートのバレルファイルに F07 向けモジュールのエクスポート定義を追加する (`src/domain/models/index.ts` および `src/domain/repositories/index.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ユーザーストーリーの実装を開始する前に必須となる、クリーンアーキテクチャの基本定義、リポジトリ契約、およびレジストリの実装。

**⚠️ CRITICAL**: 本フェーズが完了するまで、個々のユーザーストーリーのコーディングを開始してはならない。

* [x] T002 ドメインオブジェクト `PartnerOrder` クラスおよび `OrderDetail` クラスを `src/domain/models/PartnerOrder.ts` に作成し、工数範囲（0.0〜1.0人月）と所属会社一致 of コンストラクタバリデーションを実装する
* [x] T003 読取専用ドメインインターフェース `IPartnerOrder` および `IOrderDetail` を `src/domain/models/types.ts` に追加・エクスポートする
* [x] T004 [P] リポジトリ契約 `PartnerOrderRepository` を `src/domain/repositories/PartnerOrderRepository.ts` に作成し、バレルファイルで再エクスポートする
* [x] T005 [P] アプリケーションユースケース契約 `PartnerOrderUseCase` を `src/application/usecases/PartnerOrderUseCase.ts` に作成し、バレルファイルで再エクスポートする
* [x] T006 [P] テストおよび初期開発用のインメモリリポジトリ `InMemoryPartnerOrderRepository` を `src/infrastructure/persistence/InMemoryPartnerOrderRepository.ts` に骨組みだけ実装する（既存 of スタブを置き換えて本格的なリポジトリとする）
* [x] T007 [P] リポジトリレジストリ `src/infrastructure/persistence/RepositoryRegistry.ts` に `PartnerOrderRepository` の登録・取得ロジックを追加する
* [x] T008 `PartnerOrderUseCase` を実装する具象アプリケーションサービス `PartnerOrderService` を `src/application/services/PartnerOrderService.ts` に骨組みだけ実装する

**Checkpoint**: 基礎インフラストラクチャの定義完了。これ以降、各ユーザーストーリーの開発を並行して開始できる。

---

## Phase 3: User Story 1 - 発注および注文明細の一覧表示と自動計算 (Priority: P1) 🎯 MVP

**Goal**: 登録されている発注情報の一覧をテーブル形式で画面表示し、初回起動時にはシードデータ（6件）が自動的にロードされて表示される。明細データから全体の合計工数・合計発注額が自動計算される。

**Independent Test**: LocalStorageやメモリ上のデータが空の状態でアプリを起動し、発注一覧を開いた際、初期シード明細 6件（ORD001〜ORD006）が合計工数、合計発注額とともに一覧テーブル上に自動で表示され、詳細をクリックした際に対応する明細が展開されること。

### US1 に対するテスト実装 (TDD推奨)
* [x] T009 [P] [US1] アプリ初回起動時のシードデータ投入および工数・金額の自動計算ユースケースのユニットテストを `tests/unit/application/PartnerOrderService.list.test.ts` に作成し、失敗することを確認する
* [x] T010 [P] [US1] 一覧ビューの初期描画および自動計算項目の表示に関するUIテストを `tests/unit/infrastructure/ui/PartnerOrderView.test.tsx` に作成し、失敗することを確認する

### US1 の実装
* [x] T011 [US1] `InMemoryPartnerOrderRepository` の初期化時に、正本に定義された6件（ORD001〜ORD006）のデータおよびそれに紐づく注文明細を自動投入するシードロジックを `src/infrastructure/persistence/InMemoryPartnerOrderRepository.ts` に実装する
* [x] T012 [US1] 注文IDの順で全データを返却するリポジトリメソッド `findAll()` や、案件アサインID別データを取得する `findByCaseAssignmentId()` を `src/infrastructure/persistence/InMemoryPartnerOrderRepository.ts` に実装する
* [x] T013 [US1] `PartnerOrderRepository.findAll()` 等を呼び出して一覧および詳細を返却するユースケース `PartnerOrderService.getOrders()` および `getOrderById()` を `src/application/services/PartnerOrderService.ts` に実装する
* [x] T014 [US1] 発注一覧および注文明細詳細をテーブル形式で描画するビューコンポーネント `PartnerOrderView` を `src/infrastructure/ui/PartnerOrderView.tsx` に実装する（発注先名は発注先マスタリポジトリを用いて動的に解決する）
* [x] T015 [US1] アプリのエントリポイント `src/App.tsx` を修正し、ナビゲーションに「発注管理」のタブを追加し、`PartnerOrderView` をマウントして初期一覧表示の動作確認を行う

**Checkpoint**: 登録済み発注（初期データ含む）の一覧および自動計算項目が画面に正しく表示され、テストがすべてパスすること。

---

## Phase 4: User Story 2 - 新しい案件作業明細の追加登録 (Priority: P1)

**Goal**: 作業契約、発注先、年月を選択して新しい発注を作成し、そこに紐づく要員アサイン明細を追加登録できる。

**Independent Test**: 新規登録フォームに値を入力し登録した際、注文IDが自動採番されること、および年月期間外エラーや所属会社不一致エラーでブロックされること。

### US2 に対するテスト実装
* [x] T016 [P] [US2] 新規登録ユースケースの単体テスト（自動採番、年月期間外エラー、要員所属会社不一致エラー、重複登録 UQ1 エラー）を `tests/unit/application/PartnerOrderService.create.test.ts` に作成し、失敗することを確認する
* [x] T017 [P] [US2] 新規登録フォームのバリデーション表示やエラー警告に関するUIテストを `tests/unit/infrastructure/ui/PartnerOrderForm.test.tsx` に作成し、失敗することを確認する

### US2 の実装
* [x] T018 [US2] `InMemoryPartnerOrderRepository.ts` に 注文ID自動採番（`nextIdentity`）および一意性重複チェック（`existsByKeys`）を実装する
* [x] T019 [US2] `PartnerOrderService.createOrder()` において、年月期間外バリデーション（アサイン期間との重なりチェック）、重複登録 UQ1 バリデーションを行い、新規IDを付与して保存する登録処理を `src/application/services/PartnerOrderService.ts` に実装する
* [x] T020 [US2] 新規登録および明細行のグリッド追加を行う入力フォームコンポーネント `PartnerOrderForm` を `src/infrastructure/ui/PartnerOrderForm.tsx` に実装する（要員セレクトボックスは発注先所属要員に限定する）
* [x] T021 [US2] 一覧ビュー `PartnerOrderView.tsx` と登録フォーム `PartnerOrderForm.tsx` を統合し、登録成功時に一覧が再描画される連携ロジックを実装する

**Checkpoint**: 発注登録操作が正常系・異常系・バリデーションを含めて正しく動作すること。

---

## Phase 5: User Story 3 - 発注情報の編集・更新 (Priority: P2)

**Goal**: 登録済みの発注データおよび注文明細（工数の増減、明細の追加・削除）を編集・更新できる。

**Independent Test**: 既存発注の編集画面を開き、情報を書き換えて保存した際、一覧画面に即座に反映され、合計工数・合計発注額が再計算されること。

### US3 に対するテスト実装
* [x] T022 [P] [US3] 情報更新ユースケースの単体テスト（正常更新、明細の追加・削除に伴う再計算、工数値の範囲バリデーション）を `tests/unit/application/PartnerOrderService.update.test.ts` に作成し、失敗することを確認する
* [x] T023 [P] [US3] 情報編集時の入力内容およびエラーメッセージ描画に関するUIテストを `tests/unit/infrastructure/ui/PartnerOrderForm.edit.test.tsx` に作成し、失敗することを確認する

### US3 の実装
* [x] T024 [US3] `PartnerOrderService.updateOrderDetails()` において、存在確認、工数値チェック、イミュータブルに変更してリポジトリに保存する更新処理を `src/application/services/PartnerOrderService.ts` に実装する
* [x] T025 [US3] `PartnerOrderForm.tsx` に編集用初期値の読み込みモードを追加し、明細行のインライン追加・削除・工数編集グリッドを実装し、保存時に `PartnerOrderUseCase.updateOrderDetails()` を呼び出す編集ロジックを実装する
* [x] T026 [US3] `PartnerOrderView.tsx` の各行に「編集」アクションを追加し、クリック時に選択された発注情報を `PartnerOrderForm` に引き渡して編集用のフォームを開く統合ロジックを実装する

**Checkpoint**: 登録済みの発注情報の変更が、バリデーションを含めて正しく動作すること。

---

## Phase 6: User Story 4 - 発注データの物理削除 (Priority: P2)

**Goal**: 不要になった発注データを物理削除し、対応する注文明細データもカスケード削除する。

**Independent Test**: 削除を実行した際、一覧から消去され、リポジトリ上からも消滅すること。

### US4 に対するテスト実装
* [x] T027 [P] [US4] 発注データの物理削除およびカスケード削除に関する単体テストを `tests/unit/application/PartnerOrderService.delete.test.ts` に作成し、失敗することを確認する
* [x] T028 [P] [US4] 削除確認ダイアログの表示や一覧再描画に関するUIテストを `tests/unit/infrastructure/ui/PartnerOrderView.delete.test.tsx` に作成し、失敗することを確認する

### US4 の実装
* [x] T029 [US4] `InMemoryPartnerOrderRepository.ts` に `delete(id)` を実装し、発注および注文明細をカスケード削除するロジックを実装する
* [x] T030 [US4] `PartnerOrderService.deleteOrder()` の物理削除ユースケースを `src/application/services/PartnerOrderService.ts` に実装する
* [x] T031 [US4] `PartnerOrderView.tsx` の各行に「削除」アクションを追加し、確認ダイアログを挟んで `PartnerOrderUseCase.deleteOrder()` を呼び出し、削除完了後のリスト再ロードロジックを実装する

**Checkpoint**: 物理削除およびカスケード削除が正しく動作すること。

---

## Phase 7: LocalStorage 永続化の実装 (LocalStorage Persistence)

**Purpose**: ブラウザリロード後も発注データが保持されるように、本番用の LocalStorage リポジトリを実装し差し替える。

* [x] T032 本番用の `LocalStoragePartnerOrderRepository` を `src/infrastructure/persistence/LocalStoragePartnerOrderRepository.ts` に実装する（`findAll`, `findById`, `findByCaseAssignmentId`, `existsByKeys`, `existsByPartnerId`, `existsByCaseAssignmentId`, `sumByCaseAssignmentId`, `save`, `delete`, `nextIdentity` をすべて実装。空の時は自動シード化）
* [x] T033 `RepositoryRegistry.ts` 内で返却するリポジトリを、ブラウザ環境では `LocalStoragePartnerOrderRepository` に、テスト環境では `InMemoryPartnerOrderRepository` に動的に切り替えるロジックを実装する

**Checkpoint**: ブラウザの localStorage 内にJSON形式でデータが永続化され、リロード後もデータが完全に維持されること。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 製造原価計算とのプル同期結合、デザインの微調整、および受入検証シナリオの最終確認。

* [x] T034 `quickstart.md` に定義された全受入検証シナリオを実演し、すべての検証項目をクリアすることを確認する
* [x] T035 案件作業アサイン (F06) 側の製造原価動的集計ロジックにおいて、今回実装した `PartnerOrderRepository.sumByCaseAssignmentId` の具象メソッドを繋ぎ込み、アサイン明細の製造原価・粗利率が発注金額と連動して再集計されるようにプル型結果整合性ロジックを結合・統合する
* [x] T036 [P] 未使用コードのクリーンアップ、TypeScriptコンパイルおよびテストがエラーなしで通ることを確認する

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

## Parallel Example: User Story 1

```bash
# US1 のユースケーステストとUIテストを並行して作成する:
Task: "アプリ初回起動時のシードデータ投入および工数・金額の自動計算ユースケースのユニットテストを tests/unit/application/PartnerOrderService.list.test.ts に作成"
Task: "一覧ビューの初期描画および自動計算項目の表示に関するUIテストを tests/unit/infrastructure/ui/PartnerOrderView.test.tsx に作成"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. **Phase 1: Setup** を完了する。
2. **Phase 2: Foundational** を完了する。
3. **Phase 3: User Story 1**（一覧表示・初期データ表示）を実装する。
4. **検証**: テストを実行し、初期状態で画面に 6件のシード発注が表示され、合計金額が自動計算されることを確認する。これが最初の実用インクリメント（MVP）となる。

### Incremental Delivery
1. 一覧表示（US1）の完了後、新規登録（US2）を実装し、動的なデータ追加を可能にする。
2. 登録ができるようになった後、情報変更（US3）を実装し、データの編集を可能にする。
3. 最後に、不要なデータの物理削除およびカスケード削除（US4）を実装し、安全なデータのクリーンアップを可能にする。
4. 最終的に LocalStorage に結合し、ブラウザをリロードしても上記CRUD機能が永続化される状態を完成させる。
5. 最後に F06 の製造原価計算に結合させ、システム間（アサイン契約と発注）の結果整合性を完成させる。
