import { QuarterCategory as IQuarterCategory } from './types';
import { assertNonEmptyString, assertValidYearMonth } from '../validation/validator';

export class QuarterCategory implements IQuarterCategory {
  readonly quarterCode: string;
  readonly fiscalYear: number;
  readonly quarterName: string;
  readonly startYearMonth: string;
  readonly endYearMonth: string;

  constructor(
    quarterCode: string,
    fiscalYear: number,
    quarterName: string,
    startYearMonth: string,
    endYearMonth: string
  ) {
    assertNonEmptyString(quarterCode, '四半期コード');
    assertValidYearMonth(startYearMonth, '開始年月');
    assertValidYearMonth(endYearMonth, '終了年月');

    this.quarterCode = quarterCode;
    this.fiscalYear = fiscalYear;
    this.quarterName = quarterName;
    this.startYearMonth = startYearMonth;
    this.endYearMonth = endYearMonth;
  }
}
