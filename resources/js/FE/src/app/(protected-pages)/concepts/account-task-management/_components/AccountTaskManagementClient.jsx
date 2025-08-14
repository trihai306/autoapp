'use client'

import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import AccountTaskListProvider from './AccountTaskListProvider'
import AccountTaskListTable from './AccountTaskListTable'
import { useTranslations } from 'next-intl'

const AccountTaskManagementClient = ({ data, params }) => {
    const t = useTranslations('accountTaskManagement')

    return (
        <AccountTaskListProvider accountTaskList={data.list || []}>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>{t('title')}</h3>
                        </div>
                        <AccountTaskListTable
                            accountTaskListTotal={data.total || 0}
                            page={parseInt(params.page) || 1}
                            per_page={parseInt(params.per_page) || 10}
                        />
                    </div>
                </AdaptiveCard>
            </Container>
        </AccountTaskListProvider>
    )
}

export default AccountTaskManagementClient
