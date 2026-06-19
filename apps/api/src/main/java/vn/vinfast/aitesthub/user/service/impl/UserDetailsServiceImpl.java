package vn.vinfast.aitesthub.user.service.impl;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.vinfast.aitesthub.user.enums.UserStatus;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/9/2026
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

  private final UserRepository userRepository;

  @Override
  public @NonNull UserDetails loadUserByUsername(@NonNull String username)
      throws UsernameNotFoundException {
    var user =
        userRepository
            .findByUsername(username.trim().toLowerCase())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    return User.withUsername(user.getUsername())
        .password(user.getPasswordHash())
        .authorities(user.getRole())
        .disabled(user.getStatus() != UserStatus.ACTIVE)
        .build();
  }
}
