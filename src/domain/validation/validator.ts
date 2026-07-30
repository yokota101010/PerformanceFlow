/**
 * ドメイン層の共通制約・バリデーションヘルパー
 */

export class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

export function assertNonEmptyString(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new DomainValidationError(`${fieldName}は必須入力です。`);
  }
}

export function assertNonNegativeNumber(value: number, fieldName: string): void {
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    throw new DomainValidationError(`${fieldName}は0以上の数値を指定してください。`);
  }
}

export function assertValidYearMonth(yearMonth: string, fieldName: string = '対象年月'): void {
  if (!yearMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth)) {
    throw new DomainValidationError(`${fieldName}は YYYY-MM 形式で指定してください。`);
  }
}
