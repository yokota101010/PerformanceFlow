import {
  MonthlyMemberWorkHoursSummaryUseCase,
  MonthlyMemberWorkHoursSummaryDTO,
  MonthlyMemberWorkHoursRowDTO
} from '../usecases/MonthlyMemberWorkHoursSummaryUseCase';
import { MonthlyMemberWorkHoursSummaryRepository } from '../../domain/repositories/MonthlyMemberWorkHoursSummaryRepository';
import { PartnerOrderRepository } from '../../domain/repositories/PartnerOrderRepository';
import { StaffRepository } from '../../domain/repositories/StaffRepository';
import { PartnerRepository } from '../../domain/repositories/PartnerRepository';
import { MonthlyMemberWorkHoursSummary } from '../../domain/models/MonthlyMemberWorkHoursSummary';

export class MonthlyMemberWorkHoursSummaryService implements MonthlyMemberWorkHoursSummaryUseCase {
  constructor(
    private readonly summaryRepository: MonthlyMemberWorkHoursSummaryRepository,
    private readonly partnerOrderRepository: PartnerOrderRepository,
    private readonly staffRepository: StaffRepository,
    private readonly partnerRepository: PartnerRepository
  ) {}

  async execute(): Promise<MonthlyMemberWorkHoursSummaryDTO> {
    // --- 同期（ライトバック）処理の実行 ---
    // 1. SoT(真実の源泉)であるすべての注文明細データを取得
    const orders = await this.partnerOrderRepository.findAll();
    
    // 2. 要員ID・年月ごとに発注工数を集計
    const effortMap = new Map<string, number>(); // キー: "staffId:yearMonth"
    
    const normalizeToFirstDay = (dateStr: string): string => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        return `${parts[0]}-${parts[1]}-01`;
      }
      return dateStr;
    };

    for (const order of orders) {
      for (const detail of order.details) {
        const monthKey = normalizeToFirstDay(detail.targetMonth);
        if (!monthKey) continue;
        
        const key = `${detail.staffId}:${monthKey}`;
        const current = effortMap.get(key) || 0;
        // 浮動小数点誤差を考慮した足し算
        effortMap.set(key, Math.round((current + detail.orderEffort) * 10) / 10);
      }
    }

    // 3. 集計結果を MonthlyMemberWorkHoursSummary インスタンス群に変換してライトバック保存
    const newSummaries: MonthlyMemberWorkHoursSummary[] = [];
    effortMap.forEach((totalEffort, key) => {
      const [staffId, yearMonth] = key.split(':');
      newSummaries.push(new MonthlyMemberWorkHoursSummary(staffId, yearMonth, totalEffort));
    });

    // リポジトリを一旦空にして最新集計値で上書き保存（自動同期の完了）
    await this.summaryRepository.deleteAll();
    await this.summaryRepository.saveAll(newSummaries);

    // --- 通常のロード・DTO変換処理 ---
    const summaries = await this.summaryRepository.findAll();

    // 存在する年月（YYYY-MM-DD形式）を昇順に並べ替え
    const uniqueMonths = Array.from(new Set(summaries.map((s) => s.yearMonth))).sort();

    // 要員IDごとにグルーピング
    const staffIds = Array.from(new Set(summaries.map((s) => s.staffId)));
    const rows: MonthlyMemberWorkHoursRowDTO[] = [];

    // マスタデータを一括ロードしてキャッシュ
    const [allStaff, allPartners] = await Promise.all([
      this.staffRepository.findAll(),
      this.partnerRepository.findAll()
    ]);

    for (const staffId of staffIds) {
      const staffInfo = allStaff.find((s) => s.id === staffId);
      const staffName = staffInfo ? staffInfo.name : `要員 (${staffId})`;

      // パートナー会社名を引き当て
      const partner = allPartners.find((p) => p.id === staffInfo?.partnerId);
      const companyName = partner ? partner.name : '自社（内製）';

      // 年月ごとの工数をマッピング
      const efforts: Record<string, number> = {};
      for (const month of uniqueMonths) {
        const found = summaries.find((s) => s.staffId === staffId && s.yearMonth === month);
        efforts[month] = found ? found.totalEffort : 0;
      }

      rows.push({
        staffId,
        staffName,
        companyName,
        efforts
      });
    }

    return {
      months: uniqueMonths,
      rows
    };
  }
}
