package vn.vinfast.aitesthub.auth.token.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.util.ReflectionTestUtils;
import vn.vinfast.aitesthub.config.JwtConfig;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.enums.Role;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/10/2026
 */
class JwtTokenServiceImplTest {

  @Test
  void readRefreshTokenSubjectAcceptsOnlyRefreshTokens() {
    JwtConfig config = new JwtConfig();
    ReflectionTestUtils.setField(
        config, "secret", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    SecretKey secretKey = config.secretKey();
    JwtTokenService tokenService =
        new JwtTokenService(config.jwtEncoder(secretKey), config.refreshTokenJwtDecoder(secretKey));
    ReflectionTestUtils.setField(tokenService, "accessExpirationMinutes", 15L);
    ReflectionTestUtils.setField(tokenService, "refreshExpirationMinutes", 10080L);
    User user = new User();
    user.setPublicId(UUID.fromString("7b7b7d42-5f42-4c5a-9281-8d1d36f6f59d"));
    user.setUsername("qc.demo@example.com");
    user.setRole(Role.QC_MEMBER);

    String refreshToken = tokenService.createRefreshToken(user);
    String accessToken = tokenService.createAccessToken(user);

    assertThat(tokenService.readRefreshTokenSubject(refreshToken)).isEqualTo("qc.demo@example.com");
    assertThatThrownBy(() -> tokenService.readRefreshTokenSubject(accessToken))
        .isInstanceOf(JwtException.class);
  }
}
