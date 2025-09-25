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

    // Điều chỉnh kích thước logo cho phù hợp hơn
    const width = logoWidth || (type === 'full' ? 40 : 32)
    const height = logoHeight || (type === 'full' ? 32 : 32)

    return (
        <div className={classNames('logo', className)} style={style}>
            {/* Sử dụng logo SI85XhJA.png cho cả dark mode và light mode */}
            <Image
                className={classNames(
                    'object-contain transition-all duration-200 hover:scale-105',
                    // CSS cho logo sắc nét và responsive
                    'filter-none drop-shadow-sm',
                    // Responsive sizing
                    'w-auto h-auto max-w-full',
                    imgClass
                )}
                src={`${LOGO_SRC_PATH}SI85XhJA.png`}
                alt={`${APP_NAME} logo`}
                width={width}
                height={height}
                priority
                quality={95}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
        </div>
    )
}

export default Logo
