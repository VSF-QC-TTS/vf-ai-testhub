package vn.vinfast.aitesthub.oauth.filter;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/23/2026
 */
class OAuth2RedirectToFilterTest {

  private final OAuth2RedirectToFilter filter = new OAuth2RedirectToFilter();

  @Test
  void storesSafeRedirectToForOAuthAuthorizationRequest() throws ServletException, IOException {
    var request = oauthAuthorizationRequest();
    request.setParameter("redirectTo", "/projects/prj_123/runs?status=completed");
    var response = new MockHttpServletResponse();

    filter.doFilter(request, response, new MockFilterChain());

    assertThat(
            request
                .getSession(false)
                .getAttribute(OAuth2RedirectToFilter.REDIRECT_TO_SESSION_ATTRIBUTE))
        .isEqualTo("/projects/prj_123/runs?status=completed");
  }

  @Test
  void ignoresExternalRedirectToForOAuthAuthorizationRequest() throws ServletException, IOException {
    var request = oauthAuthorizationRequest();
    request.setParameter("redirectTo", "https://evil.example/phish");
    var response = new MockHttpServletResponse();

    filter.doFilter(request, response, new MockFilterChain());

    assertThat(request.getSession(false)).isNull();
  }

  @Test
  void ignoresProtocolRelativeRedirectToForOAuthAuthorizationRequest()
      throws ServletException, IOException {
    var request = oauthAuthorizationRequest();
    request.setParameter("redirectTo", "//evil.example/phish");
    var response = new MockHttpServletResponse();

    filter.doFilter(request, response, new MockFilterChain());

    assertThat(request.getSession(false)).isNull();
  }

  private MockHttpServletRequest oauthAuthorizationRequest() {
    var request = new MockHttpServletRequest("GET", "/api/v1/oauth2/authorization/google");
    request.setServletPath("/api/v1/oauth2/authorization/google");
    return request;
  }
}
