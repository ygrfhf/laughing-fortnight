import { describe, expect, test } from "vitest";
import { joinForSpeech, MAX_CHUNK_LENGTH, pickOnDeviceVoice, splitForSpeech } from "./speech";

type VoiceLike = Pick<SpeechSynthesisVoice, "name" | "lang" | "localService" | "default">;
const voice = (name: string, lang: string, localService: boolean, isDefault = false): VoiceLike => ({
  name,
  lang,
  localService,
  default: isDefault,
});

describe("pickOnDeviceVoice", () => {
  test("never picks a cloud voice, even if it is the browser default", () => {
    const voices = [voice("Cloud English", "en-US", false, true), voice("Device English", "en-US", true)];

    expect(pickOnDeviceVoice(voices, "en-US")?.name).toBe("Device English");
  });

  test("returns null when only cloud voices exist (the read-aloud button is then hidden)", () => {
    expect(pickOnDeviceVoice([voice("Cloud English", "en-US", false, true)], "en")).toBeNull();
  });

  test("returns null when no on-device voice speaks the page language", () => {
    expect(pickOnDeviceVoice([voice("Device Spanish", "es-ES", true)], "en")).toBeNull();
  });

  test("prefers an exact language match, then any voice for the same language", () => {
    const voices = [voice("UK", "en-GB", true), voice("US", "en-US", true)];

    expect(pickOnDeviceVoice(voices, "en-US")?.name).toBe("US");
    expect(pickOnDeviceVoice(voices, "en")?.name).toBe("UK");
  });

  test("prefers the device default among equally good on-device voices", () => {
    const voices = [voice("A", "en-US", true), voice("B", "en-US", true, true)];

    expect(pickOnDeviceVoice(voices, "en-US")?.name).toBe("B");
  });

  test("matches languages case-insensitively and with underscores (some Android voices)", () => {
    expect(pickOnDeviceVoice([voice("Android", "en_us", true)], "en-US")?.name).toBe("Android");
  });

  test("returns null for an empty voice list (voices not loaded yet)", () => {
    expect(pickOnDeviceVoice([], "en")).toBeNull();
  });
});

describe("splitForSpeech", () => {
  test("splits into sentences, keeping their punctuation", () => {
    expect(splitForSpeech("Get your blocks. Count them! Ready? Go")).toEqual([
      "Get your blocks.",
      "Count them!",
      "Ready?",
      "Go",
    ]);
  });

  test("breaks very long sentences at word boundaries so no chunk is too long", () => {
    const long = Array.from({ length: 80 }, (_, i) => `word${i}`).join(" ");

    const chunks = splitForSpeech(long);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= MAX_CHUNK_LENGTH)).toBe(true);
    expect(chunks.join(" ")).toBe(long);
  });

  test("ignores blank input and extra whitespace", () => {
    expect(splitForSpeech("   ")).toEqual([]);
    expect(splitForSpeech("  Hi.   There.  ")).toEqual(["Hi.", "There."]);
  });

  test("does not split inside numbers like 1/2 or 3.5", () => {
    expect(splitForSpeech("Place 1/2 and 3.5 on the line.")).toEqual(["Place 1/2 and 3.5 on the line."]);
  });
});

describe("joinForSpeech", () => {
  test("joins parts into sentences, adding a period only where needed", () => {
    expect(joinForSpeech(["Your next step", "Count to 20", "Great job!"])).toBe(
      "Your next step. Count to 20. Great job!",
    );
  });

  test("skips empty parts", () => {
    expect(joinForSpeech(["Right now", "", "  ", "Math"])).toBe("Right now. Math.");
  });
});
