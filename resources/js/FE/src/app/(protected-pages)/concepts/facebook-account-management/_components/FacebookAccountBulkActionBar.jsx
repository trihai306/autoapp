'use client'
import React, { useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { TbTrash, TbPlayerPlay, TbPlayerStop, TbSettings, TbDeviceMobile } from 'react-icons/tb'
import { apiGetDevices } from '@/services/device/DeviceService'
import getInteractionScenarios from '@/server/actions/interaction-scenario/getInteractionScenarios'
import { withAuthCheck } from '@/utils/withAuthCheck'
import {
    apiBulkDeleteFacebookAccounts,
    apiBulkRunFacebookAccounts,
    apiBulkStopFacebookAccountsScenario,
    apiBulkAssignScenarioToFacebookAccounts,
    apiBulkAssignDeviceToFacebookAccounts,
} from '@/services/facebook-account/FacebookAccountService'

const FacebookAccountBulkActionBar = ({ selected = [], onDone }) => {
    const [confirmOpen, setConfirmOpen] = useState(null) // 'delete' | 'run' | 'stop' | 'assignScenario' | 'assignDevice'
    const [scenarios, setScenarios] = useState([])
    const [devices, setDevices] = useState([])
    const [scenarioId, setScenarioId] = useState('')
    const [deviceId, setDeviceId] = useState('')
    const [loading, setLoading] = useState(false)

    const ids = useMemo(() => selected.map((i) => i.id), [selected])

    const ensureScenarios = async () => {
        if (scenarios.length > 0) return
        try {
            const res = await getInteractionScenarios({ platform: 'facebook' })
            const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])
            setScenarios(list)
        } catch {}
    }

    const ensureDevices = async () => {
        if (devices.length > 0) return
        try {
            // BE đã lọc theo quyền: super-admin/admin thấy tất cả; user thường chỉ thấy thiết bị của họ
            const res = await apiGetDevices({ per_page: 200 })
            const list = res?.data?.data || res?.data || []
            const options = list.map((d) => ({ value: String(d.id ?? d.value ?? d.device_id), label: d.name ?? d.device_name ?? d.label }))
            setDevices(options)
        } catch {}
    }

    const runAction = async (type) => {
        setLoading(true)
        try {
            let result
            if (type === 'delete') {
                result = await apiBulkDeleteFacebookAccounts(ids)
            } else if (type === 'run') {
                if (!scenarioId) throw new Error('Vui lòng chọn kịch bản')
                result = await apiBulkRunFacebookAccounts(ids, Number(scenarioId), deviceId ? Number(deviceId) : null)
            } else if (type === 'stop') {
                result = await apiBulkStopFacebookAccountsScenario(ids)
            } else if (type === 'assignScenario') {
                if (!scenarioId) throw new Error('Vui lòng chọn kịch bản')
                result = await apiBulkAssignScenarioToFacebookAccounts(ids, Number(scenarioId))
            } else if (type === 'assignDevice') {
                if (!deviceId) throw new Error('Vui lòng chọn thiết bị')
                result = await apiBulkAssignDeviceToFacebookAccounts(ids, Number(deviceId))
            }

            const success = result?.success !== false
            toast.push(
                <Notification title={success ? 'Thành công' : 'Lỗi'} type={success ? 'success' : 'danger'}>
                    {result?.message || (success ? 'Thao tác thành công' : 'Thao tác thất bại')}
                </Notification>
            )
            if (success) {
                // Thông báo global cho các provider lắng nghe
                try { window.dispatchEvent(new CustomEvent('facebook:bulk:changed', { detail: { type } })) } catch {}
                onDone?.()
                setConfirmOpen(null)
                setScenarioId('')
                setDeviceId('')
            }
        } catch (e) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {e.message || 'Có lỗi xảy ra'}
                </Notification>
            )

        } finally {
            setLoading(false)
        }
    }

    const openConfirm = async (type) => {
        if (type === 'run' || type === 'assignScenario') await ensureScenarios()
        if (type === 'run' || type === 'assignDevice') await ensureDevices()
        setConfirmOpen(type)
    }

    if (!selected.length) return null

    return (
        <>
            {!confirmOpen && (
                <div className="sticky top-0 z-[55] bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Đã chọn {selected.length} tài khoản
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => openConfirm('delete')}>
                            <TbTrash className="w-4 h-4" /> Xóa
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => openConfirm('run')}>
                            <TbPlayerPlay className="w-4 h-4" /> Chạy tất cả
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => openConfirm('stop')}>
                            <TbPlayerStop className="w-4 h-4" /> Dừng tất cả
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => openConfirm('assignScenario')}>
                            <TbSettings className="w-4 h-4" /> Gán kịch bản
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => openConfirm('assignDevice')}>
                            <TbDeviceMobile className="w-4 h-4" /> Gán thiết bị
                        </Button>
                    </div>
                </div>
            )}

            {/* Confirm/Config Dialog */}
            <Dialog isOpen={Boolean(confirmOpen)} onClose={() => setConfirmOpen(null)} onRequestClose={() => setConfirmOpen(null)} width={560}>
                <div className="p-6 space-y-4">
                    {confirmOpen === 'delete' && (
                        <>
                            <h4 className="font-semibold">Xác nhận xóa {selected.length} tài khoản</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Hành động này không thể hoàn tác.</p>
                        </>
                    )}

                    {confirmOpen === 'stop' && (
                        <>
                            <h4 className="font-semibold">Dừng kịch bản cho {selected.length} tài khoản</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Sẽ dừng kịch bản đang chạy trên các tài khoản đã chọn.</p>
                        </>
                    )}

                    {confirmOpen === 'run' && (
                        <>
                            <h4 className="font-semibold">Chạy kịch bản cho {selected.length} tài khoản</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Chọn kịch bản</label>
                                    <Select
                                        placeholder="Chọn kịch bản"
                                        options={scenarios.map((s) => ({ value: String(s.id), label: s.name }))}
                                        value={scenarioId ? { value: scenarioId, label: scenarios.find(s=>String(s.id)===scenarioId)?.name || 'Đang tải...' } : null}
                                        onChange={(opt) => setScenarioId(opt?.value || '')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Chọn thiết bị (tuỳ chọn)</label>
                                    <Select
                                        placeholder="Chọn thiết bị"
                                        options={[{ value: '', label: '— Không chỉ định —' }, ...devices]}
                                        value={deviceId ? { value: deviceId, label: devices.find(d=>d.value===deviceId)?.label || 'Đang tải...' } : { value: '', label: '— Không chỉ định —' }}
                                        onChange={(opt) => setDeviceId(opt?.value || '')}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {confirmOpen === 'assignScenario' && (
                        <>
                            <h4 className="font-semibold">Gán kịch bản cho {selected.length} tài khoản</h4>
                            <div>
                                <label className="block text-sm font-medium mb-1">Chọn kịch bản</label>
                                <Select
                                    placeholder="Chọn kịch bản"
                                    options={scenarios.map((s) => ({ value: String(s.id), label: s.name }))}
                                    value={scenarioId ? { value: scenarioId, label: scenarios.find(s=>String(s.id)===scenarioId)?.name || 'Đang tải...' } : null}
                                    onChange={(opt) => setScenarioId(opt?.value || '')}
                                />
                            </div>
                        </>
                    )}

                    {confirmOpen === 'assignDevice' && (
                        <>
                            <h4 className="font-semibold">Gán thiết bị cho {selected.length} tài khoản</h4>
                            <div>
                                <label className="block text-sm font-medium mb-1">Chọn thiết bị</label>
                                <Select
                                    placeholder="Chọn thiết bị"
                                    options={devices}
                                    value={deviceId ? { value: deviceId, label: devices.find(d=>d.value===deviceId)?.label || 'Đang tải...' } : null}
                                    onChange={(opt) => setDeviceId(opt?.value || '')}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="default" onClick={() => setConfirmOpen(null)} disabled={loading}>Đóng</Button>
                        {confirmOpen === 'delete' && (
                            <Button variant="solid" className="bg-red-600 hover:bg-red-700" onClick={() => runAction('delete')} loading={loading} disabled={loading}>Xóa</Button>
                        )}
                        {confirmOpen === 'run' && (
                            <Button variant="solid" onClick={() => runAction('run')} loading={loading} disabled={loading || !scenarioId}>Chạy</Button>
                        )}
                        {confirmOpen === 'stop' && (
                            <Button variant="solid" onClick={() => runAction('stop')} loading={loading} disabled={loading}>Dừng</Button>
                        )}
                        {confirmOpen === 'assignScenario' && (
                            <Button variant="solid" onClick={() => runAction('assignScenario')} loading={loading} disabled={loading || !scenarioId}>Gán</Button>
                        )}
                        {confirmOpen === 'assignDevice' && (
                            <Button variant="solid" onClick={() => runAction('assignDevice')} loading={loading} disabled={loading || !deviceId}>Gán</Button>
                        )}
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default FacebookAccountBulkActionBar


