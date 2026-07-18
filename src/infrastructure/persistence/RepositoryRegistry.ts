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
} from '../../domain/repositories';
import { LocalStorageProjectRepository } from './LocalStorageProjectRepository';
import { LocalStorageEmployeeRepository } from './LocalStorageEmployeeRepository';
import { InMemoryEmployeeWorkTimeRepository } from './InMemoryEmployeeWorkTimeRepository';
import { InMemoryPartnerRepository } from './InMemoryPartnerRepository';
import { InMemoryPartnerStaffRepository } from './InMemoryPartnerStaffRepository';
import { InMemoryPartnerOrderRepository } from './InMemoryPartnerOrderRepository';
import { LocalStoragePartnerRepository } from './LocalStoragePartnerRepository';
import { InMemoryStaffRepository } from './InMemoryStaffRepository';
import { LocalStorageStaffRepository } from './LocalStorageStaffRepository';
import { InMemoryStaffOrderDetailRepository } from './InMemoryStaffOrderDetailRepository';
import { InMemoryStaffMonthlySummaryRepository } from './InMemoryStaffMonthlySummaryRepository';
import { InMemoryCaseRepository } from './InMemoryCaseRepository';
import { LocalStorageCaseRepository } from './LocalStorageCaseRepository';
import { InMemoryCaseAssignmentRepository } from './InMemoryCaseAssignmentRepository';

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
      this.employeeWorkTimeRepository = new InMemoryEmployeeWorkTimeRepository();
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
   * 【仮】要員所属リポジトリを取得する。
   */
  static getPartnerStaffRepository(): PartnerStaffRepository {
    if (!this.partnerStaffRepository) {
      this.partnerStaffRepository = new InMemoryPartnerStaffRepository();
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
      this.partnerOrderRepository = new InMemoryPartnerOrderRepository();
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
   * 【仮】注文明細リポジトリを取得する。
   */
  static getStaffOrderDetailRepository(): StaffOrderDetailRepository {
    if (!this.staffOrderDetailRepository) {
      this.staffOrderDetailRepository = new InMemoryStaffOrderDetailRepository();
    }
    return this.staffOrderDetailRepository;
  }

  static registerStaffOrderDetailRepository(repository: StaffOrderDetailRepository): void {
    this.staffOrderDetailRepository = repository;
  }

  /**
   * 【仮】工数サマリリポジトリを取得する。
   */
  static getStaffMonthlySummaryRepository(): StaffMonthlySummaryRepository {
    if (!this.staffMonthlySummaryRepository) {
      this.staffMonthlySummaryRepository = new InMemoryStaffMonthlySummaryRepository();
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
      this.caseAssignmentRepository = new InMemoryCaseAssignmentRepository();
    }
    return this.caseAssignmentRepository;
  }

  static registerCaseAssignmentRepository(repository: CaseAssignmentRepository): void {
    this.caseAssignmentRepository = repository;
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
  }
}
