package vn.vinfast.aitesthub.target.service;

import java.util.Map;
import vn.vinfast.aitesthub.target.entity.Target;

/**
 * @author nghlong3004
 * @since 6/23/2026
 */
public interface TargetSecretService {

  /**
   * Encrypts and persists secret values for a target.
   * Replaces any existing secrets for the target.
   *
   * @param target the target
   * @param secretValues map of secret keys to raw values
   */
  void saveSecrets(Target target, Map<String, String> secretValues);

  /**
   * Decrypts and retrieves all secrets for a target.
   *
   * @param target the target
   * @return map of secret keys to decrypted raw values
   */
  Map<String, String> decryptSecrets(Target target);
}
