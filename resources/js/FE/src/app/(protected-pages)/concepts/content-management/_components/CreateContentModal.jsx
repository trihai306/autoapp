'use client'

import { useState } from 'react'
import { Dialog, Button, Input } from '@/components/ui'
import { Form, FormItem, FormContainer } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useContentManagementStore } from '../_store/contentManagementStore'
import createContent from '@/server/actions/content/createContent'
import getContentsByGroup from '@/server/actions/content/getContentsByGroup'
import { toast } from 'react-hot-toast'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineClipboardList } from 'react-icons/hi'

const schema = z.object({
    contents: z.array(z.object({
        content: z.string().min(1, 'Nội dung không được để trống'),
    })).min(1, 'Phải có ít nhất 1 nội dung'),
})

const CreateContentModal = ({ onSuccess }) => {
    const {
        isCreateContentModalOpen,
        setCreateContentModalOpen,
        selectedContentGroup,
        setContents,
        setContentsLoading,
    } = useContentManagementStore()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showBulkInput, setShowBulkInput] = useState(false)
    const [bulkText, setBulkText] = useState('')

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            contents: [{ content: '' }],
        },
        resolver: zodResolver(schema),
    })

    const watchedContents = watch('contents')

    const handleClose = () => {
        setCreateContentModalOpen(false)
        setShowBulkInput(false)
        setBulkText('')
        reset({
            contents: [{ content: '' }]
        })
    }

    const addContentField = () => {
        const currentContents = watchedContents || []
        setValue('contents', [...currentContents, { content: '' }])
    }

    const removeContentField = (index) => {
        const currentContents = watchedContents || []
        if (currentContents.length > 1) {
            setValue('contents', currentContents.filter((_, i) => i !== index))
        }
    }

    // Helper function to generate title from content (first 50 chars)
    const generateTitle = (content) => {
        if (!content) return ''
        return content.length > 50 ? content.substring(0, 50) + '...' : content
    }

    // Function to process bulk text input
    const processBulkText = () => {
        if (!bulkText.trim()) {
            toast.error('Vui lòng nhập nội dung')
            return
        }

        // Split by lines and filter out empty lines
        const lines = bulkText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)

        if (lines.length === 0) {
            toast.error('Không có nội dung hợp lệ')
            return
        }

        // Convert to contents format
        const newContents = lines.map(line => ({ content: line }))
        setValue('contents', newContents)
        
        // Close bulk input and show success
        setShowBulkInput(false)
        setBulkText('')
        toast.success(`Đã tạo ${lines.length} content từ text!`)
    }

    const onSubmit = async (values) => {
        if (!selectedContentGroup) {
            toast.error('Vui lòng chọn nhóm content trước')
            return
        }

        try {
            setIsSubmitting(true)
            
            // Create multiple contents
            const createPromises = values.contents.map(async (contentItem) => {
                const data = {
                    title: generateTitle(contentItem.content),
                    content: contentItem.content,
                    content_group_id: selectedContentGroup.id,
                }
                return await createContent(data)
            })
            
            const responses = await Promise.all(createPromises)
            
            // Check if all requests succeeded
            const successCount = responses.filter(response => response.success).length
            const totalCount = responses.length
            
            if (successCount === totalCount) {
                toast.success(`Tạo thành công ${successCount} content!`)
            } else if (successCount > 0) {
                toast.success(`Tạo thành công ${successCount}/${totalCount} content!`)
            } else {
                toast.error('Không thể tạo content nào. Vui lòng thử lại.')
                return
            }
            
            handleClose()
            
            // Refresh contents list for selected group
            setContentsLoading(true)
            const contentsResponse = await getContentsByGroup(selectedContentGroup.id)
            if (contentsResponse.success && contentsResponse.data) {
                setContents(contentsResponse.data.data || contentsResponse.data)
            }
            setContentsLoading(false)
            
            onSuccess?.()
            
        } catch (error) {
            console.error('Error creating contents:', error)
            toast.error('Không thể tạo content. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog
            isOpen={isCreateContentModalOpen}
            onClose={handleClose}
            width={700}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Tạo content mới
                    </h4>
                    <div className="flex items-center space-x-2">
                        <Button
                            type="button"
                            variant="plain"
                            size="sm"
                            onClick={() => setShowBulkInput(true)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                            <HiOutlineClipboardList className="w-4 h-4" />
                            <span>Bulk Input</span>
                        </Button>
                        <Button
                            type="button"
                            variant="plain"
                            size="sm"
                            onClick={addContentField}
                            className="flex items-center space-x-1 text-primary hover:text-primary-dark"
                        >
                            <HiOutlinePlus className="w-4 h-4" />
                            <span>Thêm content</span>
                        </Button>
                    </div>
                </div>
                
                {selectedContentGroup && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Nhóm: <span className="font-medium">{selectedContentGroup.name}</span>
                    </p>
                )}
                
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormContainer>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {watchedContents?.map((_, index) => (
                                <div key={index} className="relative">
                                    <FormItem
                                        label={`Nội dung ${index + 1}`}
                                        invalid={Boolean(errors.contents?.[index]?.content)}
                                        errorMessage={errors.contents?.[index]?.content?.message}
                                    >
                                        <div className="flex space-x-2">
                                            <div className="flex-1">
                                                <Controller
                                                    name={`contents.${index}.content`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            placeholder="Nhập nội dung content..."
                                                            textArea
                                                            rows={4}
                                                            autoFocus={index === 0}
                                                        />
                                                    )}
                                                />
                                                {watchedContents[index]?.content && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Title sẽ là: "{generateTitle(watchedContents[index].content)}"
                                                    </p>
                                                )}
                                            </div>
                                            {watchedContents.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="plain"
                                                    size="sm"
                                                    onClick={() => removeContentField(index)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </FormItem>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Sẽ tạo {watchedContents?.length || 0} content
                            </p>
                            <div className="flex items-center space-x-3">
                                <Button
                                    type="button"
                                    variant="plain"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="solid"
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                    className="bg-primary hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang tạo...' : `Tạo ${watchedContents?.length || 0} content`}
                                </Button>
                            </div>
                        </div>
                    </FormContainer>
                </Form>
            </div>

            {/* Bulk Input Modal */}
            {showBulkInput && (
                <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Nhập nhiều content cùng lúc
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Mỗi dòng sẽ tạo thành 1 content riêng biệt:
                        </p>
                        <textarea
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            placeholder={`hello\nxin chào\nđang làm gì vậy\nbạn ở đâu thế`}
                            className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                            autoFocus
                        />
                        <div className="flex items-center justify-end space-x-3 mt-4">
                            <Button
                                type="button"
                                variant="plain"
                                onClick={() => {
                                    setShowBulkInput(false)
                                    setBulkText('')
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                variant="solid"
                                onClick={processBulkText}
                                className="bg-primary hover:bg-primary-dark"
                            >
                                Tạo content
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    )
}

export default CreateContentModal
