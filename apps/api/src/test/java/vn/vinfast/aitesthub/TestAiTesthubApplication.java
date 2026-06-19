package vn.vinfast.aitesthub;

import org.springframework.boot.SpringApplication;

public class TestAiTesthubApplication {

  public static void main(String[] args) {
    SpringApplication.from(AiTesthubApplication::main)
        .with(TestcontainersConfiguration.class)
        .run(args);
  }
}
