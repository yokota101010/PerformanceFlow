import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { StaffView } from '../../../../src/infrastructure/ui/StaffView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryStaffRepository } from '../../../../src/infrastructure/persistence/InMemoryStaffRepository';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';

describe('StaffView (要員一覧画面)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerStaffRepository(new InMemoryStaffRepository());
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
  });

  it('初期読み込み時に要員一覧がテーブル表示され、シードデータおよび所属会社名が正しく表示されること', async () => {
    render(<StaffView />);

    // 氏名の表示確認
    const name1 = await screen.findByText('坂本龍馬');
    expect(name1).toBeInTheDocument();

    const name2 = screen.getByText('高杉晋作');
    expect(name2).toBeInTheDocument();

    const name3 = screen.getByText('西郷隆盛');
    expect(name3).toBeInTheDocument();

    const name4 = screen.getByText('勝海舟');
    expect(name4).toBeInTheDocument();

    // 所属会社名の動的表示確認 (BP001 -> Ａソフトウェア, BP002 -> Ｂエンジニアリング)
    const company1 = screen.getAllByText('Ａソフトウェア');
    expect(company1.length).toBeGreaterThanOrEqual(2); // 坂本、高杉

    const company2 = screen.getAllByText('Ｂエンジニアリング');
    expect(company2.length).toBeGreaterThanOrEqual(2); // 西郷、勝

    // 単価のカンマ区切り表示確認
    const cost1 = screen.getByText('1,000,000 円');
    expect(cost1).toBeInTheDocument();

    const cost2 = screen.getByText('700,000 円');
    expect(cost2).toBeInTheDocument();
  });
});
