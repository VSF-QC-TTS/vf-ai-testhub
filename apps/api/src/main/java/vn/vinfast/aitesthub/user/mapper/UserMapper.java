package vn.vinfast.aitesthub.user.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.response.UserResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

  /**
   * Maps an internal {@link User} entity to a public API response.
   *
   * @param user internal {@link User} entity
   * @return public {@link UserResponse}
   */
  @Mapping(source = "username", target = "email")
  UserResponse toResponse(User user);
}
