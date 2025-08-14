'use client'
import { useState, useMemo } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { TbUsers, TbDeviceDesktop, TbSettings, TbBell, TbVideo, TbEye, TbSearch, TbUser, TbUserPlus, TbBulb, TbMessage, TbThumbUp, TbShare, TbEdit, TbPhoto, TbFileText, TbWallet, TbClock, TbPhone, TbFilter, TbX, TbCheck, TbStar, TbSparkles, TbBolt, TbHeart } from 'react-icons/tb'
import styles from './ActionListModal.module.css'

const ActionListModal = ({ isOpen, onClose, onSelectAction, selectedScenario }) => {
    const [selectedCategory, setSelectedCategory] = useState('interaction')
    const [searchTerm, setSearchTerm] = useState('')
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
    const [hoveredAction, setHoveredAction] = useState(null)

    const actionCategories = [
        {
            id: 'interaction',
            title: 'Tương tác',
            icon: <TbUsers />,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            description: 'Các hành động tương tác với nội dung',
            actions: [
                { id: 'read_notification', name: 'Đọc thông báo', icon: <TbBell />, available: true, description: 'Đọc và xử lý thông báo từ TikTok' },
                { id: 'random_video_interaction', name: 'Tương tác video ngẫu nhiên', icon: <TbVideo />, available: true, description: 'Tương tác với video ngẫu nhiên trên For You' },
                { id: 'specific_video_interaction', name: 'Tương tác video chỉ định', icon: <TbEye />, available: true, description: 'Tương tác với video cụ thể theo URL' },
                { id: 'keyword_video_interaction', name: 'Tương tác video theo từ khóa', icon: <TbSearch />, available: true, description: 'Tìm và tương tác video theo từ khóa' },
                { id: 'user_video_interaction', name: 'Tương tác video theo User', icon: <TbUser />, available: true, description: 'Tương tác với video của user cụ thể' },
                { id: 'random_live_interaction', name: 'Tương tác live ngẫu nhiên', icon: <TbEye />, available: true, description: 'Tham gia và tương tác live stream ngẫu nhiên' },
                { id: 'specific_live_interaction', name: 'Tương tác live chỉ định', icon: <TbVideo />, available: true, description: 'Tham gia live stream cụ thể' }
            ]
        },
        {
            id: 'follow_message',
            title: 'Theo dõi và nhắn tin',
            icon: <TbDeviceDesktop />,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            description: 'Quản lý kết nối và giao tiếp',
            actions: [
                { id: 'follow_user', name: 'Theo dõi User', icon: <TbUserPlus />, available: true, description: 'Follow user cụ thể' },
                { id: 'follow_back', name: 'Theo dõi lại', icon: <TbUser />, available: true, description: 'Follow lại những người đã follow bạn' },
                { id: 'follow_user_suggestion', name: 'Theo dõi User gợi ý', icon: <TbBulb />, comingSoon: true, description: 'Follow user từ danh sách gợi ý' },
                { id: 'follow_user_by_id', name: 'Theo dõi User qua Id chỉ định', icon: <TbUser />, comingSoon: true, description: 'Follow user bằng ID cụ thể' },
                { id: 'receive_message', name: 'Nhắn tin được chỉ định', icon: <TbMessage />, comingSoon: true, description: 'Gửi tin nhắn theo nội dung định sẵn' },
                { id: 'reply_comment', name: 'Trả lời Comment chỉ định', icon: <TbMessage />, comingSoon: true, description: 'Tự động trả lời comment' },
                { id: 'increase_view', name: 'Tăng Lượt Xem Sản Phẩm', icon: <TbEye />, comingSoon: true, description: 'Tăng view cho sản phẩm' }
            ]
        },
        {
            id: 'account_features',
            title: 'Chức năng tài khoản',
            icon: <TbSettings />,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            description: 'Quản lý và tùy chỉnh tài khoản',
            actions: [
                { id: 'check_balance', name: 'Kiểm tiền', icon: <TbWallet />, comingSoon: true, description: 'Kiểm tra số dư tài khoản' },
                { id: 'create_post', name: 'Tạo bài viết', icon: <TbEdit />, available: true, description: 'Đăng bài viết mới' },
                { id: 'update_avatar', name: 'Cập nhật Ảnh đại diện', icon: <TbPhoto />, available: true, description: 'Thay đổi avatar tài khoản' },
                { id: 'change_name', name: 'Đổi tên', icon: <TbEdit />, available: true, description: 'Cập nhật tên hiển thị' },
                { id: 'change_bio', name: 'Đổi tiểu sử', icon: <TbFileText />, available: true, description: 'Chỉnh sửa bio cá nhân' },
                { id: 'interact_friends', name: 'Tương tác bạn bè', icon: <TbUsers />, available: true, description: 'Tương tác với danh sách bạn bè' },
                { id: 'auto_tools', name: 'Công khai lượt thích', icon: <TbThumbUp />, comingSoon: true, description: 'Tự động công khai lượt thích' },
                { id: 'rest', name: 'Nghỉ', icon: <TbClock />, comingSoon: true, description: 'Tạm dừng hoạt động' },
                { id: 'check_health', name: 'Kiểm tra sức khỏe', icon: <TbPhone />, comingSoon: true, description: 'Kiểm tra trạng thái tài khoản' }
            ]
        }
    ]

    // Filter actions based on search and availability
    const filteredCategories = useMemo(() => {
        return actionCategories.map(category => ({
            ...category,
            actions: category.actions.filter(action => {
                const matchesSearch = action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   action.description?.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesAvailability = showOnlyAvailable ? action.available : true
                return matchesSearch && matchesAvailability
            })
        })).filter(category => category.actions.length > 0)
    }, [searchTerm, showOnlyAvailable])

    // Statistics
    const stats = useMemo(() => {
        const totalActions = actionCategories.reduce((sum, cat) => sum + cat.actions.length, 0)
        const availableActions = actionCategories.reduce((sum, cat) => 
            sum + cat.actions.filter(action => action.available).length, 0)
        const comingSoonActions = totalActions - availableActions
        
        return { totalActions, availableActions, comingSoonActions }
    }, [])

    const selectedCategoryData = actionCategories.find(cat => cat.id === selectedCategory)

    const handleActionSelect = (action) => {
        if (!action.available && action.comingSoon) {
            return // Không cho phép chọn action "Coming Soon"
        }
        
        if (onSelectAction) {
            onSelectAction(action, selectedScenario)
        }
        onClose()
    }

    const clearFilters = () => {
        setSearchTerm('')
        setShowOnlyAvailable(false)
    }

    // Tooltip component
    const Tooltip = ({ children, content, show }) => (
        <div className="relative inline-block">
            {children}
            {show && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
                    {content}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
            )}
        </div>
    )

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width="90vw"
            maxWidth={1200}
            className="z-[70]"
        >
            <div className="flex flex-col h-full max-h-[85vh] min-h-[50vh]">
                {/* Enhanced Header */}
                <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg ${styles.floatingIcon}`}>
                                    <TbSparkles className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                                    Danh sách hành động
                                </h4>
                                <div className={`${styles.floatingIcon} ml-2`} style={{ animationDelay: '1s' }}>
                                    <TbBolt className="w-5 h-5 text-yellow-500" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
                                Chọn hành động để thêm vào kịch bản <span className="font-semibold text-blue-600 dark:text-blue-400">"{selectedScenario?.name}"</span>
                            </p>
                        </div>
                        
                        {/* Statistics */}
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                <TbCheck className="text-green-500" size={18} />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {stats.availableActions}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">sẵn sàng</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                <TbClock className="text-orange-500" size={18} />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {stats.comingSoonActions}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">sắp có</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 lg:p-6 max-h-48 lg:max-h-full overflow-y-auto">
                        {/* Search and Filter */}
                        <div className="space-y-4 mb-6">
                            <div className="relative">
                                <Input
                                    placeholder="🔍 Tìm kiếm hành động..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-4 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-xl"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <TbX size={18} />
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showOnlyAvailable}
                                        onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chỉ hiển thị sẵn sàng
                                    </span>
                                </label>
                                
                                {(searchTerm || showOnlyAvailable) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category Navigation */}
                        <div className="space-y-3">
                            <h6 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                Danh mục hành động
                            </h6>
                            {actionCategories.map((category) => {
                                const categoryStats = {
                                    total: category.actions.length,
                                    available: category.actions.filter(a => a.available).length,
                                    filtered: filteredCategories.find(c => c.id === category.id)?.actions.length || 0
                                }
                                
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`${styles.categoryButton} w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 group ${
                                            selectedCategory === category.id
                                                ? `${category.color} text-white shadow-lg shadow-${category.color.split('-')[1]}-200 dark:shadow-${category.color.split('-')[1]}-900/30 scale-[1.02]`
                                                : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:shadow-md hover:scale-[1.01]'
                                        }`}
                                    >
                                        <div className={`p-3 rounded-lg transition-all duration-300 ${
                                            selectedCategory === category.id 
                                                ? 'bg-white/20 shadow-inner' 
                                                : `${category.color} text-white group-hover:scale-110`
                                        }`}>
                                            {category.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate mb-1">
                                                {category.title}
                                            </div>
                                            <div className={`text-xs mb-1 ${
                                                selectedCategory === category.id 
                                                    ? 'text-white/90' 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {category.description}
                                            </div>
                                            <div className={`text-xs font-medium ${
                                                selectedCategory === category.id 
                                                    ? 'text-white/80' 
                                                    : 'text-gray-600 dark:text-gray-300'
                                            }`}>
                                                {(searchTerm || showOnlyAvailable) ? (
                                                    `${categoryStats.filtered} kết quả`
                                                ) : (
                                                    `${categoryStats.available}/${categoryStats.total} sẵn sàng`
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-4 lg:p-6 overflow-y-auto min-h-0 max-h-full">
                        {filteredCategories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6">
                                    <TbSearch size={32} className="text-gray-400" />
                                </div>
                                <h6 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-3">
                                    Không tìm thấy hành động
                                </h6>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mb-6">
                                    {searchTerm 
                                        ? `Không có hành động nào khớp với từ khóa "${searchTerm}"`
                                        : 'Không có hành động nào phù hợp với bộ lọc hiện tại'
                                    }
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {(searchTerm || showOnlyAvailable ? filteredCategories : [selectedCategoryData]).filter(Boolean).map((category) => (
                                    <div key={category.id} className="space-y-6">
                                        {(searchTerm || showOnlyAvailable) && (
                                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                                                <div className={`${category.color} text-white p-3 rounded-xl shadow-lg`}>
                                                    {category.icon}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                        {category.title}
                                                    </h5>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {category.description}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {category.actions.map((action, index) => (
                                                <div
                                                    key={action.id}
                                                    className={`${styles.actionCard} group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                        action.comingSoon 
                                                            ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed' 
                                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:-translate-y-2 active:translate-y-0 active:shadow-lg'
                                                    } ${hoveredAction === action.id ? styles.pulseAnimation : ''}`}
                                                    onClick={() => handleActionSelect(action)}
                                                    onMouseEnter={() => setHoveredAction(action.id)}
                                                    onMouseLeave={() => setHoveredAction(null)}
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    {/* Action Icon & Status */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <Tooltip 
                                                            content={action.description} 
                                                            show={hoveredAction === action.id && !action.comingSoon}
                                                        >
                                                            <div className={`p-3 rounded-xl transition-all duration-300 ${
                                                                action.comingSoon 
                                                                    ? 'bg-gray-200 dark:bg-gray-700' 
                                                                    : `${category.color} shadow-lg group-hover:shadow-xl group-hover:scale-110`
                                                            }`}>
                                                                <span className={`text-2xl ${
                                                                    action.comingSoon 
                                                                        ? 'text-gray-400 dark:text-gray-500' 
                                                                        : 'text-white'
                                                                }`}>
                                                                    {action.icon}
                                                                </span>
                                                            </div>
                                                        </Tooltip>
                                                        
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                                                                action.comingSoon 
                                                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
                                                                    : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                            }`}>
                                                                {action.comingSoon ? '🚧 Sắp có' : '✅ Sẵn sàng'}
                                                            </span>
                                                            
                                                            {!action.comingSoon && (
                                                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                                    <TbStar className="text-yellow-500" size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Info */}
                                                    <div className="space-y-3">
                                                        <h6 className={`font-bold text-base leading-tight ${
                                                            action.comingSoon 
                                                                ? 'text-gray-400 dark:text-gray-500' 
                                                                : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                                        }`}>
                                                            {action.name}
                                                        </h6>
                                                        
                                                        <p className={`text-sm leading-relaxed ${
                                                            action.comingSoon 
                                                                ? 'text-gray-400 dark:text-gray-500' 
                                                                : 'text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                            {action.description}
                                                        </p>
                                                        
                                                        {!action.comingSoon && (
                                                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 pt-2 border-t border-gray-100 dark:border-gray-700">
                                                                <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                                                                    Nhấn để chọn
                                                                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Hover Effect */}
                                                    {!action.comingSoon && (
                                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Footer */}
                <div className="p-4 lg:p-6 border-t border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                                Tổng cộng: <span className="font-bold text-gray-900 dark:text-gray-100">{stats.totalActions}</span> hành động
                            </span>
                            {(searchTerm || showOnlyAvailable) && (
                                <span>
                                    Hiển thị: <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {filteredCategories.reduce((sum, cat) => sum + cat.actions.length, 0)}
                                    </span> kết quả
                                </span>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="default"
                            onClick={onClose}
                            icon={<TbX />}
                            className="px-6 py-3 font-semibold"
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default ActionListModal