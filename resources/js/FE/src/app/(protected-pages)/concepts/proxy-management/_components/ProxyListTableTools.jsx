'use client'
import ProxyListSearch from './ProxyListSearch'
import ColumnSelector from './ColumnSelector'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useProxyListStore } from '../_store/proxyListStore'
import Button from '@/components/ui/Button'
import { TbTrash, TbX, TbCheck, TbX as TbDeactivate } from 'react-icons/tb'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react'
import deleteProxies from '@/server/actions/proxy/deleteProxies'
import updateProxyStatus from '@/server/actions/proxy/updateProxyStatus'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const ProxyListBulkActionTools = () => {
    const router = useRouter()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const selectedProxy = useProxyListStore((state) => state.selectedProxy)
    const setSelectAllProxy = useProxyListStore((state) => state.setSelectAllProxy)
    const t = useTranslations('proxy-management')
    const tConfirm = useTranslations('proxy-management')

    const onBulkDelete = () => setShowDeleteConfirmation(true)
    const onClearSelection = () => setSelectAllProxy([])
    
    const handleDeleteConfirm = async () => {
        const proxyIds = selectedProxy.map((p) => p.id)
        const result = await deleteProxies(proxyIds)

        if (result.success) {
            toast.push(
                <Notification title="Success" type="success" closable>
                    {result.message}
                </Notification>
            )
            setSelectAllProxy([])
            router.refresh()
        } else {
            toast.push(
                <Notification title="Error" type="danger" closable>
                    {result.message}
                </Notification>
            )
        }
        setShowDeleteConfirmation(false)
    }

    const handleStatusUpdate = async (status) => {
        const proxyIds = selectedProxy.map((p) => p.id)
        const result = await updateProxyStatus(proxyIds, status)

        if (result.success) {
            toast.push(
                <Notification title="Success" type="success" closable>
                    {result.message}
                </Notification>
            )
            setSelectAllProxy([])
            router.refresh()
        } else {
            toast.push(
                <Notification title="Error" type="danger" closable>
                    {result.message}
                </Notification>
            )
        }
    }

    return (
        <>
            <div className="flex flex-col items-start md:flex-row md:items-center gap-3">
                <span className="font-semibold leading-9">
                    {t('bulkAction.selected', { count: selectedProxy.length })}
                </span>
                <Button
                    size="sm"
                    variant="solid"
                    className="bg-red-500 hover:bg-red-400"
                    icon={<TbTrash />}
                    onClick={onBulkDelete}
                >
                    {t('bulkAction.delete')}
                </Button>
                <Button
                    size="sm"
                    variant="solid"
                    className="bg-green-500 hover:bg-green-400"
                    icon={<TbCheck />}
                    onClick={() => handleStatusUpdate('active')}
                >
                    {t('bulkAction.activate')}
                </Button>
                <Button
                    size="sm"
                    variant="solid"
                    className="bg-orange-500 hover:bg-orange-400"
                    icon={<TbDeactivate />}
                    onClick={() => handleStatusUpdate('inactive')}
                >
                    {t('bulkAction.deactivate')}
                </Button>
                <Button
                    size="sm"
                    variant="default"
                    icon={<TbX />}
                    onClick={onClearSelection}
                >
                    {t('bulkAction.clear')}
                </Button>
            </div>
            <Dialog
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onRequestClose={() => setShowDeleteConfirmation(false)}
            >
                <h5 className="mb-4">{tConfirm('bulkDeleteConfirm.title')}</h5>
                <p>
                    {tConfirm('bulkDeleteConfirm.content', { count: selectedProxy.length })}
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        onClick={() => setShowDeleteConfirmation(false)}
                    >
                        {tConfirm('bulkDeleteConfirm.cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        color="red-600"
                        onClick={handleDeleteConfirm}
                    >
                        {tConfirm('bulkDeleteConfirm.delete')}
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

const ProxyListTableTools = ({ columns, selectableColumns, onColumnToggle }) => {
    const { onAppendQueryParams } = useAppendQueryParams()
    const selectedProxy = useProxyListStore((state) => state.selectedProxy)
    const handleInputChange = (query) => onAppendQueryParams({ search: query, page: '1' })

    if (selectedProxy.length > 0) {
        return <ProxyListBulkActionTools />
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <ProxyListSearch onInputChange={handleInputChange} />
            <div className="flex items-center gap-2">
                <ColumnSelector
                    columns={columns}
                    selectableColumns={selectableColumns}
                    onColumnToggle={onColumnToggle}
                />
            </div>
        </div>
    )
}

export default ProxyListTableTools
