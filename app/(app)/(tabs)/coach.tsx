import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-screens/experimental';

import { CoachChat } from '@/src/features/coach/CoachChat';
import { useThemeColors } from '@/src/theme/useThemeColors';

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function CoachScreen() {
  const theme = useThemeColors();

  const params = useLocalSearchParams<{
    roomId?: string | string[];
    attach?: string | string[];
    discuss?: string | string[];
  }>();
  const roomId = firstParam(params.roomId);
  const attachRaw = firstParam(params.attach);
  const autoAttach =
    attachRaw === 'camera' || attachRaw === 'library' ? attachRaw : null;
  const discussParam = firstParam(params.discuss);
  const discussToday = discussParam === '1';
  const discussSession = discussParam === 'session';

  return (
    <SafeAreaView
      testID="coach-screen"
      edges={{ top: true, bottom: true }}
      style={{ flex: 1, backgroundColor: theme.surface }}
    >
      <CoachChat
        targetRoomId={roomId}
        autoAttach={autoAttach}
        discussToday={discussToday}
        discussSession={discussSession}
      />
    </SafeAreaView>
  );
}
