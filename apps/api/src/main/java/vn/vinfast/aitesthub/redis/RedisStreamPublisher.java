package vn.vinfast.aitesthub.redis;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StreamOperations;
import org.springframework.stereotype.Component;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/19/2026
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisStreamPublisher {

  private final StreamOperations<String, String, String> streamOperations;

  public RecordId publishToStream(String streamKey, String payload) {
    Map<String, String> content = Map.of("payload", payload);
    RecordId recordId = streamOperations.add(streamKey, content);
    log.debug("Published message to stream '{}' with ID '{}'", streamKey, recordId);
    return recordId;
  }
}
