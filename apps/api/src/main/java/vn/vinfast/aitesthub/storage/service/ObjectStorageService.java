package vn.vinfast.aitesthub.storage.service;

import vn.vinfast.aitesthub.storage.model.StorageResource;
import vn.vinfast.aitesthub.storage.model.StoreObjectCommand;
import vn.vinfast.aitesthub.storage.model.StoredObject;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/11/2026
 */
public interface ObjectStorageService {

  StoredObject store(StoreObjectCommand command);

  StorageResource load(String key);
}
