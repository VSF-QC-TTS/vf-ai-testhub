package vn.vinfast.aitesthub.target.service.impl;

import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.target.crypto.AesGcmEncryptor;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.entity.TargetSecret;
import vn.vinfast.aitesthub.target.repository.TargetSecretRepository;
import vn.vinfast.aitesthub.target.service.TargetSecretService;

/**
 * @author nghlong3004
 * @since 6/23/2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TargetSecretServiceImpl implements TargetSecretService {

  private final TargetSecretRepository targetSecretRepository;
  private final AesGcmEncryptor aesGcmEncryptor;

  @Override
  @Transactional
  public void saveSecrets(Target target, Map<String, String> secretValues) {
    if (secretValues == null || secretValues.isEmpty()) {
      return;
    }
    targetSecretRepository.deleteByTarget(target);
    targetSecretRepository.flush();
    for (Map.Entry<String, String> entry : secretValues.entrySet()) {
      String key = entry.getKey();
      String rawValue = entry.getValue();
      if (rawValue == null || rawValue.isBlank()) {
        continue;
      }
      TargetSecret secret =
          TargetSecret.builder()
              .target(target)
              .secretKey(key)
              .encryptedValue(aesGcmEncryptor.encrypt(rawValue.trim()))
              .maskedValue(mask(rawValue.trim()))
              .build();
      targetSecretRepository.save(secret);
    }
    log.debug(
        "Saved {} encrypted secrets for target {}",
        secretValues.size(),
        target.getPublicId());
  }

  @Override
  @Transactional(readOnly = true)
  public Map<String, String> decryptSecrets(Target target) {
    var secrets = targetSecretRepository.findByTarget(target);
    if (secrets.isEmpty()) {
      return Map.of();
    }
    Map<String, String> decrypted = new LinkedHashMap<>();
    for (TargetSecret secret : secrets) {
      decrypted.put(secret.getSecretKey(), aesGcmEncryptor.decrypt(secret.getEncryptedValue()));
    }
    return decrypted;
  }

  private String mask(String value) {
    if (value.length() <= 4) {
      return "****";
    }
    return "****" + value.substring(value.length() - 4);
  }
}
