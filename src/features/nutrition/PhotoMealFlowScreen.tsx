/* Hallmark · pre-emit critique: P5 H4 E4 S5 R5 V4 */
/* Hallmark · genre: modern-minimal · macrostructure: Narrative Workflow · design-system: docs/DESIGN.md · designed-as-app */
import { router } from 'expo-router';

import { LogMealSheet } from '@/src/features/nutrition/LogMealSheet';

/** Full-screen photo analysis and review flow; manual quick logging stays in the Log sheet. */
export function PhotoMealFlowScreen() {
  return (
    <LogMealSheet
      visible
      autoOpenPicker
      presentation="screen"
      onClose={() => router.back()}
    />
  );
}
