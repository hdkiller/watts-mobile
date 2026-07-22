import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/src/theme/colors';

import type { ChatRoomSummary } from './types';

/** pageSheet already clears the status bar; top inset double-pads on iOS. */
const sheetEdges = Platform.OS === 'ios' ? (['bottom'] as const) : (['top', 'bottom'] as const);

function previewForRoom(room: ChatRoomSummary): string {
  const content = room.lastMessage?.content?.trim();
  if (content) return content;
  // A lastMessage with empty content means the conversation exists but the server
  // stored the text in `parts` (content column empty) — don't claim it's empty.
  if (room.lastMessage) return 'Conversation';
  return 'No messages yet';
}

function timeForRoom(room: ChatRoomSummary): string {
  if (room.lastMessage?.timestamp) return room.lastMessage.timestamp;
  if (typeof room.index === 'number' && room.index > 0) {
    try {
      return new Date(room.index).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }
  return '';
}

export function RoomListSheet({
  visible,
  rooms,
  activeRoomId,
  loading,
  onClose,
  onSelect,
  onCreate,
  onRefresh,
}: {
  visible: boolean;
  rooms: ChatRoomSummary[];
  activeRoomId: string | null;
  loading: boolean;
  onClose: () => void;
  onSelect: (roomId: string) => void;
  onCreate: () => void;
  onRefresh: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-surface" edges={sheetEdges}>
        <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
          <Text className="text-xl font-semibold text-text-primary">Chats</Text>
          <View className="flex-row items-center gap-3">
            <Pressable onPress={onRefresh} className="active:opacity-70">
              <Text className="text-sm font-semibold text-text-muted">Refresh</Text>
            </Pressable>
            <Pressable onPress={onClose} className="active:opacity-70">
              <Text className="text-sm font-semibold text-brand">Done</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          className="mx-5 mt-4 mb-3 items-center rounded-xl bg-brand py-3.5 active:opacity-80"
          onPress={onCreate}
        >
          <Text className="text-base font-semibold text-ink">New chat</Text>
        </Pressable>

        {loading && rooms.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.brand} />
          </View>
        ) : (
          <FlatList
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 32 }}
            data={rooms}
            keyExtractor={(item) => item.roomId}
            ListEmptyComponent={
              <Text className="mt-8 text-center text-sm text-text-muted">No chats yet.</Text>
            }
            renderItem={({ item }) => {
              const active = item.roomId === activeRoomId;
              return (
                <Pressable
                  className={`mx-5 mb-3 rounded-2xl border px-4 py-3 active:opacity-80 ${
                    active ? 'border-brand bg-brand/10' : 'border-border-strong bg-card'
                  }`}
                  onPress={() => onSelect(item.roomId)}
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <Text
                      className="min-w-0 flex-1 text-base font-semibold text-text-primary"
                      numberOfLines={1}
                    >
                      {item.roomName || 'Chat'}
                    </Text>
                    <Text className="shrink-0 text-xs text-text-muted">{timeForRoom(item)}</Text>
                  </View>
                  <Text className="mt-1 text-sm text-text-muted" numberOfLines={2}>
                    {previewForRoom(item)}
                    {item.isReadOnly ? ' · Read-only' : ''}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
