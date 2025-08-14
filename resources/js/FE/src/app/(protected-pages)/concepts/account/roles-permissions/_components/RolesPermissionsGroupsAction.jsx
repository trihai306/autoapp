'use client'

import Button from '@/components/ui/Button'
import { useRolePermissionsStore } from '../_store/rolePermissionsStore'
import { useTranslations } from 'next-intl'

const RolesPermissionsGroupsAction = () => {
    const t = useTranslations('account.rolesPermissions')
    const { setRoleDialog } = useRolePermissionsStore()

    return (
        <div>
            <Button
                variant="solid"
                onClick={() =>
                    setRoleDialog({
                        type: 'new',
                        open: true,
                    })
                }
            >
                {t('createRole')}
            </Button>
        </div>
    )
}

export default RolesPermissionsGroupsAction
