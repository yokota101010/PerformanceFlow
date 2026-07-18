import {
  ProjectRepository,
  EmployeeRepository,
  EmployeeWorkTimeRepository,
  PartnerRepository,
  PartnerStaffRepository,
  PartnerOrderRepository,
} from '../../domain/repositories';
import { LocalStorageProjectRepository } from './LocalStorageProjectRepository';
import { LocalStorageEmployeeRepository } from './LocalStorageEmployeeRepository';
import { InMemoryEmployeeWorkTimeRepository } from './InMemoryEmployeeWorkTimeRepository';
import { InMemoryPartnerRepository } from './InMemoryPartnerRepository';
import { InMemoryPartnerStaffRepository } from './InMemoryPartnerStaffRepository';
import { InMemoryPartnerOrderRepository } from './InMemoryPartnerOrderRepository';
import { LocalStoragePartnerRepository } from './LocalStoragePartnerRepository';

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

  /**
   * プロジェクトリポジトリを登録する（テスト用モック注入）。
   */
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

  /**
   * 社員リポジトリを登録する（テスト用モック注入）。
   */
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

  /**
   * 社員工数リポジトリを登録する（テスト用モック注入）。
   */
  static registerEmployeeWorkTimeRepository(repository: EmployeeWorkTimeRepository): void {
    this.employeeWorkTimeRepository = repository;
  }

  /**
   * 発注先リポジトリを取得する。
   * テスト環境 (vitest) の場合は InMemory を、ブラウザ環境の場合は LocalStorage をデフォルトとする (T037)。
   */
  static getPartnerRepository(): PartnerRepository {
    if (!this.partnerRepository) {
      const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';
      if (isTest) {
        this.partnerRepository = new InMemoryPartnerRepository();
      } else {
        this.partnerRepository = new LocalStoragePartnerRepository();
      }
    }
    return this.partnerRepository;
  }

  /**
   * 発注先リポジトリを登録する（テスト用モック注入）。
   */
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

  /**
   * 【仮】要員所属リポジトリを登録する（テスト用モック注入）。
   */
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

  /**
   * 【仮】発注実績リポジトリを登録する（テスト用モック注入）。
   */
  static registerPartnerOrderRepository(repository: PartnerOrderRepository): void {
    this.partnerOrderRepository = repository;
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
  }
}
