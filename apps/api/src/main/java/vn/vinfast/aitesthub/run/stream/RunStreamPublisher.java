package vn.vinfast.aitesthub.run.stream;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.stereotype.Component;
import vn.vinfast.aitesthub.redis.RedisStreamPublisher;
import vn.vinfast.aitesthub.run.dto.RunSnapshotDto;

/**
 * Publishes run jobs to the evaluation runner stream.
 *
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Component
@RequiredArgsConstructor
public class RunStreamPublisher {

  public static final String RUN_JOBS_STREAM = "run:jobs";

  private final RedisStreamPublisher redisStreamPublisher;
  private final ObjectMapper objectMapper;

  public RecordId publishRunJob(RunSnapshotDto snapshot) {
    RunJobEnvelope envelope =
        new RunJobEnvelope(snapshot.runId(), UUID.randomUUID().toString(), snapshot, OffsetDateTime.now());
    try {
      return redisStreamPublisher.publishToStream(
          RUN_JOBS_STREAM, objectMapper.writeValueAsString(envelope));
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("Failed to serialize run job payload", exception);
    }
  }

  public record RunJobEnvelope(
      UUID runId,
      String correlationId,
      RunSnapshotDto snapshot,
      OffsetDateTime publishedAt
  ) {}
}
