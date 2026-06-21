import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth.store";

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it("updates state on setSession", () => {
    const user = {
      id: "1",
      email: "test@example.com",
      displayName: "Test User",
      role: "ADMIN",
    };

    useAuthStore.getState().setSession("test-token", user);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe("test-token");
    expect(state.user).toEqual(user);
  });

  it("clears state on clearSession", () => {
    useAuthStore.getState().setSession("test-token", {
      id: "1",
      email: "test@example.com",
      displayName: "Test User",
      role: "ADMIN",
    });

    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });
});
