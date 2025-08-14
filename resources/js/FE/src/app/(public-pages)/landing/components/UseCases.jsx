import Container from './LandingContainer'
import { motion } from 'framer-motion'
import {
    TbBuildingStore,
    TbCode,
    TbReportAnalytics,
    TbRobot,
} from 'react-icons/tb'

const useCases = [
    {
        icon: <TbCode />,
        title: 'Phát triển phần mềm',
        desc: 'Tự động hóa việc viết mã, gỡ lỗi và triển khai để đẩy nhanh chu kỳ phát triển của bạn.',
    },
    {
        icon: <TbReportAnalytics />,
        title: 'Phân tích dữ liệu',
        desc: 'Sử dụng các agent để xử lý và phân tích các tập dữ liệu lớn, tạo ra thông tin chi tiết và báo cáo.',
    },
    {
        icon: <TbBuildingStore />,
        title: 'Tự động hóa quy trình kinh doanh',
        desc: 'Tối ưu hóa các hoạt động bằng cách tự động hóa các tác vụ lặp đi lặp lại như nhập dữ liệu và dịch vụ khách hàng.',
    },
    {
        icon: <TbRobot />,
        title: 'Nghiên cứu & Phát triển',
        desc: 'Triển khai các agent để thực hiện nghiên cứu, thu thập thông tin và tóm tắt các phát hiện để thúc đẩy sự đổi mới.',
    },
]

const UseCaseCard = ({ icon, title, desc, index }) => {
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
            className="p-6 rounded-2xl z-10 relative bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 h-full group"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-600">
                    <span className="text-3xl">{icon}</span>
                </div>
                <h3 className="text-lg">{title}</h3>
            </div>
            <p className="text-muted dark:text-muted-dark mt-4">{desc}</p>
        </motion.div>
    )
}

const UseCases = () => {
    return (
        <div id="use-cases" className="relative z-20 py-10 md:py-40">
            <Container>
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, type: 'spring', bounce: 0.1 }}
                    viewport={{ once: true }}
                >
                    <motion.h2 className="my-6 text-5xl">
                        Giải quyết các vấn đề trong thế giới thực
                    </motion.h2>
                    <motion.p className="mx-auto max-w-[600px]">
                        Từ các công ty khởi nghiệp đến các doanh nghiệp lớn, AgentAI có thể được điều chỉnh để phù hợp với một loạt các ứng dụng.
                    </motion.p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {useCases.map((useCase, index) => (
                        <UseCaseCard key={index} index={index} {...useCase} />
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default UseCases
