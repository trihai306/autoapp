'use client'
import { useState, useEffect } from 'react'

/**
 * ClientOnly component to prevent hydration mismatch
 * Only renders children after component has mounted on client
 */
const ClientOnly = ({ children, fallback = null }) => {
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    if (!hasMounted) {
        return fallback
    }

    return children
}

export default ClientOnly
