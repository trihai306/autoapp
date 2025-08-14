'use client'
import Timeline from '@/components/ui/Timeline'
import Button from '@/components/ui/Button'
import { ActivityAvatar, ActivityEvent } from '@/components/view/Activity'
import isEmpty from 'lodash/isEmpty'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

const Log = ({ activities, loadable, isLoading, onLoadMore, filter = [] }) => {
    const t = useTranslations('account.activityLog')
    return (
        <div>
            {activities.map((log, index) => (
                <div key={log.id + index} className="mb-8">
                    {log.events.filter((item) => filter.includes(item.type))
                        .length > 0 && (
                        <div className="mb-4 font-semibold uppercase">
                            {dayjs.unix(log.date).format('dddd, DD MMMM')}
                        </div>
                    )}
                    <Timeline>
                        {isEmpty(log.events) ? (
                            <Timeline.Item>No Activities</Timeline.Item>
                        ) : (
                            log.events
                                .filter((item) => filter.includes(item.type))
                                .map((event, index) => (
                                    <Timeline.Item
                                        key={log.id + event.type + index}
                                        media={<ActivityAvatar data={event} />}
                                    >
                                        <div className="mt-1">
                                            <ActivityEvent data={event} />
                                        </div>
                                    </Timeline.Item>
                                ))
                        )}
                    </Timeline>
                </div>
            ))}
            <div className="text-center">
                {loadable ? (
                    <Button loading={isLoading} onClick={onLoadMore}>
                        {t('loadMore')}
                    </Button>
                ) : (
                    t('noMoreActivity')
                )}
            </div>
        </div>
    )
}

export default Log
