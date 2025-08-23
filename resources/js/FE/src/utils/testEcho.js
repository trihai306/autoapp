// Test file để kiểm tra Echo hoạt động
import { initializeEcho, testBroadcastingAuth } from './echo.js';

/**
 * Test toàn bộ Echo functionality
 */
export const runEchoTest = async () => {
  console.log('🧪 [Echo Test] Starting Echo test...');
  
  try {
    // Test 1: Broadcasting authentication
    console.log('🧪 [Echo Test] Testing broadcasting authentication...');
    const authResult = await testBroadcastingAuth();
    console.log('🧪 [Echo Test] Auth test result:', authResult);
    
    // Test 2: Initialize Echo
    console.log('🧪 [Echo Test] Testing Echo initialization...');
    const echo = await initializeEcho();
    console.log('🧪 [Echo Test] Echo instance:', echo ? 'Created' : 'Failed');
    
    if (echo) {
      // Test 3: Check connection
      console.log('🧪 [Echo Test] Testing connection...');
      const connection = echo.connector?.pusher?.connection;
      console.log('🧪 [Echo Test] Connection state:', connection?.state);
      
      // Test 4: Listen to a test channel
      console.log('🧪 [Echo Test] Testing channel listening...');
      const channel = echo.channel('test-channel');
      console.log('🧪 [Echo Test] Channel created:', !!channel);
      
      // Test 5: Listen to a test event
      channel.listen('TestEvent', (data) => {
        console.log('🧪 [Echo Test] Received test event:', data);
      });
      console.log('🧪 [Echo Test] Event listener attached');
      
      return {
        success: true,
        auth: authResult,
        echo: !!echo,
        connection: connection?.state,
        channel: !!channel
      };
    }
    
    return {
      success: false,
      auth: authResult,
      echo: false,
      error: 'Failed to initialize Echo'
    };
    
  } catch (error) {
    console.error('🧪 [Echo Test] Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test broadcasting auth only
 */
export const testAuthOnly = async () => {
  console.log('🧪 [Echo Test] Testing auth only...');
  return await testBroadcastingAuth();
};

/**
 * Test Echo initialization only
 */
export const testEchoOnly = async () => {
  console.log('🧪 [Echo Test] Testing Echo only...');
  try {
    const echo = await initializeEcho();
    return {
      success: !!echo,
      echo: echo ? 'Created' : 'Failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Auto-run test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    console.log('🧪 [Echo Test] Auto-running Echo test...');
    runEchoTest().then(result => {
      console.log('🧪 [Echo Test] Test completed:', result);
    });
  }, 5000);
}

const testEchoUtils = {
  runEchoTest,
  testAuthOnly,
  testEchoOnly
};

export default testEchoUtils;
