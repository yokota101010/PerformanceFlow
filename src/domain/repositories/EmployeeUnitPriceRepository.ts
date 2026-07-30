import { EmployeeUnitPrice } from '../models';

export interface EmployeeUnitPriceRepository {
  findAll(): Promise<readonly EmployeeUnitPrice[]>;
  findByEmployeeId(employeeId: string): Promise<EmployeeUnitPrice | null>;
  save(entity: EmployeeUnitPrice): Promise<void>;
  delete(id: string): Promise<void>;
}
