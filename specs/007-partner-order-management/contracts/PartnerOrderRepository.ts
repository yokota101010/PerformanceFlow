import { PartnerOrder } from '../../../src/domain/models/PartnerOrder';

export interface PartnerOrderRepository {
  findAll(): Promise<readonly PartnerOrder[]>;
  findById(id: string): Promise<PartnerOrder | null>;
  findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly PartnerOrder[]>;
  existsByKeys(caseAssignmentId: string, targetMonth: string, partnerId: string): Promise<boolean>;
  existsByPartnerId(partnerId: string): Promise<boolean>;
  existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean>;
  sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number>;
  save(order: PartnerOrder): Promise<void>;
  delete(id: string): Promise<void>;
  nextIdentity(): Promise<string>;
}
