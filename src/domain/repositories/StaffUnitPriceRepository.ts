import { StaffUnitPrice } from '../models';

export interface StaffUnitPriceRepository {
  findAll(): Promise<readonly StaffUnitPrice[]>;
  findByStaffId(staffId: string): Promise<StaffUnitPrice | null>;
  save(entity: StaffUnitPrice): Promise<void>;
  delete(id: string): Promise<void>;
}
