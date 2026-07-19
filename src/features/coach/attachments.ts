import type { ImagePickerAsset } from 'expo-image-picker';

import { MAX_CHAT_ATTACHMENTS, type PendingAttachment } from './types';

type ImagePickerModule = typeof import('expo-image-picker');

function getImagePicker(): ImagePickerModule | null {
  try {
    // Resolves native ExponentImagePicker at require time; missing binary throws.
    return require('expo-image-picker') as ImagePickerModule;
  } catch {
    return null;
  }
}

function extensionForMediaType(mediaType: string): string {
  if (mediaType.includes('png')) return 'png';
  if (mediaType.includes('webp')) return 'webp';
  if (mediaType.includes('gif')) return 'gif';
  if (mediaType.includes('heic') || mediaType.includes('heif')) return 'heic';
  return 'jpg';
}

function assetToPending(asset: ImagePickerAsset): PendingAttachment {
  const mediaType = asset.mimeType || 'image/jpeg';
  const ext = extensionForMediaType(mediaType);
  const filename =
    asset.fileName ||
    `coach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return {
    id: `${asset.assetId || filename}-${asset.uri}`,
    localUri: asset.uri,
    mediaType,
    filename,
    uploading: false,
    error: null,
  };
}

export type AttachResult =
  | { ok: true; attachments: PendingAttachment[] }
  | {
      ok: false;
      reason: 'permission' | 'cancelled' | 'limit' | 'unavailable';
      message: string;
    };

const UNAVAILABLE_RESULT: AttachResult = {
  ok: false,
  reason: 'unavailable',
  message:
    'Photo attach needs a rebuilt native app. Run npx expo run:ios (or android) after adding expo-image-picker.',
};

export async function pickChatImagesFromLibrary(
  currentCount: number
): Promise<AttachResult> {
  const ImagePicker = getImagePicker();
  if (!ImagePicker) return UNAVAILABLE_RESULT;

  const remaining = MAX_CHAT_ATTACHMENTS - currentCount;
  if (remaining <= 0) {
    return {
      ok: false,
      reason: 'limit',
      message: `You can attach up to ${MAX_CHAT_ATTACHMENTS} photos per message.`,
    };
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      reason: 'permission',
      message: 'Photo library access is needed to attach meal photos for Coach.',
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 0.72,
    exif: false,
  });

  if (result.canceled) {
    return { ok: false, reason: 'cancelled', message: 'Cancelled' };
  }

  return {
    ok: true,
    attachments: result.assets.map(assetToPending).slice(0, remaining),
  };
}

export async function captureChatPhoto(currentCount: number): Promise<AttachResult> {
  const ImagePicker = getImagePicker();
  if (!ImagePicker) return UNAVAILABLE_RESULT;

  if (currentCount >= MAX_CHAT_ATTACHMENTS) {
    return {
      ok: false,
      reason: 'limit',
      message: `You can attach up to ${MAX_CHAT_ATTACHMENTS} photos per message.`,
    };
  }

  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      reason: 'permission',
      message: 'Camera access is needed to photograph meals for Coach.',
    };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.72,
    exif: false,
  });

  if (result.canceled || !result.assets[0]) {
    return { ok: false, reason: 'cancelled', message: 'Cancelled' };
  }

  return { ok: true, attachments: [assetToPending(result.assets[0])] };
}
