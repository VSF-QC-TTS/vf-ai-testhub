package vn.vinfast.aitesthub.auth.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import vn.vinfast.aitesthub.auth.entity.EmailVerificationToken;
import vn.vinfast.aitesthub.auth.repository.EmailVerificationTokenRepository;
import vn.vinfast.aitesthub.auth.token.OpaqueTokenService;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.enums.UserStatus;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
class EmailVerificationServiceImplTest {

  @Test
  void createVerificationTokenStoresHashAndVerifyEmailActivatesUser() {
    User user = new User();
    user.setUsername("qc.demo@example.com");
    user.setDisplayName("QC Demo");
    user.setStatus(UserStatus.PENDING_EMAIL_VERIFICATION);
    AtomicReference<EmailVerificationToken> savedToken = new AtomicReference<>();
    AtomicReference<User> savedUser = new AtomicReference<>();
    EmailVerificationServiceImpl service =
        new EmailVerificationServiceImpl(
            tokenRepository(savedToken), userRepository(savedUser), opaqueTokenService());

    String rawToken = service.createVerificationToken(user);

    assertThat(rawToken).isNotBlank();
    assertThat(savedToken.get().getTokenHash()).isNotEqualTo(rawToken);
    assertThat(savedToken.get().getTokenHash()).hasSize(64);
    assertThat(savedToken.get().getUser()).isSameAs(user);

    User verifiedUser = service.verifyEmail(rawToken);

    assertThat(verifiedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
    assertThat(savedUser).hasValue(user);
    assertThat(savedToken.get().getUsedAt()).isNotNull();
  }

  private EmailVerificationTokenRepository tokenRepository(
      AtomicReference<EmailVerificationToken> savedToken) {
    return (EmailVerificationTokenRepository)
        Proxy.newProxyInstance(
            EmailVerificationTokenRepository.class.getClassLoader(),
            new Class<?>[] {EmailVerificationTokenRepository.class},
            (proxy, method, args) -> {
              return switch (method.getName()) {
                case "save" -> {
                  savedToken.set((EmailVerificationToken) args[0]);
                  yield args[0];
                }
                case "findByTokenHash" -> {
                  EmailVerificationToken token = savedToken.get();
                  if (token != null && token.getTokenHash().equals(args[0])) {
                    yield Optional.of(token);
                  }
                  yield Optional.empty();
                }
                case "toString" -> "EmailVerificationTokenRepositoryTestDouble";
                default -> throw new UnsupportedOperationException(method.getName());
              };
            });
  }

  private UserRepository userRepository(AtomicReference<User> savedUser) {
    return (UserRepository)
        Proxy.newProxyInstance(
            UserRepository.class.getClassLoader(),
            new Class<?>[] {UserRepository.class},
            (proxy, method, args) -> {
              return switch (method.getName()) {
                case "save" -> {
                  savedUser.set((User) args[0]);
                  yield args[0];
                }
                case "toString" -> "UserRepositoryTestDouble";
                default -> throw new UnsupportedOperationException(method.getName());
              };
            });
  }

  private OpaqueTokenService opaqueTokenService() {
    return new OpaqueTokenService() {
      @Override
      public String generateRawToken() {
        return "raw-token";
      }

      @Override
      public String hash(String rawToken) {
        return "a".repeat(64);
      }
    };
  }
}
