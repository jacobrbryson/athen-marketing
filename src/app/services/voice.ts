import { Injectable, signal } from '@angular/core';

/**
 * Voice input foundation (Phase 6).
 *
 * Browser-based speech-to-text via the Web Speech API, exposed through a
 * small provider-agnostic surface so future phases can swap in cloud STT,
 * streaming transcription, wake words, or native mobile recognizers without
 * touching call sites.
 *
 * A consumer:
 *   1. checks `isSupported()`
 *   2. calls `start()` for push-to-talk (press), `stop()` on release
 *   3. reads `interimTranscript` (live) and receives the final text via the
 *      `onResult` callback passed to `start()`.
 */
type SpeechRecognitionCtor = new () => any;

@Injectable({ providedIn: 'root' })
export class VoiceInputService {
  readonly listening = signal<boolean>(false);
  readonly interimTranscript = signal<string>('');
  readonly errorMessage = signal<string | null>(null);

  private recognition: any = null;
  private onResultCb: ((text: string) => void) | null = null;

  private getCtor(): SpeechRecognitionCtor | null {
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }

  /** Whether browser-based speech recognition is available. */
  isSupported(): boolean {
    return this.getCtor() !== null;
  }

  /**
   * Begin listening. `onResult` is called with the final transcript when
   * recognition produces a final result (or on stop). Returns false if
   * unsupported so callers can fall back to typing.
   */
  start(onResult: (text: string) => void): boolean {
    if (this.listening()) return true;
    const Ctor = this.getCtor();
    if (!Ctor) {
      this.errorMessage.set('Voice input is not supported in this browser.');
      return false;
    }

    this.onResultCb = onResult;
    this.errorMessage.set(null);
    this.interimTranscript.set('');

    const recognition = new Ctor();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (interim) this.interimTranscript.set(interim);
      if (finalText && this.onResultCb) {
        this.onResultCb(finalText.trim());
        this.interimTranscript.set('');
      }
    };

    recognition.onerror = (event: any) => {
      const map: Record<string, string> = {
        'not-allowed': 'Microphone access was blocked.',
        'no-speech': "I didn't catch that — try again.",
        'audio-capture': 'No microphone was found.',
        network: 'Network error during voice recognition.',
      };
      this.errorMessage.set(map[event.error] || 'Voice input error.');
      this.listening.set(false);
    };

    recognition.onend = () => {
      this.listening.set(false);
    };

    try {
      recognition.start();
      this.recognition = recognition;
      this.listening.set(true);
      return true;
    } catch (err) {
      console.error('VoiceInputService: start failed', err);
      this.errorMessage.set('Could not start voice input.');
      this.listening.set(false);
      return false;
    }
  }

  /** Stop listening (push-to-talk release). */
  stop(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        /* already stopped */
      }
    }
    this.listening.set(false);
  }
}
