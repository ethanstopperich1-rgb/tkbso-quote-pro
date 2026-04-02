/**
 * useVoiceEstimate — Web Speech API + Qwen AI estimate generation
 *
 * Flow:
 *   1. User taps mic → SpeechRecognition starts (real-time transcript)
 *   2. User taps stop (or silence detected) → transcript finalized
 *   3. Hook calls generateEstimateFromVoice() from aiEngine.ts
 *   4. Returns AIScopeResponse with line items, gap warnings, markup suggestion
 *
 * Browser support:
 *   Chrome/Edge: window.SpeechRecognition (full support)
 *   iOS Safari:  window.webkitSpeechRecognition (webkit prefix required)
 *   Firefox:     Not supported — graceful fallback to manual text input
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { generateEstimateFromVoice } from '../lib/aiEngine';
import type { AIScopeResponse, ProjectType } from '../types';

export type VoiceEstimateStatus =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'processing'
  | 'done'
  | 'error'
  | 'unsupported';

export interface UseVoiceEstimateReturn {
  status: VoiceEstimateStatus;
  transcript: string;            // live transcript while recording
  finalTranscript: string;       // confirmed transcript after stop
  result: AIScopeResponse | null;
  error: string | null;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  reset: () => void;
  runEstimate: (text: string, type?: ProjectType) => Promise<void>; // manual text fallback
}

export function useVoiceEstimate(projectType: ProjectType = 'kitchen'): UseVoiceEstimateReturn {
  const [status, setStatus] = useState<VoiceEstimateStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [result, setResult] = useState<AIScopeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedRef = useRef(''); // accumulate interim results

  // Detect browser support
  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
      : undefined;

  const isSupported = Boolean(SpeechRecognitionAPI);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }

    setStatus('requesting_permission');
    setTranscript('');
    setFinalTranscript('');
    setResult(null);
    setError(null);
    accumulatedRef.current = '';

    const recognition = new SpeechRecognitionAPI!();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('recording');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let confirmed = accumulatedRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          confirmed += result[0].transcript + ' ';
          accumulatedRef.current = confirmed;
        } else {
          interim += result[0].transcript;
        }
      }

      setTranscript(confirmed + interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted') return; // user stopped intentionally
      const msg =
        event.error === 'not-allowed'
          ? 'Microphone access denied. Please allow mic access in your browser settings.'
          : event.error === 'network'
          ? 'Network error. Check your connection and try again.'
          : `Speech recognition error: ${event.error}`;
      setError(msg);
      setStatus('error');
    };

    recognition.onend = () => {
      // Only auto-process if we were still recording (not manually stopped)
      if (accumulatedRef.current.trim().length > 0) {
        const finalText = accumulatedRef.current.trim();
        setFinalTranscript(finalText);
        runEstimateInternal(finalText);
      } else {
        setStatus('idle');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, projectType]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // triggers onend
    }
  }, []);

  const runEstimateInternal = useCallback(
    async (text: string, type: ProjectType = projectType) => {
      if (!text.trim()) {
        setError('No speech detected. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('processing');
      setError(null);

      try {
        const response = await generateEstimateFromVoice(text, type);
        setResult(response);
        setStatus('done');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'AI estimate failed. Please try again.';
        setError(msg);
        setStatus('error');
      }
    },
    [projectType]
  );

  // Public manual text fallback
  const runEstimate = useCallback(
    async (text: string, type: ProjectType = projectType) => {
      setFinalTranscript(text);
      await runEstimateInternal(text, type);
    },
    [projectType, runEstimateInternal]
  );

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    setStatus('idle');
    setTranscript('');
    setFinalTranscript('');
    setResult(null);
    setError(null);
    accumulatedRef.current = '';
  }, []);

  return {
    status,
    transcript,
    finalTranscript,
    result,
    error,
    isSupported,
    startRecording,
    stopRecording,
    reset,
    runEstimate,
  };
}
