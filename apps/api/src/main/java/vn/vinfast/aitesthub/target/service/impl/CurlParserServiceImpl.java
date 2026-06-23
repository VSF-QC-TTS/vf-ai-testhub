package vn.vinfast.aitesthub.target.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.target.enums.HttpMethod;
import vn.vinfast.aitesthub.target.service.CurlParserService;
import vn.vinfast.aitesthub.target.service.TargetSecretDetector;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CurlParserServiceImpl implements CurlParserService {

  private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};
  private final ObjectMapper objectMapper;
  private final TargetSecretDetector secretDetector;

  @Override
  public ParsedCurl parseCurl(String curlCommand) {
    if (curlCommand == null || curlCommand.trim().isEmpty()) {
      throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
    }

    String normalized = normalize(curlCommand);
    List<String> tokens = tokenize(normalized);

    if (tokens.isEmpty() || !tokens.getFirst().equalsIgnoreCase("curl")) {
      throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
    }

    ParsedCurl parsed = new ParsedCurl();
    String methodStr = null;
    String urlStr = null;
    Map<String, Object> headers = new HashMap<>();
    StringBuilder bodyBuilder = new StringBuilder();

    int i = 1;
    while (i < tokens.size()) {
      String token = tokens.get(i);
      switch (token) {
        case "--request", "-X" -> {
          methodStr = requireNext(tokens, i);
          i += 2;
        }
        case "--header", "-H" -> {
          String headerValue = requireNext(tokens, i);
          parseHeader(headerValue, headers);
          i += 2;
        }
        case "--data", "--data-raw", "--data-binary", "-d" -> {
          String data = requireNext(tokens, i);
          if (!bodyBuilder.isEmpty()) {
            bodyBuilder.append("&");
          }
          bodyBuilder.append(data);
          i += 2;
        }
        case "--url" -> {
          urlStr = requireNext(tokens, i);
          i += 2;
        }
        case "--location", "-L", "--compressed", "--insecure", "-k", "-s", "--silent", "-S",
            "--show-error", "-v", "--verbose", "--globoff", "-g" -> i++;
        default -> {
          if (token.startsWith("-")) {
            // Unknown flag with possible value — skip flag + value
            if (i + 1 < tokens.size() && !tokens.get(i + 1).startsWith("-")) {
              i += 2;
            } else {
              i++;
            }
          } else if (urlStr == null) {
            urlStr = token;
            i++;
          } else {
            i++;
          }
        }
      }
    }

    if (urlStr == null || urlStr.isBlank()) {
      throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
    }

    // Process URL & Query Params
    try {
      // Remove any surrounding quotes from URL if they exist
      if ((urlStr.startsWith("'") && urlStr.endsWith("'")) || (urlStr.startsWith("\"") && urlStr.endsWith("\""))) {
        urlStr = urlStr.substring(1, urlStr.length() - 1);
      }
      
      URI uri = new URI(urlStr);
      String baseUrl = uri.getScheme() + "://" + uri.getAuthority() + uri.getPath();
      parsed.url = baseUrl;

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

    if (!headers.isEmpty()) {
      TargetSecretDetector.SecretDetectionResult detectionResult = secretDetector.detect(headers);
      parsed.headersTemplate = detectionResult.sanitizedHeaders();
      parsed.extractedSecrets = detectionResult.secretValues();
    }

    String bodyRaw = bodyBuilder.isEmpty() ? null : bodyBuilder.toString();
    parsed.method = resolveMethod(methodStr, bodyRaw);
    
    if (bodyRaw != null) {
      parsed.bodyTemplate = tryParseJson(bodyRaw);
      if (parsed.bodyTemplate == null) {
        log.warn("cURL body is not valid JSON, creating a raw wrapper. Original: {}", bodyRaw);
        Map<String, Object> rawMap = new HashMap<>();
        rawMap.put("raw", bodyRaw);
        parsed.bodyTemplate = rawMap;
      }
    }

    return parsed;
  }

  private String normalize(String rawCurl) {
    return rawCurl
        .replace("\\\n", " ")
        .replace("\\\r\n", " ")
        .replace("\\\r", " ")
        .replaceAll("\\\\\\s*\n", " ")
        .trim();
  }

  private List<String> tokenize(String input) {
    List<String> tokens = new ArrayList<>();
    StringBuilder current = new StringBuilder();
    boolean inSingleQuote = false;
    boolean inDoubleQuote = false;

    for (int i = 0; i < input.length(); i++) {
      char c = input.charAt(i);

      if (inSingleQuote) {
        if (c == '\'') {
          inSingleQuote = false;
        } else {
          current.append(c);
        }
      } else if (inDoubleQuote) {
        if (c == '\\' && i + 1 < input.length()) {
          char next = input.charAt(i + 1);
          if (next == '"' || next == '\\') {
            current.append(next);
            i++;
          } else {
            current.append(c);
          }
        } else if (c == '"') {
          inDoubleQuote = false;
        } else {
          current.append(c);
        }
      } else {
        if (c == '\'') {
          inSingleQuote = true;
        } else if (c == '"') {
          inDoubleQuote = true;
        } else if (Character.isWhitespace(c)) {
          if (!current.isEmpty()) {
            tokens.add(current.toString());
            current.setLength(0);
          }
        } else {
          current.append(c);
        }
      }
    }

    if (!current.isEmpty()) {
      tokens.add(current.toString());
    }

    return tokens;
  }

  private void parseHeader(String headerValue, Map<String, Object> headers) {
    int colonIndex = headerValue.indexOf(':');
    if (colonIndex <= 0) {
      return;
    }
    String name = headerValue.substring(0, colonIndex).trim();
    String value = headerValue.substring(colonIndex + 1).trim();
    headers.put(name, value);
  }

  private String requireNext(List<String> tokens, int currentIndex) {
    if (currentIndex + 1 >= tokens.size()) {
      throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
    }
    return tokens.get(currentIndex + 1);
  }

  private HttpMethod resolveMethod(String explicit, String bodyRaw) {
    if (explicit != null) {
      try {
        return HttpMethod.valueOf(explicit.toUpperCase());
      } catch (IllegalArgumentException e) {
        throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
      }
    }
    return bodyRaw != null ? HttpMethod.POST : HttpMethod.GET;
  }

  private Map<String, Object> tryParseJson(String bodyRaw) {
    if (bodyRaw == null || bodyRaw.isBlank()) {
      return null;
    }
    try {
      return objectMapper.readValue(bodyRaw.trim(), MAP_TYPE);
    } catch (Exception e) {
      return null;
    }
  }
}
