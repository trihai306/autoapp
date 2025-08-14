'use client'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import PermissionListProvider from './_components/PermissionListProvider'
import PermissionListTable from './_components/PermissionListTable'
import PermissionListActionTools from './_components/PermissionListActionTools'
import { usePermissionListStore } from './_store/permissionListStore'
import Dialog from '@/components/ui/Dialog'
import PermissionForm from './_components/PermissionForm'
import { useTranslations } from 'next-intl'

const PermissionManagementClient = ({ data, params }) => {
    const isFormOpen = usePermissionListStore((state) => state.isFormOpen)
    const formMode = usePermissionListStore((state) => state.formMode)
    const selectedPermissionForForm = usePermissionListStore((state) => state.selectedPermissionForForm)
    const openForm = usePermissionListStore((state) => state.openForm)
    const closeForm = usePermissionListStore((state) => state.closeForm)
    const t = useTranslations('permissionManagement')

    return (
        <PermissionListProvider permissionList={data.list}>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>{t('title')}</h3>
                            <PermissionListActionTools onAddNew={() => openForm('add')} />
                        </div>
                        <PermissionListTable
                            permissionListTotal={data.total}
                            page={parseInt(params.page) || 1}
                            per_page={parseInt(params.per_page) || 10}
                        />
                    </div>
                </AdaptiveCard>
            </Container>
            <Dialog
                isOpen={isFormOpen}
                onClose={closeForm}
                onRequestClose={closeForm}
            >
                <PermissionForm 
                    mode={formMode} 
                    permission={selectedPermissionForForm} 
                    onClose={closeForm} 
                />
            </Dialog>
        </PermissionListProvider>
    )
}

export default PermissionManagementClient;