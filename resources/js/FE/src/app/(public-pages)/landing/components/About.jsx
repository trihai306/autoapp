import Container from './LandingContainer'
import { motion } from 'framer-motion'
import Image from 'next/image'

const About = () => {
    return (
        <div id="about" className="relative z-20 py-10 md:py-40">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, type: 'spring', bounce: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl mb-6">Về AgentAI</h2>
                        <p className="text-lg text-muted dark:text-muted-dark mb-4">
                            AgentAI được thành lập với một sứ mệnh duy nhất: dân chủ hóa việc tạo và triển khai các agent trí tuệ nhân tạo tự động. Chúng tôi tin rằng tương lai của công việc và tự động hóa nằm trong tay của các hệ thống thông minh có thể học hỏi, thích nghi và thực thi các tác vụ phức tạp.
                        </p>
                        <p className="text-lg text-muted dark:text-muted-dark">
                            Nền tảng của chúng tôi cung cấp một bộ công cụ toàn diện, từ giao diện kéo-thả trực quan đến các API mạnh mẽ, cho phép các nhà phát triển và doanh nghiệp ở mọi quy mô xây dựng các giải pháp AI tùy chỉnh phù hợp với nhu cầu riêng của họ.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                            <Image
                                src="/img/landing/about/teamwork.jpg"
                                width={600}
                                height={400}
                                className="rounded-xl object-cover"
                                alt="AgentAI Team"
                            />
                        </div>
                    </motion.div>
                </div>
            </Container>
        </div>
    )
}

export default About
