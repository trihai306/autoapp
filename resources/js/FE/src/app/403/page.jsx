import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { TbShieldX, TbHome, TbArrowLeft } from 'react-icons/tb'
import Link from 'next/link'

export default function ForbiddenPage() {
  const headerContent = (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
        <TbShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Truy cập bị từ chối</h2>
      <p className="text-gray-600 dark:text-gray-400">Bạn không có quyền truy cập vào trang này</p>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card
        className="w-full max-w-md"
        header={{ content: headerContent, className: 'text-center' }}
      >
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập vào tính năng này.
          </p>

          <div className="flex flex-col space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <TbHome className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>

            <Button variant="outline" className="w-full" onClick={() => history.back()}>
              <TbArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
