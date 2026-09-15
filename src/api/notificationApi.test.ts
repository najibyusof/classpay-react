import { notificationApi } from './notificationApi';

jest.mock('./client', () => ({ apiClient: { get: jest.fn(), post: jest.fn() } }));

import { apiClient } from './client';

const get = apiClient.get as jest.Mock;
const post = apiClient.post as jest.Mock;

describe('notificationApi', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('uses authenticated notification endpoints without a user identifier', async () => {
    get.mockResolvedValue({
      data: { data: { notifications: [], pagination: { current_page: 1, last_page: 1 } } },
    });

    await notificationApi.getNotifications(2);

    expect(get).toHaveBeenCalledWith('/notifications', { params: { page: 2 } });
  });

  it('gets unread count and changes read state only by notification resource path', async () => {
    get.mockResolvedValue({ data: { data: { count: 3 } } });

    await expect(notificationApi.getUnreadCount()).resolves.toBe(3);
    await notificationApi.markAsRead(4);
    await notificationApi.markAsUnread(4);
    await notificationApi.markAllAsRead();

    expect(post).toHaveBeenNthCalledWith(1, '/notifications/4/read');
    expect(post).toHaveBeenNthCalledWith(2, '/notifications/4/unread');
    expect(post).toHaveBeenNthCalledWith(3, '/notifications/read-all');
  });

  it('gets notification details from the authenticated resource path', async () => {
    const notification = {
      created_at: '2026-09-13T10:00:00Z',
      id: 8,
      message: 'Payment is due soon.',
      read_at: null,
      title: 'Payment reminder',
      type: 'payment.reminder',
    };
    get.mockResolvedValue({ data: { data: notification } });

    await expect(notificationApi.getNotification(8)).resolves.toEqual(notification);
    expect(get).toHaveBeenCalledWith('/notifications/8');
  });
});
