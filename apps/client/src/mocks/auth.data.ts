export const initialAuthData = {
  accessToken: "mock-access-token-123",
  tokenType: "Bearer",
  expiresInSeconds: 3600,
  user: {
    publicId: "u-12345",
    email: "test@example.com",
    displayName: "Test User",
    role: "QC_MEMBER",
    status: "ACTIVE",
    avatarUrl: null,
    lastLoginAt: new Date().toISOString()
  }
};
