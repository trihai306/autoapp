'use client'
import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { TbSearch, TbPlus, TbEdit, TbTrash } from 'react-icons/tb'

import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ActionListModal from './ActionListModal'
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
    NotificationModal
} from './action-modals'

import { useTranslations } from 'next-intl'

const InteractionConfigModal = ({ isOpen, onClose }) => {
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
    const [showVideoInteractionModal, setShowVideoInteractionModal] = useState(false)
    const [showSpecificVideoInteractionModal, setShowSpecificVideoInteractionModal] = useState(false)
    const [showKeywordVideoInteractionModal, setShowKeywordVideoInteractionModal] = useState(false)
    const [showUserVideoInteractionModal, setShowUserVideoInteractionModal] = useState(false)
    const [showRandomLiveInteractionModal, setShowRandomLiveInteractionModal] = useState(false)
    const [showSpecificLiveInteractionModal, setShowSpecificLiveInteractionModal] = useState(false)
    const [showFollowUserModal, setShowFollowUserModal] = useState(false)
    const [showCreatePostModal, setShowCreatePostModal] = useState(false)
    const [showUpdateAvatarModal, setShowUpdateAvatarModal] = useState(false)
    const [showChangeNameModal, setShowChangeNameModal] = useState(false)
    const [showNotificationModal, setShowNotificationModal] = useState(false)
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
            const result = await getInteractionScenarios()
            if (result.success) {
                // Ensure scenarios are sorted by newest first (fallback sorting)
                const sortedScenarios = result.data.sort((a, b) => {
                    const dateA = new Date(a.created_at || a.updated_at || 0)
                    const dateB = new Date(b.created_at || b.updated_at || 0)
                    return dateB - dateA // Newest first
                })
                
                setScenarios(sortedScenarios)
                // Auto-select first scenario if available and no scenario is currently selected
                if (sortedScenarios.length > 0 && !selectedScenario) {
                    const firstScenario = sortedScenarios[0]
                    setSelectedScenario(firstScenario)
                    // Load details for the first scenario
                    if (firstScenario.id) {
                        loadScenarioDetails(firstScenario.id)
                    }
                }
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        {result.message || "Không thể tải danh sách kịch bản"}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error loading scenarios:', error)
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
                // Return the full response for pagination support
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

    // Legacy function for backward compatibility (still used by other modals)
    const handleFetchContentGroupsLegacy = async () => {
        try {
            const result = await getContentGroups()
            if (result.success) {
                // result.data is now the direct response from API
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
            const result = await getInteractionScenario(scenarioId)
            if (result.success) {
                // Update actions with scripts from the scenario
                setActions(result.data.scripts || [])
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        {result.message || "Không thể tải chi tiết kịch bản"}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error loading scenario details:', error)
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
        // Load scenario details including scripts
        if (scenario?.id) {
            loadScenarioDetails(scenario.id)
        }
    }

    const getScenarioActions = (scenarioId) => {
        return actions.filter(action => action.scenario_id === scenarioId || action.scenarioId === scenarioId)
    }

    const currentActions = selectedScenario ? actions : []
    
    // Helper function to get action name from script
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
    
    // Scenario CRUD functions
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
                // Update local state
            setScenarios(prev => prev.filter(s => s.id !== deletingScenario.id))
                setActions(prev => prev.filter(a => a.scenario_id !== deletingScenario.id))
            
                // Update selected scenario if it was deleted
            if (selectedScenario?.id === deletingScenario.id) {
                const remainingScenarios = scenarios.filter(s => s.id !== deletingScenario.id)
                    const newSelected = remainingScenarios[0] || null
                    setSelectedScenario(newSelected)
                    
                    // Load details for new selected scenario
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
                        {result.message || "Không thể xóa kịch bản"}
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
            // Update existing scenario
                const result = await updateInteractionScenario(editingScenario.id, {
                    name: scenarioForm.name,
                    description: scenarioForm.description,
                    status: scenarioForm.status
                })
                
                if (result.success) {
                    // Update local state
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
                    console.error("Update scenario error:", result)
                    toast.push(
                        <Notification title="Lỗi" type="danger" closable>
                            {result.message || "Không thể cập nhật kịch bản"}
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
        } else {
            // Add new scenario
                const result = await createInteractionScenario({
                name: scenarioForm.name,
                    description: scenarioForm.description || null,
                    status: scenarioForm.status || 'active',
                    shuffle_actions: false,
                    run_count: false
                })
                
                if (result.success) {
                    // Reload scenarios to get the new one
                    await loadScenarios()
                    
                    // Auto-select the newly created scenario (should be first in the list)
                    if (result.data && result.data.id) {
                        const newScenario = result.data
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
                    console.error("Create scenario error:", result)
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
            console.error('Error saving scenario:', error)
        toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi lưu kịch bản
            </Notification>
        )
        } finally {
            setLoading(false)
        }
    }
    
    // Action CRUD functions
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
        // Tạo action mới nhưng chưa thêm vào danh sách
        const newAction = {
            id: Math.max(...actions.map(a => a.id), 0) + 1,
            name: actionData.name,
            scenarioId: scenario.id,
            actionId: actionData.id,
            isNew: true // Đánh dấu là action mới
        }
        
        // Không đóng ActionListModal, chỉ mở modal cấu hình phù hợp
        // setShowActionListModal(false) // Đã comment để không đóng modal danh sách
        setConfiguringAction(newAction)
        
        // Kiểm tra loại hành động để mở modal phù hợp
        const randomVideoActions = ['random_video_interaction']
        const specificVideoActions = ['specific_video_interaction']
        const keywordVideoActions = ['keyword_video_interaction']
        const userVideoActions = ['user_video_interaction']
        const randomLiveActions = ['random_live_interaction']
        const specificLiveActions = ['specific_live_interaction']
        const followUserActions = ['follow_user']
        const createPostActions = ['create_post']
        const updateAvatarActions = ['update_avatar']
        const changeNameActions = ['change_name']
        const notificationActions = ['notification']
        
        if (randomVideoActions.includes(actionData.id)) {
            setShowVideoInteractionModal(true)
        } else if (specificVideoActions.includes(actionData.id)) {
            setShowSpecificVideoInteractionModal(true)
        } else if (keywordVideoActions.includes(actionData.id)) {
            setShowKeywordVideoInteractionModal(true)
        } else if (userVideoActions.includes(actionData.id)) {
            setShowUserVideoInteractionModal(true)
        } else if (randomLiveActions.includes(actionData.id)) {
            setShowRandomLiveInteractionModal(true)
        } else if (specificLiveActions.includes(actionData.id)) {
            setShowSpecificLiveInteractionModal(true)
        } else if (followUserActions.includes(actionData.id)) {
            setShowFollowUserModal(true)
        } else if (createPostActions.includes(actionData.id)) {
            setShowCreatePostModal(true)
        } else if (updateAvatarActions.includes(actionData.id)) {
            setShowUpdateAvatarModal(true)
        } else if (changeNameActions.includes(actionData.id)) {
            setShowChangeNameModal(true)
        } else if (notificationActions.includes(actionData.id)) {
            setShowNotificationModal(true)
        } else {
            setShowActionConfigModal(true)
        }
    }
    
    const handleEditAction = (action) => {
        setConfiguringAction(action)
        
        // Kiểm tra loại hành động để mở modal phù hợp
        const randomVideoActions = ['random_video_interaction']
        const specificVideoActions = ['specific_video_interaction']
        const keywordVideoActions = ['keyword_video_interaction']
        const userVideoActions = ['user_video_interaction']
        const randomLiveActions = ['random_live_interaction']
        const specificLiveActions = ['specific_live_interaction']
        const followUserActions = ['follow_user']
        const createPostActions = ['create_post']
        const updateAvatarActions = ['update_avatar']
        const changeNameActions = ['change_name']
        const notificationActions = ['notification']
        
        if (randomVideoActions.includes(action.actionId)) {
            setShowVideoInteractionModal(true)
        } else if (specificVideoActions.includes(action.actionId)) {
            setShowSpecificVideoInteractionModal(true)
        } else if (keywordVideoActions.includes(action.actionId)) {
            setShowKeywordVideoInteractionModal(true)
        } else if (userVideoActions.includes(action.actionId)) {
            setShowUserVideoInteractionModal(true)
        } else if (randomLiveActions.includes(action.actionId)) {
            setShowRandomLiveInteractionModal(true)
        } else if (specificLiveActions.includes(action.actionId)) {
            setShowSpecificLiveInteractionModal(true)
        } else if (followUserActions.includes(action.actionId)) {
            setShowFollowUserModal(true)
        } else if (createPostActions.includes(action.actionId)) {
            setShowCreatePostModal(true)
        } else if (updateAvatarActions.includes(action.actionId)) {
            setShowUpdateAvatarModal(true)
        } else if (changeNameActions.includes(action.actionId)) {
            setShowChangeNameModal(true)
        } else if (notificationActions.includes(action.actionId)) {
            setShowNotificationModal(true)
        } else {
            setShowActionConfigModal(true)
        }
    }
    
    // Helper function to save action configuration
    const saveActionConfig = async (action, config, modalSetter) => {
        setLoading(true)
        try {
        if (action.isNew) {
                // Tạo script mới cho scenario
                const scriptData = {
                    scenario_id: selectedScenario.id,
                    order: actions.length + 1,
                    script: JSON.stringify(config)
                }
                
                const result = await createScenarioScript(scriptData)
                
                if (result.success) {
                    // Reload scenario details to get updated scripts
                    await loadScenarioDetails(selectedScenario.id)
            
            toast.push(
                <Notification title="Thành công" type="success" closable>
                    {t('toast.actionAdded')}
                </Notification>
            )
        } else {
            toast.push(
                        <Notification title="Lỗi" type="danger" closable>
                            {result.message || "Không thể tạo hành động"}
                </Notification>
            )
                    return
                }
            } else {
                // Cập nhật script hiện có
                const scriptData = {
                    script: JSON.stringify(config)
                }
                
                const result = await updateScenarioScript(action.id, scriptData)
                
                if (result.success) {
                    // Update local state
            setActions(prev => prev.map(a => 
                a.id === action.id 
                            ? { ...a, script: scriptData.script }
                    : a
            ))
            
            toast.push(
                <Notification title="Thành công" type="success" closable>
                    Đã lưu cấu hình hành động
                </Notification>
            )
        } else {
            toast.push(
                        <Notification title="Lỗi" type="danger" closable>
                            {result.message || "Không thể cập nhật hành động"}
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

    const handleCreatePostSave = async (action, config) => {
        await saveActionConfig(action, config, setShowCreatePostModal)
    }

    const handleUpdateAvatarSave = async (action, config) => {
        await saveActionConfig(action, config, setShowUpdateAvatarModal)
    }

    const handleChangeNameSave = async (action, config) => {
        await saveActionConfig(action, config, setShowChangeNameModal)
    }

    const handleNotificationSave = async (action, config) => {
        await saveActionConfig(action, config, setShowNotificationModal)
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
                // Update local state
            setActions(prev => prev.filter(a => a.id !== deletingAction.id))
            
            toast.push(
                <Notification title="Thành công" type="success" closable>
                    {t('toast.actionDeleted')}
                </Notification>
            )
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        {result.message || "Không thể xóa hành động"}
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
            // Update existing action
            setActions(prev => prev.map(a => 
                a.id === editingAction.id 
                    ? { ...a, name: actionForm.name }
                    : a
            ))
        } else {
            // Add new action
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

    // Hàm để đóng ActionListModal một cách có chủ ý
    const handleCloseActionListModal = () => {
        // Chỉ đóng nếu không có modal con nào đang mở
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
                    <h5 className="font-bold">{t('title')}</h5>
                </div>
                
                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-12 gap-6 h-full">
                        {/* Left Panel - Scenarios */}
                        <div className="col-span-5">
                            <div className="flex items-center justify-between mb-4">
                                <h6 className="font-semibold">{t('scenarios')}</h6>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    color="blue-500"
                                    icon={<TbPlus />}
                                    onClick={handleAddScenario}
                                >
                                    {t('addScenario')}
                                </Button>
                            </div>
                            
                            {/* Search */}
                            <div className="mb-4">
                                <Input
                                    placeholder={t('searchPlaceholder')}
                                    suffix={<TbSearch className="text-lg" />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Scenarios List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : filteredScenarios.length > 0 ? (
                                    filteredScenarios.map((scenario) => (
                                    <div
                                        key={scenario.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedScenario?.id === scenario.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                        onClick={() => handleScenarioSelect(scenario)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{scenario.name}</span>
                                            <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        scenario.status === 'active' 
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                        {scenario.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button 
                                                        className="text-blue-500 hover:text-blue-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleEditScenario(scenario)
                                                        }}
                                                    >
                                                        <TbEdit size={16} />
                                                    </button>
                                                    <button 
                                                        className="text-red-500 hover:text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteScenario(scenario)
                                                        }}
                                                    >
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

                        {/* Right Panel - Scenario Details */}
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
                                            <Button
                                                size="sm"
                                                variant="solid"
                                                color="green-500"
                                                icon={<TbPlus />}
                                                onClick={handleAddAction}
                                            >
                                                {t('addAction')}
                                            </Button>
                                        </div>

                                    {/* Actions Grid */}
                                    <div className="space-y-4">
                                        {scenarioLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : currentActions.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentActions.map((action, index) => (
                                                    <div 
                                                        key={action.id}
                                                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                                                                        {index + 1}
                                                                    </span>
                                                                    <h6 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                        {getActionDisplayName(action)}
                                                                    </h6>
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Hành động #{index + 1} (ID: {action.id})
                                                                    {action.description && (
                                                                        <div className="mt-1 text-xs text-gray-400">
                                                                            {action.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 ml-4">
                                                                <button 
                                                                    className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                    onClick={() => handleEditAction(action)}
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <TbEdit size={18} />
                                                                </button>
                                                                <button 
                                                                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                    onClick={() => handleDeleteAction(action)}
                                                                    title="Xóa"
                                                                >
                                                                    <TbTrash size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800/50">
                                                <div className="text-gray-500 dark:text-gray-400">
                                                    Chưa có hành động nào
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {currentActions.length > 0 && (
                                        <div className="flex justify-center mt-4">
                                            <div className="flex items-center space-x-2">
                                                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                                                    &lt;
                                                </button>
                                                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                                                    1
                                                </button>
                                                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                                                    &gt;
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                    {t('selectScenario')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="default"
                            onClick={onClose}
                        >
                            {t('close')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Scenario Modal */}
            <Dialog
                isOpen={showScenarioModal}
                onClose={() => setShowScenarioModal(false)}
                onRequestClose={() => setShowScenarioModal(false)}
                width={500}
                className="z-[80]"
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h5 className="font-bold">
                        {editingScenario ? t('scenarioForm.edit') : t('scenarioForm.add')}
                    </h5>
                </div>
                
                <div className="p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">{t('scenarioForm.nameLabel')}</label>
                            <Input
                                placeholder={t('scenarioForm.namePlaceholder')}
                                value={scenarioForm.name}
                                onChange={(e) => setScenarioForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="form-label">Mô tả</label>
                            <textarea
                                placeholder="Nhập mô tả cho kịch bản..."
                                value={scenarioForm.description}
                                onChange={(e) => setScenarioForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                        <div>
                            <label className="form-label">Trạng thái</label>
                            <select
                                value={scenarioForm.status}
                                onChange={(e) => setScenarioForm(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                                <option value="draft">Bản nháp</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => setShowScenarioModal(false)}
                            disabled={loading}
                        >
                            {t('scenarioForm.cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            onClick={handleSaveScenario}
                            disabled={loading}
                        >
                            {loading ? 'Đang lưu...' : (editingScenario ? t('scenarioForm.update') : t('scenarioForm.save'))}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Action Modal */}
            <Dialog
                isOpen={showActionModal}
                onClose={() => setShowActionModal(false)}
                onRequestClose={() => setShowActionModal(false)}
                width={500}
                className="z-[80]"
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h5 className="font-bold">
                        {editingAction ? t('actionForm.edit') : t('actionForm.add')}
                    </h5>
                </div>
                
                <div className="p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">{t('actionForm.nameLabel')}</label>
                            <Input
                                placeholder={t('actionForm.namePlaceholder')}
                                value={actionForm.name}
                                onChange={(e) => setActionForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => setShowActionModal(false)}
                        >
                            {t('actionForm.cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            onClick={handleSaveAction}
                        >
                            {editingAction ? t('actionForm.update') : t('actionForm.save')}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Action List Modal */}
            <ActionListModal
                isOpen={showActionListModal}
                onClose={handleCloseActionListModal}
                onSelectAction={handleSelectActionFromList}
                selectedScenario={selectedScenario}
            />

            {/* Action Config Modal */}
            <ActionConfigModal
                isOpen={showActionConfigModal}
                onClose={() => {
                    setShowActionConfigModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleActionConfigSave}
            />

            {/* Video Interaction Modal */}
            <VideoInteractionModal
                isOpen={showVideoInteractionModal}
                onClose={() => {
                    setShowVideoInteractionModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleVideoInteractionSave}
                onFetchContentGroups={handleFetchContentGroups}
                onFetchContentsByGroup={handleFetchContentsByGroup}
            />

            {/* Specific Video Interaction Modal */}
            <SpecificVideoInteractionModal
                isOpen={showSpecificVideoInteractionModal}
                onClose={() => {
                    setShowSpecificVideoInteractionModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleSpecificVideoInteractionSave}
            />

            {/* Keyword Video Interaction Modal */}
            <KeywordVideoInteractionModal
                isOpen={showKeywordVideoInteractionModal}
                onClose={() => {
                    setShowKeywordVideoInteractionModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleKeywordVideoInteractionSave}
            />

            {/* User Video Interaction Modal */}
            <UserVideoInteractionModal
                isOpen={showUserVideoInteractionModal}
                onClose={() => {
                    setShowUserVideoInteractionModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleUserVideoInteractionSave}
                onFetchContentGroups={handleFetchContentGroups}
                onFetchContentsByGroup={handleFetchContentsByGroup}
            />

            {/* Random Live Interaction Modal */}
            <RandomLiveInteractionModal
                isOpen={showRandomLiveInteractionModal}
                onClose={() => {
                    setShowRandomLiveInteractionModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleRandomLiveInteractionSave}
            />

            {/* Specific Live Interaction Modal */}
            <SpecificLiveInteractionModal
                isOpen={showSpecificLiveInteractionModal}
                onClose={() => {
                    setShowSpecificLiveInteractionModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleSpecificLiveInteractionSave}
            />

            {/* Follow User Modal */}
            <FollowUserModal
                isOpen={showFollowUserModal}
                onClose={() => {
                    setShowFollowUserModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleFollowUserSave}
            />

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={showCreatePostModal}
                onClose={() => {
                    setShowCreatePostModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleCreatePostSave}
            />

            {/* Update Avatar Modal */}
            <UpdateAvatarModal
                isOpen={showUpdateAvatarModal}
                onClose={() => {
                    setShowUpdateAvatarModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleUpdateAvatarSave}
            />

            {/* Change Name Modal */}
            <ChangeNameModal
                isOpen={showChangeNameModal}
                onClose={() => {
                    setShowChangeNameModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleChangeNameSave}
            />

            {/* Notification Modal */}
            <NotificationModal
                isOpen={showNotificationModal}
                onClose={() => {
                    setShowNotificationModal(false)
                    setConfiguringAction(null)
                }}
                action={configuringAction}
                onSave={handleNotificationSave}
            />

            {/* Delete Scenario Confirmation Dialog */}
            <Dialog
                isOpen={showDeleteScenarioDialog}
                onClose={() => setShowDeleteScenarioDialog(false)}
                onRequestClose={() => setShowDeleteScenarioDialog(false)}
                width={400}
                className="z-[90]"
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h5 className="font-bold text-red-600">{t('deleteDialog.scenarioTitle')}</h5>
                </div>
                
                <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        {t('deleteDialog.scenarioContent')} <strong>"{deletingScenario?.name}"</strong>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {t('deleteDialog.scenarioWarning')}
                    </p>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => setShowDeleteScenarioDialog(false)}
                        >
                            {t('deleteDialog.cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            className="bg-red-500 hover:bg-red-600"
                            onClick={confirmDeleteScenario}
                        >
                            {t('deleteDialog.deleteScenario')}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Action Confirmation Dialog */}
            <Dialog
                isOpen={showDeleteActionDialog}
                onClose={() => setShowDeleteActionDialog(false)}
                onRequestClose={() => setShowDeleteActionDialog(false)}
                width={400}
                className="z-[90]"
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h5 className="font-bold text-red-600">Xác nhận xóa hành động</h5>
                </div>
                
                <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Bạn có chắc chắn muốn xóa hành động <strong>"{deletingAction ? getActionDisplayName(deletingAction) : ''}"</strong>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Hành động này không thể hoàn tác.
                    </p>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => setShowDeleteActionDialog(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            className="bg-red-500 hover:bg-red-600"
                            onClick={confirmDeleteAction}
                        >
                            Xóa hành động
                        </Button>
                    </div>
                </div>
            </Dialog>
        </Dialog>
    )
}

export default InteractionConfigModal
