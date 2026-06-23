package vn.vinfast.aitesthub.auth.token.impl;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import vn.vinfast.aitesthub.auth.token.TokenService;
import vn.vinfast.aitesthub.user.entity.User;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
@Service
@RequiredArgsConstructor
public class JwtTokenService implements TokenService {

  private static final String ISSUER = "vat-api";
  private static final String ACCESS_TOKEN_TYPE = "access";
  private static final String REFRESH_TOKEN_KEY_PREFIX = "vat:auth:refresh:";

  @Value("${vat.security.access-expiration}")
  private long accessExpirationMinutes;

  @Value("${vat.security.refresh-expiration}")
  private long refreshExpirationMinutes;

  private final JwtEncoder jwtEncoder;
  private final StringRedisTemplate stringRedisTemplate;

  @Override
  public String createAccessToken(User user) {
    return createToken(user, ACCESS_TOKEN_TYPE, accessTokenExpiresInSeconds());
  }

  @Override
  public String createRefreshToken(User user) {
    String refreshToken = UUID.randomUUID().toString();
    stringRedisTemplate
        .opsForValue()
        .set(
            refreshTokenKey(refreshToken),
            user.getUsername(),
            Duration.ofSeconds(refreshTokenExpiresInSeconds()));
    return refreshToken;
  }

  @Override
  public String readRefreshTokenSubject(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new BadJwtException("Refresh token is missing");
    }

    try {
      UUID.fromString(refreshToken);
    } catch (IllegalArgumentException ex) {
      throw new BadJwtException("Refresh token format is invalid", ex);
    }

    String subject = stringRedisTemplate.opsForValue().get(refreshTokenKey(refreshToken));
    if (subject == null || subject.isBlank()) {
      throw new BadJwtException("Refresh token is missing or expired");
    }
    return subject;
  }

  @Override
  public void revokeRefreshToken(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      return;
    }

    try {
      UUID.fromString(refreshToken);
    } catch (IllegalArgumentException ex) {
      return;
    }

    stringRedisTemplate.delete(refreshTokenKey(refreshToken));
  }

  @Override
  public long accessTokenExpiresInSeconds() {
    return accessExpirationMinutes * 60;
  }

  @Override
  public long refreshTokenExpiresInSeconds() {
    return refreshExpirationMinutes * 60;
  }

  private String createToken(User user, String tokenType, long expiresInSeconds) {
    Instant now = Instant.now();
    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer(ISSUER)
            .issuedAt(now)
            .expiresAt(now.plusSeconds(expiresInSeconds))
            .subject(user.getUsername())
            .claim("scope", user.getRole().getAuthority())
            .claim("token_type", tokenType)
            .claim("user_public_id", user.getPublicId().toString())
            .build();
    JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();
    return jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
  }

  private String refreshTokenKey(String refreshToken) {
    return REFRESH_TOKEN_KEY_PREFIX + refreshToken;
  }
}
