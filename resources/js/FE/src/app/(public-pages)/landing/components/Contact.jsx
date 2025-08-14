import Container from './LandingContainer'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
// import Textarea from '@/components/ui/Textarea'

const Contact = () => {
    return (
        <div id="contact" className="relative z-20 py-10 md:py-40 bg-gray-100 dark:bg-gray-950">
            <Container>
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, type: 'spring', bounce: 0.1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="my-6 text-5xl">Liên hệ với chúng tôi</h2>
                    <p className="mx-auto max-w-[600px]">
                        Có câu hỏi hoặc muốn yêu cầu một buổi demo được cá nhân hóa? Đội ngũ của chúng tôi sẵn sàng hỗ trợ.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2">Tên của bạn</label>
                                    <Input id="name" type="text" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                                    <Input id="email" type="email" placeholder="you@example.com" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label htmlFor="message" className="block text-sm font-medium mb-2">Tin nhắn của bạn</label>
                                <Input textArea id="message" rows={4} placeholder="Hãy cho chúng tôi biết làm thế nào chúng tôi có thể giúp bạn..." />
                            </div>
                            <div className="text-right">
                                <Button type="submit" variant="solid">Gửi tin nhắn</Button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </Container>
        </div>
    )
}

export default Contact
