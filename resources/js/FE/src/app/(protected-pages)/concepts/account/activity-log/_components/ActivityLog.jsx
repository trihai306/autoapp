'use client'
import { useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Log from './Log'
import LogAction from './LogAction'
import getLogs from '@/server/actions/log/getLogs'
import { useTranslations } from 'next-intl'
import {
    UPDATE_TICKET,
    COMMENT,
    COMMENT_MENTION,
    ASSIGN_TICKET,
    ADD_TAGS_TO_TICKET,
    ADD_FILES_TO_TICKET,
    CREATE_TICKET,
} from '@/components/view/Activity/constants'
import { useActivityLog } from '../_store/activityLogStore'

const defaultSelectedType = [
    UPDATE_TICKET,
    COMMENT,
    COMMENT_MENTION,
    ASSIGN_TICKET,
    ADD_TAGS_TO_TICKET,
    ADD_FILES_TO_TICKET,
    CREATE_TICKET,
]

const ActivityLog = () => {
    const t = useTranslations('account.activityLog')
    const [isLoading, setIsLoading] = useState(false)
    const [activityIndex, setActivityIndex] = useState(1)
    const [showMentionedOnly, setShowMentionedOnly] = useState(false)
    const [selectedType, setSelectedType] = useState(defaultSelectedType)

    const activities = useActivityLog((state) => state.data)
    const setActivities = useActivityLog((state) => state.setData)
    const loadable = useActivityLog((state) => state.loadable)
    const setLoadable = useActivityLog((state) => state.setLoadable)
    const initialLoading = useActivityLog((state) => state.initialLoading)

    const fetchLogs = async (index) => {
        setIsLoading(true)
        const result = await getLogs(index);
        if (result.data) {
            setActivities([...activities, ...result.data]);
            setLoadable(result.loadable);
        }
        setIsLoading(false)
    }

    const handleFilterChange = (selected) => {
        setShowMentionedOnly(false)
        if (selectedType.includes(selected)) {
            setSelectedType((prevData) =>
                prevData.filter((prev) => prev !== selected),
            )
        } else {
            setSelectedType((prevData) => [...prevData, ...[selected]])
        }
    }

    const handleLoadMore = () => {
        const nextIndex = activityIndex + 1;
        setActivityIndex(nextIndex);
        fetchLogs(nextIndex);
    }

    const handleCheckboxChange = (bool) => {
        setShowMentionedOnly(bool)
        if (bool) {
            setSelectedType([COMMENT_MENTION])
        } else {
            setSelectedType(defaultSelectedType)
        }
    }

    return (
        <AdaptiveCard className="h-full" bodyClass="h-full">
            <div className="max-w-[800px] mx-auto h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3>{t('title')}</h3>
                    <LogAction
                        selectedType={selectedType}
                        showMentionedOnly={showMentionedOnly}
                        onFilterChange={handleFilterChange}
                        onCheckboxChange={handleCheckboxChange}
                    />
                </div>
                {initialLoading ? (
                    <div className="flex flex-col justify-center h-full">
                        <Loading loading={true} />
                    </div>
                ) : (
                    <Log
                        isLoading={isLoading}
                        loadable={loadable}
                        activities={activities}
                        filter={selectedType}
                        onLoadMore={handleLoadMore}
                    />
                )}
            </div>
        </AdaptiveCard>
    )
}

export default ActivityLog
