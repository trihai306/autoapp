'use client'
import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { TbSearch, TbPlus, TbEdit, TbTrash } from 'react-icons/tb'

import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import FacebookActionListModal from './FacebookActionListModal'
import NewsfeedInteractionModal from './action-modals/NewsfeedInteractionModal'
import SpecificPostInteractionModal from './action-modals/SpecificPostInteractionModal'
import GroupInteractionModal from './action-modals/GroupInteractionModal'
import GroupPostCreateModal from './action-modals/GroupPostCreateModal'
import SpecificPostCreateModal from './action-modals/SpecificPostCreateModal'
import PostToTimelineModal from './action-modals/PostToTimelineModal'
import getInteractionScenarios from '@/server/actions/interaction-scenario/getInteractionScenarios'
import createInteractionScenario from '@/server/actions/interaction-scenario/createInteractionScenario'
import updateInteractionScenario from '@/server/actions/interaction-scenario/updateInteractionScenario'
import deleteInteractionScenario from '@/server/actions/interaction-scenario/deleteInteractionScenario'
import getInteractionScenario from '@/server/actions/interaction-scenario/getInteractionScenario'
import createScenarioScript from '@/server/actions/scenario-script/createScenarioScript'
import updateScenarioScript from '@/server/actions/scenario-script/updateScenarioScript'
import deleteScenarioScript from '@/server/actions/scenario-script/deleteScenarioScript'
import getContentGroups from '@/server/actions/content/getContentGroups'
import getContentsByGroup from '@/server/actions/content/getContentsByGroup'
import {
    ActionConfigModal,
    VideoInteractionModal,
    SpecificVideoInteractionModal,
    KeywordVideoInteractionModal,
    UserVideoInteractionModal,
    RandomLiveInteractionModal,
    SpecificLiveInteractionModal,
    FollowUserModal,
    CreatePostModal,
    UpdateAvatarModal,
    ChangeNameModal,
    NotificationModal,
    ChangeBioModal,
    FollowUserListModal,
    FollowBackModal,
    FriendVideoInteractionModal
} from '@/app/(protected-pages)/concepts/tiktok-account-management/_components/action-modals'

import { useTranslations } from 'next-intl'

