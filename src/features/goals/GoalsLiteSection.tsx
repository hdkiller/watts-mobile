import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { useThemeColors } from '@/src/theme/useThemeColors';

import { fetchGoals, patchGoal } from './api';

export function GoalsLiteSection() {
  const theme = useThemeColors();
  const { instanceUrl } = useAuth();
  const { data, isLoading, refetch, isError, error } = useQuery({
    queryKey: ['goals', 'list'],
    queryFn: fetchGoals,
  });
  const primary = data?.[0] ?? null;
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const startEdit = () => {
    setTitle(primary?.title ?? '');
    setEditing(true);
    setMsg(null);
  };

  const onSave = async () => {
    if (!primary || !title.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await patchGoal(primary.id, { title: title.trim() });
      setEditing(false);
      await refetch();
      setMsg('Goal updated');
    } catch (err) {
      setMsg(friendlyError(err, 'Could not update goal'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="mt-6 rounded-2xl border border-border bg-card p-4">
      <Text className="text-lg font-semibold text-text-primary">Goal</Text>
      <Text className="mt-1 text-sm text-text-muted">
        Primary goal used for your training plan. Full portfolio tools stay on web.
      </Text>

      {isLoading ? (
        <Text className="mt-3 text-sm text-text-muted">Loading…</Text>
      ) : isError ? (
        <Text className="mt-3 text-sm text-red-400">
          {friendlyError(error, 'Could not load goals')}
        </Text>
      ) : !primary ? (
        <Text className="mt-3 text-sm text-text-muted">No goal yet. Set one during activation.</Text>
      ) : editing ? (
        <View className="mt-3 gap-2">
          <TextInput
            className="rounded-xl border border-border bg-surface px-3 py-2 text-base text-text-primary"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={theme.textMuted}
          />
          <Button label="Save" loading={busy} onPress={() => void onSave()} />
          <Button variant="secondary" label="Cancel" onPress={() => setEditing(false)} />
        </View>
      ) : (
        <View className="mt-3">
          <Text className="text-base text-text-primary">{primary.title}</Text>
          <Text className="mt-1 text-sm text-text-muted">{primary.type}</Text>
          <Button className="mt-3" variant="secondary" label="Edit title" onPress={startEdit} />
        </View>
      )}

      {msg ? <Text className="mt-2 text-sm text-text-muted">{msg}</Text> : null}

      <Button
        className="mt-3"
        variant="secondary"
        label="Open goals on web"
        onPress={() => void openInstanceWeb(instanceUrl, '/profile/goals')}
      />
    </View>
  );
}
