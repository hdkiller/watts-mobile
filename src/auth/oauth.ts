import { ApiError } from '@/src/api/errors';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

import { APP_SCHEME, OAUTH_CLIENT_ID } from '@/src/config/env';
import {
  bumpAuthSessionGeneration,
  getAuthSessionGeneration,
} from '@/src/auth/authSessionGeneration';
import { COMPANION_SCOPES } from '@/src/auth/scopes';
import { saveTokens, type StoredTokens } from '@/src/auth/tokenStorage';
import { Colors } from '@/src/theme/colors';

WebBrowser.maybeCompleteAuthSession();

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  refresh_token_expires_in?: number;
};

/** True when running inside Expo Go (redirect will be exp://…, not coachwatts://). */
export function isExpoGoRuntime(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Redirect URI that must be registered on the Official Mobile App OAuth client.
 * Standalone / dev client → coachwatts://oauth/callback
 * Expo Go → exp://HOST/--/oauth/callback (register after first run if missing)
 */
export function getRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: APP_SCHEME,
    path: 'oauth/callback',
  });
}

export function assertOAuthClientConfigured(): string {
  if (!OAUTH_CLIENT_ID) {
    throw new Error(
      'Missing EXPO_PUBLIC_OAUTH_CLIENT_ID. Register an OAuth app in Coach Watts and set the client id in .env',
    );
  }
  return OAUTH_CLIENT_ID;
}

export async function loginWithPkce(instanceBaseUrl: string): Promise<StoredTokens> {
  // Invalidate in-flight 401/refresh handlers before the browser returns — otherwise a
  // stale failAuthSession can clear the brand-new tokens and bounce straight to login.
  bumpAuthSessionGeneration();

  const clientId = assertOAuthClientConfigured();
  const redirectUri = getRedirectUri();

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: [...COMPANION_SCOPES],
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
    prompt: AuthSession.Prompt.Login,
  });

  await request.makeAuthUrlAsync({
    authorizationEndpoint: `${instanceBaseUrl}/api/oauth/authorize`,
  });

  // Keep cookies so the user can complete Coach Watts (Google) login inside the auth session.
  //
  // Theming only reaches Android here: it has no native ASWebAuthenticationSession
  // equivalent, so expo-web-browser falls back to Chrome Custom Tabs and honors
  // toolbarColor/showTitle. iOS's ASWebAuthenticationSession chrome is deliberately
  // non-themeable by Apple (anti-spoofing) — these options are silently ignored there.
  const result = await request.promptAsync(
    {
      authorizationEndpoint: `${instanceBaseUrl}/api/oauth/authorize`,
    },
    {
      preferEphemeralSession: false,
      showInRecents: true,
      toolbarColor: Colors.background,
      secondaryToolbarColor: Colors.background,
      showTitle: false,
      enableDefaultShareMenuItem: false,
    },
  );

  if (result.type !== 'success' || !result.params.code) {
    if (result.type === 'dismiss' || result.type === 'cancel') {
      throw new Error('Sign-in was cancelled');
    }
    throw new Error('Sign-in failed — no authorization code returned');
  }

  if (!request.codeVerifier) {
    throw new Error('Missing PKCE code_verifier');
  }

  const token = await exchangeAuthorizationCode({
    instanceBaseUrl,
    clientId,
    code: result.params.code,
    redirectUri,
    codeVerifier: request.codeVerifier,
  });

  if (!token.refresh_token) {
    throw new Error(
      'Sign-in succeeded but no refresh token was issued — check offline_access scope',
    );
  }

  return saveTokens({
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresIn: token.expires_in ?? 3600,
  });
}

export async function exchangeAuthorizationCode(params: {
  instanceBaseUrl: string;
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<TokenResponse> {
  const response = await fetch(`${params.instanceBaseUrl}/api/oauth/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: params.clientId,
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
    }),
  });

  const body = (await response.json()) as TokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || body.error || 'Token exchange failed');
  }

  return body;
}

export async function refreshAccessToken(params: {
  instanceBaseUrl: string;
  refreshToken: string;
}): Promise<StoredTokens> {
  const clientId = assertOAuthClientConfigured();
  const generation = getAuthSessionGeneration();

  const response = await fetch(`${params.instanceBaseUrl}/api/oauth/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: params.refreshToken,
    }),
  });

  let body: (TokenResponse & { error?: string; error_description?: string }) | undefined;
  try {
    body = (await response.json()) as TokenResponse & {
      error?: string;
      error_description?: string;
    };
  } catch {
    // Ignore JSON parse failure if response is not JSON
  }

  if (!response.ok || !body?.access_token) {
    const message =
      body?.error_description || body?.error || 'Token refresh failed (' + response.status + ')';
    throw new ApiError(message, response.status, body);
  }

  if (generation !== getAuthSessionGeneration()) {
    throw new Error('Auth session changed during token refresh');
  }

  return saveTokens({
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? params.refreshToken,
    expiresIn: body.expires_in ?? 3600,
  });
}
