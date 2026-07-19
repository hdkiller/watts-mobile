/** Raw notification row from `GET /api/notifications`. */
export type NotificationApi = {
  id: string;
  userId?: string;
  title: string;
  message: string;
  icon?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type NotificationsListApi = {
  notifications: NotificationApi[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
};

export type InboxNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link: string | null;
};

export type NotificationsInbox = {
  items: InboxNotification[];
  unreadCount: number;
  total: number;
  page: number;
  totalPages: number;
};

export type DevicePlatform = 'ios' | 'android';

export type RegisterDeviceBody = {
  token: string;
  platform: DevicePlatform;
  appVersion?: string;
};
