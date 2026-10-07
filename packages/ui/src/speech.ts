/**
 * Pure helpers for read-aloud. Privacy rule: only voices that run on the device
 * (localService === true) are ever used, so text is never sent to a cloud speech service.
 */

/** Longest piece handed to the speech engine at once (Chrome stops long utterances early). */
export const MAX_CHUNK_LENGTH = 180;

type VoiceLike = Pick<SpeechSynthesisVoice, "name" | "lang" | "localService" | "default">;

const normalizeLang = (lang: string): string => lang.toLowerCase().replace(/_/g, "-");
const baseLanguage = (lang: string): string => normalizeLang(lang).split("-")[0] ?? "";

/**
 * The best on-device voice for `lang`: exact match first (en-US), then the same language
 * (any en-*), preferring the device default. Null when there is none: callers then hide
 * read-aloud rather than fall back to a cloud or default voice.
 */
export function pickOnDeviceVoice<V extends VoiceLike>(voices: readonly V[], lang: string): V | null {
  const wanted = normalizeLang(lang);
  const onDevice = voices.filter((v) => v.localService);
  const exact = onDevice.filter((v) => normalizeLang(v.lang) === wanted);
  const sameLanguage = onDevice.filter((v) => baseLanguage(v.lang) === baseLanguage(wanted));
  const pool = exact.length > 0 ? exact : sameLanguage;
  return pool.find((v) => v.default) ?? pool[0] ?? null;
}

/** Sentences (split after . ! ? followed by a space), with overly long ones broken at words. */
export function splitForSpeech(text: string): string[] {
  return text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .flatMap(chunkByWords);
}

function chunkByWords(sentence: string): string[] {
  if (sentence.length <= MAX_CHUNK_LENGTH) {
    return [sentence];
  }
  const chunks: string[] = [];
  let current = "";
  for (const word of sentence.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length > MAX_CHUNK_LENGTH) {
      chunks.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Joins labels and content into sentences: ["Right now", "Math"] -> "Right now. Math." */
export function joinForSpeech(parts: readonly string[]): string {
  return parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => (/[.!?]$/.test(part) ? part : `${part}.`))
    .join(" ");
}
