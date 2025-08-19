'use client'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ProxyListProvider from './_components/ProxyListProvider'
import ProxyListTable from './_components/ProxyListTable'
import ProxyListActionTools from './_components/ProxyListActionTools'
import ProxyStatsCards from './_components/ProxyStatsCards'
import { useProxyListStore } from './_store/proxyListStore'
import Dialog from '@/components/ui/Dialog'
import ProxyForm from './_components/ProxyForm'
import ImportForm from './_components/ImportForm'
import { useTranslations } from 'next-intl'

const ProxyManagementClient = ({ data, stats, params }) => {
    const isFormOpen = useProxyListStore((state) => state.isFormOpen)
    const isImportFormOpen = useProxyListStore((state) => state.isImportFormOpen)
    const formMode = useProxyListStore((state) => state.formMode)
    const selectedProxyForForm = useProxyListStore((state) => state.selectedProxyForForm)
    const openForm = useProxyListStore((state) => state.openForm)
    const closeForm = useProxyListStore((state) => state.closeForm)
    const openImportForm = useProxyListStore((state) => state.openImportForm)
    const closeImportForm = useProxyListStore((state) => state.closeImportForm)
    const t = useTranslations('proxy-management')

    return (
        <ProxyListProvider proxyList={data.list} stats={stats}>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>{t('title')}</h3>
                            <ProxyListActionTools 
                                onAddNew={() => openForm('add')} 
                                onImport={() => openImportForm()}
                            />
                        </div>
                        <ProxyStatsCards />
                        <ProxyListTable
                            proxyListTotal={data.total}
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
                <ProxyForm 
                    mode={formMode} 
                    proxy={selectedProxyForForm} 
                    onClose={closeForm} 
                />
            </Dialog>
            <Dialog
                isOpen={isImportFormOpen}
                onClose={closeImportForm}
                onRequestClose={closeImportForm}
            >
                <ImportForm onClose={closeImportForm} />
            </Dialog>
        </ProxyListProvider>
    )
}

export default ProxyManagementClient;
