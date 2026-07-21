/** REST OAuth scopes for activation companion (coach-wattz REST_OAUTH_SCOPES). */
export const COMPANION_SCOPES = [
  'profile:read',
  'profile:write',
  'workout:read',
  'workout:write',
  'health:read',
  'health:write',
  'nutrition:read',
  'nutrition:write',
  'recommendation:read',
  'plan:read',
  'plan:write',
  'goal:read',
  'goal:write',
  'availability:read',
  'availability:write',
  'performance:read',
  'chat:read',
  'chat:write',
  'offline_access',
] as const;

export const COMPANION_SCOPE_STRING = COMPANION_SCOPES.join(' ');
