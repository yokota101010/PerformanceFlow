import {
  ProjectRepository,
  EmployeeRepository,
  EmployeeWorkTimeRepository,
  PartnerRepository,
  PartnerStaffRepository,
  PartnerOrderRepository,
  StaffRepository,
  StaffOrderDetailRepository,
  StaffMonthlySummaryRepository,
  CaseRepository,
  CaseAssignmentRepository,
  OtherExpenseRepository,
  MonthlyMemberWorkHoursSummaryRepository,
} from '../../domain/repositories';
import { LocalStorageProjectRepository } from './LocalStorageProjectRepository';
import { LocalStorageEmployeeRepository } from './LocalStorageEmployeeRepository';
import { InMemoryEmployeeWorkTimeRepository } from './InMemoryEmployeeWorkTimeRepository';
import { LocalStorageEmployeeWorkTimeRepository } from './LocalStorageEmployeeWorkTimeRepository';
import { InMemoryPartnerRepository } from './InMemoryPartnerRepository';
import { InMemoryPartnerStaffRepository } from './InMemoryPartnerStaffRepository';
import { LocalStoragePartnerStaffRepository } from './LocalStoragePartnerStaffRepository';
import { InMemoryPartnerOrderRepository } from './InMemoryPartnerOrderRepository';
import { LocalStoragePartnerOrderRepository } from './LocalStoragePartnerOrderRepository';
import { LocalStoragePartnerRepository } from './LocalStoragePartnerRepository';
import { InMemoryStaffRepository } from './InMemoryStaffRepository';
import { LocalStorageStaffRepository } from './LocalStorageStaffRepository';
import { InMemoryStaffOrderDetailRepository } from './InMemoryStaffOrderDetailRepository';
import { LocalStorageStaffOrderDetailRepository } from './LocalStorageStaffOrderDetailRepository';
import { InMemoryStaffMonthlySummaryRepository } from './InMemoryStaffMonthlySummaryRepository';
import { LocalStorageStaffMonthlySummaryRepository } from './LocalStorageStaffMonthlySummaryRepository';
import { InMemoryCaseRepository } from './InMemoryCaseRepository';
import { LocalStorageCaseRepository } from './LocalStorageCaseRepository';
import { InMemoryCaseAssignmentRepository } from './InMemoryCaseAssignmentRepository';
import { LocalStorageCaseAssignmentRepository } from './LocalStorageCaseAssignmentRepository';
import { InMemoryOtherExpenseRepository } from './InMemoryOtherExpenseRepository';
import { LocalStorageOtherExpenseRepository } from './LocalStorageOtherExpenseRepository';
import { InMemoryMonthlyMemberWorkHoursSummaryRepository } from './InMemoryMonthlyMemberWorkHoursSummaryRepository';
import { LocalStorageMonthlyMemberWorkHoursSummaryRepository } from './LocalStorageMonthlyMemberWorkHoursSummaryRepository';

/**
 * リポジトリの具象インスタンスを一元管理するレジストリクラス。
 * 憲法に定める「直接の new 禁止」を強制し、シングルトンとしてインスタンスを提供する。
 */
export class RepositoryRegistry {
  private static projectRepository: ProjectRepository | null = null;
  private static employeeRepository: EmployeeRepository | null = null;
  private static employeeWorkTimeRepository: EmployeeWorkTimeRepository | null = null;
  
  private static partnerRepository: PartnerRepository | null = null;
  private static partnerStaffRepository: PartnerStaffRepository | null = null;
  private static partnerOrderRepository: PartnerOrderRepository | null = null;

  private static staffRepository: StaffRepository | null = null;
  private static staffOrderDetailRepository: StaffOrderDetailRepository | null = null;
  private static staffMonthlySummaryRepository: StaffMonthlySummaryRepository | null = null;

