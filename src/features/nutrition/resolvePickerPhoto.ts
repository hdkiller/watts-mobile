export type PickerPhotoAsset = {
  uri?: string | null;
  base64?: string | null;
  mimeType?: string | null;
};

export type ResolvedPickerPhoto = {
  uri: string;
  base64: string;
  mimeType: string;
};

/**
 * Normalize an ImagePicker asset into the payload estimate-photo needs.
 * Prefer the picker's base64 when present; otherwise read the local file.
 */
export async function resolvePickerPhoto(
  asset: PickerPhotoAsset,
  readBase64: (uri: string) => Promise<string> = defaultReadBase64
): Promise<ResolvedPickerPhoto | null> {
  const uri = asset.uri?.trim();
  if (!uri) return null;

  let base64 = asset.base64?.trim() ?? '';
  if (!base64) {
    try {
      base64 = (await readBase64(uri)).trim();
    } catch {
      return null;
    }
  }
  if (!base64) return null;

  return {
    uri,
    base64,
    mimeType: asset.mimeType?.trim() || 'image/jpeg',
  };
}

async function defaultReadBase64(uri: string): Promise<string> {
  const { File } = await import('expo-file-system');
  return new File(uri).base64();
}
