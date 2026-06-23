package vn.vinfast.aitesthub.run.stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.connection.stream.RecordId;
import vn.vinfast.aitesthub.redis.RedisStreamPublisher;
import vn.vinfast.aitesthub.run.dto.RunSnapshotDto;
import vn.vinfast.aitesthub.run.enums.RunMode;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@ExtendWith(MockitoExtension.class)
class RunStreamPublisherTest {

  @Mock private RedisStreamPublisher redisStreamPublisher;

  @Test
  void publishRunJob_writesEnvelopeToRunJobsStream() throws Exception {
    ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();
    RunStreamPublisher publisher = new RunStreamPublisher(redisStreamPublisher, objectMapper);
    UUID runId = UUID.randomUUID();
    RunSnapshotDto snapshot =
        new RunSnapshotDto(
            runId,
            RunMode.FULL_DATASET,
            UUID.randomUUID(),
            UUID.randomUUID(),
            new RunSnapshotDto.TargetSnapshot(
                UUID.randomUUID(),
                "Chat API",
                "HTTP",
                "POST",
                "https://bot.test/chat",
                Map.of(),
                Map.of(),
                Map.of(),
                Map.of(),
                null,
                null,
                null,
                null,
                Map.of(),
                Map.of(),
                30000),
            Map.of("answerPath", "$.answer"),
            List.of(),
            new RunSnapshotDto.RunOptions(true, true, 3, 30000, 0),
            OffsetDateTime.now());
    RecordId expectedRecordId = RecordId.of("1-0");
    ArgumentCaptor<String> payloadCaptor = ArgumentCaptor.forClass(String.class);

    when(redisStreamPublisher.publishToStream(eq(RunStreamPublisher.RUN_JOBS_STREAM), payloadCaptor.capture()))
        .thenReturn(expectedRecordId);

    RecordId recordId = publisher.publishRunJob(snapshot);

    assertThat(recordId).isEqualTo(expectedRecordId);
    verify(redisStreamPublisher).publishToStream(eq("run:jobs"), payloadCaptor.capture());
    var payload = objectMapper.readTree(payloadCaptor.getValue());
    assertThat(payload.get("runId").asText()).isEqualTo(runId.toString());
    assertThat(payload.get("correlationId").asText()).isNotBlank();
    assertThat(payload.get("snapshot").get("target").get("url").asText())
        .isEqualTo("https://bot.test/chat");
  }
}
