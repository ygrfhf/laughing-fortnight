import { useCallback, useEffect, useRef, useState } from "react";
import { pickOnDeviceVoice, splitForSpeech } from "./speech";

/** A little slower than default, for young listeners. */
const SPEECH_RATE = 0.9;

export interface Speech {
  /** True only when an on-device voice for the page language exists. */
  available: boolean;
  speaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
}

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  if (typeof window.SpeechSynthesisUtterance !== "function") return null;
  return window.speechSynthesis;
}

const pageLanguage = (lang?: string): string => lang ?? (document.documentElement.lang || "en");

/**
 * Text-to-speech with on-device voices only (never the microphone, never a cloud voice).
 * Speaks only when `speak` is called (tap-only). Stops when the component unmounts, but only
 * if this component started the current speech.
 */
export function useSpeech(lang?: string): Speech {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(() => {
    const synth = getSynth();
    return synth ? pickOnDeviceVoice(synth.getVoices(), pageLanguage(lang)) : null;
  });
  const [speaking, setSpeaking] = useState(false);
  const ownsSpeechRef = useRef(false);
  // Each speak() bumps this, so late events from cancelled speech cannot flip the state.
  const generationRef = useRef(0);

  // Voices often load after the page does; follow "voiceschanged".
  useEffect(() => {
    const synth = getSynth();
    if (!synth) return;
    const update = () => setVoice(pickOnDeviceVoice(synth.getVoices(), pageLanguage(lang)));
    update();
    synth.addEventListener?.("voiceschanged", update);
    return () => synth.removeEventListener?.("voiceschanged", update);
  }, [lang]);

  useEffect(
    () => () => {
      if (ownsSpeechRef.current) getSynth()?.cancel();
    },
    [],
  );

  const stop = useCallback(() => {
    generationRef.current += 1;
    ownsSpeechRef.current = false;
    setSpeaking(false);
    getSynth()?.cancel();
  }, []);

  const speak = useCallback(
    (text: string) => {
      const synth = getSynth();
      const chunks = splitForSpeech(text);
      if (!synth || !voice || chunks.length === 0) return;

      synth.cancel();
      const generation = ++generationRef.current;
      ownsSpeechRef.current = true;
      setSpeaking(true);
      const finished = () => {
        if (generation !== generationRef.current) return;
        ownsSpeechRef.current = false;
        setSpeaking(false);
      };

      chunks.forEach((chunk, index) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        // Always set the voice explicitly: the browser default may be a cloud voice.
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = SPEECH_RATE;
        if (index === chunks.length - 1) {
          utterance.onend = finished;
          utterance.onerror = finished;
        }
        synth.speak(utterance);
      });
    },
    [voice],
  );

  return { available: voice !== null, speaking, speak, stop };
}
