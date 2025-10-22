import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { HiOutlineExclamation as AlertTriangle, HiOutlineShieldCheck as Shield } from 'react-icons/hi'

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md" header={{ content: (
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Phiên đăng nhập đã hết hạn</h2>
                    <p className="text-gray-600">Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại để tiếp tục.</p>
                </div>
            )}}>
                <div className="space-y-4">
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
                        <Button asElement={Link} href="/sign-in" className="w-full">Đăng nhập lại</Button>
                        <Button variant="default" asElement={Link} href="/" className="w-full">Về trang chủ</Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
