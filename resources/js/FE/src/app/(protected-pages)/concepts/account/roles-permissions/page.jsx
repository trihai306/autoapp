import Container from '@/components/shared/Container'
import RolesPermissionsGroups from './_components/RolesPermissionsGroups'
import RolesPermissionsGroupsAction from './_components/RolesPermissionsGroupsAction'
import RolesPermissionsUserAction from './_components/RolesPermissionsUserAction'
import RolesPermissionsUserTable from './_components/RolesPermissionsUserTable'
import RolesPermissionsUserSelected from './_components/RolesPermissionsUserSelected'
import RolesPermissionsAccessDialog from './_components/RolesPermissionsAccessDialog'
import RolesPermissionsProvider from './_components/RolesPermissionsProvider'
import getRolesPermissionsRoles from '@/server/actions/user/getRolesPermissionsRoles'
import getRolesPermissionsUsers from '@/server/actions/user/getRolesPermissionsUsers'
import { getTranslations } from 'next-intl/server'

export default async function Page({ searchParams }) {
    const params = await searchParams
    const t = await getTranslations('account.rolesPermissions')

    const roleList = await getRolesPermissionsRoles()
    const userList = await getRolesPermissionsUsers(params)

    return (
        <RolesPermissionsProvider
            roleList={roleList}
            userList={userList.list}
            role={params.role}
            status={params.status}
        >
            <Container>
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3>{t('title')}</h3>
                        <RolesPermissionsGroupsAction />
                    </div>
                    <div className="mb-10">
                        <RolesPermissionsGroups />
                    </div>
                </div>
                <div>
                    <div>
                        <div className="mb-6 flex flex-col gap-5">
                            <h3>{t('allAccounts')}</h3>
                            <div className="flex-1">
                                <RolesPermissionsUserAction />
                            </div>
                        </div>
                        <RolesPermissionsUserTable
                            userListTotal={userList.total}
                            pageIndex={parseInt(params.pageIndex) || 1}
                            pageSize={parseInt(params.pageSize) || 10}
                        />
                    </div>
                </div>
            </Container>
            <RolesPermissionsAccessDialog />
            <RolesPermissionsUserSelected />
        </RolesPermissionsProvider>
    )
}
