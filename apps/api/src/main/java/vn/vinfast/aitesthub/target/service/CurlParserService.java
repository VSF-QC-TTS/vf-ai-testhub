package vn.vinfast.aitesthub.target.service;

import java.util.Map;
import vn.vinfast.aitesthub.target.enums.HttpMethod;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
public interface CurlParserService {

  class ParsedCurl {
    public HttpMethod method;
    public String url;
    public Map<String, Object> queryParamsTemplate;
    public Map<String, Object> headersTemplate;
    public Map<String, Object> bodyTemplate;
    public Map<String, String> extractedSecrets;
  }

  /**
   * Parses a cURL command string into its component parts.
   *
   * @param curlCommand the raw cURL command string
   * @return the parsed {@link ParsedCurl} structure
   */
  ParsedCurl parseCurl(String curlCommand);
}
