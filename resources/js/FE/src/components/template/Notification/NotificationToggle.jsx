'use client'
import Badge from '@/components/ui/Badge'
import classNames from '@/utils/classNames'
import { HiOutlineBell } from 'react-icons/hi'

const NotificationToggle = ({ className, dot, count }) => {
    return (
        <div className={classNames('text-2xl', className)}>
            {dot ? (
                <Badge
                    badgeStyle={{ top: '2px', right: '4px' }}
                    content={count > 9 ? '9+' : count}
                >
                    <HiOutlineBell />
                </Badge>
            ) : (
                <HiOutlineBell />
            )}
        </div>
    )
}

export default NotificationToggle
