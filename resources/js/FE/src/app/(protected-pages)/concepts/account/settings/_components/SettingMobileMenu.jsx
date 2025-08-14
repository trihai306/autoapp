'use client'
import { useRef } from 'react'
import ToggleDrawer from '@/components/shared/ToggleDrawer'
import SettingsMenu from './SettingsMenu'
import { useTranslations } from 'next-intl'

const SettingMobileMenu = () => {
    const t = useTranslations('account.settings')
    const drawerRef = useRef(null)

    return (
        <>
            <div>
                <ToggleDrawer ref={drawerRef} title={t('menu.navigation')}>
                    <SettingsMenu
                        onChange={() => {
                            drawerRef.current?.handleCloseDrawer()
                        }}
                    />
                </ToggleDrawer>
            </div>
        </>
    )
}

export default SettingMobileMenu
