import { useContext } from 'react'
import SessionContext from '@/components/auth/AuthProvider/SessionContext'

const useCurrentSession = () => {
    const context = useContext(SessionContext)

    return {
        session: context || {
            expires: '',
            user: {},
        },
        refreshSession: context?.refreshSession,
    }
}

export default useCurrentSession
