import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PartnerForm } from '../../../../src/infrastructure/ui/PartnerForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { Partner } from '../../../../src/domain/models';

describe('PartnerForm (編集モード)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
  });

  it('編集用発注先データが渡されたとき、フォームに初期値が読み込まれ、タイトルが「発注先編集」になること', () => {
    const editingPartner = new Partner('BP001', 'Ａソフトウェア');
    render(
      <PartnerForm
        editingPartner={editingPartner}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('発注先編集 (BP001)')).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText('発注先名') as HTMLInputElement;
    expect(nameInput.value).toBe('Ａソフトウェア');
    
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('名前を書き換えて保存ボタンを押すと、更新が実行され onSuccess が呼ばれること', async () => {
    const editingPartner = new Partner('BP001', 'Ａソフトウェア');
    const handleSuccess = vi.fn();
    render(
      <PartnerForm
        editingPartner={editingPartner}
        onSuccess={handleSuccess}
        onCancel={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText('発注先名');
    fireEvent.change(nameInput, { target: { value: 'Ａソフトウェア更新' } });

    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });

    const repo = RepositoryRegistry.getPartnerRepository();
    const updated = await repo.findById('BP001');
    expect(updated?.name).toBe('Ａソフトウェア更新');
  });

  it('キャンセルボタンを押すと onCancel が呼ばれること', () => {
    const editingPartner = new Partner('BP001', 'Ａソフトウェア');
    const handleCancel = vi.fn();
    render(
      <PartnerForm
        editingPartner={editingPartner}
        onSuccess={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalled();
  });
});
