import { describe, it, expect } from "vitest";
import i18n from "./index";

describe("i18n configuration", () => {
  it("switches language and updates document element", async () => {
    await i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");
    expect(document.documentElement.lang).toBe("en");

    await i18n.changeLanguage("vi");
    expect(i18n.language).toBe("vi");
    expect(document.documentElement.lang).toBe("vi");
    
    // Test translation output
    expect(i18n.t("common:language")).toBe("Ngôn ngữ");
  });
});
