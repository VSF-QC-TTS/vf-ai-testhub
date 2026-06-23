package vn.vinfast.aitesthub.target.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.target.enums.HttpMethod;
import vn.vinfast.aitesthub.target.service.CurlParserService;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CurlParserServiceImpl implements CurlParserService {

  private final ObjectMapper objectMapper;

  private static final Pattern CURL_PATTERN = Pattern.compile("^curl\\s+");
  private static final Pattern URL_PATTERN = Pattern.compile("['\"]?(https?://[^\\s'\"]+)['\"]?");
  private static final Pattern METHOD_PATTERN = Pattern.compile("-X\\s+([A-Z]+)");
  private static final Pattern HEADER_PATTERN = Pattern.compile("-H\\s+['\"]([^:]+):\\s*(.*?)['\"]");
  private static final Pattern DATA_PATTERN = Pattern.compile("--data(?:-raw|-binary)?\\s+['\"](.*?)['\"]", Pattern.DOTALL);
  private static final Pattern DATA_SHORT_PATTERN = Pattern.compile("-d\\s+['\"](.*?)['\"]", Pattern.DOTALL);

  @Override
  public ParsedCurl parseCurl(String curlCommand) {
    if (curlCommand == null || curlCommand.trim().isEmpty()) {
      throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
    }

    String normalizedCurl = curlCommand.trim().replace("\\\n", " ").replace("\\\r\n", " ");

    if (!CURL_PATTERN.matcher(normalizedCurl).find()) {
      throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
    }

    ParsedCurl parsed = new ParsedCurl();

    // Parse URL
    Matcher urlMatcher = URL_PATTERN.matcher(normalizedCurl);
    if (urlMatcher.find()) {
      String fullUrl = urlMatcher.group(1);
      try {
        URI uri = new URI(fullUrl);
        String baseUrl = uri.getScheme() + "://" + uri.getAuthority() + uri.getPath();
        parsed.url = baseUrl;

        // Parse Query Params from URL
        if (uri.getQuery() != null) {
          Map<String, Object> queryParams = new HashMap<>();
          String[] pairs = uri.getQuery().split("&");
          for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
              queryParams.put(pair.substring(0, idx), pair.substring(idx + 1));
            } else {
              queryParams.put(pair, "");
            }
          }
          parsed.queryParamsTemplate = queryParams;
        }
      } catch (URISyntaxException e) {
        throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
      }
    } else {
      throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
    }

    // Parse Method
    Matcher methodMatcher = METHOD_PATTERN.matcher(normalizedCurl);
    if (methodMatcher.find()) {
      try {
        parsed.method = HttpMethod.valueOf(methodMatcher.group(1).toUpperCase());
      } catch (IllegalArgumentException e) {
        parsed.method = HttpMethod.POST; // Default fallback
      }
    } else {
      parsed.method = (normalizedCurl.contains("--data") || normalizedCurl.contains("-d ")) ? HttpMethod.POST : HttpMethod.GET;
    }

    // Parse Headers
    Map<String, Object> headers = new HashMap<>();
    Matcher headerMatcher = HEADER_PATTERN.matcher(normalizedCurl);
    while (headerMatcher.find()) {
      headers.put(headerMatcher.group(1).trim(), headerMatcher.group(2).trim());
    }
    if (!headers.isEmpty()) {
      parsed.headersTemplate = headers;
    }

    // Parse Body
    Matcher dataMatcher = DATA_PATTERN.matcher(normalizedCurl);
    if (!dataMatcher.find()) {
      dataMatcher = DATA_SHORT_PATTERN.matcher(normalizedCurl);
    }

    if (dataMatcher.find()) {
      String rawBody = dataMatcher.group(1);
      
      // Try to parse as-is first
      try {
        parsed.bodyTemplate = objectMapper.readValue(rawBody, new TypeReference<Map<String, Object>>() {});
      } catch (JsonProcessingException e) {
        // If it fails, it might be because the entire string was inside double quotes and escaped.
        // Let's try unescaping.
        String unescapedBody = rawBody.replace("\\\"", "\"");
        try {
          parsed.bodyTemplate = objectMapper.readValue(unescapedBody, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException ex) {
          log.warn("cURL body is not valid JSON, creating a raw wrapper. Original: {}", rawBody);
          Map<String, Object> rawMap = new HashMap<>();
          rawMap.put("raw", rawBody);
          parsed.bodyTemplate = rawMap;
        }
      }
    }

    return parsed;
  }
}
