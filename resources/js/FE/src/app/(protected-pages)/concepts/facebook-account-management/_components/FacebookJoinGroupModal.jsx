'use client'
import React, { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FormItem from '@/components/ui/Form/FormItem'
import FormContainer from '@/components/ui/Form/FormContainer'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { TbUsers, TbLink, TbTrash, TbPlus, TbSettings } from 'react-icons/tb'
import runFacebookJoinGroup from '@/server/actions/facebook-account/runFacebookJoinGroup'

const FacebookJoinGroupModal = ({ isOpen, onClose, accountId, accountUsername }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [groups, setGroups] = useState([{ link: '', name: '' }])
    const [config, setConfig] = useState({
        maxGroups: 10,
        delayBetweenJoins: 3000,
        randomDelay: true,
        randomDelayMin: 2000,
        randomDelayMax: 5000,
        skipIfMember: true,
        skipIfRequestPending: true,
        retryFailedJoins: true,
        maxRetries: 3,
    })
    const [showAdvanced, setShowAdvanced] = useState(false)

    const handleAddGroup = () => {
        setGroups([...groups, { link: '', name: '' }])
    }

    const handleRemoveGroup = (index) => {
        if (groups.length > 1) {
            setGroups(groups.filter((_, i) => i !== index))
        }
    }

    const handleGroupChange = (index, field, value) => {
        const newGroups = [...groups]
        newGroups[index][field] = value
        setGroups(newGroups)
    }

    const handleConfigChange = (field, value) => {
        setConfig({ ...config, [field]: value })
    }

    // Check if at least one valid group link exists
    const hasValidGroup = () => {
        return groups.some(g => g.link.trim() !== '')
    }

    const validateForm = () => {
        const validGroups = groups.filter(g => g.link.trim() !== '')
        if (validGroups.length === 0) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    Vui lòng nhập ít nhất một link nhóm!
                </Notification>,
                { placement: 'top-center' }
            )
            return false
        }

        // Validate link format (basic check)
        const invalidLinks = validGroups.filter(g => {
            const link = g.link.trim()
            return !link.includes('facebook.com/groups/') && !link.includes('fb.com/groups/')
        })

        if (invalidLinks.length > 0) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    Vui lòng nhập link nhóm Facebook hợp lệ! (VD: https://www.facebook.com/groups/123456789)
                </Notification>,
                { placement: 'top-center' }
            )
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            const validGroups = groups.filter(g => g.link.trim() !== '')
            
            const payload = {
                accountId,
                groups: validGroups.map(g => ({
                    link: g.link.trim(),
                    name: g.name.trim() || 'Unknown Group'
                })),
                config: {
                    ...config,
                    delayBetweenJoins: parseInt(config.delayBetweenJoins),
                    randomDelayMin: parseInt(config.randomDelayMin),
                    randomDelayMax: parseInt(config.randomDelayMax),
                    maxRetries: parseInt(config.maxRetries),
                    maxGroups: parseInt(config.maxGroups),
                }
            }

            const result = await runFacebookJoinGroup(payload)

            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        {result.message || 'Đã gửi yêu cầu tham gia nhóm thành công!'}
                    </Notification>,
                    { placement: 'top-center' }
                )
                onClose()
                // Reset form
                setGroups([{ link: '', name: '' }])
                setConfig({
                    maxGroups: 10,
                    delayBetweenJoins: 3000,
                    randomDelay: true,
                    randomDelayMin: 2000,
                    randomDelayMax: 5000,
                    skipIfMember: true,
                    skipIfRequestPending: true,
                    retryFailedJoins: true,
                    maxRetries: 3,
                })
            } else {
                throw new Error(result.message || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error joining groups:', error)
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {error.message || 'Không thể gửi yêu cầu tham gia nhóm. Vui lòng thử lại!'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} width={800}>
            <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <TbUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Tham gia nhóm Facebook
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tài khoản: <span className="font-medium">{accountUsername}</span>
                    </p>
                </div>
            </div>

            <FormContainer>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {/* Groups Input */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Danh sách nhóm
                            </label>
                            <Button
                                size="sm"
                                variant="solid"
                                icon={<TbPlus />}
                                onClick={handleAddGroup}
                            >
                                Thêm nhóm
                            </Button>
                        </div>

                        {groups.map((group, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <FormItem
                                        label={`Link nhóm ${index + 1}`}
                                        className="mb-2"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="https://www.facebook.com/groups/123456789"
                                            value={group.link}
                                            onChange={(e) => handleGroupChange(index, 'link', e.target.value)}
                                            prefix={<TbLink className="text-gray-400" />}
                                        />
                                    </FormItem>
                                    <FormItem label="Tên nhóm (tùy chọn)">
                                        <Input
                                            type="text"
                                            placeholder="Tên nhóm..."
                                            value={group.name}
                                            onChange={(e) => handleGroupChange(index, 'name', e.target.value)}
                                        />
                                    </FormItem>
                                </div>
                                {groups.length > 1 && (
                                    <Button
                                        size="sm"
                                        variant="plain"
                                        icon={<TbTrash />}
                                        onClick={() => handleRemoveGroup(index)}
                                        className="mt-7 text-red-600 hover:text-red-700"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Advanced Settings */}
                    <div className="border-t pt-4 dark:border-gray-700">
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<TbSettings />}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="mb-3"
                        >
                            {showAdvanced ? 'Ẩn' : 'Hiện'} cài đặt nâng cao
                        </Button>

                        {showAdvanced && (
                            <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem label="Số nhóm tối đa">
                                        <Input
                                            type="number"
                                            value={config.maxGroups}
                                            onChange={(e) => handleConfigChange('maxGroups', e.target.value)}
                                            min={1}
                                            max={100}
                                        />
                                    </FormItem>

                                    <FormItem label="Độ trễ giữa các lần (ms)">
                                        <Input
                                            type="number"
                                            value={config.delayBetweenJoins}
                                            onChange={(e) => handleConfigChange('delayBetweenJoins', e.target.value)}
                                            min={1000}
                                            max={60000}
                                        />
                                    </FormItem>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={config.randomDelay}
                                            onChange={(e) => handleConfigChange('randomDelay', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Độ trễ ngẫu nhiên
                                        </span>
                                    </label>

                                    {config.randomDelay && (
                                        <div className="grid grid-cols-2 gap-4 pl-6">
                                            <FormItem label="Tối thiểu (ms)">
                                                <Input
                                                    type="number"
                                                    value={config.randomDelayMin}
                                                    onChange={(e) => handleConfigChange('randomDelayMin', e.target.value)}
                                                    min={1000}
                                                />
                                            </FormItem>
                                            <FormItem label="Tối đa (ms)">
                                                <Input
                                                    type="number"
                                                    value={config.randomDelayMax}
                                                    onChange={(e) => handleConfigChange('randomDelayMax', e.target.value)}
                                                    min={1000}
                                                />
                                            </FormItem>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={config.skipIfMember}
                                            onChange={(e) => handleConfigChange('skipIfMember', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Bỏ qua nếu đã là thành viên
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={config.skipIfRequestPending}
                                            onChange={(e) => handleConfigChange('skipIfRequestPending', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Bỏ qua nếu đã gửi yêu cầu
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={config.retryFailedJoins}
                                            onChange={(e) => handleConfigChange('retryFailedJoins', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Thử lại khi thất bại
                                        </span>
                                    </label>

                                    {config.retryFailedJoins && (
                                        <div className="pl-6">
                                            <FormItem label="Số lần thử lại">
                                                <Input
                                                    type="number"
                                                    value={config.maxRetries}
                                                    onChange={(e) => handleConfigChange('maxRetries', e.target.value)}
                                                    min={1}
                                                    max={10}
                                                />
                                            </FormItem>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
                    <div className="flex-1">
                        {!hasValidGroup() && !isSubmitting && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                ⚠️ Vui lòng nhập ít nhất một link nhóm
                            </p>
                        )}
                    </div>
                    <Button variant="plain" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button
                        variant="solid"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!hasValidGroup() || isSubmitting}
                        icon={<TbUsers />}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Tham gia nhóm'}
                    </Button>
                </div>
            </FormContainer>
        </Dialog>
    )
}

export default FacebookJoinGroupModal

