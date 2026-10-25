import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { OtherExpenseService } from '../../../src/application/services/OtherExpenseService';
import { CaseAssignment } from '../../../src/domain/models';
import { LocalStorageOtherExpenseRepository } from '../../../src/infrastructure/persistence/LocalStorageOtherExpenseRepository';

describe('Feature 014: その他経費の発生日対応（正本整合）', () => {
  const service = new OtherExpenseService();

  beforeEach(async () => {
    RepositoryRegistry.clear();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    const assignRepo = RepositoryRegistry.getCaseAssignmentRepository();
    // 契約 CON001 (開始日: 2026-08-15)
    await assignRepo.save(
      new CaseAssignment('PJ001', 'CON001', 'ANK001', '2026-08-15', '2026-09-30', 1.0, 1000000, 0)
    );
    // 契約 CON002 (開始日: 2026-10-01)
    await assignRepo.save(
      new CaseAssignment('PJ001', 'CON002', 'ANK001', '2026-10-01', '2026-11-15', 1.0, 1000000, 0)
    );
  });

  describe('User Story 1 - 発生日を指定した経費の登録', () => {
    it('発生日・金額・摘要を入力して登録すると、行No=1、発生年月が自動設定されること', async () => {
      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-09-05',
        amount: 30000,
        memo: '書籍購入',
      });

      const list = await service.getOtherExpenses('CON001');
      expect(list).toHaveLength(1);
      expect(list[0].caseAssignmentId).toBe('CON001');
      expect(list[0].occurrenceDate).toBe('2026-09-05');
      expect(list[0].lineNo).toBe(1);
      expect(list[0].occurrenceYearMonth).toBe('2026-09-01');
      expect(list[0].amount).toBe(30000);
      expect(list[0].memo).toBe('書籍購入');
    });

    it('同日（同じ契約・同じ発生日）に2件目を登録すると、行No=2が自動採番されること', async () => {
      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-08-20',
        amount: 15000,
        memo: 'クラウド利用料',
      });

      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-08-20',
        amount: 5000,
        memo: '追加利用料',
      });

      const list = await service.getOtherExpenses('CON001');
      expect(list).toHaveLength(2);
      expect(list[0].lineNo).toBe(1);
      expect(list[1].lineNo).toBe(2);
    });

    it('異なる発生日を登録した場合は、行Noが1から採番されること', async () => {
      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-08-20',
        amount: 15000,
        memo: '経費A',
      });

      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-08-21',
        amount: 8000,
        memo: '経費B',
      });

      const list = await service.getOtherExpenses('CON001');
      expect(list).toHaveLength(2);
      expect(list[0].occurrenceDate).toBe('2026-08-20');
      expect(list[0].lineNo).toBe(1);
      expect(list[1].occurrenceDate).toBe('2026-08-21');
      expect(list[1].lineNo).toBe(1);
    });

    it('発生日が未入力（空文字）のとき、エラーをスローすること', async () => {
      await expect(
        service.createOtherExpense({
          caseAssignmentId: 'CON001',
          occurrenceDate: '',
          amount: 10000,
          memo: 'テスト',
        })
      ).rejects.toThrow('発生日は必須です。');
    });

    it('存在しない日付（2026-02-30）や不正形式のとき、バリデーションエラーをスローすること', async () => {
      await expect(
        service.createOtherExpense({
          caseAssignmentId: 'CON001',
          occurrenceDate: '2026-02-30',
          amount: 10000,
          memo: 'テスト',
        })
      ).rejects.toThrow('発生日は YYYY-MM-DD 形式の有効な日付で入力してください。');

      await expect(
        service.createOtherExpense({
          caseAssignmentId: 'CON001',
          occurrenceDate: '2026/08/20',
          amount: 10000,
          memo: 'テスト',
        })
      ).rejects.toThrow('発生日は YYYY-MM-DD 形式の有効な日付で入力してください。');
    });
  });

  describe('User Story 2 - 経費一覧の発生日表示と並び順', () => {
    it('登録された経費が発生日の昇順、同日内は行Noの昇順で並ぶこと', async () => {
      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-09-10',
        amount: 20000,
        memo: '9月経費',
      });
      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-08-20',
        amount: 10000,
        memo: '8月経費1',
      });
      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-08-20',
        amount: 5000,
        memo: '8月経費2',
      });

      const list = await service.getOtherExpenses('CON001');
      expect(list).toHaveLength(3);
      expect(list[0].occurrenceDate).toBe('2026-08-20');
      expect(list[0].lineNo).toBe(1);
      expect(list[1].occurrenceDate).toBe('2026-08-20');
      expect(list[1].lineNo).toBe(2);
      expect(list[2].occurrenceDate).toBe('2026-09-10');
      expect(list[2].lineNo).toBe(1);
    });
  });

  describe('User Story 3 - 経費の編集・削除', () => {
    beforeEach(async () => {
      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-08-20',
        amount: 15000,
        memo: '初期経費',
      });
    });

    it('同日内で金額・摘要を編集したとき、行Noは変わらないこと', async () => {
      await service.updateOtherExpense({
        caseAssignmentId: 'CON001',
        oldOccurrenceDate: '2026-08-20',
        occurrenceDate: '2026-08-20',
        lineNo: 1,
        amount: 18000,
        memo: '修正後経費',
      });

      const list = await service.getOtherExpenses('CON001');
      expect(list).toHaveLength(1);
      expect(list[0].amount).toBe(18000);
      expect(list[0].memo).toBe('修正後経費');
      expect(list[0].lineNo).toBe(1);
      expect(list[0].occurrenceDate).toBe('2026-08-20');
    });

    it('発生日を変更したとき、新発生日で再採番され、元のレコードは削除されること', async () => {
      await service.updateOtherExpense({
        caseAssignmentId: 'CON001',
        oldOccurrenceDate: '2026-08-20',
        occurrenceDate: '2026-09-01',
        lineNo: 1,
        amount: 15000,
        memo: '9月へ移動',
      });

      const list = await service.getOtherExpenses('CON001');
      expect(list).toHaveLength(1);
      expect(list[0].occurrenceDate).toBe('2026-09-01');
      expect(list[0].lineNo).toBe(1);
      expect(list[0].occurrenceYearMonth).toBe('2026-09-01');
    });

    it('削除したときに対象レコードのみが消え、他の行の行Noは詰め直されないこと', async () => {
      await service.createOtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-08-20',
        amount: 5000,
        memo: '2件目',
      });

      // 行No=1 を削除
      await service.deleteOtherExpense('CON001', '2026-08-20', 1);

      const list = await service.getOtherExpenses('CON001');
      expect(list).toHaveLength(1);
      expect(list[0].lineNo).toBe(2); // 欠番のまま残る
    });
  });

  describe('User Story 4 - 旧形式データの自動移行', () => {
    it('発生日を持たない旧形式経費が、契約開始日を仮発生日として新形式へ移行され、要確認フラグが付くこと', async () => {
      // LocalStorage に旧形式で保存（CON001: 開始日 2026-08-15）
      const legacyStorageKey = 'performance_flow_other_expenses';
      const legacyItems = [
        { caseAssignmentId: 'CON001', lineNo: 1, amount: 25000, memo: '旧データ1' },
        { caseAssignmentId: 'CON001', lineNo: 3, amount: 10000, memo: '旧データ2' },
      ];
      localStorage.setItem(legacyStorageKey, JSON.stringify(legacyItems));

      const repo = new LocalStorageOtherExpenseRepository();
      RepositoryRegistry.registerOtherExpenseRepository(repo);

      const list = await repo.findByCaseAssignmentId('CON001');

      expect(list).toHaveLength(2);
      expect(list[0].occurrenceDate).toBe('2026-08-15');
      expect(list[0].lineNo).toBe(1);
      expect(list[0].needsReview).toBe(true);

      expect(list[1].occurrenceDate).toBe('2026-08-15');
      expect(list[1].lineNo).toBe(2); // 1から連番で採番
      expect(list[1].needsReview).toBe(true);
    });

    it('要確認の経費を編集保存すると、needsReview フラグが解除されること', async () => {
      const legacyStorageKey = 'performance_flow_other_expenses';
      localStorage.setItem(
        legacyStorageKey,
        JSON.stringify([{ caseAssignmentId: 'CON001', lineNo: 1, amount: 25000, memo: '旧データ' }])
      );

      const repo = new LocalStorageOtherExpenseRepository();
      RepositoryRegistry.registerOtherExpenseRepository(repo);

      // 一度ロードして移行完了させる
      await service.getOtherExpenses('CON001');

      // 編集して保存
      await service.updateOtherExpense({
        caseAssignmentId: 'CON001',
        oldOccurrenceDate: '2026-08-15',
        occurrenceDate: '2026-08-15',
        lineNo: 1,
        amount: 25000,
        memo: '確認済みデータ',
      });

      const list = await service.getOtherExpenses('CON001');
      expect(list[0].needsReview).toBe(false);
      expect(list[0].memo).toBe('確認済みデータ');
    });
  });
});
