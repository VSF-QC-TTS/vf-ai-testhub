package vn.vinfast.aitesthub.user.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.vinfast.aitesthub.auth.request.RegisterRequest;
import vn.vinfast.aitesthub.auth.service.EmailVerificationService;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.mail.model.MailRequest;
import vn.vinfast.aitesthub.mail.model.MailType;
import vn.vinfast.aitesthub.mail.service.MailService;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.enums.Role;
import vn.vinfast.aitesthub.user.enums.UserStatus;
import vn.vinfast.aitesthub.user.mapper.UserMapper;
import vn.vinfast.aitesthub.user.repository.UserRepository;
import vn.vinfast.aitesthub.user.response.UserResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
class UserServiceImplTest {

  @Test
  void registerNormalizesEmailHashesPasswordAndDefaultsDisplayName() {
    RegisterRequest request = new RegisterRequest("  QC.Demo@Example.COM  ", "password123", "   ");
    UserResponse mappedResponse =
        new UserResponse(null, "qc.demo@example.com", "qc.demo", null, Role.QC_MEMBER, null, null);
    AtomicReference<User> savedUser = new AtomicReference<>();
    RecordingMailService mailService = new RecordingMailService();
    RecordingEmailVerificationService emailVerificationService =
        new RecordingEmailVerificationService("raw-token");
    UserServiceImpl userService =
        new UserServiceImpl(
            repository(false, savedUser, null),
            user -> mappedResponse,
            passwordEncoder(),
            mailService,
            emailVerificationService);

    UserResponse response = userService.register(request);

    assertThat(savedUser.get().getUsername()).isEqualTo("qc.demo@example.com");
    assertThat(savedUser.get().getPasswordHash()).isEqualTo("encoded-password");
    assertThat(savedUser.get().getDisplayName()).isEqualTo("qc.demo");
    assertThat(savedUser.get().getRole()).isEqualTo(Role.QC_MEMBER);
    assertThat(savedUser.get().getStatus()).isEqualTo(UserStatus.PENDING_EMAIL_VERIFICATION);
    assertThat(emailVerificationService.user).isSameAs(savedUser.get());
    assertThat(mailService.type).isEqualTo(MailType.EMAIL_VERIFICATION);
    assertThat(mailService.request.to()).isEqualTo("qc.demo@example.com");
    assertThat(mailService.request.displayName()).isEqualTo("qc.demo");
    assertThat(mailService.request.actionUrl())
        .isEqualTo("http://localhost:5173/verify-email?token=raw-token");
    assertThat(response).isSameAs(mappedResponse);
  }

  @Test
  void registerRejectsExistingEmailBeforeSaving() {
    RegisterRequest request = new RegisterRequest("qc.demo@example.com", "password123", "QC Demo");
    AtomicReference<User> savedUser = new AtomicReference<>();
    UserServiceImpl userService =
        new UserServiceImpl(
            repository(true, savedUser, null),
            ignoredMapper(),
            passwordEncoder(),
            ignoredMailService(),
            ignoredEmailVerificationService());

    assertThatThrownBy(() -> userService.register(request))
        .isInstanceOf(ResourceException.class)
        .extracting("response.code")
        .isEqualTo("EMAIL_ALREADY_EXISTS");

    assertThat(savedUser).hasValue(null);
  }

  @Test
  void registerMapsUniqueConstraintRaceToEmailAlreadyExists() {
    RegisterRequest request = new RegisterRequest("qc.demo@example.com", "password123", "QC Demo");
    UserServiceImpl userService =
        new UserServiceImpl(
            repository(
                false,
                new AtomicReference<>(),
                new DataIntegrityViolationException("duplicate username")),
            ignoredMapper(),
            passwordEncoder(),
            ignoredMailService(),
            ignoredEmailVerificationService());

    assertThatThrownBy(() -> userService.register(request))
        .isInstanceOf(ResourceException.class)
        .extracting("response.code")
        .isEqualTo("EMAIL_ALREADY_EXISTS");
  }

