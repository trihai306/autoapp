import { NextResponse } from 'next/server'
import getSrcumboardMembers from '@/server/actions/project/getSrcumboardMembers'

export async function GET() {
    try {
        const scrumboardMembers = await getSrcumboardMembers()

        return NextResponse.json(scrumboardMembers)
    } catch (error) {
        // // // console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}
