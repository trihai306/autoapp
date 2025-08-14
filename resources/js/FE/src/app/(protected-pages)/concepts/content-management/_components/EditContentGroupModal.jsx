'use client'

import { useState, useEffect } from 'react'
import { Dialog, Button, Input } from '@/components/ui'
import { Form, FormItem, FormContainer } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useContentManagementStore } from '../_store/contentManagementStore'
import updateContentGroup from '@/server/actions/content/updateContentGroup'
import { toast } from 'react-hot-toast'

const schema = z.object({
    name: z.string().min(1, 'Tên nhóm content là bắt buộc'),
})

const EditContentGroupModal = ({ onSuccess }) => {
    const {
        isEditGroupModalOpen,
        editingGroup,
        setEditGroupModalOpen,
    } = useContentManagementStore()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
        },
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        if (editingGroup) {
            reset({
                name: editingGroup.name,
            })
        }
    }, [editingGroup, reset])

    const handleClose = () => {
        setEditGroupModalOpen(false)
        reset()
    }

    const onSubmit = async (values) => {
        if (!editingGroup) return

        try {
            setIsSubmitting(true)
            const response = await updateContentGroup(editingGroup.id, values)
            
            if (response.success) {
                toast.success(response.message || 'Cập nhật nhóm content thành công!')
                handleClose()
                onSuccess?.()
            } else {
                toast.error(response.message || 'Không thể cập nhật nhóm content. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Error updating content group:', error)
            toast.error('Không thể cập nhật nhóm content. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog
            isOpen={isEditGroupModalOpen}
            onClose={handleClose}
            width={500}
        >
            <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Chỉnh sửa nhóm content
                </h4>
                
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormContainer>
                        <FormItem
                            label="Tên nhóm content"
                            invalid={Boolean(errors.name)}
                            errorMessage={errors.name?.message}
                        >
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Nhập tên nhóm content..."
                                        autoFocus
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

export default EditContentGroupModal
