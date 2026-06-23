package vn.vinfast.aitesthub.auth.token.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
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
  void createsOpaqueRefreshTokenInRedisAndReadsSubject() {
    JwtConfig config = new JwtConfig();
    ReflectionTestUtils.setField(
        config, "secret", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    SecretKey secretKey = config.secretKey();
    var redisTemplate = redisTemplate();
    JwtTokenService tokenService =
        new JwtTokenService(config.jwtEncoder(secretKey), redisTemplate.template);
    ReflectionTestUtils.setField(tokenService, "accessExpirationMinutes", 15L);
    ReflectionTestUtils.setField(tokenService, "refreshExpirationMinutes", 10080L);
    User user = new User();
    user.setPublicId(UUID.fromString("7b7b7d42-5f42-4c5a-9281-8d1d36f6f59d"));
    user.setUsername("qc.demo@example.com");
    user.setRole(Role.QC_MEMBER);

    String refreshToken = tokenService.createRefreshToken(user);
    String accessToken = tokenService.createAccessToken(user);
    when(redisTemplate.valueOperations.get("vat:auth:refresh:" + refreshToken))
        .thenReturn("qc.demo@example.com");

    assertThat(UUID.fromString(refreshToken)).isNotNull();
    assertThat(tokenService.readRefreshTokenSubject(refreshToken)).isEqualTo("qc.demo@example.com");
    verify(redisTemplate.valueOperations)
        .set(
            eq("vat:auth:refresh:" + refreshToken),
            eq("qc.demo@example.com"),
            eq(Duration.ofSeconds(604800)));
    assertThatThrownBy(() -> tokenService.readRefreshTokenSubject(accessToken))
        .isInstanceOf(JwtException.class);
  }

  @Test
  void readRefreshTokenSubjectRejectsMissingRedisToken() {
    JwtConfig config = new JwtConfig();
    ReflectionTestUtils.setField(
        config, "secret", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    SecretKey secretKey = config.secretKey();
    var redisTemplate = redisTemplate();
    JwtTokenService tokenService =
        new JwtTokenService(config.jwtEncoder(secretKey), redisTemplate.template);
    String refreshToken = UUID.randomUUID().toString();
    when(redisTemplate.valueOperations.get("vat:auth:refresh:" + refreshToken)).thenReturn(null);

    assertThatThrownBy(() -> tokenService.readRefreshTokenSubject(refreshToken))
        .isInstanceOf(JwtException.class);
  }

  @Test
  void revokeRefreshTokenDeletesRedisKey() {
    JwtConfig config = new JwtConfig();
    ReflectionTestUtils.setField(
        config, "secret", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    SecretKey secretKey = config.secretKey();
    var redisTemplate = redisTemplate();
    JwtTokenService tokenService =
        new JwtTokenService(config.jwtEncoder(secretKey), redisTemplate.template);
    String refreshToken = UUID.randomUUID().toString();

    tokenService.revokeRefreshToken(refreshToken);

    verify(redisTemplate.template).delete("vat:auth:refresh:" + refreshToken);
  }

  @SuppressWarnings("unchecked")
  private RedisTemplateDouble redisTemplate() {
    StringRedisTemplate template = mock(StringRedisTemplate.class);
    ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
    when(template.opsForValue()).thenReturn(valueOperations);
    return new RedisTemplateDouble(template, valueOperations);
  }

  private record RedisTemplateDouble(
      StringRedisTemplate template, ValueOperations<String, String> valueOperations) {}
}
