'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Select, Badge, Modal, Form, message, Table, Space, Tooltip, Popconfirm } from 'antd'
import { 
    PiPlusDuotone, 
    PiPencilSimpleLineDuotone, 
    PiTrashDuotone, 
    PiArrowClockwiseDuotone, 
    PiUploadDuotone, 
    PiDownloadDuotone, 
    PiEyeDuotone, 
    PiPlayCircleDuotone 
} from 'react-icons/pi'
import { useTranslations } from 'next-intl'
import getProxies from '@/server/actions/proxy/getProxies'
import createProxy from '@/server/actions/proxy/createProxy'
import updateProxy from '@/server/actions/proxy/updateProxy'
import deleteProxy from '@/server/actions/proxy/deleteProxy'
import deleteProxies from '@/server/actions/proxy/deleteProxies'
import updateProxyStatus from '@/server/actions/proxy/updateProxyStatus'
import testProxyConnection from '@/server/actions/proxy/testProxyConnection'
import getProxyStats from '@/server/actions/proxy/getProxyStats'
import importProxies from '@/server/actions/proxy/importProxies'

const { Option } = Select
const { TextArea } = Input

export default function ProxyManagementPage() {
    const t = useTranslations('proxy-management')
    const [proxies, setProxies] = useState([])
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({})
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    })
    const [filters, setFilters] = useState({})
    const [modalVisible, setModalVisible] = useState(false)
    const [editingProxy, setEditingProxy] = useState(null)
    const [importModalVisible, setImportModalVisible] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [form] = Form.useForm()

    // Load proxies
    const loadProxies = async (page = 1, pageSize = 10, searchFilters = {}) => {
        setLoading(true)
        try {
            const params = {
                page,
                per_page: pageSize,
                ...searchFilters,
            }
            
            const result = await getProxies(params)
            
            if (result.success) {
                setProxies(result.data || [])
                setPagination({
                    current: page,
                    pageSize,
                    total: result.total || 0,
                })
            } else {
                message.error(result.message || t('messages.error'))
            }
        } catch (error) {
            console.error('Error loading proxies:', error)
            message.error(t('messages.error'))
        } finally {
            setLoading(false)
        }
    }

    // Load statistics
    const loadStats = async () => {
        try {
            const result = await getProxyStats()
            if (result.success) {
                setStats(result.data || {})
            }
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    useEffect(() => {
        loadProxies()
        loadStats()
    }, [])

    // Handle table change
    const handleTableChange = (pagination, filters, sorter) => {
        const searchFilters = {}
        
        // Convert filters to API format
        Object.keys(filters).forEach(key => {
            if (filters[key] && filters[key].length > 0) {
                searchFilters[`filter[${key}]`] = filters[key][0]
            }
        })

        // Add sorter
        if (sorter.field) {
            searchFilters.sort = sorter.order === 'descend' ? `-${sorter.field}` : sorter.field
        }

        setFilters(searchFilters)
        loadProxies(pagination.current, pagination.pageSize, searchFilters)
    }

    // Handle search
    const handleSearch = (value) => {
        const searchFilters = { ...filters, search: value }
        setFilters(searchFilters)
        loadProxies(1, pagination.pageSize, searchFilters)
    }

    // Handle create/edit proxy
    const handleSubmit = async (values) => {
        try {
            let result
            if (editingProxy) {
                result = await updateProxy(editingProxy.id, values)
            } else {
                result = await createProxy(values)
            }

            if (result.success) {
                message.success(editingProxy ? t('messages.updated') : t('messages.created'))
                setModalVisible(false)
                setEditingProxy(null)
                form.resetFields()
                loadProxies(pagination.current, pagination.pageSize, filters)
                loadStats()
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error saving proxy:', error)
            message.error(t('messages.error'))
        }
    }

    // Handle delete proxy
    const handleDelete = async (id) => {
        try {
            const result = await deleteProxy(id)
            if (result.success) {
                message.success(t('messages.deleted'))
                loadProxies(pagination.current, pagination.pageSize, filters)
                loadStats()
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error deleting proxy:', error)
            message.error(t('messages.error'))
        }
    }

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning(t('messages.error'))
            return
        }

        try {
            const result = await deleteProxies(selectedRowKeys)
            if (result.success) {
                message.success(t('messages.bulkDeleted', { count: selectedRowKeys.length }))
                setSelectedRowKeys([])
                loadProxies(pagination.current, pagination.pageSize, filters)
                loadStats()
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error bulk deleting proxies:', error)
            message.error(t('messages.error'))
        }
    }

    // Handle status update
    const handleStatusUpdate = async (ids, status) => {
        try {
            const result = await updateProxyStatus(ids, status)
            if (result.success) {
                message.success(t('messages.statusUpdated'))
                loadProxies(pagination.current, pagination.pageSize, filters)
                loadStats()
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error updating proxy status:', error)
            message.error(t('messages.error'))
        }
    }

    // Handle test connection
    const handleTestConnection = async (id) => {
        try {
            const result = await testProxyConnection(id)
            if (result.success) {
                if (result.data.success) {
                    message.success(t('test.success'))
                } else {
                    message.error(t('test.error'))
                }
                loadProxies(pagination.current, pagination.pageSize, filters)
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error testing connection:', error)
            message.error(t('test.error'))
        }
    }

    // Handle import proxies
    const handleImport = async (values) => {
        try {
            const proxyList = values.proxyList.split('\n').filter(line => line.trim()).map(line => {
                const parts = line.split(':')
                return {
                    host: parts[0]?.trim(),
                    port: parseInt(parts[1]?.trim()) || 8080,
                    username: parts[2]?.trim() || null,
                    password: parts[3]?.trim() || null,
                    type: 'http',
                    status: 'active',
                }
            })

            const result = await importProxies({ proxies: proxyList })
            if (result.success) {
                message.success(t('import.success', { count: result.data?.length || 0 }))
                setImportModalVisible(false)
                loadProxies(pagination.current, pagination.pageSize, filters)
                loadStats()
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error importing proxies:', error)
            message.error(t('import.error'))
        }
    }

    // Table columns
    const columns = [
        {
            title: t('table.name'),
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        },
        {
            title: t('table.host'),
            dataIndex: 'host',
            key: 'host',
            render: (host, record) => (
                <div>
                    <div>{host}:{record.port}</div>
                    <small style={{ color: '#666' }}>{record.type.toUpperCase()}</small>
                </div>
            ),
        },
        {
            title: t('table.status'),
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: t('status.active'), value: 'active' },
                { text: t('status.inactive'), value: 'inactive' },
                { text: t('status.error'), value: 'error' },
            ],
            render: (status) => {
                const colors = {
                    active: 'green',
                    inactive: 'orange',
                    error: 'red',
                }
                return <Badge color={colors[status]} text={t(`status.${status}`)} />
            },
        },
        {
            title: t('table.country'),
            dataIndex: 'country',
            key: 'country',
            filters: true,
        },
        {
            title: t('table.lastUsed'),
            dataIndex: 'last_used_at',
            key: 'last_used_at',
            sorter: true,
            render: (date) => date ? new Date(date).toLocaleDateString() : 'Never',
        },
        {
            title: t('table.actions'),
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title={t('test.title')}>
                        <Button
                            type="text"
                            icon={<PiPlayCircleDuotone />}
                            onClick={() => handleTestConnection(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title={t('form.update')}>
                        <Button
                            type="text"
                            icon={<PiPencilSimpleLineDuotone />}
                            onClick={() => {
                                setEditingProxy(record)
                                form.setFieldsValue(record)
                                setModalVisible(true)
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title={t('deleteConfirm.singleContent')}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t('deleteConfirm.delete')}
                        cancelText={t('deleteConfirm.cancel')}
                    >
                        <Tooltip title={t('deleteConfirm.delete')}>
                            <Button type="text" danger icon={<PiTrashDuotone />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                            <div className="text-gray-600">{t('stats.total')}</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
                            <div className="text-gray-600">{t('stats.active')}</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.inactive || 0}</div>
                            <div className="text-gray-600">{t('stats.inactive')}</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.error || 0}</div>
                            <div className="text-gray-600">{t('stats.error')}</div>
                        </div>
                    </Card>
                </div>

                {/* Actions Bar */}
                <Card className="mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-4">
                            <Input.Search
                                placeholder={t('quickSearch')}
                                onSearch={handleSearch}
                                style={{ width: 300 }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                icon={<PiPlusDuotone />}
                                type="primary"
                                onClick={() => {
                                    setEditingProxy(null)
                                    form.resetFields()
                                    setModalVisible(true)
                                }}
                            >
                                {t('addNew')}
                            </Button>
                            <Button
                                icon={<PiUploadDuotone />}
                                onClick={() => setImportModalVisible(true)}
                            >
                                {t('import')}
                            </Button>
                            <Button
                                icon={<PiArrowClockwiseDuotone />}
                                onClick={() => loadProxies(pagination.current, pagination.pageSize, filters)}
                            >
                                {t('refresh')}
                            </Button>
                            {selectedRowKeys.length > 0 && (
                                <>
                                    <Button
                                        danger
                                        onClick={handleBulkDelete}
                                    >
                                        {t('bulkAction.delete')} ({selectedRowKeys.length})
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedRowKeys, 'active')}
                                    >
                                        {t('bulkAction.activate')}
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedRowKeys, 'inactive')}
                                    >
                                        {t('bulkAction.deactivate')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Proxies Table */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={proxies}
                        rowKey="id"
                        loading={loading}
                        pagination={pagination}
                        onChange={handleTableChange}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: setSelectedRowKeys,
                        }}
                    />
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                title={editingProxy ? t('form.update') : t('addNew')}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    setEditingProxy(null)
                    form.resetFields()
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        type: 'http',
                        status: 'active',
                    }}
                >
                    <Form.Item
                        name="name"
                        label={t('form.name')}
                        rules={[{ required: true, message: t('validation.nameRequired') }]}
                    >
                        <Input placeholder={t('form.namePlaceholder')} />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="host"
                            label={t('form.host')}
                            rules={[{ required: true, message: t('validation.hostRequired') }]}
                        >
                            <Input placeholder={t('form.hostPlaceholder')} />
                        </Form.Item>

                        <Form.Item
                            name="port"
                            label={t('form.port')}
                            rules={[{ required: true, message: t('validation.portRequired') }]}
                        >
                            <Input type="number" placeholder={t('form.portPlaceholder')} />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="username" label={t('form.username')}>
                            <Input placeholder={t('form.usernamePlaceholder')} />
                        </Form.Item>

                        <Form.Item name="password" label={t('form.password')}>
                            <Input.Password placeholder={t('form.passwordPlaceholder')} />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="type" label={t('form.type')}>
                            <Select placeholder={t('form.selectType')}>
                                <Option value="http">{t('type.http')}</Option>
                                <Option value="https">{t('type.https')}</Option>
                                <Option value="socks4">{t('type.socks4')}</Option>
                                <Option value="socks5">{t('type.socks5')}</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="status" label={t('form.status')}>
                            <Select placeholder={t('form.selectStatus')}>
                                <Option value="active">{t('status.active')}</Option>
                                <Option value="inactive">{t('status.inactive')}</Option>
                                <Option value="error">{t('status.error')}</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="country" label={t('form.country')}>
                            <Input placeholder={t('form.countryPlaceholder')} />
                        </Form.Item>

                        <Form.Item name="city" label={t('form.city')}>
                            <Input placeholder={t('form.cityPlaceholder')} />
                        </Form.Item>
                    </div>

                    <Form.Item name="notes" label={t('form.notes')}>
                        <TextArea rows={3} placeholder={t('form.notesPlaceholder')} />
                    </Form.Item>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setModalVisible(false)}>
                            {t('form.cancel')}
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingProxy ? t('form.update') : t('form.save')}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Import Modal */}
            <Modal
                title={t('import.title')}
                open={importModalVisible}
                onCancel={() => setImportModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form onFinish={handleImport}>
                    <Form.Item
                        name="proxyList"
                        label={t('import.title')}
                        rules={[{ required: true, message: t('import.error') }]}
                        extra={t('import.description')}
                    >
                        <TextArea
                            rows={10}
                            placeholder={t('import.placeholder')}
                        />
                    </Form.Item>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setImportModalVisible(false)}>
                            {t('import.cancel')}
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {t('import.import')}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}
