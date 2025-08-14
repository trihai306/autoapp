import Container from './LandingContainer'
import { motion } from 'framer-motion'
import { LuGoal, LuPlug, LuPlay } from 'react-icons/lu'

const steps = [
    {
        icon: <LuGoal />,
        title: 'Xác định mục tiêu của bạn',
        desc: 'Bắt đầu bằng cách mô tả nhiệm vụ bạn muốn tự động hóa bằng ngôn ngữ tự nhiên. Càng chi tiết càng tốt.',
    },
    {
        icon: <LuPlug />,
        title: 'Cung cấp công cụ & Quyền truy cập',
        desc: 'Trang bị cho agent của bạn các công cụ cần thiết và cấp quyền truy cập vào các API hoặc tài nguyên liên quan.',
    },
    {
        icon: <LuPlay />,
        title: 'Triển khai và Giám sát',
        desc: 'Chạy agent của bạn và theo dõi tiến trình của nó trong thời gian thực. Can thiệp khi cần thiết hoặc để nó hoạt động tự chủ.',
    },
]

const StepCard = ({ icon, title, desc, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                type: 'spring',
                bounce: 0.1,
                delay: index * 0.1,
            }}
            viewport={{ once: true }}
            className="p-4 rounded-2xl z-10 relative bg-gray-50 dark:bg-gray-800 h-full group"
        >
            <div className="flex flex-col">
                <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                    <span className="text-4xl text-primary">{icon}</span>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg mb-2">{title}</h3>
                    <p className="text-muted dark:text-muted-dark">{desc}</p>
                </div>
            </div>
        </motion.div>
    )
}

const HowItWorks = () => {
    return (
        <div id="how-it-works" className="relative z-20 py-10 md:py-40 bg-gray-100 dark:bg-gray-950">
            <Container>
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, type: 'spring', bounce: 0.1 }}
                    viewport={{ once: true }}
                >
                    <motion.h2 className="my-6 text-5xl">
                        Bắt đầu trong vài phút
                    </motion.h2>
                    <motion.p className="mx-auto max-w-[600px]">
                        Một quy trình làm việc đơn giản và trực quan để đưa các agent của bạn vào cuộc sống.
                    </motion.p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {steps.map((step, index) => (
                        <StepCard key={index} index={index} {...step} />
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default HowItWorks
