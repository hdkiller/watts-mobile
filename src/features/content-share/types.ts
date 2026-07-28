export type ShareContentType = 'WORKOUT' | 'PLANNED_WORKOUT';

export interface GenerateSharePayload {
  type: ShareContentType;
  id: string;
}

export interface GenerateShareResponse {
  token: string;
  url: string;
  expiresAt?: string;
}

export interface AttributeShareOptions {
  url: string;
  viaCode?: string;
  contentKind?: ShareContentType;
  contentId?: string;
}
