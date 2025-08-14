'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'

const RandomLiveInteractionModal = ({ 
    isOpen, 
    onClose, 
    action, 
    onSave,
    onFetchContentGroups,
    onFetchContentsByGroup 
}) => {
    // Initialize config based on JSON schema for Random Live Interaction Form
    const initialConfig = {
        name: "Tương tác live ngẫu nhiên",
        limit_mode: "video",
        limit_video_from: 1,
        limit_video_to: 2,
        view_from: 3,
        view_to: 5,
        enable_follow: true,
        follow_rate: 100,
        follow_gap_from: 1,
        follow_gap_to: 3,
        enable_emotion: true,
        emotion_rate: 100,
        emotion_gap_from: 1,
        emotion_gap_to: 3,
        enable_comment: true,
        comment_rate: 100,
        comment_gap_from: 1,
        comment_gap_to: 3,
        comment_contents: [],
        selectedContentGroupId: "",
        selectedContentTitleId: ""
    }
    
    const [config, setConfig] = useState(initialConfig)
    
    const [isLoading, setIsLoading] = useState(false)
    const [loadingContents, setLoadingContents] = useState(false)
    
    // State for searchable select
    const [contentGroupsState, setContentGroupsState] = useState({
        options: [],
        hasNextPage: true,
        isLoading: false,
        currentPage: 1,
        searchTerm: ''
    })

    // Debounced search function
    const debounce = useCallback((func, delay) => {
        let timeoutId
        return (...args) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay)
        }
    }, [])

    // Function to fetch content groups with search and pagination
    const fetchContentGroups = useCallback(async (searchTerm = '', page = 1, reset = false) => {
        if (!onFetchContentGroups) return

        setContentGroupsState(prev => ({ ...prev, isLoading: true }))

        try {
            const params = {
                page,
                per_page: 20,
                ...(searchTerm && { search: searchTerm })
            }

            const response = await onFetchContentGroups(params)
            
            if (response?.success && response?.data) {
                const newOptions = response.data.data?.map(group => ({
                    value: group.id,
                    label: group.name
                })) || []

                setContentGroupsState(prev => ({
                    ...prev,
                    options: reset ? newOptions : [...prev.options, ...newOptions],
                    hasNextPage: response.data.current_page < response.data.last_page,
                    currentPage: response.data.current_page,
                    searchTerm,
                    isLoading: false
                    
                }))
            }
        } catch (error) {
            console.error('Error fetching content groups:', error)
            setContentGroupsState(prev => ({ ...prev, isLoading: false }))
        }
    }, [onFetchContentGroups])

    // Debounced search
    const debouncedSearch = useMemo(
        () => debounce((searchTerm) => {
            fetchContentGroups(searchTerm, 1, true)
        }, 300),
        [debounce, fetchContentGroups]
    )

    // Handle search input
    const handleSearch = useCallback((inputValue) => {
        debouncedSearch(inputValue)
    }, [debouncedSearch])

    // Handle load more (infinite scroll)
    const handleLoadMore = useCallback(() => {
        if (contentGroupsState.hasNextPage && !contentGroupsState.isLoading) {
            fetchContentGroups(contentGroupsState.searchTerm, contentGroupsState.currentPage + 1, false)
        }
    }, [contentGroupsState, fetchContentGroups])

    // Custom MenuList component for infinite scroll
    const CustomMenuList = useCallback((props) => {
        const { 
            children, 
            className,
            innerRef,
            innerProps,
            // Filter out react-select specific props that shouldn't be passed to DOM
            clearValue,
            cx,
            getStyles,
            getValue,
            hasValue,
            isMulti,
            isRtl,
            options,
            selectOption,
            selectProps,
            setValue,
            theme,
            ...rest 
        } = props
        
        const handleScroll = (e) => {
            const { target } = e
            const bottom = target.scrollHeight - target.scrollTop === target.clientHeight
            
            if (bottom && contentGroupsState.hasNextPage && !contentGroupsState.isLoading) {
                handleLoadMore()
            }
        }

        return (
            <div 
                ref={innerRef}
                className={className}
                {...innerProps}
                onScroll={handleScroll}
            >
                {children}
                {contentGroupsState.isLoading && (
                    <div className="px-3 py-2 text-center text-sm text-gray-500">
                        Đang tải...
                    </div>
                )}
                {!contentGroupsState.hasNextPage && contentGroupsState.options.length > 0 && (
                    <div className="px-3 py-2 text-center text-xs text-gray-400">
                        Đã tải hết dữ liệu
                    </div>
                )}
            </div>
        )
    }, [contentGroupsState, handleLoadMore])

    // Fetch content groups when modal opens
    useEffect(() => {
        if (isOpen) {
            // Reset state and fetch initial data
            setContentGroupsState({
                options: [],
                hasNextPage: true,
                isLoading: false,
                currentPage: 1,
                searchTerm: ''
            })
            fetchContentGroups('', 1, true)
        }
    }, [isOpen, fetchContentGroups])

    const fetchContentsByGroup = async (groupId) => {
        if (!groupId) {
            setConfig(prev => ({ ...prev, comment_contents: [] }))
            return
        }
        
        if (onFetchContentsByGroup) {
            setLoadingContents(true)
            try {
                const contents = await onFetchContentsByGroup(groupId)
                
                // Ensure we extract only string values, not objects
                const commentContents = contents.map((content) => {
                    // If content is already a string, use it
                    if (typeof content === 'string') {
                        return content
                    }
                    
                    // If content is an object, extract the text value
                    let extracted = ''
                    
                    // Try different extraction paths based on API structure
                    if (content.content && content.content.text) {
                        // Case: {content: {text: 'value'}}
                        extracted = content.content.text
                    } else if (content.content && typeof content.content === 'string') {
                        // Case: {content: 'value'}
                        extracted = content.content
                    } else if (content.text) {
                        // Case: {text: 'value'}
                        extracted = content.text
                    } else if (content.title) {
                        // Case: {title: 'value'}
                        extracted = content.title
                    } else if (content.value) {
                        // Case: {value: 'value'}
                        extracted = content.value
                    } else if (content.name) {
                        // Case: {name: 'value'}
                        extracted = content.name
                    }
                    
                    return extracted
                }).filter((text) => {
                    return typeof text === 'string' && text.trim() !== ''
                })
                
                setConfig(prev => ({ ...prev, comment_contents: commentContents }))
            } catch (error) {
                console.error('Error fetching contents:', error)
                setConfig(prev => ({ ...prev, comment_contents: [] }))
            } finally {
                setLoadingContents(false)
            }
        }
    }

    const handleSelectChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
        
        // If content group is changed, fetch contents for that group
        if (field === 'selectedContentGroupId') {
            fetchContentsByGroup(value)
        }
    }

    const handleInputChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: field.includes('_from') || field.includes('_to') || field.includes('_rate') 
                ? parseInt(value) || 0 
                : value
        }))
    }

    const handleSwitchChange = (field, checked) => {
        setConfig(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    const resetForm = () => {
        setConfig(initialConfig)
        setContentGroupsState({
            options: [],
            hasNextPage: true,
            isLoading: false,
            currentPage: 1,
            searchTerm: ''
        })
    }

    const handleSave = async () => {
        if (onSave && !isLoading) {
            setIsLoading(true)
            try {
                const saveData = {
                    name: config.name,
                    type: action?.type || 'random_live',
                    parameters: {
                        name: config.name,
                        description: config.name,
                        limit_mode: config.limit_mode,
                        limit_video_from: config.limit_video_from,
                        limit_video_to: config.limit_video_to,
                        view_from: config.view_from,
                        view_to: config.view_to,
                        enable_follow: config.enable_follow,
                        follow_rate: config.follow_rate,
                        follow_gap_from: config.follow_gap_from,
                        follow_gap_to: config.follow_gap_to,
                        enable_emotion: config.enable_emotion,
                        emotion_rate: config.emotion_rate,
                        emotion_gap_from: config.emotion_gap_from,
                        emotion_gap_to: config.emotion_gap_to,
                        enable_comment: config.enable_comment,
                        comment_rate: config.comment_rate,
                        comment_gap_from: config.comment_gap_from,
                        comment_gap_to: config.comment_gap_to,
                        comment_contents: Array.isArray(config.comment_contents) 
                            ? config.comment_contents.map(content => 
                                typeof content === 'string' ? content : (content.text || content.content || content.value || '')
                              ).filter(text => typeof text === 'string' && text.trim() !== '')
                            : [],
                        selectedContentGroupId: config.selectedContentGroupId,
                        selectedContentTitleId: config.selectedContentTitleId
                    }
                }
                await onSave(action, saveData)
                // Reset form sau khi lưu thành công
                resetForm()
            } catch (error) {
                console.error('Error saving random live interaction config:', error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleClose = () => {
        // Reset form khi đóng modal
        resetForm()
        onClose()
    }

    if (!action) return null

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
            width={800}
            className="z-[80]"
        >
            <div className="flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h5 className="font-bold">Cài đặt: {action?.name}</h5>
                </div>
                
                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-0 max-h-[calc(85vh-120px)]">
                    {/* Cấu hình cơ bản */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Cấu hình cơ bản
                        </h6>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Tên hành động
                                </label>
                                <Input
                                    value={action?.name || ''}
                                    disabled
                                    className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Đặt tên để dễ dáng nhận biết hành động này, không thể thay đổi.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Giới hạn & Thời gian */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Giới hạn & Thời gian
                        </h6>
                        
                        {/* Dừng tương tác khi đạt */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Dừng tương tác khi đạt
                            </label>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="limit_mode"
                                            value="video"
                                            checked={config.limit_mode === 'video'}
                                            onChange={(e) => handleSelectChange('limit_mode', e.target.value)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Số lượng live
                                        </span>
                                    </label>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 w-fit">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={config.limit_video_from}
                                            onChange={(e) => handleInputChange('limit_video_from', e.target.value)}
                                            className="w-20 text-center border-gray-300 dark:border-gray-600"
                                        />
                                        <span className="text-gray-500 font-medium">-</span>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={config.limit_video_to}
                                            onChange={(e) => handleInputChange('limit_video_to', e.target.value)}
                                            className="w-20 text-center border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Thời gian xem mỗi live */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Thời gian xem mỗi live (giây)
                            </label>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 w-fit">
                                <Input
                                    type="number"
                                    min="1"
                                    value={config.view_from}
                                    onChange={(e) => handleInputChange('view_from', e.target.value)}
                                    className="w-20 text-center border-gray-300 dark:border-gray-600"
                                />
                                <span className="text-gray-500 font-medium">-</span>
                                <Input
                                    type="number"
                                    min="1"
                                    value={config.view_to}
                                    onChange={(e) => handleInputChange('view_to', e.target.value)}
                                    className="w-20 text-center border-gray-300 dark:border-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hành động tùy chọn */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            Hành động tùy chọn
                        </h6>
                        
                        {/* Grid layout cho các hành động */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Theo dõi streamer */}
                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        <h6 className="font-medium text-gray-900 dark:text-gray-100">
                                            Theo dõi streamer
                                        </h6>
                                    </div>
                                    <Switcher
                                        checked={config.enable_follow}
                                        onChange={(checked) => handleSwitchChange('enable_follow', checked)}
                                    />
                                </div>
                                
                                {config.enable_follow && (
                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Tỷ lệ thực hiện (%)
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={config.follow_rate}
                                                onChange={(e) => handleInputChange('follow_rate', e.target.value)}
                                                className="w-20 text-center text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Chờ trước khi thực hiện (giây)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={config.follow_gap_from}
                                                    onChange={(e) => handleInputChange('follow_gap_from', e.target.value)}
                                                    className="w-16 text-center text-sm"
                                                />
                                                <span className="text-xs text-gray-500">-</span>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={config.follow_gap_to}
                                                    onChange={(e) => handleInputChange('follow_gap_to', e.target.value)}
                                                    className="w-16 text-center text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Thả tim */}
                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-red-300 dark:hover:border-red-600 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                        <h6 className="font-medium text-gray-900 dark:text-gray-100">
                                            Thả tim
                                        </h6>
                                    </div>
                                    <Switcher
                                        checked={config.enable_emotion}
                                        onChange={(checked) => handleSwitchChange('enable_emotion', checked)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    Bày tỏ cảm xúc bằng cách thả tim trong live.
                                </p>
                                
                                {config.enable_emotion && (
                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Tỷ lệ thực hiện (%)
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={config.emotion_rate}
                                                onChange={(e) => handleInputChange('emotion_rate', e.target.value)}
                                                className="w-20 text-center text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Chờ trước khi thực hiện (giây)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={config.emotion_gap_from}
                                                    onChange={(e) => handleInputChange('emotion_gap_from', e.target.value)}
                                                    className="w-16 text-center text-sm"
                                                />
                                                <span className="text-xs text-gray-500">-</span>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={config.emotion_gap_to}
                                                    onChange={(e) => handleInputChange('emotion_gap_to', e.target.value)}
                                                    className="w-16 text-center text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bình luận live - Full width */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                    <h6 className="font-medium text-gray-900 dark:text-gray-100">
                                        Bình luận live
                                    </h6>
                                </div>
                                <Switcher
                                    checked={config.enable_comment}
                                    onChange={(checked) => handleSwitchChange('enable_comment', checked)}
                                />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Tự động bình luận trong live với nội dung soạn sẵn.
                            </p>
                            
                            {config.enable_comment && (
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Tỷ lệ (%)
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={config.comment_rate}
                                                onChange={(e) => handleInputChange('comment_rate', e.target.value)}
                                                className="text-center text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Chờ (giây)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={config.comment_gap_from}
                                                    onChange={(e) => handleInputChange('comment_gap_from', e.target.value)}
                                                    className="w-full text-center text-sm"
                                                />
                                                <span className="text-xs text-gray-500">-</span>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={config.comment_gap_to}
                                                    onChange={(e) => handleInputChange('comment_gap_to', e.target.value)}
                                                    className="w-full text-center text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nhóm nội dung ({config.comment_contents.length} bình luận)
                                            </label>
                                            <Select
                                                instanceId="random-live-interaction-content-group-select"
                                                value={contentGroupsState.options.find(opt => opt.value === config.selectedContentGroupId)}
                                                onChange={(option) => handleSelectChange('selectedContentGroupId', option?.value || '')}
                                                options={contentGroupsState.options}
                                                placeholder="-- Chọn nhóm nội dung --"
                                                isLoading={contentGroupsState.isLoading && contentGroupsState.options.length === 0}
                                                isDisabled={false}
                                                isSearchable={true}
                                                onInputChange={handleSearch}
                                                menuPortalTarget={document.body}
                                                components={{
                                                    MenuList: CustomMenuList
                                                }}
                                                styles={{
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                                noOptionsMessage={({ inputValue }) => 
                                                    inputValue ? `Không tìm thấy "${inputValue}"` : 'Không có dữ liệu'
                                                }
                                                loadingMessage={() => 'Đang tải...'}
                                            />
                                            {loadingContents && (
                                                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                                                    Đang tải nội dung...
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comments loaded from selected group */}
                                    {config.comment_contents.length > 0 && (
                                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                ✅ Đã tải {config.comment_contents.length} bình luận từ nhóm nội dung được chọn
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-gray-800">
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleClose}
                        >
                            Thoát
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            color="blue-500"
                            onClick={handleSave}
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default RandomLiveInteractionModal