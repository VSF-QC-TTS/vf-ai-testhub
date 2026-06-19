package vn.vinfast.aitesthub.auth.service.impl;

import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import vn.vinfast.aitesthub.auth.request.ForgotPasswordRequest;
import vn.vinfast.aitesthub.auth.request.LoginRequest;
import vn.vinfast.aitesthub.auth.request.ResetPasswordRequest;
import vn.vinfast.aitesthub.auth.request.VerifyEmailRequest;
import vn.vinfast.aitesthub.auth.response.LoginResponse;
import vn.vinfast.aitesthub.auth.response.LoginResult;
import vn.vinfast.aitesthub.auth.service.AuthService;
import vn.vinfast.aitesthub.auth.service.EmailVerificationService;
import vn.vinfast.aitesthub.auth.service.PasswordResetService;
import vn.vinfast.aitesthub.auth.token.TokenService;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.mail.model.MailRequest;
import vn.vinfast.aitesthub.mail.model.MailType;
import vn.vinfast.aitesthub.mail.service.MailService;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.enums.UserStatus;
import vn.vinfast.aitesthub.user.mapper.UserMapper;
import vn.vinfast.aitesthub.user.repository.UserRepository;
import vn.vinfast.aitesthub.user.response.UserResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

  private static final String TOKEN_TYPE = "Bearer";

  private final AuthenticationManager authenticationManager;
  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final TokenService jwtTokenService;
  private final EmailVerificationService emailVerificationService;
  private final PasswordResetService passwordResetService;
  private final MailService mailService;

  @Value("${vat.client.base-url}")
  private String clientBaseUrl;

  @Override
  @Transactional
  public LoginResult login(LoginRequest request) {
    String email = normalizeEmail(request.email());
    User user =
        userRepository
            .findByUsername(email)
            .orElseThrow(() -> new ResourceException(ErrorCode.BAD_CREDENTIALS));
    if (user.getStatus() == UserStatus.PENDING_EMAIL_VERIFICATION) {
      throw new ResourceException(ErrorCode.EMAIL_NOT_VERIFIED);
    }
    if (user.getStatus() != UserStatus.ACTIVE) {
      throw new ResourceException(ErrorCode.ACCOUNT_LOCKED);
    }

    authenticationManager.authenticate(
        UsernamePasswordAuthenticationToken.unauthenticated(email, request.password()));

    user.setLastLoginAt(OffsetDateTime.now());
    User saved = userRepository.save(user);

    String accessToken = jwtTokenService.createAccessToken(saved);
    String refreshToken = jwtTokenService.createRefreshToken(saved);
    LoginResponse response = buildLoginResponse(saved, accessToken);
    return new LoginResult(response, refreshToken, jwtTokenService.refreshTokenExpiresInSeconds());
  }

  @Override
  @Transactional
  public LoginResult refreshToken(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new ResourceException(ErrorCode.INVALID_REFRESH_TOKEN);
    }

    String email;
    try {
      email = jwtTokenService.readRefreshTokenSubject(refreshToken);
    } catch (JwtException ex) {
      throw new ResourceException(resolveRefreshTokenError(ex));
    }

    User user =
        userRepository
            .findByUsername(normalizeEmail(email))
            .orElseThrow(() -> new ResourceException(ErrorCode.INVALID_REFRESH_TOKEN));
    if (user.getStatus() == UserStatus.PENDING_EMAIL_VERIFICATION) {
      throw new ResourceException(ErrorCode.EMAIL_NOT_VERIFIED);
    }
    if (user.getStatus() != UserStatus.ACTIVE) {
      throw new ResourceException(ErrorCode.ACCOUNT_LOCKED);
    }

    String newAccessToken = jwtTokenService.createAccessToken(user);
    String newRefreshToken = jwtTokenService.createRefreshToken(user);
    return new LoginResult(
        buildLoginResponse(user, newAccessToken),
        newRefreshToken,
        jwtTokenService.refreshTokenExpiresInSeconds());
  }

  @Override
  @Transactional
  public UserResponse verifyEmail(VerifyEmailRequest request) {
    User verifiedUser = emailVerificationService.verifyEmail(request.token());
    return userMapper.toResponse(verifiedUser);
  }

  @Override
  @Transactional
  public void forgotPassword(ForgotPasswordRequest request) {
    String email = normalizeEmail(request.email());
    userRepository.findByUsername(email).ifPresent(this::sendPasswordReset);
  }

  @Override
  @Transactional
  public void resetPassword(ResetPasswordRequest request) {
    passwordResetService.resetPassword(request.token(), request.newPassword());
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase();
  }

  private LoginResponse buildLoginResponse(User user, String accessToken) {
    return new LoginResponse(
        accessToken,
        TOKEN_TYPE,
        jwtTokenService.accessTokenExpiresInSeconds(),
        userMapper.toResponse(user));
  }

  private ErrorCode resolveRefreshTokenError(JwtException ex) {
    String message = ex.getMessage();
    if (message != null && message.toLowerCase().contains("expired")) {
      return ErrorCode.REFRESH_TOKEN_EXPIRED;
    }
    return ErrorCode.INVALID_REFRESH_TOKEN;
  }

  private void sendPasswordReset(User user) {
    String rawToken = passwordResetService.createResetToken(user);
    try {
      mailService.send(
          MailType.PASSWORD_RESET,
          MailRequest.builder()
              .to(user.getUsername())
              .displayName(user.getDisplayName())
              .actionUrl(buildResetPasswordUrl(rawToken))
              .build());
    } catch (RuntimeException ex) {
      log.warn("Password reset email dispatch failed for user {}", user.getPublicId());
    }
  }

  private String buildResetPasswordUrl(String rawToken) {
    String baseUrl =
        clientBaseUrl == null || clientBaseUrl.isBlank() ? "http://localhost:5173" : clientBaseUrl;
    return UriComponentsBuilder.fromUriString(baseUrl)
        .path("/reset-password")
        .queryParam("token", rawToken)
        .build()
        .toUriString();
  }
}
