package vn.vinfast.aitesthub.target.crypto;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * @author nghlong3004
 * @since 6/23/2026
 */
@Component
public class AesGcmEncryptor {

  private static final String ALGORITHM = "AES/GCM/NoPadding";
  private static final int GCM_IV_LENGTH = 12;
  private static final int GCM_TAG_LENGTH = 16;

  private final SecretKey secretKey;

  public AesGcmEncryptor(@Value("${target.secret.encryption.key:0123456789abcdef0123456789abcdef}") String encryptionKey) {
    if (encryptionKey == null || encryptionKey.length() < 32) {
      throw new IllegalArgumentException("Encryption key must be at least 32 characters long");
    }
    byte[] keyBytes = encryptionKey.substring(0, 32).getBytes(StandardCharsets.UTF_8);
    this.secretKey = new SecretKeySpec(keyBytes, "AES");
  }

  public String encrypt(String rawValue) {
    if (rawValue == null || rawValue.isEmpty()) {
      return rawValue;
    }
    try {
      byte[] iv = new byte[GCM_IV_LENGTH];
      new SecureRandom().nextBytes(iv);

      Cipher cipher = Cipher.getInstance(ALGORITHM);
      GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
      cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

      byte[] cipherText = cipher.doFinal(rawValue.getBytes(StandardCharsets.UTF_8));
      
      ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
      byteBuffer.put(iv);
      byteBuffer.put(cipherText);

      return Base64.getEncoder().encodeToString(byteBuffer.array());
    } catch (Exception e) {
      throw new RuntimeException("Failed to encrypt secret", e);
    }
  }

  public String decrypt(String encryptedValue) {
    if (encryptedValue == null || encryptedValue.isEmpty()) {
      return encryptedValue;
    }
    try {
      byte[] decoded = Base64.getDecoder().decode(encryptedValue);
      ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);

      byte[] iv = new byte[GCM_IV_LENGTH];
      byteBuffer.get(iv);

      byte[] cipherText = new byte[byteBuffer.remaining()];
      byteBuffer.get(cipherText);

      Cipher cipher = Cipher.getInstance(ALGORITHM);
      GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
      cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

      return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
    } catch (Exception e) {
      throw new RuntimeException("Failed to decrypt secret", e);
    }
  }
}
