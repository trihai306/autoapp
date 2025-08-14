import Container from './LandingContainer'
import { motion } from 'framer-motion'
import {
    TbAnalyze,
    TbCode,
    TbMessageCode,
    TbRobot,
    TbTool,
    TbUsers,
} from 'react-icons/tb'

const features = [
    {
        icon: <TbRobot />,
        title: 'Agent tự động',
        desc: 'Tạo và triển khai các agent AI tự trị có khả năng thực hiện các tác vụ phức tạp một cách độc lập.',
    },
    {
        icon: <TbTool />,
        title: 'Tích hợp công cụ',
        desc: 'Tích hợp liền mạch các công cụ và API bên ngoài để mở rộng khả năng của agent.',
    },
    {
        icon: <TbAnalyze />,
        title: 'Phân tích và giám sát',
        desc: 'Theo dõi hiệu suất của agent, phân tích kết quả và gỡ lỗi hành vi bằng các công cụ trực quan.',
    },
    {
        icon: <TbMessageCode />,
        title: 'Giao diện trò chuyện',
        desc: 'Tương tác với agent của bạn thông qua giao diện trò chuyện, giúp việc quản lý và ghi đè trở nên dễ dàng.',
    },
    {
        icon: <TbCode />,
        title: 'Môi trường Code an toàn',
        desc: 'Thực thi mã trong một môi trường an toàn, có sandbox để đảm bảo an toàn và bảo mật.',
    },
    {
        icon: <TbUsers />,
        title: 'Hợp tác nhóm',
        desc: 'Mời các thành viên trong nhóm cộng tác trong các dự án, chia sẻ agent và quản lý quy trình làm việc.',
    },
]

const FeatureCard = ({ icon, title, desc, index }) => {
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
            className="p-4 rounded-2xl z-10 relative bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 h-full group"
        >
            <div className="flex flex-col">
                <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-600 group-hover:border-primary">
                    <span className="text-4xl">{icon}</span>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg mb-2">{title}</h3>
                    <p className="text-muted dark:text-muted-dark">{desc}</p>
                </div>
            </div>
        </motion.div>
    )
}

const Features = () => {
    return (
        <div id="features" className="relative z-20 py-10 md:py-40">
            <Container>
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, type: 'spring', bounce: 0.1 }}
                    viewport={{ once: true }}
                >
                    <motion.h2 className="my-6 text-5xl">
                        Một nền tảng, khả năng vô hạn
                    </motion.h2>
                    <motion.p className="mx-auto max-w-[600px]">
                        AgentAI cung cấp một bộ công cụ mạnh mẽ để xây dựng, triển khai và quản lý các agent AI tự động cho mọi trường hợp sử dụng.
                    </motion.p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} index={index} {...feature} />
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default Features
