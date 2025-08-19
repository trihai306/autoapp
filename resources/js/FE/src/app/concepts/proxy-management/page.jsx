'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Select, Badge, Modal, Form, message, Table, Space, Tooltip, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ImportOutlined, ExportOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons'
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
                message.error(result.message || 'Failed to load proxies')
            }
        } catch (error) {
            console.error('Error loading proxies:', error)
            message.error('Failed to load proxies')
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
                message.success(result.message)
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
            message.error('Failed to save proxy')
        }
    }

    // Handle delete proxy
    const handleDelete = async (id) => {
        try {
            const result = await deleteProxy(id)
            if (result.success) {
                message.success(result.message)
                loadProxies(pagination.current, pagination.pageSize, filters)
                loadStats()
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error deleting proxy:', error)
            message.error('Failed to delete proxy')
        }
    }

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select proxies to delete')
            return
        }

        try {
            const result = await deleteProxies(selectedRowKeys)
            if (result.success) {
                message.success(result.message)
                setSelectedRowKeys([])
                loadProxies(pagination.current, pagination.pageSize, filters)
                loadStats()
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error bulk deleting proxies:', error)
            message.error('Failed to delete proxies')
        }
    }

    // Handle status update
    const handleStatusUpdate = async (ids, status) => {
        try {
            const result = await updateProxyStatus(ids, status)
            if (result.success) {
                message.success(result.message)
                loadProxies(pagination.current, pagination.pageSize, filters)
                loadStats()
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error updating proxy status:', error)
            message.error('Failed to update proxy status')
        }
    }

    // Handle test connection
    const handleTestConnection = async (id) => {
        try {
            const result = await testProxyConnection(id)
            if (result.success) {
                if (result.data.success) {
                    message.success(`Connection successful! Response time: ${result.data.response_time}`)
                } else {
                    message.error(`Connection failed: ${result.data.message}`)
                }
                loadProxies(pagination.current, pagination.pageSize, filters)
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error testing connection:', error)
            message.error('Failed to test connection')
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
                message.success(result.message)
                setImportModalVisible(false)
                loadProxies(pagination.current, pagination.pageSize, filters)
                loadStats()
            } else {
                message.error(result.message)
            }
        } catch (error) {
            console.error('Error importing proxies:', error)
            message.error('Failed to import proxies')
        }
    }

    // Table columns
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        },
        {
            title: 'Host',
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
                { text: 'Error', value: 'error' },
            ],
            render: (status) => {
                const colors = {
                    active: 'green',
                    inactive: 'orange',
                    error: 'red',
                }
                return <Badge color={colors[status]} text={status.toUpperCase()} />
            },
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            filters: true,
        },
        {
            title: 'Last Used',
            dataIndex: 'last_used_at',
            key: 'last_used_at',
            sorter: true,
            render: (date) => date ? new Date(date).toLocaleDateString() : 'Never',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Test Connection">
                        <Button
                            type="text"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleTestConnection(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingProxy(record)
                                form.setFieldsValue(record)
                                setModalVisible(true)
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure you want to delete this proxy?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Proxy Management</h1>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                            <div className="text-gray-600">Total Proxies</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
                            <div className="text-gray-600">Active</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.inactive || 0}</div>
                            <div className="text-gray-600">Inactive</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.error || 0}</div>
                            <div className="text-gray-600">Error</div>
                        </div>
                    </Card>
                </div>

                {/* Actions Bar */}
                <Card className="mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-4">
                            <Input.Search
                                placeholder="Search proxies..."
                                onSearch={handleSearch}
                                style={{ width: 300 }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => {
                                    setEditingProxy(null)
                                    form.resetFields()
                                    setModalVisible(true)
                                }}
                            >
                                Add Proxy
                            </Button>
                            <Button
                                icon={<ImportOutlined />}
                                onClick={() => setImportModalVisible(true)}
                            >
                                Import
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => loadProxies(pagination.current, pagination.pageSize, filters)}
                            >
                                Refresh
                            </Button>
                            {selectedRowKeys.length > 0 && (
                                <>
                                    <Button
                                        danger
                                        onClick={handleBulkDelete}
                                    >
                                        Delete Selected ({selectedRowKeys.length})
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedRowKeys, 'active')}
                                    >
                                        Activate Selected
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedRowKeys, 'inactive')}
                                    >
                                        Deactivate Selected
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
                title={editingProxy ? 'Edit Proxy' : 'Add New Proxy'}
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
                        label="Name"
                        rules={[{ required: true, message: 'Please enter proxy name' }]}
                    >
                        <Input placeholder="Enter proxy name" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="host"
                            label="Host"
                            rules={[{ required: true, message: 'Please enter host' }]}
                        >
                            <Input placeholder="192.168.1.100" />
                        </Form.Item>

                        <Form.Item
                            name="port"
                            label="Port"
                            rules={[{ required: true, message: 'Please enter port' }]}
                        >
                            <Input type="number" placeholder="8080" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="username" label="Username">
                            <Input placeholder="Username (optional)" />
                        </Form.Item>

                        <Form.Item name="password" label="Password">
                            <Input.Password placeholder="Password (optional)" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="type" label="Type">
                            <Select>
                                <Option value="http">HTTP</Option>
                                <Option value="https">HTTPS</Option>
                                <Option value="socks4">SOCKS4</Option>
                                <Option value="socks5">SOCKS5</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="status" label="Status">
                            <Select>
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                                <Option value="error">Error</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="country" label="Country">
                            <Input placeholder="Country (optional)" />
                        </Form.Item>

                        <Form.Item name="city" label="City">
                            <Input placeholder="City (optional)" />
                        </Form.Item>
                    </div>

                    <Form.Item name="notes" label="Notes">
                        <TextArea rows={3} placeholder="Additional notes (optional)" />
                    </Form.Item>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingProxy ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Import Modal */}
            <Modal
                title="Import Proxies"
                open={importModalVisible}
                onCancel={() => setImportModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form onFinish={handleImport}>
                    <Form.Item
                        name="proxyList"
                        label="Proxy List"
                        rules={[{ required: true, message: 'Please enter proxy list' }]}
                        extra="Format: host:port:username:password (one per line). Username and password are optional."
                    >
                        <TextArea
                            rows={10}
                            placeholder="192.168.1.100:8080:user1:pass1&#10;192.168.1.101:8081:user2:pass2&#10;192.168.1.102:8082"
                        />
                    </Form.Item>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setImportModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Import
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}
