package vn.vinfast.aitesthub.storage.model;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/11/2026
 */
public record StoreObjectCommand(String key, String fileName, String contentType, byte[] content) {}
