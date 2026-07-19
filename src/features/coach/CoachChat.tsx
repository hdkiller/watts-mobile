import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors } from '@/src/theme/colors';

import { messageText } from './mapMessages';
import { COACH_STARTER_PROMPTS } from './starterPrompts';
import type { CoachUIMessage } from './types';
import { useCoachChat } from './useCoachChat';

function Bubble({ message }: { message: CoachUIMessage }) {
  const isUser = message.role === 'user';
  const typing = Boolean(message.metadata?.syntheticTyping);
  const text = messageText(message).trim();

  return (
    <View className={`mb-3 max-w-[88%] ${isUser ? 'self-end' : 'self-start'}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser ? 'bg-brand' : 'border border-zinc-700 bg-zinc-900'
        }`}
      >
        {typing ? (
          <Text className="text-sm text-ink-muted">Coach is typing…</Text>
        ) : (
          <Text className={`text-base leading-6 ${isUser ? 'text-zinc-950' : 'text-white'}`}>
            {text || (isUser ? '' : '…')}
          </Text>
        )}
      </View>
    </View>
  );
}

export function CoachChat() {
  const listRef = useRef<FlatList<CoachUIMessage>>(null);
  const chat = useCoachChat();

  useEffect(() => {
    if (chat.displayMessages.length === 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [chat.displayMessages, chat.streaming]);

  if (chat.loading && chat.displayMessages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator color={Colors.brand} size="large" />
        <Text className="mt-3 text-sm text-ink-muted">Opening Coach…</Text>
      </View>
    );
  }

  if (chat.error && chat.displayMessages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark px-6">
        <Text className="text-center text-base text-white">{chat.error}</Text>
        <Pressable
          className="mt-4 rounded-xl bg-brand px-5 py-3 active:opacity-80"
          onPress={() => void chat.refresh()}
        >
          <Text className="text-base font-semibold text-zinc-950">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const empty = chat.displayMessages.length === 0;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      <View className="border-b border-zinc-800 px-5 pb-3 pt-2">
        <Text className="text-2xl font-semibold text-white">
          {chat.roomName || 'Coach Watts'}
        </Text>
        <Text className="mt-1 text-sm text-ink-muted">
          {chat.streaming
            ? chat.isRealtimeConnected
              ? 'Streaming reply…'
              : chat.usingPollFallback
                ? 'Waiting for reply (polling)…'
                : 'Waiting for reply…'
            : chat.isRealtimeConnected
              ? 'Live'
              : 'Connected'}
        </Text>
      </View>

      {empty ? (
        <View className="flex-1 px-5 pt-6">
          <Text className="text-base text-ink-muted">
            Ask Coach Watts about today’s recommendation or how you feel. Short questions work
            best.
          </Text>
          <View className="mt-5">
            {COACH_STARTER_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt.id}
                className="mb-3 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 active:opacity-80"
                onPress={() => {
                  chat.applyStarter(prompt.text);
                  void chat.send(prompt.text);
                }}
              >
                <Text className="text-base font-semibold text-white">{prompt.label}</Text>
                <Text className="mt-1 text-sm text-ink-muted">{prompt.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          className="flex-1 px-4 pt-3"
          data={chat.displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Bubble message={item} />}
          contentContainerStyle={{ paddingBottom: 16 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {chat.sendError ? (
        <Text className="px-5 pb-2 text-sm text-red-400">{chat.sendError}</Text>
      ) : null}

      {chat.recoverableTurnId ? (
        <View className="flex-row gap-3 px-5 pb-2">
          {chat.recoverableStatus === 'INTERRUPTED' ? (
            <Pressable
              className="rounded-lg border border-zinc-600 px-3 py-2 active:opacity-80"
              onPress={() => void chat.resumeTurn()}
            >
              <Text className="text-sm font-semibold text-white">Resume</Text>
            </Pressable>
          ) : null}
          <Pressable
            className="rounded-lg border border-zinc-600 px-3 py-2 active:opacity-80"
            onPress={() => void chat.retryTurn()}
          >
            <Text className="text-sm font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <View className="flex-row items-end gap-2 border-t border-zinc-800 px-4 py-3">
        <TextInput
          className="max-h-28 flex-1 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
          placeholder="Message Coach Watts"
          placeholderTextColor={Colors.textMuted}
          value={chat.input}
          onChangeText={chat.setInput}
          multiline
          editable={!chat.sending}
        />
        <Pressable
          className={`rounded-2xl px-4 py-3 ${
            chat.input.trim() && !chat.sending ? 'bg-brand' : 'bg-zinc-700'
          }`}
          disabled={!chat.input.trim() || chat.sending}
          onPress={() => void chat.send()}
        >
          {chat.sending ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text className="text-base font-semibold text-zinc-950">Send</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
