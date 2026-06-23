package vn.vinfast.aitesthub.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.auth.cookie.AuthCookieFactory;
import vn.vinfast.aitesthub.auth.request.ForgotPasswordRequest;
import vn.vinfast.aitesthub.auth.request.LoginRequest;
import vn.vinfast.aitesthub.auth.request.RegisterRequest;
import vn.vinfast.aitesthub.auth.request.ResetPasswordRequest;
import vn.vinfast.aitesthub.auth.request.VerifyEmailRequest;
import vn.vinfast.aitesthub.auth.response.LoginResponse;
import vn.vinfast.aitesthub.auth.response.LoginResult;
import vn.vinfast.aitesthub.auth.service.AuthService;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ErrorResponse;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.user.response.UserResponse;
import vn.vinfast.aitesthub.user.service.UserService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication and local account registration APIs")
public class AuthController {
  private static final String REFRESH_TOKEN_COOKIE = "refresh_token";

  private final AuthService authService;
  private final UserService userService;
  private final AuthCookieFactory authCookieFactory;

  @Operation(
      summary = "Login local user",
      description =
          "Authenticates a local user, returns an access token, and sets refresh token as an HttpOnly cookie.")
  @io.swagger.v3.oas.annotations.parameters.RequestBody(
      required = true,
      description = "Login payload",
      content =
          @Content(
              mediaType = MediaType.APPLICATION_JSON_VALUE,
              schema = @Schema(implementation = LoginRequest.class),
              examples =
                  @ExampleObject(
                      name = "LoginRequest",
                      value =
                          """
                          {
                            "email": "qc.demo@example.com",
                            "password": "password123"
                          }
                          """)))
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Login successful. Refresh token is returned only in Set-Cookie.",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = LoginResponse.class),
                examples =
                    @ExampleObject(
                        name = "LoginResponse",
                        value =
                            """
                            {
                              "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
                              "tokenType": "Bearer",
                              "expiresInSeconds": 900,
                              "user": {
                                "publicId": "7b7b7d42-5f42-4c5a-9281-8d1d36f6f59d",
                                "email": "qc.demo@example.com",
                                "displayName": "QC Demo",
                                "role": "QC_MEMBER",
                                "status": "ACTIVE",
                                "lastLoginAt": "2026-06-09T10:00:00Z"
                              }
                            }
                            """))),
    @ApiResponse(
        responseCode = "400",
        description = "Invalid request body",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class))),
    @ApiResponse(
        responseCode = "401",
        description = "Invalid email or password",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class),
                examples =
                    @ExampleObject(
                        name = "BadCredentials",
                        value =
                            """
                            {
                              "type": "https://vat.nghlong3004.me/errors/bad-credentials",
                              "title": "Bad Credentials",
                              "status": 401,
                              "detail": "Invalid email or password.",
                              "instance": "/api/v1/auth/login",
                              "code": "BAD_CREDENTIALS"
                            }
                            """))),
    @ApiResponse(
        responseCode = "403",
        description = "Email is not verified",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class),
                examples =
                    @ExampleObject(
                        name = "EmailNotVerified",
                        value =
                            """
                            {
                              "type": "https://vat.nghlong3004.me/errors/email-not-verified",
                              "title": "Email Not Verified",
                              "status": 403,
                              "detail": "Account email has not been verified",
                              "instance": "/api/v1/auth/login",
                              "code": "EMAIL_NOT_VERIFIED"
                            }
                            """)))
  })
  @PostMapping(
      value = "/login",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    var result = authService.login(request);
    var refreshCookie =
        authCookieFactory.refreshTokenCookie(
            result.refreshToken(), result.refreshTokenMaxAgeSeconds());
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
        .body(result.response());
  }

  @Operation(
      summary = "Refresh access token",
      description =
          "Uses the HttpOnly refresh_token cookie to issue a new access token and rotate the refresh token cookie.")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Token refresh successful. New refresh token is returned only in Set-Cookie.",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = LoginResponse.class))),
    @ApiResponse(
        responseCode = "401",
        description = "Missing, invalid, or expired refresh token",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PostMapping(value = "/refresh-token", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<LoginResponse> refreshToken(HttpServletRequest request) {
    var result = refreshWithAvailableCookie(request);
    var refreshCookie =
        authCookieFactory.refreshTokenCookie(
            result.refreshToken(), result.refreshTokenMaxAgeSeconds());
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
        .body(result.response());
  }

  private LoginResult refreshWithAvailableCookie(HttpServletRequest request) {
    List<String> refreshTokens = refreshTokenCandidates(request);
    if (refreshTokens.isEmpty()) {
      return authService.refreshToken(null);
    }

    ResourceException lastRefreshTokenFailure = null;
    for (String refreshToken : refreshTokens) {
      try {
        return authService.refreshToken(refreshToken);
      } catch (ResourceException ex) {
        if (!isRefreshTokenFailure(ex)) {
          throw ex;
        }
        lastRefreshTokenFailure = ex;
      }
    }

    if (lastRefreshTokenFailure != null) {
      throw lastRefreshTokenFailure;
    }
    throw new ResourceException(ErrorCode.INVALID_REFRESH_TOKEN);
  }

  private List<String> refreshTokenCandidates(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null || cookies.length == 0) {
      return List.of();
    }

    List<String> refreshTokens = new ArrayList<>();
    for (Cookie cookie : cookies) {
      if (REFRESH_TOKEN_COOKIE.equals(cookie.getName())) {
        refreshTokens.add(cookie.getValue());
      }
    }
    return refreshTokens;
  }

  private boolean isRefreshTokenFailure(ResourceException ex) {
    String code = ex.getResponse().code();
    return ErrorCode.INVALID_REFRESH_TOKEN.getCode().equals(code)
        || ErrorCode.REFRESH_TOKEN_EXPIRED.getCode().equals(code);
  }

  @Operation(
      summary = "Logout",
      description = "Clears the HttpOnly refresh_token cookie for the current browser session.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Logout successful"),
    @ApiResponse(
        responseCode = "500",
        description = "Unexpected server error",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PostMapping("/logout")
  public ResponseEntity<Void> logout() {
    var clearCookie = authCookieFactory.clearRefreshTokenCookie();
    return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
        .build();
  }

  @Operation(
      summary = "Verify email",
      description = "Activates a pending local account using the email verification token.")
  @io.swagger.v3.oas.annotations.parameters.RequestBody(
      required = true,
      description = "Email verification payload",
      content =
          @Content(
              mediaType = MediaType.APPLICATION_JSON_VALUE,
              schema = @Schema(implementation = VerifyEmailRequest.class),
              examples =
                  @ExampleObject(
                      name = "VerifyEmailRequest",
                      value =
                          """
                          {
                            "token": "raw-email-verification-token"
                          }
                          """)))
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Email verified",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = UserResponse.class))),
    @ApiResponse(
        responseCode = "400",
        description = "Invalid, expired, or already used token",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PostMapping(
      value = "/verify-email",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public UserResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
    return authService.verifyEmail(request);
  }

  @Operation(
      summary = "Request password reset",
      description =
          "Creates a password reset token and sends a reset link when the email belongs to an account. Always returns 204 to avoid account enumeration.")
  @io.swagger.v3.oas.annotations.parameters.RequestBody(
      required = true,
      description = "Password reset email payload",
      content =
          @Content(
              mediaType = MediaType.APPLICATION_JSON_VALUE,
              schema = @Schema(implementation = ForgotPasswordRequest.class),
              examples =
                  @ExampleObject(
                      name = "ForgotPasswordRequest",
                      value =
                          """
                          {
                            "email": "qc.demo@example.com"
                          }
                          """)))
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Password reset request accepted"),
    @ApiResponse(
        responseCode = "400",
        description = "Invalid request body",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PostMapping(value = "/forgot-password", consumes = MediaType.APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    authService.forgotPassword(request);
  }

  @Operation(
      summary = "Reset password",
      description = "Sets a new password using a valid password reset token.")
  @io.swagger.v3.oas.annotations.parameters.RequestBody(
      required = true,
      description = "Password reset confirmation payload",
      content =
          @Content(
              mediaType = MediaType.APPLICATION_JSON_VALUE,
              schema = @Schema(implementation = ResetPasswordRequest.class),
              examples =
                  @ExampleObject(
                      name = "ResetPasswordRequest",
                      value =
                          """
                          {
                            "token": "raw-password-reset-token",
                            "newPassword": "newPassword123"
                          }
                          """)))
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Password reset successful"),
    @ApiResponse(
        responseCode = "400",
        description = "Invalid request body or password reset token",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PostMapping(value = "/reset-password", consumes = MediaType.APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
  }

  @Operation(
      summary = "Register local user",
      description =
          "Creates a pending local user account with the default QC_MEMBER role and sends an email verification link.")
  @io.swagger.v3.oas.annotations.parameters.RequestBody(
      required = true,
      description = "Registration payload",
      content =
          @Content(
              mediaType = MediaType.APPLICATION_JSON_VALUE,
              schema = @Schema(implementation = RegisterRequest.class),
              examples =
                  @ExampleObject(
                      name = "RegisterRequest",
                      value =
                          """
                          {
                            "email": "qc.demo@example.com",
                            "password": "password123",
                            "displayName": "QC Demo"
                          }
                          """)))
  @ApiResponses({
    @ApiResponse(
        responseCode = "201",
        description = "User created",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = UserResponse.class),
                examples =
                    @ExampleObject(
                        name = "UserResponse",
                        value =
                            """
                            {
                              "publicId": "7b7b7d42-5f42-4c5a-9281-8d1d36f6f59d",
                              "email": "qc.demo@example.com",
                              "displayName": "QC Demo",
                              "role": "QC_MEMBER",
                              "status": "PENDING_EMAIL_VERIFICATION",
                              "lastLoginAt": null
                            }
                            """))),
    @ApiResponse(
        responseCode = "400",
        description = "Invalid request body",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class),
                examples =
                    @ExampleObject(
                        name = "ValidationError",
                        value =
                            """
                            {
                              "type": "https://vat.nghlong3004.me/errors/validation-error",
                              "title": "Validation Error",
                              "status": 400,
                              "detail": "Validation failed for input data.",
                              "instance": "/api/v1/auth/register",
                              "code": "VALIDATION_ERROR",
                              "errors": [
                                {
                                  "field": "email",
                                  "message": "Email must be a valid email address."
                                }
                              ]
                            }
                            """))),
    @ApiResponse(
        responseCode = "409",
        description = "Email already exists",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class),
                examples =
                    @ExampleObject(
                        name = "EmailAlreadyExists",
                        value =
                            """
                            {
                              "type": "https://vat.nghlong3004.me/errors/email-already-exists",
                              "title": "Email Already Exists",
                              "status": 409,
                              "detail": "Email is already in use.",
                              "instance": "/api/v1/auth/register",
                              "code": "EMAIL_ALREADY_EXISTS"
                            }
                            """))),
    @ApiResponse(
        responseCode = "500",
        description = "Unexpected server error",
        content =
            @Content(
                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PostMapping(
      value = "/register",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public UserResponse register(@Valid @RequestBody RegisterRequest request) {
    return userService.register(request);
  }
}
