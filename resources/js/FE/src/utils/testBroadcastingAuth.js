// Test broadcasting authentication
export const testBroadcastingAuth = async () => {
    console.group('🧪 [Test] Broadcasting Authentication');
    
    try {
        // Lấy token từ session
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        const token = session?.accessToken;
        
        console.log('Session:', session ? 'Available' : 'Not available');
        console.log('Token:', token ? 'Available' : 'Not available');
        
        if (!token) {
            console.error('❌ No access token available');
            console.groupEnd();
            return false;
        }
        
        // Test broadcasting auth endpoint
        const response = await fetch('http://agent-ai.test/api/realtime/test-broadcasting-auth', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Broadcasting auth test successful:', data);
            console.groupEnd();
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ Broadcasting auth test failed:', errorText);
            console.groupEnd();
            return false;
        }
    } catch (error) {
        console.error('❌ Broadcasting auth test error:', error);
        console.groupEnd();
        return false;
    }
};

// Auto-test khi import
if (typeof window !== 'undefined') {
    setTimeout(() => {
        console.log('🧪 [Test] Auto-testing broadcasting authentication...');
        testBroadcastingAuth();
    }, 2000);
}

export default testBroadcastingAuth;
