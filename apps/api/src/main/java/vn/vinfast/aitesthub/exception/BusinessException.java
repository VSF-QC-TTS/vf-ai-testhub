package vn.vinfast.aitesthub.exception;

import lombok.Getter;

/**
 * @author nghlong3004
 * @since 6/20/2026
 */
@Getter
public class BusinessException extends RuntimeException {

  private final ErrorResponse response;

  public BusinessException(ErrorCode errorCode) {
    super(errorCode.getMessage());
    this.response = errorCode.toErrorResponse();
  }

  public BusinessException(ErrorCode errorCode, String customMessage) {
    super(customMessage);
    this.response = new ErrorResponse(customMessage, errorCode.getStatus(), errorCode.getCode());
  }

  public BusinessException(String message, int status, String code) {
    super(message);
    this.response = new ErrorResponse(message, status, code);
  }
}