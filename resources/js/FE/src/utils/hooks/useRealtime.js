import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
    initializeEcho, 
    getEcho, 
    disconnectEcho, 
    listenToChannel as echoListenToChannel, 
    listenToPrivateChannel as echoListenToPrivateChannel,
    leaveChannel,
    leaveAllChannels 
} from '../echo';

/**
 * Custom hook for managing real-time connections with Laravel Reverb
 */
export const useRealtime = () => {
    const { data: session } = useSession();
    const echoRef = useRef(null);
    const listenersRef = useRef(new Map());
    const [isInitializing, setIsInitializing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const initRef = useRef(false);
    const lastTokenRef = useRef(null);
    
    // Use global flag to prevent multiple initializations
    if (typeof window !== 'undefined' && !window.__ECHO_INITIALIZED__) {
        window.__ECHO_INITIALIZED__ = false;
    }

    // Initialize Echo when session is available (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') {
            // // console.log('🚫 [useRealtime] Server-side rendering, skipping Echo initialization');
            return;
        }

        // Check if Echo is already initialized globally
        if (window.__ECHO_INITIALIZED__ && echoRef.current) {
            return;
        }
        
        // Reset stuck initialization state
        if (window.__ECHO_INITIALIZED__ && !echoRef.current) {
            window.__ECHO_INITIALIZED__ = false;
        }

        const initEcho = async () => {
            // console.group('🚀 [useRealtime] Echo Initialization Process');
            
            const currentToken = session?.accessToken;
            
            // Kiểm tra token có thay đổi không
            if (lastTokenRef.current === currentToken && echoRef.current) {
                return;
            }
            
            if (isInitializing || initRef.current) {
                // console.log('⏳ [useRealtime] Echo is already initializing, skipping...');
                return;
            }

            setIsInitializing(true);
            initRef.current = true;
            lastTokenRef.current = currentToken;
            
            try {
                // Luôn khởi tạo Echo để hỗ trợ public channel, có token nếu có session
                if (!echoRef.current) {
                    if (session?.accessToken) {
                        echoRef.current = await initializeEcho(session.accessToken);
                                    } else {
                    echoRef.current = await initializeEcho();
                }
                    setIsInitialized(true);
                    window.__ECHO_INITIALIZED__ = true;
                }
                
                // Add connection event listeners for debugging
                if (echoRef.current?.connector?.pusher?.connection) {
                    const connection = echoRef.current.connector.pusher.connection;
                    
                    connection.bind('connected', () => {
                        // console.log('✅ [useRealtime] WebSocket connected');
                    });
                    
                    connection.bind('disconnected', () => {
                        // console.log('❌ [useRealtime] WebSocket disconnected');
                    });
                    
                    connection.bind('error', (error) => {
                        // console.error('💥 [useRealtime] WebSocket error:', error);
                    });
                }
            } catch (error) {
                // console.error('❌ [useRealtime] Error initializing Echo:', error);
                setIsInitialized(false);
            } finally {
                setIsInitializing(false);
                initRef.current = false;
                // console.groupEnd();
            }
        };

        initEcho();

        return () => {
            if (echoRef.current) {
                // Chỉ cleanup listeners, không disconnect Echo instance
                leaveAllChannels();
                listenersRef.current.clear();
                echoRef.current = null;
                setIsInitialized(false);
                initRef.current = false;
                // Không reset global flag để tránh re-initialization
                // window.__ECHO_INITIALIZED__ = false;
            }
        };
    }, [session?.accessToken]);

    /**
     * Wait for Echo to be initialized
     */
    const waitForEcho = useCallback(async (maxRetries = 20, delay = 300) => {
        for (let i = 0; i < maxRetries; i++) {
            // Nếu ref đã có, trả về ngay
            if (echoRef.current) {
                return echoRef.current;
            }

            // Nếu global singleton đã khởi tạo, gán vào ref để dùng chung giữa các hook instances
            try {
                const globalEcho = (typeof window !== 'undefined' && window.Echo) || getEcho?.();
                if (globalEcho) {
                    echoRef.current = globalEcho;
                    setIsInitialized(true);
                    return echoRef.current;
                }
            } catch (_) { /* ignore */ }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
        return null;
    }, []);

    /**
     * Listen to a public channel with retry mechanism
     */
    const listenToPublicChannel = useCallback(async (channelName, eventName, callback) => {
        if (typeof window === 'undefined') {
            return null;
        }

        // Wait for Echo to be initialized
        const echo = await waitForEcho();
        if (!echo) {
            console.error('❌ [useRealtime] Echo not initialized after retries for public channel');
            return null;
        }

        // Validate parameters
        if (!channelName || typeof channelName !== 'string') {
            return null;
        }

        if (!eventName || typeof eventName !== 'string') {
            return null;
        }

        if (!callback || typeof callback !== 'function') {
            console.error('❌ [useRealtime] Invalid callback:', callback);
            return null;
        }

        // // console.log(`🎯 [useRealtime] Setting up public channel listener: ${channelName} -> ${eventName}`);
        
        const listenerKey = `${channelName}:${eventName}`;
        
        // Remove existing listener if any
        if (listenersRef.current.has(listenerKey)) {
            const cleanup = listenersRef.current.get(listenerKey);
            if (typeof cleanup === 'function') {
                try { cleanup(); } catch (_) {}
            }
            listenersRef.current.delete(listenerKey);
        }

        try {
            const channel = echo.channel(channelName);

            // Listen for both raw and dotted event names (Laravel Echo requires leading dot for broadcastAs)
            const dottedName = eventName.startsWith('.') ? eventName : `.${eventName}`;
            const namesToListen = [...new Set([eventName, dottedName])];

            namesToListen.forEach((name) => channel.listen(name, callback));

            // Store cleanup function for all names
            const cleanup = () => {
                namesToListen.forEach((name) => {
                    try { channel.stopListening(name); } catch (_) {}
                });
            };
            listenersRef.current.set(listenerKey, cleanup);

            // // console.log(`✅ [useRealtime] Successfully set up listener for: ${listenerKey}`);
            return cleanup;
        } catch (error) {
            console.error(`❌ [useRealtime] Error creating listener:`, error);
            return null;
        }
    }, [waitForEcho]);

    /**
     * Listen to a private channel with retry mechanism
     */
    const listenToPrivateChannel = useCallback(async (channelName, eventName, callback) => {
        if (typeof window === 'undefined') {
            return null;
        }

        // Wait for Echo to be initialized
        const echo = await waitForEcho();
        if (!echo) {
            console.error('❌ [useRealtime] Echo not initialized after retries');
            return null;
        }

        const listenerKey = `private:${channelName}:${eventName}`;
        
        // Remove existing listener if any
        if (listenersRef.current.has(listenerKey)) {
            const cleanup = listenersRef.current.get(listenerKey);
            if (typeof cleanup === 'function') {
                try { cleanup(); } catch (_) {}
            }
            listenersRef.current.delete(listenerKey);
        }

        try {
            // Add new listener
            const channel = echo.private(channelName);

            // Listen for both raw and dotted event names
            const dottedName = eventName.startsWith('.') ? eventName : `.${eventName}`;
            const namesToListen = [...new Set([eventName, dottedName])];
            namesToListen.forEach((name) => channel.listen(name, callback));

            const cleanup = () => {
                namesToListen.forEach((name) => {
                    try { channel.stopListening(name); } catch (_) {}
                });
            };
            listenersRef.current.set(listenerKey, cleanup);
            return cleanup;
        } catch (error) {
            console.error(`❌ [useRealtime] Error creating private channel listener:`, error);
            return null;
        }
    }, [waitForEcho]);

    /**
     * Stop listening to a specific channel/event
     */
    const stopListening = useCallback((channelName, eventName = null) => {
        if (typeof window === 'undefined') {
            return;
        }

        if (eventName) {
            const listenerKey = `${channelName}:${eventName}`;
            const privateListenerKey = `private:${channelName}:${eventName}`;

            // Cleanup public listener
            if (listenersRef.current.has(listenerKey)) {
                const cleanup = listenersRef.current.get(listenerKey);
                if (typeof cleanup === 'function') {
                    try { cleanup(); } catch (_) {}
                }
                listenersRef.current.delete(listenerKey);
            }
            // Cleanup private listener
            if (listenersRef.current.has(privateListenerKey)) {
                const cleanup = listenersRef.current.get(privateListenerKey);
                if (typeof cleanup === 'function') {
                    try { cleanup(); } catch (_) {}
                }
                listenersRef.current.delete(privateListenerKey);
            }
        } else {
            // If no event specified, attempt to leave the whole channel
            try { leaveChannel(channelName); } catch (_) {}
        }
    }, []);

    /**
     * Get connection status
     */
    const isConnected = useCallback(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        return echoRef.current?.connector?.pusher?.connection?.state === 'connected';
    }, []);

    /**
     * Get detailed connection info for debugging
     */
    const getConnectionInfo = useCallback(() => {
        if (typeof window === 'undefined') {
            return { available: false, reason: 'Server-side rendering' };
        }
        
        if (!echoRef.current) {
            // Thử lấy từ global nếu có
            try {
                const globalEcho = (typeof window !== 'undefined' && window.Echo) || getEcho?.();
                if (globalEcho) {
                    echoRef.current = globalEcho;
                }
            } catch (_) { /* ignore */ }

            if (!echoRef.current) {
                return { available: false, reason: 'Echo not initialized' };
            }
        }
        
        const state = echoRef.current?.connector?.pusher?.connection?.state;
        return {
            available: !!echoRef.current,
            state: state,
            connected: state === 'connected',
            echo: !!echoRef.current,
            connector: !!echoRef.current?.connector,
            pusher: !!echoRef.current?.connector?.pusher,
            connection: !!echoRef.current?.connector?.pusher?.connection,
            isInitialized: isInitialized,
            isInitializing: isInitializing
        };
    }, [isInitialized, isInitializing]);

    /**
     * Debug function to check Echo status
     */
    const debugEchoStatus = useCallback(() => {
        const connectionInfo = getConnectionInfo();
        return connectionInfo;
    }, [getConnectionInfo, session]);

    /**
     * Force disconnect Echo (use only when necessary, e.g., logout)
     */
    const forceDisconnect = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }
        
        leaveAllChannels();
        listenersRef.current.clear();
        echoRef.current = null;
        setIsInitialized(false);
        initRef.current = false;
        window.__ECHO_INITIALIZED__ = false;
        
        // Import và gọi disconnectEcho
        import('../echo').then(({ disconnectEcho }) => {
            disconnectEcho();
        });
    }, []);

    return {
        echo: echoRef.current,
        listenToPublicChannel,
        listenToPrivateChannel,
        stopListening,
        isConnected,
        getConnectionInfo,
        debugEchoStatus,
        isInitialized,
        isInitializing,
        forceDisconnect
    };
};

