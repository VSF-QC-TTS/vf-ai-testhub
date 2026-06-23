package vn.vinfast.aitesthub.target.service.impl;

import java.util.ArrayList;
import java.util.List;

public class TokenizerTest {
    public static void main(String[] args) {
        String input = "curl -X POST \"https://generativelanguage.googleapis.com/v1beta/interactions\" \\\n" +
            "  -H \"x-goog-api-key: $GEMINI_API_KEY\" \\\n" +
            "  -H 'Content-Type: application/json' \\\n" +
            "  -d '{\n" +
            "    \"model\": \"gemini-3.5-flash\",\n" +
            "    \"input\": \"Explain how AI works in a few words\"\n" +
            "  }'";
            
        System.out.println(tokenize(normalize(input)));
    }
    
  private static String normalize(String rawCurl) {
    return rawCurl
        .replace("\\\n", " ")
        .replace("\\\r\n", " ")
        .replace("\\\r", " ")
        .replaceAll("\\\\\\s*\n", " ")
        .trim();
  }

  private static List<String> tokenize(String input) {
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
}
