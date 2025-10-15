'use client'
import { useState, useMemo } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
    TbUsers,
    TbSettings,
    TbBell,
    TbSearch,
    TbX,
    TbCheck,
    TbClock,
    TbBolt,
    TbSparkles,
    TbNews,
    TbArticle,
    TbUsersGroup,
    TbSend,
    TbBrandFacebook,
    TbLogout,
    TbPhoto,
    TbMessage,
    TbUser,
    TbArrowBarToUp
} from 'react-icons/tb'
import styles from '@/app/(protected-pages)/concepts/tiktok-account-management/_components/ActionListModal.module.css'

// Danh mục hành động cho Facebook (khác TikTok)
const actionCategories = [
    {
        id: 'interaction',
        title: 'Tương tác',
        icon: <TbUsers />,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        description: 'Các hành động tương tác nội dung Facebook',
        actions: [
            { id: 'newsfeed_interaction', name: 'Tương tác Newsfeed', icon: <TbNews />, available: true, description: 'Lướt Newsfeed và tương tác theo tỉ lệ' },
            { id: 'specific_post_interaction', name: 'Tương tác bài viết chỉ định', icon: <TbArticle />, available: true, description: 'Thực hiện like/comment/share một bài viết cụ thể' },
            { id: 'interact_reel_specific', name: 'Tương tác reel chỉ định', icon: <TbSparkles />, comingSoon: true, description: 'Xem và tương tác reel cụ thể' },
            { id: 'group_interaction', name: 'Tương tác nhóm', icon: <TbUsersGroup />, available: true, description: 'Tương tác các bài trong nhóm' },
            { id: 'leave_group', name: 'Rời nhóm', icon: <TbLogout />, comingSoon: true, description: 'Rời khỏi các nhóm được chỉ định' },
        ]
    },
    {
        id: 'posting',
        title: 'Đăng bài / Share bài / Spam',
        icon: <TbSettings />,
        color: 'bg-emerald-500',
        bgColor: 'bg-emerald-50',
        description: 'Các hành động đăng bài lên Facebook',
        actions: [
            { id: 'post_to_timeline', name: 'Đăng bài lên tường', icon: <TbSend />, available: true, description: 'Đăng bài lên trang cá nhân' },
            { id: 'group_post_create', name: 'Đăng bài lên nhóm', icon: <TbSend />, available: true, description: 'Đăng bài theo mẫu vào nhiều nhóm' },
            { id: 'specific_post_create', name: 'Đăng bài chỉ định', icon: <TbArticle />, comingSoon: true, description: 'Đăng bài lên trang cá nhân/fanpage/nhóm chỉ định' },
            { id: 'spam_post', name: 'Spam bài viết', icon: <TbBell />, available: true, description: 'Spam bài viết theo mẫu' },
        ]
    },
    {
        id: 'seeding',
        title: 'Seeding',
        icon: <TbBell />,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        description: 'Các hành động seeding/nhắn tin',
        actions: [
            { id: 'messenger_fetch', name: 'Lấy tin nhắn messenger', icon: <TbMessage />, comingSoon: true, description: 'Đọc hộp thư Messenger' },
            { id: 'message_page_profile', name: 'Nhắn tin page, profile chỉ định', icon: <TbUser />, comingSoon: true, description: 'Nhắn tin tới trang/profile cụ thể' },
        ]
    },
    {
        id: 'profile_update',
        title: 'Đổi thông tin',
        icon: <TbUser />,
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50',
        description: 'Cập nhật thông tin hồ sơ',
        actions: [
            { id: 'upload_avatar', name: 'Up Avatar', icon: <TbPhoto />, comingSoon: true, description: 'Cập nhật ảnh đại diện' },
            { id: 'upload_cover', name: 'Up cover', icon: <TbArrowBarToUp />, comingSoon: true, description: 'Cập nhật ảnh bìa' },
        ]
    },
]

