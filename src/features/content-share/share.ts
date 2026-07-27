import { Share, ShareAction } from 'react-native';

export interface ShareContentOptions {
  url: string;
  title?: string;
  message?: string;
}

/**
 * Invokes React Native native Share.share dialog.
 */
export async function sharePublicContent(options: ShareContentOptions): Promise<ShareAction> {
  const { url, title, message } = options;

  const contentMessage = message ? `${message}\n${url}` : url;

  return Share.share(
    {
      title: title || 'Coach Watts Workout',
      message: contentMessage,
      url,
    },
    {
      dialogTitle: title || 'Share Workout',
    },
  );
}
