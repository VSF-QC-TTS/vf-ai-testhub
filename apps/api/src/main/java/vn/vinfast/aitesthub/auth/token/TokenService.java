package vn.vinfast.aitesthub.auth.token;

import vn.vinfast.aitesthub.user.entity.User;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
public interface TokenService {

  /**
   * Creates a short-lived access JWT for API authentication by a {@link User}.
   *
   * @param user authenticated {@link User}
   * @return signed access token
   */
  String createAccessToken(User user);

  /**
   * Creates an opaque refresh token for session renewal by a {@link User}.
   *
   * @param user authenticated {@link User}
   * @return opaque refresh token
   */
  String createRefreshToken(User user);

  /**
   * Validates an opaque refresh token and returns its subject.
   *
   * @param refreshToken refresh token from the HttpOnly cookie
   * @return normalized email stored as the token subject
   */
  String readRefreshTokenSubject(String refreshToken);

  /**
   * Revokes an opaque refresh token.
   *
   * @param refreshToken refresh token from the HttpOnly cookie
   */
  void revokeRefreshToken(String refreshToken);

  /**
   * Returns access token TTL.
   *
   * @return access token lifetime in seconds
   */
  long accessTokenExpiresInSeconds();

  /**
   * Returns refresh token TTL.
   *
   * @return refresh token lifetime in seconds
   */
  long refreshTokenExpiresInSeconds();
}
