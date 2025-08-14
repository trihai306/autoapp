'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FollowBackModal } from './index'

const FollowBackModalExample = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    // Mock action data
    const mockAction = {
        id: 'follow_back',
        name: 'Theo dõi lại',
        type: 'follow_interaction'
    }

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const handleSaveConfig = (action, config) => {
        // // console.log('Saved config:', { action, config })
        
        // Ví dụ config sẽ có dạng:
        // {
        //     actionName: "Theo dõi lại",
        //     userCount: { min: 1, max: 1 },
        //     interval: { min: 3, max: 5 }
        // }
        
        setIsModalOpen(false)
        
        // Ở đây bạn có thể gửi config lên server hoặc lưu vào state
        alert('Đã lưu cấu hình theo dõi lại!')
    }

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">
                Demo FollowBackModal
            </h3>
            
            <Button
                onClick={handleOpenModal}
                variant="solid"
                color="blue-500"
            >
                Mở Modal Theo dõi lại
            </Button>

            <FollowBackModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                action={mockAction}
                onSave={handleSaveConfig}
            />
        </div>
    )
}

export default FollowBackModalExample
