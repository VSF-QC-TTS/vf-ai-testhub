package vn.vinfast.aitesthub.auth.service.impl;

import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.auth.entity.PasswordResetToken;
import vn.vinfast.aitesthub.auth.repository.PasswordResetTokenRepository;
import vn.vinfast.aitesthub.auth.service.PasswordResetService;
import vn.vinfast.aitesthub.auth.token.OpaqueTokenService;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

  private static final long TOKEN_TTL_HOURS = 1;

  private final PasswordResetTokenRepository tokenRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final OpaqueTokenService opaqueTokenService;

  @Override
  @Transactional
  public String createResetToken(User user) {
    String rawToken = opaqueTokenService.generateRawToken();
    PasswordResetToken token = new PasswordResetToken();
    token.setUser(user);
    token.setTokenHash(opaqueTokenService.hash(rawToken));
    token.setExpiresAt(OffsetDateTime.now().plusHours(TOKEN_TTL_HOURS));
    tokenRepository.save(token);
    return rawToken;
  }

  @Override
  @Transactional
  public void resetPassword(String rawToken, String newPassword) {
    OffsetDateTime now = OffsetDateTime.now();
    PasswordResetToken token =
        tokenRepository
            .findByTokenHash(opaqueTokenService.hash(rawToken))
            .orElseThrow(() -> new ResourceException(ErrorCode.INVALID_PASSWORD_RESET_TOKEN));

    if (token.isUsed()) {
      throw new ResourceException(ErrorCode.PASSWORD_RESET_TOKEN_USED);
    }
    if (token.isExpired(now)) {
      throw new ResourceException(ErrorCode.PASSWORD_RESET_TOKEN_EXPIRED);
    }

    User user = token.getUser();
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    token.setUsedAt(now);
    userRepository.save(user);
    tokenRepository.save(token);
  }
}
