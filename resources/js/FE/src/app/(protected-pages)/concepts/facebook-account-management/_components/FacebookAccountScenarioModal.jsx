'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { TbSearch, TbPlayerPlay, TbPlayerStop, TbSettings } from 'react-icons/tb'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import getInteractionScenarios from '@/server/actions/interaction-scenario/getInteractionScenarios'
import assignScenarioToAccount from '@/server/actions/facebook-account/assignScenarioToAccount'
import stopAccountScenario from '@/server/actions/facebook-account/stopAccountScenario'

const FacebookAccountScenarioModal = ({ isOpen, onClose, account, onDataChange }) => {
    const router = useRouter()
    const [scenarios, setScenarios] = useState([])
    const [filteredScenarios, setFilteredScenarios] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const [stopping, setStopping] = useState(false)

    // Load scenarios when modal opens
    useEffect(() => {
        if (isOpen) {
            loadScenarios()
        }
    }, [isOpen])

    // Filter scenarios based on search term
    useEffect(() => {
        const filtered = scenarios.filter(scenario =>
            scenario.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredScenarios(filtered)
    }, [scenarios, searchTerm])

    const loadScenarios = async () => {
        setLoading(true)
        try {
            const params = { platform: 'facebook' }
            const result = await getInteractionScenarios(params)
            const list = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
            const sortedScenarios = list.sort((a, b) => {
                const dateA = new Date(a.created_at || a.updated_at || 0)
                const dateB = new Date(b.created_at || b.updated_at || 0)
                return dateB - dateA
            })
            setScenarios(sortedScenarios)
        } catch (error) {
            console.error('Error loading scenarios:', error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi tải danh sách kịch bản
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    const handleAssignScenario = async (scenario) => {
        if (!account?.id) return

        setAssigning(true)
        try {
            const result = await assignScenarioToAccount(account.id, scenario.id)
            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success" closable>
                        Đã gán kịch bản "{scenario.name}" cho tài khoản
                    </Notification>
                )
                onClose()
                // Gọi callback để refresh data từ parent component với delay
                if (onDataChange) {
                    setTimeout(() => {
                        onDataChange()
                    }, 500)
                }
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        {result.message || 'Không thể gán kịch bản'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error assigning scenario:', error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi gán kịch bản
                </Notification>
            )
        } finally {
            setAssigning(false)
        }
    }

    const handleStopScenario = async () => {
        if (!account?.id) return

        setStopping(true)
        try {
            const result = await stopAccountScenario(account.id)
            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success" closable>
                        Đã dừng kịch bản cho tài khoản
                    </Notification>
                )
                onClose()
                // Gọi callback để refresh data từ parent component với delay
                if (onDataChange) {
                    setTimeout(() => {
                        onDataChange()
                    }, 500)
                }
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        {result.message || 'Không thể dừng kịch bản'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error stopping scenario:', error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi dừng kịch bản
                </Notification>
            )
        } finally {
            setStopping(false)
        }
    }

    const currentScenario = account?.running_scenario || account?.current_scenario

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={800}
            className="z-[60]"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h5 className="font-bold">Quản lý kịch bản - {account?.username}</h5>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto">
                    {/* Current scenario */}
                    {currentScenario && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h6 className="font-semibold text-blue-900 dark:text-blue-100">
                                        Kịch bản đang chạy: {currentScenario.name}
                                    </h6>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        Trạng thái: {currentScenario.status === 'running' ? 'Đang chạy' : 'Tạm dừng'}
                                    </p>
                                </div>
                                <Button
                                    variant="solid"
                                    color="red-500"
                                    size="sm"
                                    onClick={handleStopScenario}
                                    disabled={stopping}
                                    icon={<TbPlayerStop />}
                                >
                                    {stopping ? 'Đang dừng...' : 'Dừng kịch bản'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="mb-4">
                        <Input
                            placeholder="Tìm kiếm kịch bản..."
                            suffix={<TbSearch className="text-lg" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Scenarios list */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredScenarios.length > 0 ? (
                            filteredScenarios.map((scenario) => (
                                <div key={scenario.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h6 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {scenario.name}
                                            </h6>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {scenario.description || 'Không có mô tả'}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span>Trạng thái: {scenario.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</span>
                                                <span>Tạo: {new Date(scenario.created_at).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                variant="solid"
                                                color="blue-500"
                                                size="sm"
                                                onClick={() => handleAssignScenario(scenario)}
                                                disabled={assigning || scenario.id === currentScenario?.id}
                                                icon={<TbPlayerPlay />}
                                            >
                                                {assigning ? 'Đang gán...' : 'Gán kịch bản'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'Không tìm thấy kịch bản nào' : 'Chưa có kịch bản nào'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end">
                        <Button type="button" variant="default" onClick={onClose}>
                            Đóng
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default FacebookAccountScenarioModal
