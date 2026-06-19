import java.util.regex.*;

public class test {
    public static void main(String[] args) {
        String curl = "curl -X POST 'https://api.example.com/v1/chat' "
        + "-H 'Content-Type: application/json' "
        + "-H 'Authorization: Bearer token' "
        + "-d '{\"message\": \"hello\", \"model\": \"gpt-4\"}'";
        
        System.out.println("Original: " + curl);
        
        // This regex fails because it's non-greedy (.*?) and matches up to the first double quote inside the JSON
        // If the payload is wrapped in single quotes, it matches the first double quote as the end quote
        Pattern DATA_SHORT_PATTERN = Pattern.compile("-d\\s+['\"](.*)['\"]", Pattern.DOTALL);
        Matcher dataMatcher = DATA_SHORT_PATTERN.matcher(curl);
        
        if (dataMatcher.find()) {
            System.out.println("Match: " + dataMatcher.group(1));
        } else {
            System.out.println("No match");
        }
    }
}
