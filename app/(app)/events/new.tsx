/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app
 * Events lite create — title + date + lite optionals.
 */
import { router, Stack, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Button } from '@/src/components/Button';
import { DateYmdField } from '@/src/components/DateYmdField';
import {
  buildCreateEventInput,
  defaultEventDateYmd,
  EVENT_PRIORITY_OPTIONS,
  EVENT_TYPE_OPTIONS,
  validateEventCreateForm,
} from '@/src/features/events/buildCreateEvent';
import type { EventPriority } from '@/src/features/events/types';
import { useCreateEventMutation } from '@/src/features/events/useEvents';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function NewEventScreen() {
  const theme = useThemeColors();
  const createEvent = useCreateEventMutation();
  const { containerRef, overlap } = useKeyboardOverlap();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => defaultEventDateYmd());
  const [type, setType] = useState('Ride');
  const [priority, setPriority] = useState<EventPriority | ''>('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const values = useMemo(
    () => ({ title, date, type, priority, location, description, startTime }),
    [title, date, type, priority, location, description, startTime],
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
      <View ref={containerRef} testID="event-create-screen" className="flex-1 bg-surface">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 40 + overlap }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-sm text-text-muted">
            Add a race or life event. Edit and delete stay on Coach Watts web.
          </Text>

          <Text className="mt-6 text-sm font-medium text-text-muted">Title</Text>
          <TextInput
            testID="event-create-title"
            className="mt-2 rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
            placeholder="e.g. Autumn gran fondo"
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <View className="mt-4">
            <DateYmdField label="Date" value={date} onChange={setDate} testID="event-create-date" />
          </View>

          <Text className="mt-4 text-sm font-medium text-text-muted">Type</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {EVENT_TYPE_OPTIONS.map((item) => {
              const selected = type === item.id;
              return (
                <AnimatedPressable
                  key={item.id}
                  testID={`event-create-type-${item.id}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  hitSlop={8}
                  onPress={() => {
                    hapticLight();
                    setType(item.id);
                  }}
                  className={`rounded-xl border px-3 py-2 ${
                    selected ? 'border-brand bg-brand/15' : 'border-border bg-card/60'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? 'text-brand' : 'text-text-primary'
                    }`}
                  >
                    {item.label}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text className="mt-4 text-sm font-medium text-text-muted">Priority</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {EVENT_PRIORITY_OPTIONS.map((item) => {
              const selected = priority === item.id;
              return (
                <AnimatedPressable
                  key={item.id || 'none'}
                  testID={`event-create-priority-${item.id || 'none'}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  hitSlop={8}
                  onPress={() => {
                    hapticLight();
                    setPriority(item.id);
                  }}
                  className={`rounded-xl border px-3 py-2 ${
                    selected ? 'border-brand bg-brand/15' : 'border-border bg-card/60'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? 'text-brand' : 'text-text-primary'
                    }`}
                  >
                    {item.label}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text className="mt-4 text-sm font-medium text-text-muted">Location (optional)</Text>
          <TextInput
            testID="event-create-location"
            className="mt-2 rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
            placeholder="City or venue"
            placeholderTextColor={theme.textMuted}
            value={location}
            onChangeText={setLocation}
          />

          <Text className="mt-4 text-sm font-medium text-text-muted">Start time (optional)</Text>
          <TextInput
            testID="event-create-start-time"
            className="mt-2 rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
            placeholder="09:00"
            placeholderTextColor={theme.textMuted}
            value={startTime}
            onChangeText={setStartTime}
            autoCapitalize="none"
          />

          <Text className="mt-4 text-sm font-medium text-text-muted">Notes (optional)</Text>
          <TextInput
            testID="event-create-notes"
            className="mt-2 min-h-[88px] rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
            placeholder="Course notes, travel, etc."
            placeholderTextColor={theme.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          {error ? (
            <View className="mt-4 rounded-xl border border-danger/40 bg-tint-error p-3">
              <Text className="text-sm text-danger">{error}</Text>
              <AnimatedPressable
                hitSlop={8}
                onPress={() => {
                  hapticLight();
                  void onSubmit();
                }}
                accessibilityRole="button"
                accessibilityLabel="Retry"
                className="mt-2 self-start"
                testID="event-create-retry"
              >
                <Text className="text-sm font-semibold text-brand">Retry</Text>
              </AnimatedPressable>
            </View>
          ) : null}

          <Button
            className="mt-8"
            label="Create event"
            testID="event-create-submit"
            disabled={createEvent.isPending}
            loading={createEvent.isPending}
            onPress={() => void onSubmit()}
          />
        </ScrollView>
      </View>
    </>
  );
}
