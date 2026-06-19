package vn.vinfast.aitesthub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StreamOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/19/2026
 */
@Configuration
public class RedisStreamConfig {

  @Bean
  public StreamOperations<String, String, String> streamOperations(StringRedisTemplate stringRedisTemplate) {
    return stringRedisTemplate.opsForStream();
  }
}
