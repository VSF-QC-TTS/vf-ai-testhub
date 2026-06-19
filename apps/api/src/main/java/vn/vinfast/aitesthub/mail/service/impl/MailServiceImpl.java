package vn.vinfast.aitesthub.mail.service.impl;

import jakarta.mail.MessagingException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import vn.vinfast.aitesthub.mail.config.MailProperties;
import vn.vinfast.aitesthub.mail.factory.MailStrategyFactory;
import vn.vinfast.aitesthub.mail.model.MailMessage;
import vn.vinfast.aitesthub.mail.model.MailRequest;
import vn.vinfast.aitesthub.mail.model.MailType;
import vn.vinfast.aitesthub.mail.service.MailService;
import vn.vinfast.aitesthub.mail.template.HtmlMailTemplateRenderer;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

  private final JavaMailSender mailSender;
  private final MailProperties mailProperties;
  private final HtmlMailTemplateRenderer templateRenderer;
  private final MailStrategyFactory mailStrategyFactory;

  @Async
  @Override
  public void send(MailType type, MailRequest request) {
    try {
      MailMessage mailMessage = mailStrategyFactory.get(type).buildMessage(request);
      var message = mailSender.createMimeMessage();
      var helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
      helper.setFrom(mailProperties.from());
      helper.setTo(mailMessage.to());
      helper.setSubject(mailMessage.subject());
      helper.setText(render(mailMessage), true);

      mailSender.send(message);
      log.info("Sent {} mail message", type);
    } catch (IllegalStateException | MailException | MessagingException ex) {
      log.warn("Failed to send {} mail message: {}", type, ex.getMessage());
    }
  }

  private String render(MailMessage mailMessage) {
    return templateRenderer.render(mailMessage.templatePath(), mailMessage.model());
  }
}
