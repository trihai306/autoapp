'use client'

import { useState, useEffect } from 'react'
import { Dialog, Button, Input } from '@/components/ui'
import { Form, FormItem, FormContainer } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useContentManagementStore } from '../_store/contentManagementStore'
import { apiUpdateContent } from '@/services/content/ContentService'
import { apiGetContentsByGroup } from '@/services/content/ContentService'
import { toast } from 'react-hot-toast'

const schema = z.object({
    title: z.string().min(1, 'Tiêu đề content là bắt buộc'),
    content: z.string().min(1, 'Nội dung content là bắt buộc'),
})

const EditContentModal = ({ onSuccess }) => {
    const {
        isEditContentModalOpen,
        editingContent,
        selectedContentGroup,
        setEditContentModalOpen,
        setContents,
        setContentsLoading,
    } = useContentManagementStore()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: '',
            content: '',
        },
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        if (editingContent) {
            const contentValue = typeof editingContent.content === 'string' 
                ? editingContent.content 
                : JSON.stringify(editingContent.content, null, 2)
                
            reset({
                title: editingContent.title,
                content: contentValue,
            })
        }
    }, [editingContent, reset])

    const handleClose = () => {
        setEditContentModalOpen(false)
        reset()
    }

    const onSubmit = async (values) => {
        if (!editingContent) return

        try {
            setIsSubmitting(true)
            const response = await apiUpdateContent(editingContent.id, values)
            
            if (response.data) {
                toast.success('Cập nhật content thành công!')
                handleClose()
                
                // Refresh contents list for selected group
                if (selectedContentGroup) {
                    setContentsLoading(true)
                    const contentsResponse = await apiGetContentsByGroup(selectedContentGroup.id)
                    if (contentsResponse.data) {
                        setContents(contentsResponse.data.data || contentsResponse.data)
                    }
                    setContentsLoading(false)
                }
                
                onSuccess?.()
            }
        } catch (error) {
            console.error('Error updating content:', error)
            toast.error('Không thể cập nhật content. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog
            isOpen={isEditContentModalOpen}
            onClose={handleClose}
            width={600}
        >
            <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Chỉnh sửa content
                </h4>
                {editingContent && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        ID: <span className="font-medium">{editingContent.id}</span>
                    </p>
                )}
                
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormContainer>
                        <FormItem
                            label="Tiêu đề content"
                            invalid={Boolean(errors.title)}
                            errorMessage={errors.title?.message}
                        >
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Nhập tiêu đề content..."
                                        autoFocus
                                    />
                                )}
                            />
                        </FormItem>
                        
                        <FormItem
                            label="Nội dung"
                            invalid={Boolean(errors.content)}
                            errorMessage={errors.content?.message}
                        >
                            <Controller
                                name="content"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Nhập nội dung content..."
                                        textArea
                                        rows={6}
                                    />
                                )}
                            />
                        </FormItem>
                        
                        <div className="flex items-center justify-end space-x-3 mt-6">
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
                                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                            </Button>
                        </div>
                    </FormContainer>
                </Form>
            </div>
        </Dialog>
    )
}

export default EditContentModal
