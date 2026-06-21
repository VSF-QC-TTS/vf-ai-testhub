import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "./pages/LoginPage";
import { authApi } from "./auth.api";
import { useAuthStore } from "./auth.store";
import { I18nextProvider } from "react-i18next";
import i18n from "../../lib/i18n";

vi.mock("./auth.api", () => ({
  authApi: {
    login: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {component}
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

describe("Auth Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it("shows validation errors for empty login form", async () => {
    renderWithProviders(<LoginPage />);
    
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
    
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("calls login API on valid submission and sets session", async () => {
    const mockUser = {
      publicId: "1",
      email: "test@example.com",
      displayName: "Test User",
      role: "QC_MEMBER",
      status: "ACTIVE",
      avatarUrl: null,
      lastLoginAt: null
    };

    vi.mocked(authApi.login).mockResolvedValueOnce({
      accessToken: "mock-token",
      tokenType: "Bearer",
      expiresInSeconds: 900,
      user: mockUser as any,
    });

    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123"
      });
    });

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().accessToken).toBe("mock-token");
    });
  });
});
