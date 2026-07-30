# Tasks: Domain Model & CRUD Matrix Alignment

**Input**: Design documents from `/specs/012-domain-crud-alignment/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project SPA: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/ui/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and 3-tier DDD directory structure verification

- [x] T001 Verify project structure alignment in `src/domain/`, `src/application/`, `src/infrastructure/`, `src/ui/`
- [x] T002 [P] Verify TypeScript & build configuration in `tsconfig.json` and `vite.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain aggregate type definitions and base infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Update domain aggregate models definitions & types in `src/domain/models/types.ts` for all 15 aggregates
- [x] T004 [P] Verify base LocalStorage repository interfaces in `src/domain/repositories/IRepository.ts`
- [x] T005 Setup global validation & error handling helpers in `src/domain/validation/validator.ts`


**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 15ドメイン集約に基づく単一集約整合性操作 (Priority: P1) 🎯 MVP

**Goal**: Ensure all Command features (F01-F11) strictly modify only their primary aggregate root without side-effect writes to other aggregate stores.

**Independent Test**: Perform CRUD operations on Case (F05) and Order (F06) screens, verifying LocalStorage state to ensure only the target aggregate store is updated.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create Project aggregate root class in `src/domain/models/Project.ts`
- [x] T007 [P] [US1] Create Case aggregate root class & Detail member in `src/domain/models/Case.ts`
- [x] T008 [P] [US1] Create Order aggregate root class & Detail member in `src/domain/models/Order.ts`
- [x] T009 [P] [US1] Create EmployeeWorktime aggregate root class in `src/domain/models/EmployeeWorktime.ts`
- [x] T010 [P] [US1] Create Employee aggregate root class in `src/domain/models/Employee.ts`
- [x] T011 [P] [US1] Create Partner aggregate root class in `src/domain/models/Partner.ts`
- [x] T012 [P] [US1] Create Staff aggregate root class in `src/domain/models/Staff.ts`
- [x] T013 [P] [US1] Create Expense aggregate root class in `src/domain/models/Expense.ts`
- [x] T014 [US1] Refactor Case Command UseCase to enforce single-aggregate write in `src/application/usecases/SaveCaseUseCase.ts`
- [x] T015 [US1] Refactor Order Command UseCase to enforce single-aggregate write in `src/application/usecases/SaveOrderUseCase.ts`
- [x] T016 [US1] Refactor EmployeeWorktime Command UseCase in `src/application/usecases/SaveWorktimeUseCase.ts`


**Checkpoint**: At this point, User Story 1 is fully functional and guarantees single-aggregate mutation consistency across primary Command operations.

---

## Phase 4: User Story 2 - 単価設定および四半期区分管理機能の適用 (Priority: P2)

**Goal**: Implement EmployeeUnitPrice, StaffUnitPrice, and QuarterCategory domain models, usecases, and UI screens (F08, F09, F11).

**Independent Test**: Add and update monthly prices for employees/staff and change fiscal quarter boundaries; verify each aggregate persists independently.

### Implementation for User Story 2

- [x] T017 [P] [US2] Create EmployeeUnitPrice aggregate root & monthly detail in `src/domain/models/EmployeeUnitPrice.ts`
- [x] T018 [P] [US2] Create StaffUnitPrice aggregate root & monthly detail in `src/domain/models/StaffUnitPrice.ts`
- [x] T019 [P] [US2] Create QuarterCategory aggregate root in `src/domain/models/QuarterCategory.ts`
- [x] T020 [US2] Implement EmployeeUnitPrice UseCase in `src/application/usecases/SaveEmployeeUnitPriceUseCase.ts`
- [x] T021 [US2] Implement StaffUnitPrice UseCase in `src/application/usecases/SaveStaffUnitPriceUseCase.ts`
- [x] T022 [US2] Implement QuarterCategory UseCase in `src/application/usecases/SaveQuarterCategoryUseCase.ts`
- [x] T023 [P] [US2] Implement EmployeeUnitPrice management UI page in `src/ui/pages/EmployeeUnitPricePage.tsx`
- [x] T024 [P] [US2] Implement StaffUnitPrice management UI page in `src/ui/pages/StaffUnitPricePage.tsx`
- [x] T025 [P] [US2] Implement QuarterCategory management UI page in `src/ui/pages/QuarterCategoryPage.tsx`


**Checkpoint**: User Stories 1 AND 2 are both independently functional.

---

## Phase 5: User Story 3 - 参照画面におけるプル型オンデマンド算出 (Priority: P3)

**Goal**: Implement pull-based on-demand calculation queries for F12 Financial Summary, F13 Employee Worktime Summary, and F14 Staff Worktime Summary.

**Independent Test**: Modify worktime or price inputs and immediately navigate to Financial Summary (F12) to verify accurate, dynamic calculation of costs and gross profit within 1 second.

### Implementation for User Story 3

- [x] T026 [P] [US3] Implement Financial Summary Query Service in `src/application/queries/FinancialSummaryQuery.ts`
- [x] T027 [P] [US3] Implement Employee Worktime Summary Query Service in `src/application/queries/EmployeeWorktimeSummaryQuery.ts`
- [x] T028 [P] [US3] Implement Staff Worktime Summary Query Service in `src/application/queries/StaffWorktimeSummaryQuery.ts`
- [x] T029 [US3] Update Financial Summary UI page for on-demand calculation in `src/ui/pages/FinancialSummaryPage.tsx`
- [x] T030 [US3] Update Employee Worktime Summary UI page for on-demand calculation in `src/ui/pages/EmployeeWorktimeSummaryPage.tsx`
- [x] T031 [US3] Update Staff Worktime Summary UI page for on-demand calculation in `src/ui/pages/StaffWorktimeSummaryPage.tsx`


**Checkpoint**: All user stories are independently functional with pull-based eventual consistency.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, testing, and final polish across all stories

- [x] T032 [P] Verify quickstart validation scenarios in `specs/012-domain-crud-alignment/quickstart.md`
- [x] T033 [P] Run unit tests and type checks across all domain models and application usecases
- [x] T034 Run full build (`npm run build`) and verify standalone SPA execution


---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Phase 6)**: Depends on completion of desired user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase (Phase 2).
- **User Story 2 (P2)**: Can start after Foundational phase (Phase 2). Independent of US1.
- **User Story 3 (P3)**: Can start after Foundational phase (Phase 2). Uses data from US1 & US2 for on-demand calculation.

### Parallel Opportunities

- Tasks marked `[P]` within each phase can execute in parallel.
- Once Foundational phase completes, US1, US2, and US3 implementation can proceed in parallel where team capacity permits.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & Phase 2.
2. Complete Phase 3 (US1).
3. Validate single-aggregate mutation integrity.

### Incremental Delivery

1. Foundation ready.
2. Deliver US1 (Single aggregate mutation consistency MVP).
3. Deliver US2 (Prices and fiscal quarters management).
4. Deliver US3 (Pull-based summary query calculation).
