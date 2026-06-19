package vn.vinfast.aitesthub.mail.strategy;

import vn.vinfast.aitesthub.mail.model.MailMessage;
import vn.vinfast.aitesthub.mail.model.MailRequest;
import vn.vinfast.aitesthub.mail.model.MailType;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
public interface MailStrategy {

  /**
   * Declares the {@link MailType} handled by this strategy.
   *
   * @return supported {@link MailType}
   */
  MailType type();

  /**
   * Builds the {@link MailMessage} metadata and template model.
   *
   * @param request {@link MailRequest} with recipient and scenario-specific data
   * @return renderable {@link MailMessage}
   */
  MailMessage buildMessage(MailRequest request);
}
