import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, Tabs, Accordion, Search, Pagination, FilterBar } from './InteractionComponents';

describe('Interaction components', () => {
  it('Modal renders when open and hides when closed', () => {
    const { rerender } = render(<Modal open title="M" onClose={() => {}}>body</Modal>);
    expect(screen.getByTestId('modal')).toHaveTextContent('body');
    rerender(<Modal open={false} title="M" onClose={() => {}}>body</Modal>);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('Tabs marks the active tab', () => {
    render(<Tabs tabs={['A', 'B']} active="A" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'A' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'B' }).getAttribute('aria-selected')).toBe('false');
  });

  it('Accordion toggles open', async () => {
    const user = userEvent.setup();
    render(<Accordion title="Details">secret</Accordion>);
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Details/ }));
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('Search fires onSearch', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Search onSearch={fn} />);
    await user.type(screen.getByRole('searchbox'), 'abc');
    expect(fn).toHaveBeenCalledWith('abc');
  });

  it('Pagination disables Prev on first page', () => {
    render(<Pagination page={1} pageCount={3} onPage={() => {}} />);
    expect(screen.getByRole('button', { name: /Prev/ })).toBeDisabled();
  });

  it('FilterBar reflects selected filter', () => {
    render(<FilterBar options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} selected="a" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'A' }).getAttribute('aria-pressed')).toBe('true');
  });
});
