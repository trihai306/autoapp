import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { HiOutlineLockClosed as Lock, HiOutlineExclamation as AlertTriangle } from 'react-icons/hi'

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md" header={{ content: (
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                        <Lock className="h-6 w-6 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Không có quyền truy cập</h2>
                    <p className="text-gray-600">Bạn không có quyền truy cập vào tài nguyên này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.</p>
                </div>
            )}}>
                <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-orange-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-orange-800">
                                    Lỗi phân quyền
                                </h3>
                                <div className="mt-2 text-sm text-orange-700">
                                    <p>Mã lỗi: 403 - Forbidden</p>
                                    <p>Thời gian: {new Date().toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Button asElement={Link} href="/dashboard" className="w-full">
                            Về trang chủ
                        </Button>
                        <Button variant="default" asElement={Link} href="/support" className="w-full">
                            Liên hệ hỗ trợ
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
