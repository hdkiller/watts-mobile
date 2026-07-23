import { useCallback, useEffect, useRef, useState } from 'react';

import { friendlyError } from '@/src/api/errors';

import { transcribeChatAudio } from './api';
import { appendTranscript } from './dictation';

type ExpoAudioModule = typeof import('expo-audio');

type UseCoachDictationOptions = {
  /** When false, block starting a new recording. Stop remains available while recording. */
  canStart: boolean;
  input: string;
  setInput: (value: string) => void;
};

type UseCoachDictationResult = {
  isRecording: boolean;
  isTranscribing: boolean;
  statusLine: string | null;
  error: string | null;
  clearError: () => void;
  toggleRecording: () => Promise<void>;
};

const UNAVAILABLE_MESSAGE =
  'Dictation needs a rebuilt native app. Run pnpm ios (or pnpm android) after adding expo-audio.';

function getExpoAudio(): ExpoAudioModule | null {
  try {
    // Resolves native ExpoAudio at require time; missing binary throws.
    return require('expo-audio') as ExpoAudioModule;
  } catch {
    return null;
  }
}

const ExpoAudio = getExpoAudio();

function useCoachDictationUnavailable(): UseCoachDictationResult {
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);
  const toggleRecording = useCallback(async () => {
    setError(UNAVAILABLE_MESSAGE);
  }, []);

  return {
    isRecording: false,
    isTranscribing: false,
    statusLine: null,
    error,
    clearError,
    toggleRecording,
  };
}

function useCoachDictationNative(options: UseCoachDictationOptions): UseCoachDictationResult {
  const {
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState,
  } = ExpoAudio!;
  const { canStart, input, setInput } = options;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef(input);
  const busyRef = useRef(false);
  const ownsRecordingModeRef = useRef(false);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    return () => {
      if (!ownsRecordingModeRef.current) return;
      if (recorder.isRecording) {
        void recorder
          .stop()
          .catch(() => {
            // ignore cleanup errors
          })
          .finally(() => {
            ownsRecordingModeRef.current = false;
            void setAudioModeAsync({ allowsRecording: false });
          });
      } else {
        ownsRecordingModeRef.current = false;
        void setAudioModeAsync({ allowsRecording: false });
      }
    };
    // Recorder instance is stable for the component lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const startRecording = useCallback(async () => {
    setError(null);
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError('Allow microphone access to use dictation.');
      return;
    }

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      ownsRecordingModeRef.current = true;
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      ownsRecordingModeRef.current = false;
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {
        // Preserve the original recording error.
      });
      throw err;
    }
  }, [recorder, requestRecordingPermissionsAsync, setAudioModeAsync]);

  const stopAndTranscribe = useCallback(async () => {
    setError(null);
    try {
      await recorder.stop();
    } finally {
      // `setAudioModeAsync` is app-global. Restore playback mode before the
      // network transcription so Coach chat does not retain play-and-record.
      ownsRecordingModeRef.current = false;
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {
        // A mode-reset failure must not discard an otherwise valid recording.
      });
    }
    const uri = recorder.uri;
    if (!uri) {
      setError('Could not capture your voice note.');
      return;
    }

    setIsTranscribing(true);
    try {
      const transcript = await transcribeChatAudio({
        uri,
        mediaType: 'audio/mp4',
        filename: 'dictation.m4a',
      });
      setInput(appendTranscript(inputRef.current, transcript));
    } catch (err) {
      setError(friendlyError(err, 'Could not transcribe your voice note.'));
    } finally {
      setIsTranscribing(false);
    }
  }, [recorder, setAudioModeAsync, setInput]);

  const toggleRecording = useCallback(async () => {
    if (busyRef.current || isTranscribing) return;
    busyRef.current = true;
    try {
      if (recorderState.isRecording) {
        // Always allow stop — even if canStart flipped false mid-recording (e.g. send/stream).
        await stopAndTranscribe();
      } else if (canStart) {
        await startRecording();
      }
    } catch (err) {
      setError(friendlyError(err, 'Could not start microphone recording.'));
    } finally {
      busyRef.current = false;
    }
  }, [
    canStart,
    isTranscribing,
    recorderState.isRecording,
    startRecording,
    stopAndTranscribe,
  ]);

  const statusLine = recorderState.isRecording
    ? 'Recording voice note…'
    : isTranscribing
      ? 'Transcribing your voice note…'
      : null;

  return {
    isRecording: recorderState.isRecording,
    isTranscribing,
    statusLine,
    error,
    clearError,
    toggleRecording,
  };
}

/** Soft-fails when the installed binary lacks ExpoAudio (stale dev client). */
export const useCoachDictation = ExpoAudio
  ? useCoachDictationNative
  : useCoachDictationUnavailable;
