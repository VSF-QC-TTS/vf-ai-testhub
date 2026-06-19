package vn.vinfast.aitesthub.user.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.enums.Role;
import vn.vinfast.aitesthub.user.enums.UserStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
class UserMapperTest {

  private final UserMapper userMapper = Mappers.getMapper(UserMapper.class);

  @Test
  void toResponseUsesEmailContractAndDefaultRole() {
    User user = new User();
    user.setUsername("qc.demo@example.com");
    user.setDisplayName("QC Demo");
    user.setStatus(UserStatus.ACTIVE);
    user.setLastLoginAt(OffsetDateTime.parse("2026-06-09T10:00:00Z"));

    var response = userMapper.toResponse(user);

    assertThat(response.publicId()).isEqualTo(user.getPublicId());
    assertThat(response.email()).isEqualTo("qc.demo@example.com");
    assertThat(response.displayName()).isEqualTo("QC Demo");
    assertThat(response.role()).isEqualTo(Role.QC_MEMBER);
    assertThat(response.status()).isEqualTo(UserStatus.ACTIVE);
    assertThat(response.lastLoginAt()).isEqualTo(user.getLastLoginAt());
  }
}
