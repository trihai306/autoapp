import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import Image from 'next/image'

const LOGO_SRC_PATH = '/img/logo/'

const Logo = (props) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth,
        logoHeight,
    } = props

    const width = logoWidth || (type === 'full' ? 120 : 40)
    const height = logoHeight || (type === 'full' ? 40 : 40)

    return (
        <div className={classNames('logo', className)} style={style}>
            {mode === 'light' && type === 'full' && (
                <Image
                    className={classNames(imgClass)}
                    src={`${LOGO_SRC_PATH}logo-light-full.png`}
                    alt={`${APP_NAME} logo`}
                    width={width}
                    height={height}
                    priority
                />
            )}
            {mode === 'light' && type === 'streamline' && (
                <Image
                    className={classNames(imgClass)}
                    src={`${LOGO_SRC_PATH}logo-light-streamline.png`}
                    alt={`${APP_NAME} logo`}
                    width={width}
                    height={height}
                    priority
                />
            )}
            {mode === 'dark' && type === 'full' && (
                <Image
                    className={classNames(imgClass)}
                    src={`${LOGO_SRC_PATH}logo-dark-full.png`}
                    alt={`${APP_NAME} logo`}
                    width={width}
                    height={height}
                    priority
                />
            )}
            {mode === 'dark' && type === 'streamline' && (
                <Image
                    className={classNames(imgClass)}
                    src={`${LOGO_SRC_PATH}logo-dark-streamline.png`}
                    alt={`${APP_NAME} logo`}
                    width={width}
                    height={height}
                    priority
                />
            )}
        </div>
    )
}

export default Logo
