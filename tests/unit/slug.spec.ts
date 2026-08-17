import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Soueast S07")).toBe("soueast-s07");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("S06 DM (Plug-in Hybrid)")).toBe("s06-dm-plug-in-hybrid");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Weird Input!!--  ")).toBe("weird-input");
  });

  it("returns an empty string for unsluggable input (uniqueSlug applies the 'item' fallback)", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when free", async () => {
    const slug = await uniqueSlug("Soueast S09", async () => false);
    expect(slug).toBe("soueast-s09");
  });

  it("appends an incrementing suffix until a free slug is found", async () => {
    const taken = new Set(["soueast-s09", "soueast-s09-2", "soueast-s09-3"]);
    const slug = await uniqueSlug("Soueast S09", async (candidate) => taken.has(candidate));
    expect(slug).toBe("soueast-s09-4");
  });

  it("falls back to 'item' as the base when the input has no sluggable characters", async () => {
    const slug = await uniqueSlug("!!!", async () => false);
    expect(slug).toBe("item");
  });
});
