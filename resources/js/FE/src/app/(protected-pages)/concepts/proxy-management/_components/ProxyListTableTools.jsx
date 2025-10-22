'use client'
import ProxyListSearch from './ProxyListSearch'
import ColumnSelector from './ColumnSelector'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useProxyListStore } from '../_store/proxyListStore'
import Button from '@/components/ui/Button'
import { TbTrash, TbX, TbCheck, TbX as TbDeactivate } from 'react-icons/tb'
import Dialog from '@/components/ui/Dialog'
import { useState, useEffect } from 'react'
import deleteProxies from '@/server/actions/proxy/deleteProxies'
import updateProxyStatus from '@/server/actions/proxy/updateProxyStatus'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'

// Component xử lý dialog xóa (luôn được render)
const DeleteDialogHandler = () => {
    const router = useRouter()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [singleProxyToDelete, setSingleProxyToDelete] = useState(null)
    const selectedProxy = useProxyListStore((state) => state.selectedProxy)
    const setSelectAllProxy = useProxyListStore((state) => state.setSelectAllProxy)

    // Lắng nghe sự kiện mở dialog xóa từ xóa đơn lẻ
    useEffect(() => {
        const handleOpenSingleDeleteDialog = (event) => {
            setSingleProxyToDelete(event.detail)
            setShowDeleteConfirmation(true)
        }

        const handleOpenBulkDeleteDialog = () => {
            setSingleProxyToDelete(null)
            setShowDeleteConfirmation(true)
        }

        window.addEventListener('openSingleDeleteDialog', handleOpenSingleDeleteDialog)
        window.addEventListener('openBulkDeleteDialog', handleOpenBulkDeleteDialog)

        return () => {
            window.removeEventListener('openSingleDeleteDialog', handleOpenSingleDeleteDialog)
            window.removeEventListener('openBulkDeleteDialog', handleOpenBulkDeleteDialog)
        }
    }, [])

    const onClearSelection = () => setSelectAllProxy([])

    const handleDeleteConfirm = async () => {
        let proxyIds

        if (singleProxyToDelete) {
            // Xóa đơn lẻ
            proxyIds = [singleProxyToDelete.id]
        } else {
            // Xóa nhiều
            proxyIds = selectedProxy.map((p) => p.id)
        }

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
        setSingleProxyToDelete(null)
    }

    return (
        <Dialog
            isOpen={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onRequestClose={() => setShowDeleteConfirmation(false)}
        >
            <h5 className="mb-4">Xác nhận xóa</h5>
            <p>
                {singleProxyToDelete
                    ? `Bạn có chắc chắn muốn xóa proxy "${singleProxyToDelete.name}" không?`
                    : selectedProxy.length === 1
                        ? `Bạn có chắc chắn muốn xóa proxy "${selectedProxy[0]?.name}" không?`
                        : `Bạn có chắc chắn muốn xóa ${selectedProxy.length} proxy đã chọn?`
                }
            </p>
            <div className="text-right mt-6">
                <Button
                    className="ltr:mr-2 rtl:ml-2"
                    onClick={() => setShowDeleteConfirmation(false)}
                >
                    Hủy
                </Button>
                <Button
                    variant="solid"
                    color="red-600"
                    onClick={handleDeleteConfirm}
                >
                    Xóa
                </Button>
            </div>
        </Dialog>
    )
}

const ProxyListBulkActionTools = () => {
    const router = useRouter()
    const selectedProxy = useProxyListStore((state) => state.selectedProxy)
    const setSelectAllProxy = useProxyListStore((state) => state.setSelectAllProxy)
    const t = { selected: (c) => `Đã chọn ${c} mục`, delete: 'Xóa', activate: 'Kích hoạt', deactivate: 'Vô hiệu hóa', clear: 'Xóa lựa chọn' }

    const onBulkDelete = () => {
        const event = new CustomEvent('openBulkDeleteDialog')
        window.dispatchEvent(event)
    }
    const onClearSelection = () => setSelectAllProxy([])

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
        <div className="flex flex-col items-start md:flex-row md:items-center gap-3">
            <span className="font-semibold leading-9">
                {t.selected(selectedProxy.length)}
            </span>
            <Button
                size="sm"
                variant="solid"
                className="bg-red-500 hover:bg-red-400"
                icon={<TbTrash />}
                onClick={onBulkDelete}
            >
                {t.delete}
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="bg-green-500 hover:bg-green-400"
                icon={<TbCheck />}
                onClick={() => handleStatusUpdate('active')}
            >
                {t.activate}
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="bg-orange-500 hover:bg-orange-400"
                icon={<TbDeactivate />}
                onClick={() => handleStatusUpdate('inactive')}
            >
                {t.deactivate}
            </Button>
            <Button
                size="sm"
                variant="default"
                icon={<TbX />}
                onClick={onClearSelection}
            >
                {t.clear}
            </Button>
        </div>
    )
}

const ProxyListTableTools = ({ columns, selectableColumns, onColumnToggle }) => {
    const { onAppendQueryParams } = useAppendQueryParams()
    const selectedProxy = useProxyListStore((state) => state.selectedProxy)
    const handleInputChange = (query) => onAppendQueryParams({ search: query, page: '1' })

    return (
        <>
            {selectedProxy.length > 0 && <ProxyListBulkActionTools />}
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
            {/* Luôn render DeleteDialogHandler để xử lý dialog xóa */}
            <DeleteDialogHandler />
        </>
    )
}

export default ProxyListTableTools
