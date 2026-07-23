/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app
 * Events lite create — title + date + lite optionals.
 */
import { router, Stack, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import {
  buildCreateEventInput,
  defaultEventDateYmd,
  EVENT_PRIORITY_OPTIONS,
  EVENT_TYPE_OPTIONS,
  validateEventCreateForm,
} from '@/src/features/events/buildCreateEvent';
import type { EventPriority } from '@/src/features/events/types';
import { useCreateEventMutation } from '@/src/features/events/useEvents';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function NewEventScreen() {
  const theme = useThemeColors();
  const createEvent = useCreateEventMutation();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultEventDateYmd);
  const [type, setType] = useState('Ride');
  const [priority, setPriority] = useState<EventPriority | ''>('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const values = useMemo(
    () => ({ title, date, type, priority, location, description, startTime }),
    [title, date, type, priority, location, description, startTime]
  );

  const onSubmit = async () => {
    const validation = validateEventCreateForm(values);
    if (validation) {
      hapticError();
      setError(validation);
      return;
    }
    setError(null);
    try {
      const created = await createEvent.mutateAsync(buildCreateEventInput(values));
      hapticSuccess();
      router.replace(APP_HREFS.eventDetail(created.id) as Href);
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not create event'));
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New event', headerShown: true }} />
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="px-6 pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-sm text-text-muted">
          Add a race or life event. Edit and delete stay on Coach Watts web.
        </Text>

        <Text className="mt-6 text-sm font-medium text-text-muted">Title</Text>
        <TextInput
          className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
          placeholder="e.g. Autumn gran fondo"
          placeholderTextColor={theme.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text className="mt-4 text-sm font-medium text-text-muted">Date (YYYY-MM-DD)</Text>
        <TextInput
          className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
          placeholder="2026-10-15"
          placeholderTextColor={theme.textMuted}
          value={date}
          onChangeText={setDate}
          autoCapitalize="none"
        />

        <Text className="mt-4 text-sm font-medium text-text-muted">Type</Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {EVENT_TYPE_OPTIONS.map((item) => {
            const selected = type === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  hapticLight();
                  setType(item.id);
                }}
                className={`rounded-lg border px-3 py-2 ${selected ? 'border-brand bg-card' : 'border-border bg-card/60'}`}
              >
                <Text className="text-sm font-medium text-text-primary">{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-4 text-sm font-medium text-text-muted">Priority</Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {EVENT_PRIORITY_OPTIONS.map((item) => {
            const selected = priority === item.id;
            return (
              <Pressable
                key={item.id || 'none'}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  hapticLight();
                  setPriority(item.id);
                }}
                className={`rounded-lg border px-3 py-2 ${selected ? 'border-brand bg-card' : 'border-border bg-card/60'}`}
              >
                <Text className="text-sm font-medium text-text-primary">{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-4 text-sm font-medium text-text-muted">Location (optional)</Text>
        <TextInput
          className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
          placeholder="City or venue"
          placeholderTextColor={theme.textMuted}
          value={location}
          onChangeText={setLocation}
        />

        <Text className="mt-4 text-sm font-medium text-text-muted">Start time (optional)</Text>
        <TextInput
          className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
          placeholder="09:00"
          placeholderTextColor={theme.textMuted}
          value={startTime}
          onChangeText={setStartTime}
          autoCapitalize="none"
        />

        <Text className="mt-4 text-sm font-medium text-text-muted">Notes (optional)</Text>
        <TextInput
          className="mt-2 min-h-[88px] rounded-xl border border-border bg-card px-4 py-3 text-base text-text-primary"
          placeholder="Course notes, travel, etc."
          placeholderTextColor={theme.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

        <Button
          className="mt-8"
          label="Create event"
          disabled={createEvent.isPending}
          loading={createEvent.isPending}
          onPress={() => void onSubmit()}
        />
      </ScrollView>
    </>
  );
}
