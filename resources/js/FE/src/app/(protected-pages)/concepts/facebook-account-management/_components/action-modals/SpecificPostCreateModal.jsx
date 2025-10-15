'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const SpecificPostCreateModal = ({ isOpen, onClose, action, onSave }) => {
    const [form, setForm] = useState({
        destination: 'timeline', // timeline, page, group
        destinationId: '',
        contentTemplate: '',
        media: [],
    })

    const handleSave = () => {
        const config = {
            type: 'specific_post_create',
            name: 'Đăng bài chỉ định',
            parameters: form,
        }
        onSave?.(action, config)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={700}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h5 className="font-bold">Đăng bài chỉ định (Facebook)</h5></div>
            <div className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nơi đăng</label>
                    <select value={form.destination} onChange={(e)=>setForm(p=>({ ...p, destination: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="timeline">Trang cá nhân</option>
                        <option value="page">Fanpage</option>
                        <option value="group">Nhóm</option>
                    </select>
                </div>
                <Input placeholder="ID Fanpage/Nhóm (nếu chọn Fanpage/Nhóm)" value={form.destinationId} onChange={(e)=>setForm(p=>({ ...p, destinationId: e.target.value }))} />
                <Input placeholder="Nội dung bài viết (mỗi dòng một mẫu)" textArea rows={4} value={form.contentTemplate} onChange={(e)=>setForm(p=>({ ...p, contentTemplate: e.target.value }))} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <Button variant="default" onClick={onClose}>Đóng</Button>
                <Button variant="solid" onClick={handleSave}>Lưu</Button>
            </div>
        </Dialog>
    )
}

export default SpecificPostCreateModal
