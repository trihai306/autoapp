'use client'

import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

const statusColor = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    inactive: 'bg-gray-200 dark:bg-gray-200 text-gray-900 dark:text-gray-900',
    suspended: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const getInitial = (username) => {
    return username ? username[0].toUpperCase() : 'T'
}

const TiktokAccountDetail = ({ tiktokAccount }) => {
    const router = useRouter()
    const t = useTranslations('tiktokAccountManagement.detail')

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Avatar size={60} shape="circle">
                        {getInitial(tiktokAccount.username)}
                    </Avatar>
                    <div>
                        <div className="font-semibold text-lg">{tiktokAccount.username}</div>
                        <div className="text-sm text-gray-500">{tiktokAccount.email}</div>
                    </div>
                </div>
                <div>
                    <div className="font-semibold">{t('status')}</div>
                    <Tag className={statusColor[tiktokAccount.status]}>
                        <span className="capitalize">{tiktokAccount.status}</span>
                    </Tag>
                </div>
                <div>
                    <div className="font-semibold">{t('phone')}</div>
                    <div>{tiktokAccount.phone_number || t('notProvided')}</div>
                </div>
                <div>
                    <div className="font-semibold">{t('notes')}</div>
                    <div>{tiktokAccount.notes || t('noNotes')}</div>
                </div>
                <div>
                    <div className="font-semibold">{t('createdDate')}</div>
                    <div>{dayjs(tiktokAccount.created_at).format('DD/MM/YYYY')}</div>
                </div>
            </div>
        </div>
    )
}

export default TiktokAccountDetail 