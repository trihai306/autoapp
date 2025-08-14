'use client'

import { useState } from 'react'
import { Dialog, Button, Input } from '@/components/ui'
import { Form, FormItem, FormContainer } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useContentManagementStore } from '../_store/contentManagementStore'
import createContentGroup from '@/server/actions/content/createContentGroup'
import { toast } from 'react-hot-toast'

const schema = z.object({
    name: z.string().min(1, 'Tên nhóm content là bắt buộc'),
})

const CreateContentGroupModal = ({ onSuccess }) => {
    const {
        isCreateGroupModalOpen,
        setCreateGroupModalOpen,
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

    const handleClose = () => {
        setCreateGroupModalOpen(false)
        reset()
    }

    const onSubmit = async (values) => {
        try {
            setIsSubmitting(true)
            const response = await createContentGroup(values)
            
            if (response.success) {
                toast.success(response.message || 'Tạo nhóm content thành công!')
                handleClose()
                onSuccess?.()
            } else {
                toast.error(response.message || 'Không thể tạo nhóm content. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Error creating content group:', error)
            toast.error('Không thể tạo nhóm content. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog
            isOpen={isCreateGroupModalOpen}
            onClose={handleClose}
            width={500}
        >
            <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Tạo nhóm content mới
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
                                {isSubmitting ? 'Đang tạo...' : 'Tạo nhóm'}
                            </Button>
                        </div>
                    </FormContainer>
                </Form>
            </div>
        </Dialog>
    )
}

export default CreateContentGroupModal