/**
 * Hook specifically for listening to notifications
 */
export const useNotifications = (userId = null) => {
    const { listenToPublicChannel, listenToPrivateChannel, stopListening } = useRealtime();

    /**
     * Listen to general notifications
     */
    const listenToGeneralNotifications = useCallback(async (callback) => {
        if (typeof window === 'undefined') {
            return null;
        }
        return await listenToPublicChannel('system.notifications', 'notification.sent', callback);
    }, [listenToPublicChannel]);

    /**
     * Listen to user-specific notifications
     */
    const listenToUserNotifications = useCallback(async (callback) => {
        if (typeof window === 'undefined' || !userId) {
            return null;
        }
        // Sử dụng channel name khớp với backend: App.Models.User.{id}
        return await listenToPrivateChannel(`App.Models.User.${userId}`, 'notification.sent', callback);
    }, [listenToPrivateChannel, userId]);

    /**
     * Stop listening to notifications
     */
    const stopListeningToNotifications = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }
        stopListening('system.notifications');
        if (userId) {
            // Sử dụng channel name khớp với backend: App.Models.User.{id}
            stopListening(`App.Models.User.${userId}`);
        }
    }, [stopListening, userId]);

    return {
        listenToGeneralNotifications,
        listenToUserNotifications,
        stopListeningToNotifications,
    };
};

