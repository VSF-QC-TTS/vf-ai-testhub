import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '../components/layout/AppShell';
import userEvent from '@testing-library/user-event';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import '../lib/i18n';
import i18n from '../lib/i18n';
import { projectKeys } from '../features/projects/projects.queries';

const project = {
  id: 'p-12345',
  name: 'Customer Support Bot',
  description: 'Evaluations for the support bot.',
  owner: {},
  createdBy: {},
  archived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  queryClient.setQueryData(projectKeys.list({}), {
    content: [project],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/projects/p-12345/targets']}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AppShell Layout', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders the sidebar and top header', () => {
    renderWithProviders(
      <AppShell>
        <div data-testid="main-content">Test Content</div>
      </AppShell>
    );

    // Sidebar text
    expect(screen.getAllByText('VinFast AI TestHub').length).toBeGreaterThan(0);
    // Main content
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });
});

describe('MobileDrawer Navigation', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('toggles the mobile drawer menu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MobileDrawer />);

    const toggleButton = screen.getByRole('button', { name: /toggle menu|mở menu/i });
    expect(toggleButton).toBeInTheDocument();

    // Drawer is closed initially, so "Home" nav link might not be visible 
    // unless it's in the DOM but hidden. In this implementation it uses conditional rendering {isOpen && ...}
    expect(screen.queryByRole('link', { name: /home|trang chủ/i })).not.toBeInTheDocument();

    // Open drawer
    await user.click(toggleButton);
    
    // Now "Home" link should be visible
    const homeLink = await screen.findByRole('link', { name: /home|trang chủ/i });
    expect(homeLink).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    // Menu should be gone
    expect(screen.queryByRole('link', { name: /home|trang chủ/i })).not.toBeInTheDocument();
  });
});
