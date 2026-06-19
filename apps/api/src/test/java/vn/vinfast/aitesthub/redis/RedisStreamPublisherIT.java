package vn.vinfast.aitesthub.redis;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.connection.stream.StreamReadOptions;
import org.springframework.data.redis.core.StreamOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import vn.vinfast.aitesthub.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(
    properties = {
      "JWT_SECRET_KEY=0123456789abcdef0123456789abcdef",
      "VAT_SECRET_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "SERVER_BASE_URL=http://localhost:8080",
      "WEB_BASE_URL=http://localhost:5173",
      "GOOGLE_CLIENT_ID=test-google-client-id",
      "GOOGLE_CLIENT_SECRET=test-google-client-secret",
      "GITHUB_CLIENT_ID=test-github-client-id",
      "GITHUB_CLIENT_SECRET=test-github-client-secret",
      "GEMINI_API_KEY=test-gemini-api-key"
    })
class RedisStreamPublisherIT {

  @Autowired
  private RedisStreamPublisher publisher;

  @Autowired
  private StringRedisTemplate redisTemplate;

  @Test
  void publishToStream_ShouldWriteMessageToRedisStream() {
    String streamKey = "test:stream:jobs";
    String payload = "{\"testCaseId\": 1, \"status\": \"PENDING\"}";

    // Act
    RecordId recordId = publisher.publishToStream(streamKey, payload);

    // Assert
    assertThat(recordId).isNotNull();

    StreamOperations<String, String, String> ops = redisTemplate.opsForStream();
    List<MapRecord<String, String, String>> records = ops.read(
        StreamReadOptions.empty().count(1),
        org.springframework.data.redis.connection.stream.StreamOffset.fromStart(streamKey)
    );

    assertThat(records).hasSize(1);
    MapRecord<String, String, String> record = records.get(0);
    assertThat(record.getId()).isEqualTo(recordId);
    
    Map<String, String> value = record.getValue();
    assertThat(value).containsEntry("payload", payload);
  }
}
