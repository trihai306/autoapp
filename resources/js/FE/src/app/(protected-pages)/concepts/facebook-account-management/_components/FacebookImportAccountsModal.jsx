'use client'
import React, { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import importFacebookAccounts from '@/server/actions/facebook-account/importFacebookAccounts'

const FacebookImportAccountsModal = ({ isOpen, onClose, onSuccess }) => {
    const [accountList, setAccountList] = useState('')
    const [format, setFormat] = useState('new')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async () => {
        if (!accountList.trim()) return
        setIsSubmitting(true)
        try {
            const res = await importFacebookAccounts({ accountList, enableRunningStatus: true, format })
            if (res.success) {
                toast.push(<Notification title="Thành công" type="success">{res.message || 'Đã import tài khoản'}</Notification>)
                onSuccess?.()
                onClose()
            } else {
                toast.push(<Notification title="Lỗi" type="danger">{res.message || 'Không thể import'}</Notification>)
            }
        } finally { setIsSubmitting(false) }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={700}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h5 className="font-bold">Nhập tài khoản Facebook</h5></div>
            <div className="p-4 space-y-4">
                <div>
                    <label className="form-label">Danh sách tài khoản</label>
                    <Input textArea rows={8} value={accountList} onChange={(e)=>setAccountList(e.target.value)} placeholder={format==='new' ? 'UID|PASS|2FA|MAIL' : 'username|email|password|phone'} />
                </div>
                <div>
                    <label className="form-label">Định dạng</label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm"><input type="radio" checked={format==='new'} onChange={()=>setFormat('new')} /> UID|PASS|2FA|MAIL</label>
                        <label className="flex items-center gap-2 text-sm"><input type="radio" checked={format==='legacy'} onChange={()=>setFormat('legacy')} /> username|email|password|phone</label>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <Button variant="default" onClick={onClose}>Đóng</Button>
                <Button variant="solid" loading={isSubmitting} disabled={isSubmitting || !accountList.trim()} onClick={onSubmit}>Nhập</Button>
            </div>
        </Dialog>
    )
}

export default FacebookImportAccountsModal


