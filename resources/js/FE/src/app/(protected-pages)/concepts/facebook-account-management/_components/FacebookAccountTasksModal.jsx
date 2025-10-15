'use client'
import React from 'react'
import Dialog from '@/components/ui/Dialog'
import FacebookAccountTasksTable from './FacebookAccountTasksTable'

const FacebookAccountTasksModal = ({ isOpen, onClose, account }) => {
    if (!account) return null

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={1200}>
            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Tasks của tài khoản Facebook: {account.username}
                    </h3>
                </div>

                <FacebookAccountTasksTable
                    accountId={account.id}
                    accountUsername={account.username}
                />
            </div>
        </Dialog>
    )
}

export default FacebookAccountTasksModal