const FacebookInteractionConfigModal = ({ isOpen, onClose, accountId }) => {
    const t = useTranslations('tiktokAccountManagement.interactionConfigModal')

    // State management
    const [scenarios, setScenarios] = useState([])
    const [selectedScenario, setSelectedScenario] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [actions, setActions] = useState([])
    const [filteredScenarios, setFilteredScenarios] = useState([])
    const [loading, setLoading] = useState(false)
    const [scenarioLoading, setScenarioLoading] = useState(false)

    // Content groups state
    const [contentGroups, setContentGroups] = useState([])

    // Modal states
    const [showScenarioModal, setShowScenarioModal] = useState(false)
    const [showActionModal, setShowActionModal] = useState(false)
    const [showActionListModal, setShowActionListModal] = useState(false)
    const [showActionConfigModal, setShowActionConfigModal] = useState(false)
    const [showFbNewsfeedModal, setShowFbNewsfeedModal] = useState(false)
    const [showFbSpecificPostInteractionModal, setShowFbSpecificPostInteractionModal] = useState(false)
    const [showFbGroupInteractionModal, setShowFbGroupInteractionModal] = useState(false)
    const [showFbGroupPostCreateModal, setShowFbGroupPostCreateModal] = useState(false)
    const [showFbSpecificPostCreateModal, setShowFbSpecificPostCreateModal] = useState(false)
    const [showFbPostToTimelineModal, setShowFbPostToTimelineModal] = useState(false)
    const [showFollowUserModal, setShowFollowUserModal] = useState(false)
    const [showFollowUserListModal, setShowFollowUserListModal] = useState(false)
    const [showFollowBackModal, setShowFollowBackModal] = useState(false)
    const [showCreatePostModal, setShowCreatePostModal] = useState(false)
    const [showUpdateAvatarModal, setShowUpdateAvatarModal] = useState(false)
    const [showChangeNameModal, setShowChangeNameModal] = useState(false)
    const [showChangeBioModal, setShowChangeBioModal] = useState(false)
    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const [showFriendVideoInteractionModal, setShowFriendVideoInteractionModal] = useState(false)
    const [showDeleteScenarioDialog, setShowDeleteScenarioDialog] = useState(false)
    const [showDeleteActionDialog, setShowDeleteActionDialog] = useState(false)
    const [preventActionListClose, setPreventActionListClose] = useState(false)
    const [editingScenario, setEditingScenario] = useState(null)
    const [editingAction, setEditingAction] = useState(null)
    const [configuringAction, setConfiguringAction] = useState(null)
    const [deletingScenario, setDeletingScenario] = useState(null)
    const [deletingAction, setDeletingAction] = useState(null)

    // Form states
    const [scenarioForm, setScenarioForm] = useState({ name: '', description: '', status: 'active' })
    const [actionForm, setActionForm] = useState({ name: '', scenarioId: null })

    // Load scenarios when modal opens
    useEffect(() => {
        if (isOpen) {
            loadScenarios()
        }
    }, [isOpen])

    // Filter scenarios based on search term
    useEffect(() => {
        const filtered = scenarios.filter(scenario =>
            scenario.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredScenarios(filtered)
    }, [scenarios, searchTerm])

    // Load scenarios from API
    const loadScenarios = async () => {
        setLoading(true)
        try {
            const params = { platform: 'facebook' }
            console.log('🔎 [Facebook] GET interaction-scenarios params =', params)
            const result = await getInteractionScenarios(params)
            console.log('✅ [Facebook] GET interaction-scenarios result =', result)
            const list = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
            // Sắp xếp mới nhất (fallback nếu BE chưa sort)
            const sortedScenarios = list.sort((a, b) => {
                const dateA = new Date(a.created_at || a.updated_at || 0)
                const dateB = new Date(b.created_at || b.updated_at || 0)
                return dateB - dateA
            })
            setScenarios(sortedScenarios)
            if (sortedScenarios.length > 0 && !selectedScenario) {
                const firstScenario = sortedScenarios[0]
                setSelectedScenario(firstScenario)
                if (firstScenario.id) {
                    loadScenarioDetails(firstScenario.id)
                }
            }
        } catch (error) {
            console.error('❌ [Facebook] GET interaction-scenarios error =', error?.response?.data || error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi tải danh sách kịch bản
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    // Content groups callback functions
    const handleFetchContentGroups = async (params = {}) => {
        try {
            const result = await getContentGroups(params)
            if (result.success) {
                return result
            } else {
                console.error('Failed to fetch content groups:', result.message)
                return { success: false, message: result.message }
            }
        } catch (error) {
            console.error('Error fetching content groups:', error)
            return { success: false, message: 'Error fetching content groups' }
        }
    }

    const handleFetchContentGroupsLegacy = async () => {
        try {
            const result = await getContentGroups()
            if (result.success) {
                const groups = result.data?.data || []
                const formattedGroups = [
                    { value: '', label: '-- Chọn nhóm nội dung --' },
                    ...groups.map(group => ({
                        value: group.id.toString(),
                        label: group.name
                    }))
                ]
                setContentGroups(formattedGroups)
            }
        } catch (error) {
            console.error('Error fetching content groups:', error)
        }
    }

    const handleFetchContentsByGroup = async (groupId) => {
        try {
            const result = await getContentsByGroup(groupId)
            if (result.success) {
                return result.data?.data || []
            }
            return []
        } catch (error) {
            console.error('Error fetching contents by group:', error)
            return []
        }
    }

    // Load scenario details with scripts
    const loadScenarioDetails = async (scenarioId) => {
        setScenarioLoading(true)
        try {
            const result = await getInteractionScenario(scenarioId).data
            // result là model scenario, không có success
            setActions(Array.isArray(result?.scripts) ? result.scripts : [])
        } catch (error) {
            console.error('❌ [Facebook] GET interaction-scenarios/:id error =', error?.response?.data || error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi tải chi tiết kịch bản
                </Notification>
            )
        } finally {
            setScenarioLoading(false)
        }
    }

    const handleScenarioSelect = (scenario) => {
        setSelectedScenario(scenario)
        if (scenario?.id) {
            loadScenarioDetails(scenario.id)
        }
    }

    const getScenarioActions = (scenarioId) => {
        return actions.filter(action => action.scenario_id === scenarioId || action.scenarioId === scenarioId)
    }

    const currentActions = selectedScenario ? actions : []

    const getActionDisplayName = (action) => {
        try {
            if (action.script) {
                const scriptData = JSON.parse(action.script)
                return scriptData.name || scriptData.parameters?.name || action.name || action.action_name
            }
        } catch (error) {
            console.warn('Failed to parse script for action:', action.id, error)
        }
        return action.name || action.action_name
    }

    // Scenario CRUD
    const handleAddScenario = () => {
        setEditingScenario(null)
        setScenarioForm({ name: '', description: '', status: 'active' })
        setShowScenarioModal(true)
    }

    const handleEditScenario = (scenario) => {
        setEditingScenario(scenario)
        setScenarioForm({
            name: scenario.name,
            description: scenario.description || '',
            status: scenario.status
        })
        setShowScenarioModal(true)
    }

    const handleDeleteScenario = (scenario) => {
        setDeletingScenario(scenario)
        setShowDeleteScenarioDialog(true)
    }

    const confirmDeleteScenario = async () => {
        if (!deletingScenario) return
        setLoading(true)
        try {
            const result = await deleteInteractionScenario(deletingScenario.id)
            if (result.success) {
                setScenarios(prev => prev.filter(s => s.id !== deletingScenario.id))
                setActions(prev => prev.filter(a => a.scenario_id !== deletingScenario.id))
                if (selectedScenario?.id === deletingScenario.id) {
                    const remainingScenarios = scenarios.filter(s => s.id !== deletingScenario.id)
                    const newSelected = remainingScenarios[0] || null
                    setSelectedScenario(newSelected)
                    if (newSelected?.id) {
                        loadScenarioDetails(newSelected.id)
                    }
                }
                toast.push(
                    <Notification title="Thành công" type="success" closable>
                        {t('toast.scenarioDeleted')}
                    </Notification>
                )
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        {result.message || 'Không thể xóa kịch bản'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error deleting scenario:', error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi xóa kịch bản
                </Notification>
            )
        } finally {
            setLoading(false)
            setShowDeleteScenarioDialog(false)
            setDeletingScenario(null)
        }
    }

    const handleSaveScenario = async () => {
        if (!scenarioForm.name.trim()) {
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    {t('toast.nameRequired')}
                </Notification>
            )
            return
        }
        setLoading(true)
        try {
            if (editingScenario) {
                const result = await updateInteractionScenario(editingScenario.id, {
                    name: scenarioForm.name,
                    description: scenarioForm.description,
                    status: scenarioForm.status
                })
                if (result.success) {
                    setScenarios(prev => prev.map(s =>
                        s.id === editingScenario.id
                            ? { ...s, name: scenarioForm.name, description: scenarioForm.description, status: scenarioForm.status }
                            : s
                    ))
                    if (selectedScenario?.id === editingScenario.id) {
                        setSelectedScenario(prev => ({ ...prev, name: scenarioForm.name, description: scenarioForm.description, status: scenarioForm.status }))
                    }
                    toast.push(
                        <Notification title="Thành công" type="success" closable>
                            {t('toast.scenarioUpdated')}
                        </Notification>
                    )
                } else {
                    toast.push(
                        <Notification title="Lỗi" type="danger" closable>
                            {result.message || 'Không thể cập nhật kịch bản'}
                        </Notification>
                    )
                    return
                }
            } else {
                const result = await createInteractionScenario({
                    name: scenarioForm.name,
                    description: scenarioForm.description || null,
                    status: scenarioForm.status || 'active',
                    shuffle_actions: false,
                    run_count: false,
                    platform: 'facebook'
                })
                if (result.success) {
                    // Reload scenarios to get the new one
                    console.log('✅ [Facebook] POST interaction-scenarios ok =', result)
                    await loadScenarios()

                    // Auto-select the newly created scenario (should be first in the list)
                    if (result.data && result.data.id) {
                        const newScenario = result.data
                        console.log('ℹ️ [Facebook] New scenario created =', newScenario)
                        setSelectedScenario(newScenario)
                        // Load details for the new scenario
                        if (newScenario.id) {
                            loadScenarioDetails(newScenario.id)
                        }
                    }

                    toast.push(
                        <Notification title="Thành công" type="success" closable>
                            {t('toast.scenarioAdded')}
                        </Notification>
                    )
                } else {
                    console.error('❌ [Facebook] POST interaction-scenarios error =', result)
                    toast.push(
                        <Notification title="Lỗi" type="danger" closable>
                            {result.message || "Không thể tạo kịch bản"}
                            {result.errors && (
                                <div className="mt-2 text-sm">
                                    {Object.entries(result.errors).map(([field, messages]) => (
                                        <div key={field}>
                                            <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Notification>
                    )
                    return
                }
            }

            setShowScenarioModal(false)
            setEditingScenario(null)
        } catch (error) {
            console.error('❌ [Facebook] save scenario exception =', error?.response?.data || error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi lưu kịch bản
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    // Actions
    const handleAddAction = () => {
        if (!selectedScenario) {
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    {t('toast.selectScenarioFirst')}
                </Notification>
            )
            return
        }
        setShowActionListModal(true)
    }

    const handleSelectActionFromList = (actionData, scenario) => {
        const newAction = {
            id: Math.max(...actions.map(a => a.id), 0) + 1,
            name: actionData.name,
            scenarioId: scenario.id,
            actionId: actionData.id,
            isNew: true
        }
        setConfiguringAction(newAction)

        if (actionData.id === 'newsfeed_interaction') setShowFbNewsfeedModal(true)
        else if (actionData.id === 'specific_post_interaction') setShowFbSpecificPostInteractionModal(true)
        else if (actionData.id === 'group_interaction') setShowFbGroupInteractionModal(true)
        else if (actionData.id === 'group_post_create') setShowFbGroupPostCreateModal(true)
        else if (actionData.id === 'post_to_timeline') setShowFbPostToTimelineModal(true)
        else if (actionData.id === 'specific_post_create') setShowFbSpecificPostCreateModal(true)
        else setShowActionConfigModal(true)
    }

    const handleEditAction = (action) => {
        setConfiguringAction(action)
        let actionType = null
        try {
            if (action.script) {
                const scriptData = JSON.parse(action.script)
                actionType = scriptData.type
            }
        } catch (error) {
            console.warn('Failed to parse script for action:', action.id, error)
        }

        if (actionType === 'newsfeed_interaction') setShowFbNewsfeedModal(true)
        else if (actionType === 'specific_post_interaction') setShowFbSpecificPostInteractionModal(true)
        else if (actionType === 'group_interaction') setShowFbGroupInteractionModal(true)
        else if (actionType === 'group_post_create') setShowFbGroupPostCreateModal(true)
        else if (actionType === 'post_to_timeline') setShowFbPostToTimelineModal(true)
        else if (actionType === 'specific_post_create') setShowFbSpecificPostCreateModal(true)
        else setShowActionConfigModal(true)
    }

    const saveActionConfig = async (action, config, modalSetter) => {
        setLoading(true)
        try {
            if (action.isNew) {
                const scriptData = {
                    scenario_id: selectedScenario.id,
                    order: actions.length + 1,
                    script: JSON.stringify(config)
                }
                const result = await createScenarioScript(scriptData)
                if (result.success) {
                    await loadScenarioDetails(selectedScenario.id)
                    toast.push(
                        <Notification title="Thành công" type="success" closable>
                            {t('toast.actionAdded')}
                        </Notification>
                    )
                } else {
                    toast.push(
                        <Notification title="Lỗi" type="danger" closable>
                            {result.message || 'Không thể tạo hành động'}
                        </Notification>
                    )
                    return
                }
            } else {
                const scriptData = { script: JSON.stringify(config) }
                const result = await updateScenarioScript(action.id, scriptData)
                if (result.success) {
                    setActions(prev => prev.map(a => a.id === action.id ? { ...a, script: scriptData.script } : a))
                    toast.push(
                        <Notification title="Thành công" type="success" closable>
                            Đã lưu cấu hình hành động
                        </Notification>
                    )
                } else {
                    toast.push(
                        <Notification title="Lỗi" type="danger" closable>
                            {result.message || 'Không thể cập nhật hành động'}
                        </Notification>
                    )
                    return
                }
            }
            modalSetter(false)
            setConfiguringAction(null)
        } catch (error) {
            console.error('Error saving action config:', error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi lưu cấu hình hành động
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    const handleActionConfigSave = async (action, config) => {
        await saveActionConfig(action, config, setShowActionConfigModal)
    }
    const handleVideoInteractionSave = async (action, config) => {
        await saveActionConfig(action, config, setShowVideoInteractionModal)
    }
    const handleSpecificVideoInteractionSave = async (action, config) => {
        await saveActionConfig(action, config, setShowSpecificVideoInteractionModal)
    }
    const handleKeywordVideoInteractionSave = async (action, config) => {
        await saveActionConfig(action, config, setShowKeywordVideoInteractionModal)
    }
    const handleUserVideoInteractionSave = async (action, config) => {
        await saveActionConfig(action, config, setShowUserVideoInteractionModal)
    }
    const handleRandomLiveInteractionSave = async (action, config) => {
        await saveActionConfig(action, config, setShowRandomLiveInteractionModal)
    }
    const handleSpecificLiveInteractionSave = async (action, config) => {
        await saveActionConfig(action, config, setShowSpecificLiveInteractionModal)
    }
    const handleFollowUserSave = async (action, config) => {
        await saveActionConfig(action, config, setShowFollowUserModal)
    }
    const handleFollowUserListSave = async (action, config) => {
        await saveActionConfig(action, config, setShowFollowUserListModal)
    }
    const handleFollowBackSave = async (action, config) => {
        await saveActionConfig(action, config, setShowFollowBackModal)
    }
    const handleCreatePostSave = async (action, config) => {
        await saveActionConfig(action, config, setShowCreatePostModal)
    }
    const handleUpdateAvatarSave = async (action, config) => {
        await saveActionConfig(action, config, setShowUpdateAvatarModal)
    }
    const handleChangeNameSave = async (action, config) => {
        await saveActionConfig(action, config, setShowChangeNameModal)
    }
    const handleChangeBioSave = async (action, config) => {
        await saveActionConfig(action, config, setShowChangeBioModal)
    }
    const handleNotificationSave = async (action, config) => {
        await saveActionConfig(action, config, setShowNotificationModal)
    }
    const handleFriendVideoInteractionSave = async (action, config) => {
        await saveActionConfig(action, config, setShowFriendVideoInteractionModal)
    }

    const handleDeleteAction = (action) => {
        setDeletingAction(action)
        setShowDeleteActionDialog(true)
    }

    const confirmDeleteAction = async () => {
        if (!deletingAction) return
        setLoading(true)
        try {
            const result = await deleteScenarioScript(deletingAction.id)
            if (result.success) {
                setActions(prev => prev.filter(a => a.id !== deletingAction.id))
                toast.push(
                    <Notification title="Thành công" type="success" closable>
                        {t('toast.actionDeleted')}
                    </Notification>
                )
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        {result.message || 'Không thể xóa hành động'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error deleting action:', error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi xóa hành động
                </Notification>
            )
        } finally {
            setLoading(false)
            setShowDeleteActionDialog(false)
            setDeletingAction(null)
        }
    }

    const handleSaveAction = () => {
        if (!actionForm.name.trim()) {
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    {t('toast.nameRequired')}
                </Notification>
            )
            return
        }
        if (editingAction) {
            setActions(prev => prev.map(a => a.id === editingAction.id ? { ...a, name: actionForm.name } : a))
        } else {
            const newAction = {
                id: Math.max(...actions.map(a => a.id), 0) + 1,
                name: actionForm.name,
                scenarioId: actionForm.scenarioId
            }
            setActions(prev => [...prev, newAction])
        }
        setShowActionModal(false)
        setEditingAction(null)
        toast.push(
            <Notification title="Thành công" type="success" closable>
                {editingAction ? t('toast.actionUpdated') : t('toast.actionAdded')}
            </Notification>
        )
    }

    const handleCloseActionListModal = () => {
        if (!preventActionListClose) {
            setShowActionListModal(false)
        }
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={1200}
            className="z-[60]"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h5 className="font-bold">Cấu hình Tương tác (Facebook)</h5>
                </div>
                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-12 gap-6 h-full">
                        {/* Scenarios */}
                        <div className="col-span-5">
                            <div className="flex items-center justify-between mb-4">
                                <h6 className="font-semibold">{t('scenarios')}</h6>
                                <Button size="sm" variant="solid" color="blue-500" icon={<TbPlus />} onClick={handleAddScenario}>
                                    {t('addScenario')}
                                </Button>
                            </div>
                            <div className="mb-4">
                                <Input placeholder={t('searchPlaceholder')} suffix={<TbSearch className="text-lg" />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : filteredScenarios.length > 0 ? (
                                    filteredScenarios.map((scenario) => (
                                        <div key={scenario.id} className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedScenario?.id === scenario.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`} onClick={() => handleScenarioSelect(scenario)}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{scenario.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${scenario.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'}`}>
                                                        {scenario.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button className="text-blue-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); handleEditScenario(scenario) }}>
                                                            <TbEdit size={16} />
                                                        </button>
                                                        <button className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteScenario(scenario) }}>
                                                            <TbTrash size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        {searchTerm ? 'Không tìm thấy kịch bản nào' : 'Chưa có kịch bản nào'}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Scenario details */}
                        <div className="col-span-7">
                            {selectedScenario ? (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h6 className="font-semibold">Kịch bản: {selectedScenario.name}</h6>
                                            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                <span>Tổng số hành động: {currentActions.length}</span>
                                                <span>Đã chạy: 0 lần</span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="solid" color="green-500" icon={<TbPlus />} onClick={handleAddAction}>
                                            {t('addAction')}
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {scenarioLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : currentActions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentActions.map((action, index) => (
                                                    <div key={action.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">{index + 1}</span>
                                                                    <h6 className="font-semibold text-gray-900 dark:text-gray-100">{getActionDisplayName(action)}</h6>
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Hành động #{index + 1} (ID: {action.id})
                                                                    {action.description && (<div className="mt-1 text-xs text-gray-400">{action.description}</div>)}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 ml-4">
                                                                <button className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" onClick={() => handleEditAction(action)} title="Chỉnh sửa">
                                                                    <TbEdit size={18} />
                                                                </button>
                                                                <button className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" onClick={() => handleDeleteAction(action)} title="Xóa">
                                                                    <TbTrash size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800/50">
                                                <div className="text-gray-500 dark:text-gray-400">Chưa có hành động nào</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">{t('selectScenario')}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end">
                        <Button type="button" variant="default" onClick={onClose}>{t('close')}</Button>
                    </div>
                    </div>
                </div>

            {/* Scenario Modal */}
            <Dialog isOpen={showScenarioModal} onClose={() => setShowScenarioModal(false)} onRequestClose={() => setShowScenarioModal(false)} width={500} className="z-[80]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600"><h5 className="font-bold">{editingScenario ? t('scenarioForm.edit') : t('scenarioForm.add')}</h5></div>
                <div className="p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">{t('scenarioForm.nameLabel')}</label>
                            <Input placeholder={t('scenarioForm.namePlaceholder')} value={scenarioForm.name} onChange={(e) => setScenarioForm(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                            <div>
                            <label className="form-label">Mô tả</label>
                            <textarea placeholder="Nhập mô tả cho kịch bản..." value={scenarioForm.description} onChange={(e) => setScenarioForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                            </div>
                        <div>
                            <label className="form-label">Trạng thái</label>
                            <select value={scenarioForm.status} onChange={(e) => setScenarioForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                                <option value="draft">Bản nháp</option>
                            </select>
                        </div>
                    </div>
                        </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="default" onClick={() => setShowScenarioModal(false)} disabled={loading}>{t('scenarioForm.cancel')}</Button>
                        <Button type="button" variant="solid" onClick={handleSaveScenario} disabled={loading}>{loading ? 'Đang lưu...' : (editingScenario ? t('scenarioForm.update') : t('scenarioForm.save'))}</Button>
                            </div>
                            </div>
            </Dialog>

            {/* Action Modal */}
            <Dialog isOpen={showActionModal} onClose={() => setShowActionModal(false)} onRequestClose={() => setShowActionModal(false)} width={500} className="z-[80]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600"><h5 className="font-bold">{editingAction ? t('actionForm.edit') : t('actionForm.add')}</h5></div>
                <div className="p-4">
                    <div className="space-y-4">
                            <div>
                            <label className="form-label">{t('actionForm.nameLabel')}</label>
                            <Input placeholder={t('actionForm.namePlaceholder')} value={actionForm.name} onChange={(e) => setActionForm(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                    </div>
                            </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="default" onClick={() => setShowActionModal(false)}>{t('actionForm.cancel')}</Button>
                        <Button type="button" variant="solid" onClick={handleSaveAction}>{editingAction ? t('actionForm.update') : t('actionForm.save')}</Button>
                            </div>
                        </div>
            </Dialog>

            {/* Action List Modal */}
            <FacebookActionListModal
                isOpen={showActionListModal}
                onClose={handleCloseActionListModal}
                onSelectAction={handleSelectActionFromList}
                selectedScenario={selectedScenario}
            />

            {/* Action Config + various modals */}
            <ActionConfigModal isOpen={showActionConfigModal} onClose={() => { setShowActionConfigModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleActionConfigSave} />

            <NewsfeedInteractionModal isOpen={showFbNewsfeedModal} onClose={()=>{ setShowFbNewsfeedModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleVideoInteractionSave} />

            <SpecificPostInteractionModal isOpen={showFbSpecificPostInteractionModal} onClose={()=>{ setShowFbSpecificPostInteractionModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleSpecificVideoInteractionSave} />

            <GroupInteractionModal isOpen={showFbGroupInteractionModal} onClose={()=>{ setShowFbGroupInteractionModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleVideoInteractionSave} />

            <GroupPostCreateModal isOpen={showFbGroupPostCreateModal} onClose={()=>{ setShowFbGroupPostCreateModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleCreatePostSave} />

            <PostToTimelineModal isOpen={showFbPostToTimelineModal} onClose={()=>{ setShowFbPostToTimelineModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleCreatePostSave} />

            <SpecificPostCreateModal isOpen={showFbSpecificPostCreateModal} onClose={()=>{ setShowFbSpecificPostCreateModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleCreatePostSave} />

            <FollowUserModal isOpen={showFollowUserModal} onClose={() => { setShowFollowUserModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleFollowUserSave} />

            <FollowUserListModal isOpen={showFollowUserListModal} onClose={() => { setShowFollowUserListModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleFollowUserListSave} />

            <FollowBackModal isOpen={showFollowBackModal} onClose={() => { setShowFollowBackModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleFollowBackSave} />

            <CreatePostModal isOpen={showCreatePostModal} onClose={() => { setShowCreatePostModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleCreatePostSave} accountId={accountId} />

            <UpdateAvatarModal isOpen={showUpdateAvatarModal} onClose={() => { setShowUpdateAvatarModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleUpdateAvatarSave} accountId={accountId} />

            <ChangeNameModal isOpen={showChangeNameModal} onClose={() => { setShowChangeNameModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleChangeNameSave} />

            <ChangeBioModal isOpen={showChangeBioModal} onClose={() => { setShowChangeBioModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleChangeBioSave} />

            <NotificationModal isOpen={showNotificationModal} onClose={() => { setShowNotificationModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleNotificationSave} />

            <FriendVideoInteractionModal isOpen={showFriendVideoInteractionModal} onClose={() => { setShowFriendVideoInteractionModal(false); setConfiguringAction(null) }} action={configuringAction} onSave={handleFriendVideoInteractionSave} onFetchContentGroups={handleFetchContentGroups} onFetchContentsByGroup={handleFetchContentsByGroup} />

            {/* Delete confirmations */}
            <Dialog isOpen={showDeleteScenarioDialog} onClose={() => setShowDeleteScenarioDialog(false)} onRequestClose={() => setShowDeleteScenarioDialog(false)} width={400} className="z-[90]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600"><h5 className="font-bold text-red-600">{t('deleteDialog.scenarioTitle')}</h5></div>
                <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300">{t('deleteDialog.scenarioContent')} <strong>"{deletingScenario?.name}"</strong>?</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('deleteDialog.scenarioWarning')}</p>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="default" onClick={() => setShowDeleteScenarioDialog(false)}>{t('deleteDialog.cancel')}</Button>
                        <Button type="button" variant="solid" className="bg-red-500 hover:bg-red-600" onClick={confirmDeleteScenario}>{t('deleteDialog.deleteScenario')}</Button>
                    </div>
                </div>
            </Dialog>

            <Dialog isOpen={showDeleteActionDialog} onClose={() => setShowDeleteActionDialog(false)} onRequestClose={() => setShowDeleteActionDialog(false)} width={400} className="z-[90]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600"><h5 className="font-bold text-red-600">Xác nhận xóa hành động</h5></div>
                <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300">Bạn có chắc chắn muốn xóa hành động <strong>"{deletingAction ? getActionDisplayName(deletingAction) : ''}"</strong>?</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Hành động này không thể hoàn tác.</p>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="default" onClick={() => setShowDeleteActionDialog(false)}>Hủy</Button>
                        <Button type="button" variant="solid" className="bg-red-500 hover:bg-red-600" onClick={confirmDeleteAction}>Xóa hành động</Button>
                </div>
            </div>
            </Dialog>
        </Dialog>
    )
}

export default FacebookInteractionConfigModal


