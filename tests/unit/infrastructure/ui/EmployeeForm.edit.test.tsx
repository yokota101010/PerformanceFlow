import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmployeeForm } from '../../../../src/infrastructure/ui/EmployeeForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryEmployeeRepository } from '../../../../src/infrastructure/persistence/InMemoryEmployeeRepository';
import { Employee } from '../../../../src/domain/models';

describe('EmployeeForm (編集モード)', () => {
  const targetEmployee = new Employee('EMP002', 'ロバート・マーチン', 8000);

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerEmployeeRepository(new InMemoryEmployeeRepository());
  });

  it('編集対象が渡された場合、入力欄に初期値がセットされ「保存」「キャンセル」ボタンが表示されること', () => {
    render(
      <EmployeeForm
        onSuccess={vi.fn()}
        editingEmployee={targetEmployee}
        onCancel={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText('社員名');
    const costInput = screen.getByLabelText('単価 (円/時間)');
    const submitButton = screen.getByRole('button', { name: '保存' });
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });

    expect(nameInput).toHaveValue('ロバート・マーチン');
    expect(costInput).toHaveValue(8000);
    expect(submitButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('値を変更して保存ボタンを押すと、更新ユースケースが実行されて onSuccess が呼ばれること', async () => {
    const handleSuccess = vi.fn();
    render(
      <EmployeeForm
        onSuccess={handleSuccess}
        editingEmployee={targetEmployee}
        onCancel={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText('社員名');
    const costInput = screen.getByLabelText('単価 (円/時間)');
    const submitButton = screen.getByRole('button', { name: '保存' });

    fireEvent.change(nameInput, { target: { value: 'ロバート・C・マーチン' } });
    fireEvent.change(costInput, { target: { value: '8500' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });

    // リポジトリにデータが保存されていること
    const repo = RepositoryRegistry.getEmployeeRepository();
    const updated = await repo.findById('EMP002');
    expect(updated?.name).toBe('ロバート・C・マーチン');
    expect(updated?.costPerHour).toBe(8500);
  });

  it('キャンセルボタンを押すと onCancel コールバックが呼ばれること', () => {
    const handleCancel = vi.fn();
    render(
      <EmployeeForm
        onSuccess={vi.fn()}
        editingEmployee={targetEmployee}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalled();
  });
});
