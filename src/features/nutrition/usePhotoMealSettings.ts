import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import {
  getPhotoSourceModeSync,
  getSavePhotoToLibrarySync,
  isPhotoMealSettingsHydrated,
  loadPhotoMealSettings,
  photoSourceModeLabel,
  setPhotoSourceMode,
  setSavePhotoToLibrary,
  subscribePhotoMealSettings,
  type PhotoSourceMode,
} from './photoMealSettings';

export function usePhotoMealSettings() {
  const sourceMode = useSyncExternalStore(
    subscribePhotoMealSettings,
    getPhotoSourceModeSync,
    getPhotoSourceModeSync
  );
  const saveToLibrary = useSyncExternalStore(
    subscribePhotoMealSettings,
    getSavePhotoToLibrarySync,
    getSavePhotoToLibrarySync
  );
  const [ready, setReady] = useState(isPhotoMealSettingsHydrated());

  useEffect(() => {
    let active = true;
    void loadPhotoMealSettings().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const updateSourceMode = useCallback(async (mode: PhotoSourceMode) => {
    await setPhotoSourceMode(mode);
  }, []);

  const updateSaveToLibrary = useCallback(async (save: boolean) => {
    await setSavePhotoToLibrary(save);
  }, []);

  return {
    sourceMode,
    saveToLibrary,
    ready,
    setSourceMode: updateSourceMode,
    setSaveToLibrary: updateSaveToLibrary,
    sourceModeLabel: photoSourceModeLabel(sourceMode),
  };
}
