import ScrumBoardProvider from './_components/ScrumBoardProvider'
import Board from './_components/Board'
import getScrumboardData from '@/server/actions/project/getScrumboardData'
import getSrcumboardMembers from '@/server/actions/project/getSrcumboardMembers'

export default async function Page() {
    const data = await getScrumboardData()
    const projectMembers = await getSrcumboardMembers()

    return (
        <ScrumBoardProvider data={data} projectMembers={projectMembers}>
            <Board />
        </ScrumBoardProvider>
    )
}