const FacebookActionListModal = ({ isOpen, onClose, onSelectAction, selectedScenario }) => {
    const [selectedCategory, setSelectedCategory] = useState('interaction')
    const [searchTerm, setSearchTerm] = useState('')
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
    const [hoveredAction, setHoveredAction] = useState(null)

    // Lọc theo search và trạng thái sẵn sàng
    const filteredCategories = useMemo(() => {
        return actionCategories.map(category => ({
            ...category,
            actions: category.actions.filter(action => {
                const matchesSearch = action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (action.description || '').toLowerCase().includes(searchTerm.toLowerCase())
                const matchesAvailability = showOnlyAvailable ? action.available : true
                return matchesSearch && matchesAvailability
            })
        })).filter(category => category.actions.length > 0)
    }, [searchTerm, showOnlyAvailable])

    // Thống kê
    const stats = useMemo(() => {
        const totalActions = actionCategories.reduce((sum, cat) => sum + cat.actions.length, 0)
        const availableActions = actionCategories.reduce((sum, cat) =>
            sum + cat.actions.filter(action => action.available).length, 0)
        const comingSoonActions = totalActions - availableActions
        return { totalActions, availableActions, comingSoonActions }
    }, [])

    const selectedCategoryData = actionCategories.find(cat => cat.id === selectedCategory)

    const handleActionSelect = (action) => {
        if (!action.available && action.comingSoon) return
        onSelectAction?.(action, selectedScenario)
        onClose?.()
    }

    const clearFilters = () => {
        setSearchTerm('')
        setShowOnlyAvailable(false)
    }

    // Tooltip đơn giản
    const Tooltip = ({ children, content, show }) => (
        <div className="relative inline-block">
            {children}
            {show && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
                    {content}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                </div>
            )}
        </div>
    )

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width="90vw" maxWidth={1200} className="z-[70]">
            <div className="flex flex-col h-full max-h-[85vh] min-h-[50vh]">
                {/* Header giống TikTok */}
                <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg ${styles.floatingIcon}`}>
                                <TbBrandFacebook className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-bold text-2xl text-gray-900 dark:text-gray-100">Danh sách hành động (Facebook)</h4>
                            <div className={`${styles.floatingIcon} ml-2`} style={{ animationDelay: '1s' }}>
                                <TbBolt className="w-5 h-5 text-yellow-500" />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                <TbCheck className="text-green-500" size={18} />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{stats.availableActions}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">sẵn sàng</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                <TbClock className="text-orange-500" size={18} />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{stats.comingSoonActions}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">sắp có</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
                    {/* Sidebar giống TikTok */}
                    <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 lg:p-6 max-h-48 lg:max-h-full overflow-y-auto">
                        <div className="space-y-4 mb-6">
                            <div className="relative">
                                <Input placeholder="🔍 Tìm kiếm hành động..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-4 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-xl" />
                                {searchTerm && (
                                    <button onClick={()=>setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><TbX size={18} /></button>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={showOnlyAvailable} onChange={(e)=>setShowOnlyAvailable(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chỉ hiển thị sẵn sàng</span>
                                </label>
                                {(searchTerm || showOnlyAvailable) && (
                                    <button onClick={()=>{ setSearchTerm(''); setShowOnlyAvailable(false) }} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Xóa bộ lọc</button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h6 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Danh mục hành động</h6>
                            {actionCategories.map(category => {
                                const categoryStats = {
                                    total: category.actions.length,
                                    available: category.actions.filter(a => a.available).length,
                                    filtered: filteredCategories.find(c => c.id === category.id)?.actions.length || 0
                                }
                                return (
                                    <button key={category.id} onClick={()=>setSelectedCategory(category.id)} className={`${styles.categoryButton} w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 group ${selectedCategory===category.id ? `${category.color} text-white shadow-lg scale-[1.02]` : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:shadow-md hover:scale-[1.01]'}`}>
                                        <div className={`p-3 rounded-lg transition-all duration-300 ${selectedCategory===category.id ? 'bg-white/20 shadow-inner' : `${category.color} text-white group-hover:scale-110`}`}>{category.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate mb-1">{category.title}</div>
                                            <div className={`text-xs mb-1 ${selectedCategory===category.id ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>{category.description}</div>
                                            <div className={`text-xs font-medium ${selectedCategory===category.id ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {(searchTerm || showOnlyAvailable) ? `${categoryStats.filtered} kết quả` : `${categoryStats.available}/${categoryStats.total} sẵn sàng`}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Main content giống TikTok */}
                    <div className="flex-1 p-4 lg:p-6 overflow-y-auto min-h-0 max-h-full">
                        {filteredCategories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6">
                                    <TbSearch size={32} className="text-gray-400" />
                                </div>
                                <h6 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-3">Không tìm thấy hành động</h6>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mb-6">{searchTerm ? `Không có hành động nào khớp với từ khóa "${searchTerm}"` : 'Không có hành động nào phù hợp với bộ lọc hiện tại'}</p>
                                <button onClick={clearFilters} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">Xóa tất cả bộ lọc</button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {(searchTerm || showOnlyAvailable ? filteredCategories : [selectedCategoryData]).filter(Boolean).map((category) => (
                                    <div key={category.id} className="space-y-6">
                                        {(searchTerm || showOnlyAvailable) && (
                                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                                                <div className={`${category.color} text-white p-3 rounded-xl shadow-lg`}>{category.icon}</div>
                                                <div>
                                                    <h5 className="font-bold text-lg text-gray-900 dark:text-gray-100">{category.title}</h5>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {category.actions.map((action, index) => (
                                                <div key={action.id} className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${action.comingSoon ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-2'}`} onClick={() => handleActionSelect(action)} style={{ animationDelay: `${index*0.1}s` }}>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={`p-3 rounded-xl ${action.comingSoon ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-500 text-white shadow-lg'}`}>{action.icon}</div>
                                                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${action.comingSoon ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>{action.comingSoon ? '🚧 Sắp có' : '✅ Sẵn sàng'}</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h6 className={`font-bold text-base ${action.comingSoon ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>{action.name}</h6>
                                                        <p className={`text-sm ${action.comingSoon ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>{action.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 lg:p-6 border-t border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <span> Tổng cộng: <span className="font-bold text-gray-900 dark:text-gray-100">{stats.totalActions}</span> hành động </span>
                            {(searchTerm || showOnlyAvailable) && (
                                <span> Hiển thị: <span className="font-bold text-blue-600 dark:text-blue-400">{filteredCategories.reduce((sum, cat) => sum + cat.actions.length, 0)}</span> kết quả </span>
                            )}
                        </div>
                        <Button type="button" variant="default" onClick={onClose} icon={<TbX />} className="px-6 py-3 font-semibold">Đóng</Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default FacebookActionListModal
