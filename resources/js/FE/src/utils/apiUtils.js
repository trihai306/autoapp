/**
 * API Utilities for handling HTTPS connections and SSL issues
 */

/**
 * Create fetch options with proper SSL and CORS handling
 */
export const createSecureFetchOptions = (options = {}) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        },
        // Add credentials for CORS
        credentials: 'include',
        // Add mode for CORS
        mode: 'cors',
        ...options,
    }
    
    return defaultOptions
}

/**
 * Enhanced fetch with better error handling for HTTPS APIs
 */
export const secureFetch = async (url, options = {}) => {
    const fetchOptions = createSecureFetchOptions(options)
    
    try {
        // console.log('🔍 Making secure API call to:', url)
        // console.log('📋 Options:', JSON.stringify(fetchOptions, null, 2))
        
        const response = await fetch(url, fetchOptions)
        
        // console.log('📡 Response status:', response.status)
        // console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ API Error Response:', errorText)
            throw new Error(`API Error ${response.status}: ${errorText}`)
        }
        
        return response
    } catch (error) {
        console.error('❌ Secure fetch error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        })
        throw error
    }
}

/**
 * Test API connectivity
 */
export const testApiConnectivity = async (baseUrl, apiPrefix = '/api') => {
    const testUrl = `${baseUrl}${apiPrefix}/login`
    
    try {
        // Test OPTIONS request first (CORS preflight)
        // console.log('🔍 Testing CORS preflight...')
        const optionsResponse = await fetch(testUrl, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization',
            },
        })
        
        // console.log('✅ CORS preflight status:', optionsResponse.status)
        
        // Test actual POST request
        // console.log('🔍 Testing POST request...')
        const response = await secureFetch(testUrl, {
            method: 'POST',
            body: JSON.stringify({
                login: 'admin@example.com',
                password: 'password'
            }),
        })
        
        const data = await response.json()
        // console.log('✅ API test successful:', data)
        return { success: true, data }
        
    } catch (error) {
        console.error('❌ API test failed:', error)
        return { success: false, error: error.message }
    }
}
