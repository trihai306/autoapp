/**
 * Extract plain text from content field
 * Handles both JSON format {"text": "content"} and plain text
 */
export const extractContentText = (content) => {
    if (!content) return ''
    
    if (typeof content === 'string') {
        // Try to parse as JSON first
        try {
            const parsed = JSON.parse(content)
            if (parsed && typeof parsed === 'object' && parsed.text) {
                return parsed.text
            } else {
                return content
            }
        } catch {
            // If not JSON, use as plain text
            return content
        }
    } else if (typeof content === 'object' && content?.text) {
        // If already an object with text property
        return content.text
    } else if (typeof content === 'object') {
        // If object but no text property, stringify
        return JSON.stringify(content)
    } else {
        return String(content)
    }
}

/**
 * Get truncated content preview
 */
export const getContentPreview = (content, maxLength = 100) => {
    const text = extractContentText(content)
    return text.length > maxLength 
        ? text.substring(0, maxLength) + '...'
        : text
}