/**
 * Hook for listening to TikTok account updates
 */
export const useTiktokAccountUpdates = (accountId = null) => {
    const { listenToPrivateChannel, stopListening } = useRealtime();

    /**
     * Listen to TikTok account updates
     */
    const listenToAccountUpdates = useCallback(async (callback) => {
        if (typeof window === 'undefined' || !accountId) {
            return null;
        }
        return await listenToPrivateChannel(`tiktok-accounts.${accountId}`, 'tiktok-account.updated', callback);
    }, [listenToPrivateChannel, accountId]);

    /**
     * Stop listening to account updates
     */
    const stopListeningToAccountUpdates = useCallback(() => {
        if (typeof window === 'undefined' || !accountId) {
            return;
        }
        stopListening(`tiktok-accounts.${accountId}`);
    }, [stopListening, accountId]);

    return {
        listenToAccountUpdates,
        stopListeningToAccountUpdates,
    };
};

/**
 * Hook for listening to transaction updates
 */
export const useTransactionUpdates = (userId = null) => {
    const { listenToPrivateChannel, stopListening } = useRealtime();

    /**
     * Listen to transaction status changes
     */
    const listenToTransactionUpdates = useCallback(async (callback) => {
        if (typeof window === 'undefined' || !userId) {
            return null;
        }
        return await listenToPrivateChannel(`transactions.${userId}`, 'transaction.status-changed', callback);
    }, [listenToPrivateChannel, userId]);

    /**
     * Stop listening to transaction updates
     */
    const stopListeningToTransactionUpdates = useCallback(() => {
        if (typeof window === 'undefined' || !userId) {
            return;
        }
        stopListening(`transactions.${userId}`);
    }, [stopListening, userId]);

    return {
        listenToTransactionUpdates,
        stopListeningToTransactionUpdates,
    };
};

