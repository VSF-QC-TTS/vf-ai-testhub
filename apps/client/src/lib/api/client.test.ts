import { describe, it, expect, beforeEach, vi } from "vitest";
import MockAdapter from "axios-mock-adapter";
import { apiClient } from "./client";
import { useAuthStore } from "../../features/auth/auth.store";
import i18n from "../i18n";
import { ApiError } from "./errors";

const mock = new MockAdapter(apiClient);

describe("API Client", () => {
  beforeEach(() => {
    mock.reset();
    useAuthStore.getState().clearSession();
  });

  it("sends Authorization header when token exists", async () => {
    useAuthStore.getState().setSession("test-token", {
      id: "1",
      email: "test@example.com",
      displayName: "Test",
      role: "QC_MEMBER",
    });

    mock.onGet("/test").reply((config) => {
      expect(config.headers?.Authorization).toBe("Bearer test-token");
      return [200, { success: true }];
    });

    await apiClient.get("/test");
  });

  it("sends Accept-Language from i18n", async () => {
    i18n.changeLanguage("vi");

    mock.onGet("/test-lang").reply((config) => {
      expect(config.headers?.["Accept-Language"]).toBe("vi");
      return [200, { success: true }];
    });

    await apiClient.get("/test-lang");
  });

  it("clears auth session on 401 and throws ApiError", async () => {
    useAuthStore.getState().setSession("test-token", {
      id: "1",
      email: "test@example.com",
      displayName: "Test",
      role: "QC_MEMBER",
    });

    mock.onGet("/test-401").reply(401, {
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
      detail: "Invalid token",
    });

    try {
      await apiClient.get("/test-401");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      if (e instanceof ApiError) {
        expect(e.status).toBe(401);
        expect(e.message).toBe("Invalid token");
      }
    }

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
