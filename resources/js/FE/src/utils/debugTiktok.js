// Debug TikTok reload
// Chạy trong console: import('@/utils/debugTiktok').then(m => m.test())

export const test = () => {
    console.log('🧪 Testing TikTok reload...');
    
    if (!window.Echo) {
        console.log('❌ Echo not available');
        return;
    }
    
    // Test private channel
    const privateChannel = window.Echo.private('user.1.tiktok-accounts');
    privateChannel.listen('tiktok-accounts.reload', (data) => {
        console.log('🎉 Private TikTok reload event received:', data);
    });
    
    console.log('✅ Test listener added');
    console.log('📺 Current channels:', Object.keys(window.Echo.connector?.channels || {}));
};

export const check = () => {
    console.log('🔍 Checking TikTok setup...');
    console.log('Echo available:', !!window.Echo);
    console.log('Channels:', Object.keys(window.Echo?.connector?.channels || {}));
    console.log('TikTok channels:', Object.keys(window.Echo?.connector?.channels || {}).filter(name => name.includes('tiktok')));
};
