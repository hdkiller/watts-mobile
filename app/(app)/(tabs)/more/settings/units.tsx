import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import {
  distanceUnitLabel,
  temperatureUnitLabel,
  weightUnitLabel,
} from '@/src/features/profile/mapProfile';
import { deviceTimeZone, filterTimeZones, listTimeZones } from '@/src/features/profile/timezones';
import {
  useAthleteProfileQuery,
  usePatchUnitsLocale,
} from '@/src/features/profile/useProfile';
import type { DistanceUnits, TemperatureUnits, WeightUnits } from '@/src/features/profile/types';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

function ChoiceRow<T extends string>({
  title,
  options,
  value,
  onChange,
  disabled,
}: {
  title: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View className="border-b border-zinc-800/80 px-4 py-4">
      <Text className="text-base font-semibold text-white">{title}</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={disabled}
              className={`rounded-lg px-3 py-2 ${
                selected ? 'bg-brand' : 'border border-zinc-700 bg-zinc-900'
              } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
              onPress={() => {
                hapticLight();
                onChange(option.value);
              }}
            >
              <Text
                className={`text-sm font-medium ${selected ? 'text-zinc-950' : 'text-white'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function UnitsLocaleScreen() {
  const { data, isLoading, isError, error, refetch } = useAthleteProfileQuery();
  const saveMutation = usePatchUnitsLocale();

  const [distanceUnits, setDistanceUnits] = useState<DistanceUnits>('Kilometers');
  const [weightUnits, setWeightUnits] = useState<WeightUnits>('Kilograms');
  const [temperatureUnits, setTemperatureUnits] = useState<TemperatureUnits>('Celsius');
  const [timezone, setTimezone] = useState(deviceTimeZone());
  const [timezoneQuery, setTimezoneQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const allZones = useMemo(() => listTimeZones(), []);
  const filteredZones = useMemo(
    () => filterTimeZones(timezoneQuery, allZones).slice(0, 40),
    [allZones, timezoneQuery]
  );

  useEffect(() => {
    if (!data) return;
    setDistanceUnits(data.distanceUnits);
    setWeightUnits(data.weightUnits);
    setTemperatureUnits(data.temperatureUnits);
    setTimezone(data.timezone?.trim() || deviceTimeZone());
  }, [data]);

  const onSave = async () => {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await saveMutation.mutateAsync({
        distanceUnits,
        weightUnits,
        temperatureUnits,
        timezone,
      });
      hapticSuccess();
      setSuccessMessage('Units saved.');
    } catch (err) {
      hapticError();
      setFormError(friendlyError(err, 'Failed to save units'));
    }
  };

  const pending = saveMutation.isPending;

  return (
    <>
      <Stack.Screen options={{ title: 'Units & locale', headerShown: true }} />
      <SafeAreaView
        edges={{ bottom: true }}
        style={{ flex: 1, backgroundColor: Colors.background }}
      >
        {isLoading && !data ? (
          <View className="flex-1 items-center justify-center bg-surface-dark">
            <ActivityIndicator color={Colors.brand} size="large" />
            <Text className="mt-3 text-sm text-ink-muted">Loading units…</Text>
          </View>
        ) : isError && !data ? (
          <View className="flex-1 bg-surface-dark px-6 pt-6">
            <Text className="text-red-400">
              {friendlyError(error, 'Failed to load units')}
            </Text>
            <Button className="mt-4" label="Try again" onPress={() => void refetch()} />
          </View>
        ) : (
          <ScrollView
            className="flex-1 bg-surface-dark"
            contentContainerClassName="px-6 pb-12 pt-4"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-2xl font-semibold text-white">Units & locale</Text>
            <Text className="mt-1 text-sm text-ink-muted">
              How distances, weight, temperature, and “today” are shown in the companion.
            </Text>

            <View className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              <ChoiceRow
                title="Distance"
                value={distanceUnits}
                disabled={pending}
                onChange={setDistanceUnits}
                options={[
                  { value: 'Kilometers', label: `Kilometers (${distanceUnitLabel('Kilometers')})` },
                  { value: 'Miles', label: `Miles (${distanceUnitLabel('Miles')})` },
                ]}
              />
              <ChoiceRow
                title="Weight"
                value={weightUnits}
                disabled={pending}
                onChange={setWeightUnits}
                options={[
                  { value: 'Kilograms', label: `Kilograms (${weightUnitLabel('Kilograms')})` },
                  { value: 'Pounds', label: `Pounds (${weightUnitLabel('Pounds')})` },
                ]}
              />
              <ChoiceRow
                title="Temperature"
                value={temperatureUnits}
                disabled={pending}
                onChange={setTemperatureUnits}
                options={[
                  {
                    value: 'Celsius',
                    label: `Celsius (${temperatureUnitLabel('Celsius')})`,
                  },
                  {
                    value: 'Fahrenheit',
                    label: `Fahrenheit (${temperatureUnitLabel('Fahrenheit')})`,
                  },
                ]}
              />

              <View className="px-4 py-4">
                <Text className="text-base font-semibold text-white">Timezone</Text>
                <Text className="mt-1 text-sm text-ink-muted">
                  Selected: {timezone}
                  {timezone === deviceTimeZone() ? ' (device)' : ''}
                </Text>
                <TextInput
                  className="mt-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white"
                  value={timezoneQuery}
                  onChangeText={setTimezoneQuery}
                  placeholder="Search timezones"
                  placeholderTextColor={Colors.textMuted}
                  editable={!pending}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  className="mt-2 self-start active:opacity-80"
                  disabled={pending}
                  onPress={() => {
                    hapticLight();
                    setTimezone(deviceTimeZone());
                    setTimezoneQuery('');
                  }}
                >
                  <Text className="text-sm font-medium text-brand">Use device timezone</Text>
                </Pressable>
                <View className="mt-3 max-h-56 overflow-hidden rounded-lg border border-zinc-800">
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {filteredZones.map((zone) => {
                      const selected = zone === timezone;
                      return (
                        <Pressable
                          key={zone}
                          className={`border-b border-zinc-800/80 px-3 py-2.5 ${
                            selected ? 'bg-zinc-800' : ''
                          } active:opacity-80`}
                          disabled={pending}
                          onPress={() => {
                            hapticLight();
                            setTimezone(zone);
                          }}
                        >
                          <Text className={`text-sm ${selected ? 'text-brand' : 'text-white'}`}>
                            {zone}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </View>

            {formError ? <Text className="mt-4 text-sm text-red-400">{formError}</Text> : null}
            {successMessage ? (
              <Text className="mt-4 text-sm text-emerald-400">{successMessage}</Text>
            ) : null}

            <Button
              className="mt-6"
              label="Save units"
              loading={pending}
              onPress={() => void onSave()}
            />
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
