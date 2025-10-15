import Logo from '@/components/template/Logo'
import useTheme from '@/utils/hooks/useTheme'
import appConfig from '@/configs/app.config'
import Link from 'next/link'

const HeaderLogo = ({ mode }) => {
    const defaultMode = useTheme((state) => state.mode)

    return (
        <Link href={appConfig.authenticatedEntryPath} className="block">
            <Logo
                imgClass="h-9 md:h-10 w-auto max-w-[160px] object-contain"
                mode={mode || defaultMode}
                className="hidden lg:block"
            />
        </Link>
    )
}

export default HeaderLogo
