'use client'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import {
    HiOutlinePlay as Play,
    HiOutlinePause as Pause,
    HiOutlineStop as Stop,
    HiOutlineDesktopComputer as Desktop
} from 'react-icons/hi'

const QuickActions = ({ selectedDevices = [], onAction, loading = false }) => {
    const handleAction = async (actionType) => {
        if (onAction) {
            await onAction(actionType)
        }
    }

    return (
        <AdaptiveCard>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Thao tác nhanh
                    </h3>
                    
                    {selectedDevices.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Đã chọn {selectedDevices.length} thiết bị
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="solid"
                                    color="green-500"
                                    className="flex-1 sm:flex-none sm:w-auto justify-center bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleAction('activate')}
                                    disabled={loading}
                                    loading={loading}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Kích hoạt
                                </Button>
                                
                                <Button
                                    variant="solid"
                                    color="orange-500"
                                    className="flex-1 sm:flex-none sm:w-auto justify-center bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={() => handleAction('pause')}
                                    disabled={loading}
                                    loading={loading}
                                >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Tạm dừng
                                </Button>
                                
                                <Button
                                    variant="solid"
                                    color="red-500"
                                    className="flex-1 sm:flex-none sm:w-auto justify-center bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => handleAction('block')}
                                    disabled={loading}
                                    loading={loading}
                                >
                                    <Stop className="w-4 h-4 mr-2" />
                                    Chặn
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Desktop className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Chọn thiết bị để thực hiện thao tác nhanh
                            </p>
                        </div>
                    )}
                </div>
            </AdaptiveCard>
    )
}

export default QuickActions
