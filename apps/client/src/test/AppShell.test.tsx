import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import userEvent from '@testing-library/user-event';
import { MobileDrawer } from '../components/layout/MobileDrawer';

describe('AppShell Layout', () => {
  it('renders the sidebar and top header', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div data-testid="main-content">Test Content</div>
        </AppShell>
      </MemoryRouter>
    );

    // Sidebar text
    expect(screen.getAllByText('EvalDesk').length).toBeGreaterThan(0);
    // Main content
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });
});

describe('MobileDrawer Navigation', () => {
  it('toggles the mobile drawer menu', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileDrawer />
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(toggleButton).toBeInTheDocument();

    // Drawer is closed initially, so "Home" nav link might not be visible 
    // unless it's in the DOM but hidden. In this implementation it uses conditional rendering {isOpen && ...}
    expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();

    // Open drawer
    await user.click(toggleButton);
    
    // Now "Home" link should be visible
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByRole('button', { name: /close menu/i });
    await user.click(closeButton);

    // Menu should be gone
    expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();
  });
});
