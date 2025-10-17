// Laravel Echo configuration for Laravel 12.x Broadcasting
// Sử dụng Laravel Echo với cấu hình hiện đại theo tài liệu chính thức

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';
import appConfig from '@/configs/app.config';

// Bắt buộc cho Echo khi dùng Pusher/Reverb
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;

  // Bật log Pusher để debug (chỉ trong development)
  // if (process.env.NODE_ENV === 'development') {
  //   // @ts-ignore
  //   window.Pusher.logToConsole = false;
  // }
}

let echoInstance = null;
let isInitializing = false;

// Helpers cho CSRF (Sanctum)
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? match[1] : null;
};

const getCsrfTokenFromCookie = () => {
  const raw = getCookie('XSRF-TOKEN');
  return raw ? decodeURIComponent(raw) : null;
};

const ensureCsrfCookie = async (apiBaseUrl) => {
  try {
    await fetch(`${apiBaseUrl}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    return getCsrfTokenFromCookie();
  } catch (e) {
    console.warn('[Echo] Could not initialize CSRF cookie:', e);
    return null;
  }
};

/**
 * Khởi tạo Echo instance (singleton pattern)
 * Tự động lấy authToken từ NextAuth session
 */
export const initializeEcho = async (manualToken = null) => {
  // Chỉ chạy trên client
  if (typeof window === 'undefined') return null;

  // Tránh khởi tạo nhiều lần
  if (echoInstance) {
    return echoInstance;
  }

  if (isInitializing) {
    // Đợi tối đa 10 giây để tránh deadlock
    let waitCount = 0;
    const maxWait = 100; // 10 giây (100 * 100ms)

    while (isInitializing && waitCount < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }

    if (isInitializing) {
      isInitializing = false;
      return null;
    }

    return echoInstance;
  }

  isInitializing = true;

  // Cấu hình cho Soketi (Pusher-compatible) đọc từ NEXT_PUBLIC_* (Next.js)
  const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const wsHost = process.env.NEXT_PUBLIC_PUSHER_HOST;
  const port = Number(
    process.env.NEXT_PUBLIC_PUSHER_PORT ??
    ((process.env.NEXT_PUBLIC_PUSHER_SCHEME ?? 'http') === 'https' ? 443 : 6001)
  );
  const useTLS = (process.env.NEXT_PUBLIC_PUSHER_SCHEME ?? 'http') === 'https';
  // Hardcode API base URL cho local development
  const apiBaseUrl = appConfig.API_BASE_URL;
  console.log('[Echo] API Base URL:', apiBaseUrl);

  // Lấy token từ NextAuth session hoặc sử dụng token thủ công
  const authToken = manualToken || await getAuthToken();

  // Debug logging
  console.log('[Echo] Auth token:', authToken ? 'Present' : 'Missing');
  console.log('[Echo] Manual token:', manualToken ? 'Present' : 'Missing');

  // Đảm bảo có CSRF cookie và lấy XSRF token
  const xsrfToken = await ensureCsrfCookie(apiBaseUrl);
  console.log('[Echo] XSRF token:', xsrfToken ? 'Present' : 'Missing');

  try {

    // Cấu hình Echo theo mẫu Pusher authorizer cho Soketi
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || key;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'mt1';

    const echoOptions = {
      broadcaster: 'pusher',
      key: pusherKey,
      cluster: pusherCluster,
      encrypted: false,
      // Cấu hình WebSocket cho Soketi
      wsHost,
      wsPort: port,
      wssPort: port,
      forceTLS: useTLS,
      enabledTransports: ['ws', 'wss'],
      // Cấu hình timeout và retry
      activityTimeout: 30000,
      pongTimeout: 15000,
      maxReconnectionAttempts: 5,
      maxReconnectGap: 10000,
      authorizer: (channel, options) => {
        return {
          authorize: async (socketId, callback) => {
            try {
              console.log(`[Echo] Authorizing channel: ${channel.name}`);
              console.log(`[Echo] Socket ID: ${socketId}`);

              // Nếu không có auth token, chỉ cho phép public channels
              if (!authToken && channel.name.startsWith('private-')) {
                console.warn('[Echo] No auth token for private channel, denying access');
                callback(true, new Error('Authentication required for private channels'));
                return;
              }

              // Lấy CSRF token mới
              const currentXsrfToken = await ensureCsrfCookie(apiBaseUrl);
              console.log('[Echo] Current XSRF token:', currentXsrfToken ? 'Present' : 'Missing');

              const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
                ...(currentXsrfToken ? { 'X-XSRF-TOKEN': currentXsrfToken } : {}),
              };

              console.log('[Echo] Request headers:', Object.keys(headers));

              const { data } = await axios.post(
                `${apiBaseUrl}/api/broadcasting/auth`,
                { socket_id: socketId, channel_name: channel.name },
                {
                  withCredentials: true,
                  headers,
                }
              );

              console.log('[Echo] Authorization successful');
              callback(false, data);
            } catch (error) {
              console.error('[Echo] Authorization failed:', error.response?.status, error.response?.data);
              callback(true, error);
            }
          },
        };
      },
    };

    // Tạo Echo instance
    echoInstance = new Echo(echoOptions);

    // Gắn vào window để debug
    try {
      window.Echo = echoInstance;
    } catch (_) { /* ignore */ }

    // Debug và monitoring (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      setupDebugListeners();
    }

    isInitializing = false;
    return echoInstance;
  } catch (error) {
    console.error('[Echo] Error initializing Echo:', error);
    echoInstance = null;
    isInitializing = false;
    throw error;
  }
};

/**
 * Thiết lập các listener để debug và monitor connection
 */
const setupDebugListeners = () => {
  if (!echoInstance?.connector?.pusher) return;

  const pusher = echoInstance.connector.pusher;
  const connection = pusher.connection;

  // Connection events
  connection.bind('connecting', () => {
    // Connecting to WebSocket server
  });

  connection.bind('connected', () => {
    // Successfully connected to WebSocket server
  });

  connection.bind('disconnected', () => {
    // Disconnected from WebSocket server
  });

  connection.bind('error', (err) => {
    console.error('❌ [Echo] Connection error:', err);
  });

  connection.bind('connection_failed', () => {
    console.error('❌ [Echo] Connection failed to WebSocket server');

    // Log chi tiết khi connection failed
    console.error('🔍 [Echo] Connection failed analysis:');
    console.error('   - Connection state:', connection?.state);
    console.error('   - Error details:', connection?.error);
    console.error('   - Connection URL:', connection?.url);

    // Retry logic
    setTimeout(() => {
      if (echoInstance && connection.state === 'failed') {
        connection.connect();
      }
    }, 5000);
  });

  connection.bind('state_change', (states) => {
    // Connection state changed
  });

  // Log connection details sau khi tạo
  setTimeout(() => {
    // Kiểm tra và retry nếu connection failed
    if (connection?.state === 'failed') {
      connection.connect();
    }
  }, 2000);
};

/**
 * Lấy auth token từ NextAuth session hoặc localStorage
 */
async function getAuthToken() {
  if (typeof window === 'undefined') return null;

  try {
    // Thử lấy từ NextAuth session trước
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    if (session?.accessToken) {
      return session.accessToken;
    }

    // Nếu không có NextAuth, thử lấy từ localStorage
    const storedToken = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    if (storedToken) {
      return storedToken;
    }

    return null;
  } catch (error) {
    console.warn('[Echo] Could not get auth token from NextAuth:', error);

    // Fallback: thử lấy từ localStorage
    try {
      const storedToken = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
      return storedToken;
    } catch (localError) {
      console.warn('[Echo] Could not get auth token from localStorage:', localError);
      return null;
    }
  }
}

/** Lấy instance hiện tại */
export const getEcho = () => echoInstance;

/** Ngắt kết nối và xoá singleton */
export const disconnectEcho = () => {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch (error) {
      console.warn('[Echo] Error during disconnect:', error);
    }
    echoInstance = null;
    isInitializing = false;

    // Reset global flags
    if (typeof window !== 'undefined') {
      window.__ECHO_INITIALIZED__ = false;
      delete window.Echo;
    }
  }
};

/** Lắng public channel */
export const listenToChannel = async (channelName, eventName, callback) => {
  if (typeof window === 'undefined') return null;

  // Tự động khởi tạo Echo nếu chưa có
  if (!echoInstance) {
    await initializeEcho();
  }

  if (!echoInstance) return null;
  return echoInstance.channel(channelName).listen(eventName, callback);
};

/** Lắng private channel */
export const listenToPrivateChannel = async (channelName, eventName, callback) => {
  if (typeof window === 'undefined') return null;

  // Tự động khởi tạo Echo nếu chưa có
  if (!echoInstance) {
    await initializeEcho();
  }

  if (!echoInstance) return null;
  return echoInstance.private(channelName).listen(eventName, callback);
};

/** Lắng presence channel */
export const listenToPresenceChannel = async (channelName, eventName, callback) => {
  if (typeof window === 'undefined') return null;

  // Tự động khởi tạo Echo nếu chưa có
  if (!echoInstance) {
    await initializeEcho();
  }

  if (!echoInstance) return null;
  return echoInstance.join(channelName).listen(eventName, callback);
};

/** Rời 1 channel */
export const leaveChannel = (channelName) => {
  if (typeof window === 'undefined' || !echoInstance) return;
  echoInstance.leaveChannel(channelName);
};

/** Rời tất cả channel */
export const leaveAllChannels = () => {
  if (typeof window === 'undefined' || !echoInstance) return;
  const channels = Object.keys(echoInstance.connector.channels || {});
  channels.forEach((name) => echoInstance.leaveChannel(name));
};

/** Gửi client event (whisper) */
export const whisperToChannel = (channelName, eventName, data) => {
  if (typeof window === 'undefined' || !echoInstance) return;

  try {
    const channel = echoInstance.private(channelName);
    if (channel && channel.whisper) {
      channel.whisper(eventName, data);
    }
  } catch (error) {
    console.error('[Echo] Error sending whisper:', error);
  }
};

/** Lắng client event (whisper) */
export const listenForWhisper = (channelName, eventName, callback) => {
  if (typeof window === 'undefined' || !echoInstance) return null;

  try {
    const channel = echoInstance.private(channelName);
    if (channel && channel.listenForWhisper) {
      return channel.listenForWhisper(eventName, callback);
    }
  } catch (error) {
    console.error('[Echo] Error listening for whisper:', error);
  }
  return null;
};

/** Lắng notification channel */
export const listenToNotification = (userId, callback) => {
  if (typeof window === 'undefined' || !echoInstance) return null;

  try {
    const channel = echoInstance.private(`App.Models.User.${userId}`);
    if (channel && channel.notification) {
      return channel.notification(callback);
    }
  } catch (error) {
    console.error('[Echo] Error listening to notification:', error);
  }
  return null;
};

/** Lắng private-user channel */
export const listenToPrivateUser = (userId, eventName, callback) => {
  if (typeof window === 'undefined' || !echoInstance) return null;

  try {
    // Sử dụng channel private-user.{id}
    const channel = echoInstance.private(`private-user.${userId}`);
    return channel.listen(eventName, callback);
  } catch (error) {
    console.error('[Echo] Error listening to private-user channel:', error);
  }
  return null;
};

export default {
  initializeEcho,
  getEcho,
  disconnectEcho,
  listenToChannel,
  listenToPrivateChannel,
  listenToPresenceChannel,
  leaveChannel,
  leaveAllChannels,
  whisperToChannel,
  listenForWhisper,
  listenToNotification,
  listenToPrivateUser,
};
