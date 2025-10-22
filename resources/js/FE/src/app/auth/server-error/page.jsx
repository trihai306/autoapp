import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, AlertTriangle } from 'lucide-react'

export default function ServerErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <Server className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Lỗi máy chủ
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Đã xảy ra lỗi từ phía máy chủ. Chúng tôi đang khắc phục sự cố này. Vui lòng thử lại sau.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Server Error
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>Mã lỗi: 500 - Internal Server Error</p>
                                    <p>Thời gian: {new Date().toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p>Nếu lỗi này tiếp tục xảy ra:</p>
                        <ul className="mt-2 text-left space-y-1">
                            <li>• Kiểm tra kết nối internet</li>
                            <li>• Thử lại sau vài phút</li>
                            <li>• Liên hệ hỗ trợ kỹ thuật</li>
                        </ul>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Button asChild className="w-full">
                            <Link href="/dashboard">
                                Về trang chủ
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                            Thử lại
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/support">
                                Liên hệ hỗ trợ
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
