import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import appConfig from '@/configs/app.config'

export async function GET() {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const response = await fetch(`${appConfig.API_BASE_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 },
        )
    }
}
