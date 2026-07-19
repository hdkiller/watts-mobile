import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-screens/experimental';

import { CoachChat } from '@/src/features/coach/CoachChat';
import { Colors } from '@/src/theme/colors';

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function CoachScreen() {
  const params = useLocalSearchParams<{ roomId?: string | string[]; attach?: string | string[] }>();
  const roomId = firstParam(params.roomId);
  const attachRaw = firstParam(params.attach);
  const autoAttach =
    attachRaw === 'camera' || attachRaw === 'library' ? attachRaw : null;

  return (
    <SafeAreaView
      edges={{ top: true, bottom: true }}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <CoachChat targetRoomId={roomId} autoAttach={autoAttach} />
    </SafeAreaView>
  );
}
