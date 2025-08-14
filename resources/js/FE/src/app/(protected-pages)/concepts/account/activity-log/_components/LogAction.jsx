'use client'
import { useMemo } from 'react'
import Dropdown from '@/components/ui/Dropdown'
import Switcher from '@/components/ui/Switcher'
import {
    UPDATE_TICKET,
    ASSIGN_TICKET,
    ADD_TAGS_TO_TICKET,
    ADD_FILES_TO_TICKET,
    CREATE_TICKET,
} from '@/components/view/Activity/constants'
import { TbFilter, TbCheck } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const LogAction = ({
    showMentionedOnly,
    selectedType = [],
    onFilterChange,
    onCheckboxChange,
}) => {
    const t = useTranslations('account.activityLog')

    const filterItems = useMemo(() => [
        { label: t('filter.ticketStatus'), value: UPDATE_TICKET },
        { label: t('filter.assignTicket'), value: ASSIGN_TICKET },
        { label: t('filter.newTicket'), value: CREATE_TICKET },
        { label: t('filter.addTags'), value: ADD_TAGS_TO_TICKET },
        { label: t('filter.addFiles'), value: ADD_FILES_TO_TICKET },
    ], [t])

    const allUnchecked = useMemo(() => {
        return !selectedType.some((type) =>
            filterItems.map((item) => item.value).includes(type),
        )
    }, [selectedType, filterItems])

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className="font-semibold">
                    {showMentionedOnly
                        ? t('showAllActivity')
                        : t('showMentionedOnly')}
                </span>
                <Switcher
                    checked={showMentionedOnly}
                    onChange={onCheckboxChange}
                />
            </div>
            <Dropdown
                placement="bottom-end"
                renderTitle={
                    <button
                        className="close-button p-2.5! button-press-feedback"
                        type="button"
                    >
                        <TbFilter />
                    </button>
                }
            >
                {filterItems.map((item) => (
                    <Dropdown.Item
                        key={item.value}
                        eventKey={item.value}
                        onClick={() => onFilterChange(item.value)}
                    >
                        {!allUnchecked && (
                            <div className="flex justify-center w-[20px]">
                                {selectedType.includes(item.value) && (
                                    <TbCheck className="text-primary text-lg" />
                                )}
                            </div>
                        )}
                        <span>{item.label}</span>
                    </Dropdown.Item>
                ))}
            </Dropdown>
        </div>
    )
}

export default LogAction
