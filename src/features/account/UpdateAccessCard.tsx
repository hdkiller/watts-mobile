import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Colors } from '@/src/theme/colors';

/**
 * Quiet inline card for scope drift: the stored token predates a newly required
 * scope (403 on a feature endpoint). Re-runs the PKCE flow IN PLACE — the browser
 * session is usually still valid, so this is one tap and never signs the athlete out.
 */
export function UpdateAccessCard({
  sectionLabel,
  onOpenWeb,
}: {
  /** Uppercase section label so the card keeps the slot's identity (e.g. "Training Load & Form"). */
  sectionLabel: string;
  onOpenWeb?: () => void;
}) {
  const { signIn } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUpdateAccess = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn();
      await queryClient.invalidateQueries();
    } catch (err) {
      setError(friendlyError(err, 'Could not update access'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="mt-6 rounded-xl border border-border bg-card/60 px-4 py-3.5">
      <Text className="text-xs uppercase tracking-wide text-text-muted">{sectionLabel}</Text>
      <Text className="mt-2 text-sm text-text-muted">
        New permissions are available for this — a quick access update unlocks it.
      </Text>
      {error ? <Text className="mt-2 text-sm text-red-400">{error}</Text> : null}
      <View className="mt-3 flex-row flex-wrap items-center gap-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Update access for ${sectionLabel}`}
          disabled={busy}
          onPress={() => void onUpdateAccess()}
          hitSlop={8}
          className="active:opacity-70"
        >
          {busy ? (
            <ActivityIndicator color={Colors.brand} size="small" />
          ) : (
            <Text className="text-sm font-semibold text-brand">Update access</Text>
          )}
        </Pressable>
        {onOpenWeb ? (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenWeb}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Text className="text-sm font-semibold text-text-body">Open web</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
