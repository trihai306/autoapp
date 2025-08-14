'use client'

import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

const statusColor = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    locked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const getInitial = (name) => {
    const a = name.split(' ')
    if (a.length > 1) {
        return a[0][0] + a[a.length - 1][0]
    }
    return name[0]
}

const UserDetail = ({ user }) => {
    const router = useRouter()
    const t = useTranslations('userManagement.detail')

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Avatar size={60} shape="circle" src={user.avatar}>
                        {getInitial(user.full_name)}
                    </Avatar>
                    <div>
                        <div className="font-semibold text-lg">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>
                <div>
                    <div className="font-semibold">{t('status')}</div>
                    <Tag className={statusColor[user.status]}>
                        <span className="capitalize">{user.status}</span>
                    </Tag>
                </div>
                <div>
                    <div className="font-semibold">{t('phone')}</div>
                    <div>{user.phone_number}</div>
                </div>
                <div>
                    <div className="font-semibold">{t('balance')}</div>
                    <div>{user.balance}</div>
                </div>
                <div>
                    <div className="font-semibold">{t('roles')}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {user.roles?.map((role) => (
                            <Tag key={role.id} className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100">
                                {role.name}
                            </Tag>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="font-semibold">{t('createdDate')}</div>
                    <div>{dayjs(user.created_at).format('DD/MM/YYYY')}</div>
                </div>
            </div>
        </div>
    )
}

export default UserDetail