  private static caseRepository: CaseRepository | null = null;
  private static caseAssignmentRepository: CaseAssignmentRepository | null = null;
  private static otherExpenseRepository: OtherExpenseRepository | null = null;
  private static monthlyMemberWorkHoursSummaryRepository: MonthlyMemberWorkHoursSummaryRepository | null = null;

  private constructor() {
    // インスタンス化を禁止
  }

  /**
   * プロジェクトリポジトリを取得する。
   */
  static getProjectRepository(): ProjectRepository {
    if (!this.projectRepository) {
      this.projectRepository = new LocalStorageProjectRepository();
    }
    return this.projectRepository;
  }

  static registerProjectRepository(repository: ProjectRepository): void {
    this.projectRepository = repository;
  }

  /**
   * 社員リポジトリを取得する。
   */
  static getEmployeeRepository(): EmployeeRepository {
    if (!this.employeeRepository) {
      this.employeeRepository = new LocalStorageEmployeeRepository();
    }
    return this.employeeRepository;
  }

  static registerEmployeeRepository(repository: EmployeeRepository): void {
    this.employeeRepository = repository;
  }

  /**
   * 社員工数リポジトリを取得する。
   */
  static getEmployeeWorkTimeRepository(): EmployeeWorkTimeRepository {
    if (!this.employeeWorkTimeRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.employeeWorkTimeRepository = new InMemoryEmployeeWorkTimeRepository();
      } else {
        this.employeeWorkTimeRepository = new LocalStorageEmployeeWorkTimeRepository();
      }
    }
    return this.employeeWorkTimeRepository;
  }

  static registerEmployeeWorkTimeRepository(repository: EmployeeWorkTimeRepository): void {
    this.employeeWorkTimeRepository = repository;
  }

  /**
   * 発注先リポジトリを取得する。
   */
  static getPartnerRepository(): PartnerRepository {
    if (!this.partnerRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.partnerRepository = new InMemoryPartnerRepository();
      } else {
        this.partnerRepository = new LocalStoragePartnerRepository();
      }
    }
    return this.partnerRepository;
  }

  static registerPartnerRepository(repository: PartnerRepository): void {
    this.partnerRepository = repository;
  }

  /**
   * 要員所属参照リポジトリを取得する。
   */
  static getPartnerStaffRepository(): PartnerStaffRepository {
    if (!this.partnerStaffRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.partnerStaffRepository = new InMemoryPartnerStaffRepository();
      } else {
        this.partnerStaffRepository = new LocalStoragePartnerStaffRepository();
      }
    }
    return this.partnerStaffRepository;
  }

  static registerPartnerStaffRepository(repository: PartnerStaffRepository): void {
    this.partnerStaffRepository = repository;
  }

  /**
   * 【仮】発注実績リポジトリを取得する。
   */
  static getPartnerOrderRepository(): PartnerOrderRepository {
    if (!this.partnerOrderRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.partnerOrderRepository = new InMemoryPartnerOrderRepository();
      } else {
        this.partnerOrderRepository = new LocalStoragePartnerOrderRepository();
      }
    }
    return this.partnerOrderRepository;
  }

  static registerPartnerOrderRepository(repository: PartnerOrderRepository): void {
    this.partnerOrderRepository = repository;
  }

  /**
   * 要員リポジトリを取得する。
   */
  static getStaffRepository(): StaffRepository {
    if (!this.staffRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.staffRepository = new InMemoryStaffRepository();
      } else {
        this.staffRepository = new LocalStorageStaffRepository();
      }
    }
    return this.staffRepository;
  }

  static registerStaffRepository(repository: StaffRepository): void {
    this.staffRepository = repository;
  }

  /**
   * 注文明細参照リポジトリを取得する。
   */
  static getStaffOrderDetailRepository(): StaffOrderDetailRepository {
    if (!this.staffOrderDetailRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.staffOrderDetailRepository = new InMemoryStaffOrderDetailRepository();
      } else {
        this.staffOrderDetailRepository = new LocalStorageStaffOrderDetailRepository();
      }
    }
    return this.staffOrderDetailRepository;
  }

  static registerStaffOrderDetailRepository(repository: StaffOrderDetailRepository): void {
    this.staffOrderDetailRepository = repository;
  }

  /**
   * 工数サマリ参照リポジトリを取得する。
   */
  static getStaffMonthlySummaryRepository(): StaffMonthlySummaryRepository {
    if (!this.staffMonthlySummaryRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.staffMonthlySummaryRepository = new InMemoryStaffMonthlySummaryRepository();
      } else {
        this.staffMonthlySummaryRepository = new LocalStorageStaffMonthlySummaryRepository();
      }
    }
    return this.staffMonthlySummaryRepository;
  }

  static registerStaffMonthlySummaryRepository(repository: StaffMonthlySummaryRepository): void {
    this.staffMonthlySummaryRepository = repository;
  }

  /**
   * 案件リポジトリを取得する。
   * ※LocalStorageCaseRepository 実装まではデフォルトで InMemoryCaseRepository を使用する (T008)。
   */
  static getCaseRepository(): CaseRepository {
    if (!this.caseRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.caseRepository = new InMemoryCaseRepository();
      } else {
        this.caseRepository = new LocalStorageCaseRepository();
      }
    }
    return this.caseRepository;
  }

  static registerCaseRepository(repository: CaseRepository): void {
    this.caseRepository = repository;
  }

  /**
   * 【仮】アサイン（案件作業明細）リポジトリを取得する。
   */
  static getCaseAssignmentRepository(): CaseAssignmentRepository {
    if (!this.caseAssignmentRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.caseAssignmentRepository = new InMemoryCaseAssignmentRepository();
      } else {
        this.caseAssignmentRepository = new LocalStorageCaseAssignmentRepository();
      }
    }
    return this.caseAssignmentRepository;
  }

  static registerCaseAssignmentRepository(repository: CaseAssignmentRepository): void {
    this.caseAssignmentRepository = repository;
  }

  static getOtherExpenseRepository(): OtherExpenseRepository {
    if (!this.otherExpenseRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.otherExpenseRepository = new InMemoryOtherExpenseRepository();
      } else {
        this.otherExpenseRepository = new LocalStorageOtherExpenseRepository();
      }
    }
    return this.otherExpenseRepository;
  }

  static registerOtherExpenseRepository(repository: OtherExpenseRepository): void {
    this.otherExpenseRepository = repository;
  }

  static getMonthlyMemberWorkHoursSummaryRepository(): MonthlyMemberWorkHoursSummaryRepository {
    if (!this.monthlyMemberWorkHoursSummaryRepository) {
      const isTest = typeof globalThis !== 'undefined' && !!(globalThis as any).vitest;
      if (isTest) {
        this.monthlyMemberWorkHoursSummaryRepository = new InMemoryMonthlyMemberWorkHoursSummaryRepository();
      } else {
        this.monthlyMemberWorkHoursSummaryRepository = new LocalStorageMonthlyMemberWorkHoursSummaryRepository();
      }
    }
    return this.monthlyMemberWorkHoursSummaryRepository;
  }

  static registerMonthlyMemberWorkHoursSummaryRepository(repository: MonthlyMemberWorkHoursSummaryRepository): void {
    this.monthlyMemberWorkHoursSummaryRepository = repository;
  }

  /**
   * レジストリの状態をクリアする（テスト用）
   */
  static clear(): void {
    this.projectRepository = null;
    this.employeeRepository = null;
    this.employeeWorkTimeRepository = null;
    this.partnerRepository = null;
    this.partnerStaffRepository = null;
    this.partnerOrderRepository = null;
    this.staffRepository = null;
    this.staffOrderDetailRepository = null;
    this.staffMonthlySummaryRepository = null;
    this.caseRepository = null;
    this.caseAssignmentRepository = null;
    this.otherExpenseRepository = null;
    this.monthlyMemberWorkHoursSummaryRepository = null;
  }
}
