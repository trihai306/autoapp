import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'

import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const HeroContent = ({ mode }) => {
    const router = useRouter()

    const handlePreview = () => {
        router.push('/dashboards/ecommerce')
    }

    const handleGetTemplate = () => {
        window.open(
            'https://themeforest.net/item/ecme-nextjs-tailwind-admin-template-app-router/56475600',
            '_blank',
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 flex min-h-screen flex-col items-center justify-between">
            <div className="flex flex-col min-h-screen pt-20 md:pt-40 relative overflow-hidden">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="text-2xl md:text-4xl lg:text-8xl font-bold max-w-7xl mx-auto text-center mt-6 relative z-10"
                    >
                        Xây dựng và triển khai các{' '}
                        <span className="bg-gradient-to-r from-[#2feaa8] to-[#0eb9ce] bg-clip-text text-transparent">
                            agent
                        </span>{' '}
                        <span className="bg-gradient-to-r from-[#02bcca] to-[#028cf3] bg-clip-text text-transparent">
                            AI
                        </span>{' '}
                        tự động
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, translateY: 40 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="text-center mt-6 text-base md:text-xl text-muted dark:text-muted-dark max-w-5xl mx-auto relative z-10 font-normal"
                    >
                        Tạo ra các agent AI tự động để tự động hóa các tác vụ phức tạp, từ phát triển phần mềm đến quy trình kinh doanh.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, translateY: 40 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                        className="flex items-center gap-4 justify-center mt-10 relative z-10"
                    >
                        <Button variant="solid" onClick={handlePreview}>
                            Yêu cầu Demo
                        </Button>
                        <Button onClick={handleGetTemplate}>
                            Bắt đầu
                        </Button>
                    </motion.div>
                </div>
                <div className="p-2 lg:p-4 border border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 rounded-2xl lg:rounded-[32px] mt-20 relative">
                    <div className="absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-b from-transparent via-white to-white dark:via-black/50 dark:to-black scale-[1.1] pointer-events-none" />
                    <div className="bg-white dark:bg-black dark:border-gray-700 border border-gray-200 rounded-[24px]">
                        {mode === MODE_LIGHT && (
                            <Image
                                className="rounded-2xl lg:rounded-[24px]"
                                src="/img/landing/hero/hero.webp"
                                width={1920}
                                height={1040}
                                alt="Ecme homepage"
                            />
                        )}
                        {mode === MODE_DARK && (
                            <Image
                                className="rounded-2xl lg:rounded-[24px]"
                                src="/img/landing/hero/hero-dark.webp"
                                width={1920}
                                height={1040}
                                alt="Ecme homepage"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroContent
