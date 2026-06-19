package vn.vinfast.aitesthub.storage.service.impl;

import java.nio.file.Files;
import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import vn.vinfast.aitesthub.config.StorageProperties;
import vn.vinfast.aitesthub.storage.model.StorageResource;
import vn.vinfast.aitesthub.storage.model.StoreObjectCommand;
import vn.vinfast.aitesthub.storage.model.StoredObject;
import vn.vinfast.aitesthub.storage.service.ObjectStorageService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/11/2026
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "vat.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalObjectStorageService implements ObjectStorageService {

  private static final String PROVIDER = "LOCAL";

  private final StorageProperties storageProperties;

  @Override
  public StoredObject store(StoreObjectCommand command) {
    if (command.key() == null || command.key().isBlank()) {
      throw new IllegalArgumentException("Storage key is required.");
    }
    if (command.content() == null) {
      throw new IllegalArgumentException("Storage content is required.");
    }
    try {
      Path path = resolveKey(command.key());
      Files.createDirectories(path.getParent());
      Files.write(path, command.content());
      return new StoredObject(
          PROVIDER, command.key(), command.contentType(), command.content().length);
    } catch (Exception ex) {
      throw new IllegalStateException("Failed to store local object.", ex);
    }
  }

  @Override
  public StorageResource load(String key) {
    if (key == null || key.isBlank()) {
      throw new IllegalArgumentException("Storage key is required.");
    }
    try {
      Path path = resolveKey(key);
      if (!Files.exists(path)) {
        throw new IllegalStateException("Storage object not found.");
      }
      return new StorageResource(key, new FileSystemResource(path));
    } catch (IllegalStateException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new IllegalStateException("Failed to load local object.", ex);
    }
  }

  private Path resolveKey(String key) {
    Path baseDir = Path.of(storageProperties.getLocal().getBaseDir()).toAbsolutePath().normalize();
    Path path = baseDir.resolve(key).normalize();
    if (!path.startsWith(baseDir)) {
      throw new IllegalArgumentException("Storage key escapes base directory.");
    }
    return path;
  }
}
