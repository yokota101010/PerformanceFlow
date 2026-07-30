import { QuarterCategory } from '../models';

export interface QuarterCategoryRepository {
  findAll(): Promise<readonly QuarterCategory[]>;
  findByQuarterCode(quarterCode: string): Promise<QuarterCategory | null>;
  save(entity: QuarterCategory): Promise<void>;
  delete(quarterCode: string): Promise<void>;
}
