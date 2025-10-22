import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Shield, Clock, Server } from 'lucide-react'

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Phiên đăng nhập đã hết hạn
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại để tiếp tục.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Lỗi xác thực
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>Mã lỗi: 401 - Unauthorized</p>
                                    <p>Thời gian: {new Date().toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Button asChild className="w-full">
                            <Link href="/sign-in">
                                Đăng nhập lại
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/">
                                Về trang chủ
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
