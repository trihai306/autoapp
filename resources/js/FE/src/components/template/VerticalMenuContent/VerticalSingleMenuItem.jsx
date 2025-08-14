import Tooltip from '@/components/ui/Tooltip'
import Menu from '@/components/ui/Menu'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import VerticalMenuIcon from './VerticalMenuIcon'
import Link from 'next/link'
import Dropdown from '@/components/ui/Dropdown'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const { MenuItem } = Menu

const CollapsedItem = ({
    nav,
    children,
    direction,
    renderAsIcon,
    onLinkClick,
    userAuthority,
    t,
}) => {
    const pathname = usePathname()
    const isActive = pathname.startsWith(nav.path)

    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            {renderAsIcon ? (
                <Tooltip
                    title={t(nav.translateKey, nav.title)}
                    placement={direction === 'rtl' ? 'left' : 'right'}
                >
                    {children}
                </Tooltip>
            ) : (
                <Dropdown.Item active={isActive ? 'true' : undefined}>
                    {nav.path ? (
                        <Link
                            className="h-full w-full flex items-center"
                            href={nav.path}
                            target={nav.isExternalLink ? '_blank' : ''}
                            onClick={() =>
                                onLinkClick?.({
                                    key: nav.key,
                                    title: nav.title,
                                    path: nav.path,
                                })
                            }
                        >
                            <span>{t(nav.translateKey, nav.title)}</span>
                        </Link>
                    ) : (
                        <span>{t(nav.translateKey, nav.title)}</span>
                    )}
                </Dropdown.Item>
            )}
        </AuthorityCheck>
    )
}

const DefaultItem = (props) => {
    const {
        nav,
        onLinkClick,
        showTitle,
        indent,
        showIcon = true,
        userAuthority,
        t,
    } = props
    
    const pathname = usePathname()
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        if (nav.path) {
            // Exact match or starts with for parent routes
            setIsActive(pathname === nav.path || pathname.startsWith(nav.path + '/'))
        }
    }, [pathname, nav.path])

    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <MenuItem 
                key={nav.key} 
                eventKey={nav.key} 
                dotIndent={indent}
                active={isActive ? 'true' : undefined}
            >
                <Link
                    href={nav.path}
                    className="flex items-center gap-2 h-full w-full"
                    target={nav.isExternalLink ? '_blank' : ''}
                    onClick={() =>
                        onLinkClick?.({
                            key: nav.key,
                            title: nav.title,
                            path: nav.path,
                        })
                    }
                >
                    {showIcon && <VerticalMenuIcon icon={nav.icon} />}
                    {showTitle && <span>{t(nav.translateKey, nav.title)}</span>}
                </Link>
            </MenuItem>
        </AuthorityCheck>
    )
}

const VerticalSingleMenuItem = ({
    nav,
    onLinkClick,
    sideCollapsed,
    direction,
    indent,
    renderAsIcon,
    userAuthority,
    showIcon,
    showTitle,
    t,
}) => {
    if (!nav.path) {
        return null
    }

    return (
        <>
            {sideCollapsed ? (
                <CollapsedItem
                    nav={nav}
                    direction={direction}
                    renderAsIcon={renderAsIcon}
                    userAuthority={userAuthority}
                    t={t}
                    onLinkClick={onLinkClick}
                >
                    <DefaultItem
                        nav={nav}
                        sideCollapsed={sideCollapsed}
                        userAuthority={userAuthority}
                        showIcon={showIcon}
                        showTitle={showTitle}
                        t={t}
                        onLinkClick={onLinkClick}
                    />
                </CollapsedItem>
            ) : (
                <DefaultItem
                    nav={nav}
                    sideCollapsed={sideCollapsed}
                    userAuthority={userAuthority}
                    showIcon={showIcon}
                    showTitle={showTitle}
                    indent={indent}
                    t={t}
                    onLinkClick={onLinkClick}
                />
            )}
        </>
    )
}

export default VerticalSingleMenuItem
