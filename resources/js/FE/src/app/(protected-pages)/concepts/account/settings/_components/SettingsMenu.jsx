'use client'
import Menu from '@/components/ui/Menu'
import ScrollBar from '@/components/ui/ScrollBar'
import { useSettingsStore } from '../_store/settingsStore'

import {
    TbUserSquare,
    TbLock,
    TbBell,
    TbFileDollar,
    TbRefreshDot,
} from 'react-icons/tb'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

const { MenuItem } = Menu

const SettingsMenu = ({ onChange }) => {
    const t = useTranslations('account.settings.menu')
    const menuList = [
        { label: t('profile'), value: 'profile', icon: <TbUserSquare /> },
        { label: t('security'), value: 'security', icon: <TbLock /> },
        { label: t('notificationSettings'), value: 'notification', icon: <TbBell /> },
        { label: t('notificationList'), value: 'notificationList', icon: <TbRefreshDot /> },
        { label: t('billing'), value: 'billing', icon: <TbFileDollar /> },
    ]
    const searchParams = useSearchParams()

    const { currentView, setCurrentView } = useSettingsStore()

    const currentPath =
        searchParams.get('category') || searchParams.get('label') || 'inbox'

    const handleSelect = (value) => {
        setCurrentView(value)
        onChange?.()
    }

    return (
        <div className="flex flex-col justify-between h-full">
            <ScrollBar className="h-full overflow-y-auto">
                <Menu className="mx-2 mb-10">
                    {menuList.map((menu) => (
                        <MenuItem
                            key={menu.value}
                            eventKey={menu.value}
                            className={`mb-2 ${
                                currentView === menu.value
                                    ? 'bg-gray-100 dark:bg-gray-700'
                                    : ''
                            }`}
                            isActive={currentPath === menu.value}
                            onSelect={() => handleSelect(menu.value)}
                        >
                            <span className="text-2xl ltr:mr-2 rtl:ml-2">
                                {menu.icon}
                            </span>
                            <span>{menu.label}</span>
                        </MenuItem>
                    ))}
                </Menu>
            </ScrollBar>
        </div>
    )
}

export default SettingsMenu
