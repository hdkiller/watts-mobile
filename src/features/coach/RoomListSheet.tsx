import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/src/theme/colors';

import type { ChatRoomSummary } from './types';

function previewForRoom(room: ChatRoomSummary): string {
  const content = room.lastMessage?.content?.trim();
  if (content) return content;
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
      <View className="flex-1 bg-surface-dark">
        <View className="flex-row items-center justify-between border-b border-zinc-800 px-5 py-4">
          <Text className="text-xl font-semibold text-white">Chats</Text>
          <View className="flex-row items-center gap-3">
            <Pressable onPress={onRefresh} className="active:opacity-70">
              <Text className="text-sm font-semibold text-ink-muted">Refresh</Text>
            </Pressable>
            <Pressable onPress={onClose} className="active:opacity-70">
              <Text className="text-sm font-semibold text-brand">Done</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          className="mx-5 mt-4 items-center rounded-xl bg-brand py-3.5 active:opacity-80"
          onPress={onCreate}
        >
          <Text className="text-base font-semibold text-zinc-950">New chat</Text>
        </Pressable>

        {loading && rooms.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.brand} />
          </View>
        ) : (
          <FlatList
            className="mt-4 px-5"
            data={rooms}
            keyExtractor={(item) => item.roomId}
            ListEmptyComponent={
              <Text className="mt-8 text-center text-sm text-ink-muted">No chats yet.</Text>
            }
            renderItem={({ item }) => {
              const active = item.roomId === activeRoomId;
              return (
                <Pressable
                  className={`mb-3 rounded-2xl border px-4 py-3 active:opacity-80 ${
                    active ? 'border-brand bg-brand/10' : 'border-zinc-700 bg-zinc-900'
                  }`}
                  onPress={() => onSelect(item.roomId)}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-white" numberOfLines={1}>
                      {item.roomName || 'Chat'}
                    </Text>
                    <Text className="ml-3 text-xs text-ink-muted">{timeForRoom(item)}</Text>
                  </View>
                  <Text className="mt-1 text-sm text-ink-muted" numberOfLines={2}>
                    {previewForRoom(item)}
                    {item.isReadOnly ? ' · Read-only' : ''}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}