/**
 * Hook for listening to TikTok Account table reload events
 */
export const useTiktokAccountTableReload = (userId = null) => {
    const { listenToPublicChannel, listenToPrivateChannel, stopListening, getConnectionInfo } = useRealtime();
    
    // Silent in production; no console logs

    /**
     * Listen to table reload events with retry mechanism
     */
    const listenToTableReload = useCallback(async (callback) => {
        if (typeof window === 'undefined') {
            return null;
        }
        
        const eventName = 'tiktok-accounts.reload'; // Event name từ broadcastAs()
        
        // Check if Echo is available before trying to set up listener
        const connectionInfo = getConnectionInfo();
        
        if (!connectionInfo.available) {
            // Return a retry function with timeout protection
            return {
                retry: async () => {
                    // Wait a bit before retrying to avoid spam
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return listenToTableReload(callback);
                },
                isRetry: true
            };
        }
        
        // Wrap the callback to add logging
        const wrappedCallback = (data) => {
            // Gọi callback để reload bảng
            if (callback && typeof callback === 'function') {
                callback(data);
            }
        };
        
        try {
            let listener;
            
            if (userId) {
                // Sử dụng private channel theo định nghĩa trong routes/channels.php
                const privateChannelName = `App.Models.User.${userId}`;
                // silent
                listener = await listenToPrivateChannel(privateChannelName, eventName, wrappedCallback);
            } else {
                // Sử dụng public channel cho tất cả users
                const publicChannelName = 'tiktok-accounts';
                // silent
                listener = await listenToPublicChannel(publicChannelName, eventName, wrappedCallback);
            }
            
            if (listener) {
                // Log các channel đã subscribe để xác nhận
                // silent
                return listener;
            } else {
                // Im lặng, chỉ trả về retry helper
                return {
                    retry: () => listenToTableReload(callback),
                    isRetry: true
                };
            }
        } catch (error) {
            // Im lặng, chỉ trả về retry helper
            return {
                retry: () => listenToTableReload(callback),
                isRetry: true
            };
        }
    }, [listenToPublicChannel, listenToPrivateChannel, getConnectionInfo, userId]);

    /**
     * Stop listening to table reload events
     */
    const stopListeningToTableReload = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }
        
        if (userId) {
            stopListening(`App.Models.User.${userId}`);
        } else {
            stopListening('tiktok-accounts');
        }
    }, [stopListening, userId]);

    /**
     * Debug function to check Echo status
     */
    const debugEchoStatus = useCallback(() => {
        const connectionInfo = getConnectionInfo();
        return connectionInfo;
    }, [getConnectionInfo, userId]);

    return {
        listenToTableReload,
        stopListeningToTableReload,
        debugEchoStatus,
    };
};