  @Test
  void getCurrentUserNormalizesPrincipalUsernameAndReturnsMappedUser() {
    User user = new User();
    user.setUsername("qc.demo@example.com");
    user.setDisplayName("QC Demo");
    user.setRole(Role.QC_MEMBER);
    user.setStatus(UserStatus.ACTIVE);
    UserResponse mappedResponse =
        new UserResponse(
            null, "qc.demo@example.com", "QC Demo", null, Role.QC_MEMBER, UserStatus.ACTIVE, null);
    UserServiceImpl userService =
        new UserServiceImpl(
            repository(false, new AtomicReference<>(), null, Optional.of(user)),
            userMapper(mappedResponse),
            passwordEncoder(),
            ignoredMailService(),
            ignoredEmailVerificationService());

    UserResponse response = userService.getCurrentUser("  QC.Demo@Example.COM  ");

    assertThat(response).isSameAs(mappedResponse);
  }

  @Test
  void getCurrentUserRejectsMissingUser() {
    UserServiceImpl userService =
        new UserServiceImpl(
            repository(false, new AtomicReference<>(), null, Optional.empty()),
            ignoredMapper(),
            passwordEncoder(),
            ignoredMailService(),
            ignoredEmailVerificationService());

    assertThatThrownBy(() -> userService.getCurrentUser("missing@example.com"))
        .isInstanceOf(ResourceException.class)
        .extracting("response.code")
        .isEqualTo("USER_NOT_FOUND");
  }

  private UserRepository repository(
      boolean existsByUsername, AtomicReference<User> savedUser, RuntimeException saveException) {
    return repository(existsByUsername, savedUser, saveException, Optional.empty());
  }

  private UserRepository repository(
      boolean existsByUsername,
      AtomicReference<User> savedUser,
      RuntimeException saveException,
      Optional<User> foundUser) {
    AtomicBoolean saveCalled = new AtomicBoolean(false);
    return (UserRepository)
        Proxy.newProxyInstance(
            UserRepository.class.getClassLoader(),
            new Class<?>[] {UserRepository.class},
            (proxy, method, args) -> {
              return switch (method.getName()) {
                case "existsByUsername" -> existsByUsername;
                case "findByUsername" -> foundUser;
                case "save" -> {
                  saveCalled.set(true);
                  if (saveException != null) {
                    throw saveException;
                  }
                  savedUser.set((User) args[0]);
                  yield args[0];
                }
                case "toString" -> "UserRepositoryTestDouble(saveCalled=" + saveCalled.get() + ")";
                default -> throw new UnsupportedOperationException(method.getName());
              };
            });
  }

  private UserMapper ignoredMapper() {
    return user -> {
      throw new AssertionError("Mapper should not be called");
    };
  }

  private UserMapper userMapper(UserResponse response) {
    return user -> response;
  }

  private PasswordEncoder passwordEncoder() {
    return new PasswordEncoder() {
      @Override
      public String encode(CharSequence rawPassword) {
        return "encoded-password";
      }

      @Override
      public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return false;
      }
    };
  }

  private MailService ignoredMailService() {
    return (type, request) -> {
      throw new AssertionError("Mail service should not be called");
    };
  }

  private static class RecordingMailService implements MailService {
    private MailType type;
    private MailRequest request;

    @Override
    public void send(MailType type, MailRequest request) {
      this.type = type;
      this.request = request;
    }
  }

  private EmailVerificationService ignoredEmailVerificationService() {
    return new EmailVerificationService() {
      @Override
      public String createVerificationToken(User user) {
        throw new AssertionError("Email verification service should not be called");
      }

      @Override
      public User verifyEmail(String rawToken) {
        throw new AssertionError("Email verification service should not be called");
      }
    };
  }

  private static class RecordingEmailVerificationService implements EmailVerificationService {
    private final String rawToken;
    private User user;

    private RecordingEmailVerificationService(String rawToken) {
      this.rawToken = rawToken;
    }

    @Override
    public String createVerificationToken(User user) {
      this.user = user;
      return rawToken;
    }

    @Override
    public User verifyEmail(String rawToken) {
      throw new AssertionError("Verify email should not be called");
    }
  }
}
