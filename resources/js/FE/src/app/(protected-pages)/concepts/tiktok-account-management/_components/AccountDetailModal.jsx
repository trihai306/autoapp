'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import getTiktokAccount from '@/server/actions/tiktok-account/getTiktokAccount'
import getTiktokAccountActivityHistory from '@/server/actions/tiktok-account/getTiktokAccountActivityHistory'
import { 
    HiOutlineUser as User,
    HiOutlineCalendar as Calendar,
    HiOutlineLocationMarker as MapPin,
    HiOutlineLink as Link,
    HiOutlineHeart as Heart,
    HiOutlineUsers as Users,
    HiOutlineVideoCamera as Video,
    HiOutlineEye as Eye,
    HiOutlineTrendingUp as TrendingUp,
    HiOutlineShieldCheck as Shield,
    HiOutlineCog as Settings,
    HiOutlineBell as Bell,
    HiOutlineDesktopComputer as Bot,
    HiOutlineSave as Save,
    HiOutlineRefresh as RotateCcw,
    HiOutlineDownload as Download,
    HiOutlineLightningBolt as Activity,
    HiOutlineClock as Clock,
    HiOutlineCheckCircle as CheckCircle,
    HiOutlineExclamationCircle as AlertCircle,
    HiOutlineX as X,
    HiOutlinePencilAlt as Edit,
    HiOutlinePlay as Play,
    HiOutlinePause as Pause,
    HiOutlineKey as Key
} from 'react-icons/hi'
import { HiOutlineRefresh as Refresh } from 'react-icons/hi'

const AccountDetailModal = ({ isOpen, onClose, account }) => {
    const t = useTranslations('tiktokAccountManagement.accountDetailModal')
    const [activeTab, setActiveTab] = useState('overview')
    const [accountData, setAccountData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [activityHistory, setActivityHistory] = useState([])
    const [activityLoading, setActivityLoading] = useState(false)
    const [activityError, setActivityError] = useState(null)
    const [activityPagination, setActivityPagination] = useState(null)

    // Fetch account details when modal opens and account ID is provided
    useEffect(() => {
        if (isOpen && account?.id) {
            fetchAccountDetails()
        }
    }, [isOpen, account?.id])

    // Fetch activity history when switching to activity tab
    useEffect(() => {
        if (isOpen && account?.id && activeTab === 'activity') {
            fetchActivityHistory()
        }
    }, [isOpen, account?.id, activeTab])

    const fetchAccountDetails = async () => {
        if (!account?.id) return
        
        setLoading(true)
        setError(null)
        
        try {
            const result = await getTiktokAccount(account.id)
            
            if (result.success) {
                setAccountData(result.data)
            } else {
                setError(result.message || t('errorLoading'))
            }
        } catch (err) {
            console.error('Error fetching account details:', err)
            setError(t('errorLoading'))
        } finally {
            setLoading(false)
        }
    }

    const fetchActivityHistory = async (page = 1, filters = {}) => {
        if (!account?.id) return
        
        setActivityLoading(true)
        setActivityError(null)
        
        try {
            const params = {
                page,
                per_page: 20,
                ...filters
            }
            
            const result = await getTiktokAccountActivityHistory(account.id, params)
            
            if (result.success) {
                setActivityHistory(result.data.activities)
                setActivityPagination(result.data.pagination)
            } else {
                setActivityError(result.message || t('errorLoading'))
            }
        } catch (err) {
            console.error('Error fetching activity history:', err)
            setActivityError(t('errorLoading'))
        } finally {
            setActivityLoading(false)
        }
    }

    // Use fetched data if available, fallback to passed account prop
    const displayAccount = accountData || account

    if (!account) return null

    const tabs = [
        { id: 'overview', label: t('tabs.overview'), icon: User },
        { id: 'stats', label: t('tabs.stats'), icon: TrendingUp },
        { id: 'activity', label: t('tabs.activity'), icon: Activity },
        { id: 'security', label: t('tabs.security'), icon: Shield },

    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            case 'running':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            case 'error':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return t('status.active')
            case 'inactive':
                return t('status.inactive')
            case 'suspended':
                return t('status.suspended')
            case 'running':
                return t('status.running')
            case 'error':
                return t('status.error')
            default:
                return t('status.unknown')
        }
    }

    const renderOverview = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">{t('loading')}</span>
                </div>
            )
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                    <Button variant="outline" size="sm" onClick={fetchAccountDetails}>
                        {t('retry')}
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {/* Profile Info */}
                <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {displayAccount.username?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                @{displayAccount.username}
                            </h3>
                            <Badge className={getStatusColor(displayAccount.status)}>
                                {getStatusText(displayAccount.status)}
                            </Badge>
                            {displayAccount.two_factor_enabled && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <Shield className="w-3 h-3 mr-1" />
                                    2FA
                                </Badge>
                            )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {displayAccount.display_name || displayAccount.nickname || t('overview.noDisplayName')}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{t('overview.joinDate', { date: displayAccount.join_date || t('overview.undetermined') })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{t('overview.lastActivity', { date: displayAccount.last_activity || t('overview.noActivity') })}</span>
                            </div>
                            {displayAccount.email && (
                                <div className="flex items-center gap-1">
                                    <Link className="w-4 h-4" />
                                    <span>{displayAccount.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {displayAccount.follower_count?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('overview.followers')}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <Heart className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {displayAccount.heart_count?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('overview.likes')}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <Video className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {displayAccount.video_count?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('overview.videos')}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <Eye className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {displayAccount.estimated_views?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('overview.estimatedViews')}</div>
                    </div>
                </div>

                {/* Current Tasks */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {t('overview.currentTasks')}
                        </h4>
                        {displayAccount.task_statistics && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {t('overview.runningTasks', { count: displayAccount.task_statistics.running_tasks_count })}, {t('overview.pendingTasks', { count: displayAccount.task_statistics.pending_tasks_count })}
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        {/* Running Tasks */}
                        {displayAccount.running_tasks?.map((task) => {
                            // Calculate progress based on task status and timing
                            const getTaskProgress = (task) => {
                                if (task.status === 'completed') return 100
                                if (task.status === 'failed') return 0
                                if (task.status === 'running') {
                                    // Estimate progress based on how long it's been running
                                    if (task.started_at) {
                                        const startTime = new Date(task.started_at)
                                        const now = new Date()
                                        const elapsed = (now - startTime) / 1000 / 60 // minutes
                                        return Math.min(Math.floor(elapsed * 10), 90) // Max 90% for running tasks
                                    }
                                    return 50 // Default for running tasks
                                }
                                return 0
                            }
                            
                            const progress = getTaskProgress(task)
                            
                            return (
                                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                            {getTaskTypeText(task.task_type)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            {t('overview.priority', { priority: getPriorityText(task.priority) })} • {t('overview.startedAt', { time: task.started_at ? new Date(task.started_at).toLocaleString() : t('overview.undetermined') })}
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full bg-blue-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {progress}%
                                    </span>
                                </div>
                            )
                        })}
                        
                        {/* Pending Tasks */}
                        {displayAccount.pending_tasks?.slice(0, 3).map((task) => (
                            <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {getTaskTypeText(task.task_type)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {t('overview.priority', { priority: getPriorityText(task.priority) })} • {t('overview.scheduledAt', { time: task.scheduled_at ? new Date(task.scheduled_at).toLocaleString() : t('overview.immediately') })}
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="h-2 rounded-full bg-gray-400" style={{ width: '0%' }} />
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('overview.pending')}
                                </span>
                            </div>
                        ))}
                        
                        {/* No tasks message */}
                        {(!displayAccount.running_tasks?.length && !displayAccount.pending_tasks?.length) && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {t('overview.noTasks')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const renderStats = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">{t('loading')}</span>
                </div>
            )
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                    <Button variant="outline" size="sm" onClick={fetchAccountDetails}>
                        {t('retry')}
                    </Button>
                </div>
            )
        }

        // Calculate statistics
        const stats = displayAccount.task_statistics || {}
        const totalTasks = stats.total_tasks_count || 0
        const completedTasks = stats.completed_tasks_count || 0
        const failedTasks = stats.failed_tasks_count || 0
        const successRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
        
        // Calculate account age
        const accountAge = displayAccount.created_at ? 
            Math.floor((new Date() - new Date(displayAccount.created_at)) / (1000 * 60 * 60 * 24)) : 0
        
        // Calculate average tasks per day
        const averageTasksPerDay = accountAge > 0 ? (totalTasks / accountAge).toFixed(1) : 0
        
        // Calculate engagement rate (likes per follower)
        const engagementRate = displayAccount.follower_count > 0 ? 
            ((displayAccount.heart_count / displayAccount.follower_count) * 100).toFixed(2) : 0
        
        // Calculate average views per video
        const averageViewsPerVideo = displayAccount.video_count > 0 ? 
            Math.floor(displayAccount.estimated_views / displayAccount.video_count) : 0

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('stats.title')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('stats.description')}
                    </p>
                </div>

                {/* Performance Overview */}
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t('stats.sections.performance')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {totalTasks.toLocaleString()}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">{t('stats.metrics.totalTasks')}</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {completedTasks.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">{t('stats.metrics.completedTasks')}</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                                {failedTasks.toLocaleString()}
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400">{t('stats.metrics.failedTasks')}</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                {successRate}%
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">{t('stats.metrics.successRate')}</div>
                        </div>
                    </div>
                </div>

                {/* Task Analysis */}
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t('stats.sections.taskAnalysis')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Task Status Breakdown */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                                {t('stats.charts.taskStatusBreakdown')}
                            </h5>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('activity.summary.completed')}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {completedTasks} ({totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0}%)
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('activity.summary.failed')}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {failedTasks} ({totalTasks > 0 ? ((failedTasks / totalTasks) * 100).toFixed(1) : 0}%)
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('activity.summary.running')}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {stats.running_tasks_count || 0}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('activity.summary.pending')}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {stats.pending_tasks_count || 0}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Metrics hiệu suất
                            </h5>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.metrics.averageTasksPerDay')}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{averageTasksPerDay}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.metrics.accountAge')}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{accountAge} ngày</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.metrics.lastActiveTime')}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {displayAccount.last_activity || t('overview.noActivity')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Engagement Statistics */}
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t('stats.sections.engagement')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {(displayAccount.follower_count || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.metrics.totalFollowers')}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {(displayAccount.heart_count || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.metrics.totalLikes')}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {(displayAccount.video_count || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.metrics.totalVideos')}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {(displayAccount.estimated_views || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.metrics.totalViews')}</div>
                        </div>
                    </div>
                    
                    {/* Additional Engagement Metrics */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.metrics.engagementRate')}</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{engagementRate}%</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                                    style={{ width: `${Math.min(engagementRate, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.metrics.averageViewsPerVideo')}</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{averageViewsPerVideo.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Dựa trên {displayAccount.video_count || 0} videos
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Rate Visualization */}
                {totalTasks > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Tỷ lệ thành công tổng thể
                        </h5>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Tiến độ hoàn thành</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{successRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div 
                                    className="h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                                    style={{ width: `${successRate}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <span>{completedTasks} thành công</span>
                                <span>{failedTasks} thất bại</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Helper functions for task types and priorities
    const getTaskTypeText = (taskType) => {
        const taskTypes = {
            'follow_user': t('activity.taskTypes.follow_user'),
            'unfollow_user': t('activity.taskTypes.unfollow_user'),
            'like_video': t('activity.taskTypes.like_video'),
            'unlike_video': t('activity.taskTypes.unlike_video'),
            'comment_video': t('activity.taskTypes.comment_video'),
            'share_video': t('activity.taskTypes.share_video'),
            'view_video': t('activity.taskTypes.view_video'),
            'create_post': t('activity.taskTypes.create_post'),
            'live_interaction': t('activity.taskTypes.live_interaction'),
            'message_user': t('activity.taskTypes.message_user')
        }
        return taskTypes[taskType] || taskType?.replace(/_/g, ' ') || t('activity.taskTypes.unknown')
    }

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'high':
                return t('activity.priority.high')
            case 'medium':
                return t('activity.priority.medium')
            case 'low':
                return t('activity.priority.low')
            default:
                return t('activity.priority.unknown')
        }
    }

    const renderActivity = () => {
        // Use API data for activity history
        const allActivities = activityHistory || []

        const getTaskStatusIcon = (status) => {
            switch (status) {
                case 'completed':
                    return <CheckCircle className="w-4 h-4 text-green-500" />
                case 'failed':
                    return <AlertCircle className="w-4 h-4 text-red-500" />
                case 'running':
                    return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                case 'pending':
                    return <Clock className="w-4 h-4 text-gray-400" />
                default:
                    return <Clock className="w-4 h-4 text-gray-400" />
            }
        }

        const getTaskStatusText = (status) => {
            switch (status) {
                case 'completed':
                    return t('activity.taskStatus.completed')
                case 'failed':
                    return t('activity.taskStatus.failed')
                case 'running':
                    return t('activity.taskStatus.running')
                case 'pending':
                    return t('activity.taskStatus.pending')
                default:
                    return t('activity.taskStatus.unknown')
            }
        }



        const getPriorityColor = (priority) => {
            switch (priority) {
                case 'high':
                    return 'text-red-600 dark:text-red-400'
                case 'medium':
                    return 'text-yellow-600 dark:text-yellow-400'
                case 'low':
                    return 'text-green-600 dark:text-green-400'
                default:
                    return 'text-gray-600 dark:text-gray-400'
            }
        }



        const getRelativeTime = (dateString) => {
            const date = new Date(dateString)
            const now = new Date()
            const diffInMinutes = Math.floor((now - date) / (1000 * 60))
            
            if (diffInMinutes < 1) return t('activity.timeAgo.justNow')
            if (diffInMinutes < 60) return t('activity.timeAgo.minutesAgo', { minutes: diffInMinutes })
            
            const diffInHours = Math.floor(diffInMinutes / 60)
            if (diffInHours < 24) return t('activity.timeAgo.hoursAgo', { hours: diffInHours })
            
            const diffInDays = Math.floor(diffInHours / 24)
            if (diffInDays < 7) return t('activity.timeAgo.daysAgo', { days: diffInDays })
            
            return date.toLocaleDateString()
        }

        if (activityLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">{t('loadingHistory')}</span>
                </div>
            )
        }

        if (activityError) {
            return (
                <div className="text-center py-12">
                    <div className="text-red-600 dark:text-red-400 mb-4">{activityError}</div>
                    <Button variant="outline" size="sm" onClick={() => fetchActivityHistory()}>
                        {t('retry')}
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {/* Activity Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {displayAccount.task_statistics?.completed_tasks_count || 0}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">{t('activity.summary.completed')}</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                        <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {displayAccount.task_statistics?.running_tasks_count || 0}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">{t('activity.summary.running')}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {displayAccount.task_statistics?.pending_tasks_count || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{t('activity.summary.pending')}</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                            {displayAccount.task_statistics?.failed_tasks_count || 0}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400">{t('activity.summary.failed')}</div>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {t('activity.timeline.title')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t('activity.timeline.description')}
                        </p>
                    </div>
                    
                    <div className="p-6">
                        {allActivities.length > 0 ? (
                            <div className="space-y-4">
                                {allActivities.map((activity, index) => (
                                    <div key={activity.id || index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex-shrink-0 mt-1">
                                            {getTaskStatusIcon(activity.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {getTaskTypeText(activity.task_type)}
                                                </h4>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {getRelativeTime(activity.completed_at || activity.started_at || activity.scheduled_at || activity.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className={`font-medium ${
                                                    activity.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                                                    activity.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                                                    activity.status === 'running' ? 'text-blue-600 dark:text-blue-400' :
                                                    'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                    {getTaskStatusText(activity.status)}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400">•</span>
                                                <span className={`text-xs ${getPriorityColor(activity.priority)}`}>
                                                    {t('overview.priority', { priority: getPriorityText(activity.priority) })}
                                                </span>
                                            </div>
                                            {activity.error_message && (
                                                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                                    {activity.error_message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Pagination */}
                                {activityPagination && activityPagination.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('activity.timeline.pagination.showing', { 
                                                from: activityPagination.from, 
                                                to: activityPagination.to, 
                                                total: activityPagination.total 
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                disabled={activityPagination.current_page === 1}
                                                onClick={() => fetchActivityHistory(activityPagination.current_page - 1)}
                                            >
                                                {t('activity.timeline.pagination.previous')}
                                            </Button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {t('activity.timeline.pagination.page', { 
                                                    current: activityPagination.current_page, 
                                                    total: activityPagination.last_page 
                                                })}
                                            </span>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                disabled={activityPagination.current_page === activityPagination.last_page}
                                                onClick={() => fetchActivityHistory(activityPagination.current_page + 1)}
                                            >
                                                {t('activity.timeline.pagination.next')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    {t('activity.timeline.noActivity')}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t('activity.timeline.noActivityDescription')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const renderSecurity = () => (
        <div className="space-y-6">
            {/* 2FA Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            displayAccount.two_factor_enabled 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                            <Shield className={`w-5 h-5 ${
                                displayAccount.two_factor_enabled 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-gray-400'
                            }`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {t('security.twoFactor.title')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('security.twoFactor.description')}
                            </p>
                        </div>
                    </div>
                    <Badge className={displayAccount.two_factor_enabled 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }>
                        {displayAccount.two_factor_enabled ? t('security.twoFactor.enabled') : t('security.twoFactor.disabled')}
                    </Badge>
                </div>
                
                {displayAccount.two_factor_enabled && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>{t('security.twoFactor.enabledMessage')}</span>
                        </div>
                        
                        {displayAccount.two_factor_backup_codes && displayAccount.two_factor_backup_codes.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {t('security.twoFactor.backupCodes')}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    {t('security.twoFactor.backupCodesAvailable', { count: displayAccount.two_factor_backup_codes.length })}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {displayAccount.two_factor_backup_codes.slice(0, 4).map((code, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-400">
                                            {code.replace(/(.{4})/g, '$1-').slice(0, -1)}
                                        </div>
                                    ))}
                                </div>
                                {displayAccount.two_factor_backup_codes.length > 4 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {t('security.twoFactor.moreBackupCodes', { count: displayAccount.two_factor_backup_codes.length - 4 })}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {!displayAccount.two_factor_enabled && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>{t('security.twoFactor.disabledMessage')}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('security.twoFactor.recommendation')}
                        </p>
                    </div>
                )}
            </div>

            {/* Security Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {t('security.securityInfo.title')}
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('security.securityInfo.phoneNumber')}</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                            {displayAccount.phone_number ? 
                                displayAccount.phone_number.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3') : 
                                t('security.securityInfo.notUpdated')
                            }
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('security.securityInfo.email')}</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                            {displayAccount.email ? 
                                displayAccount.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 
                                t('security.securityInfo.notUpdated')
                            }
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('security.securityInfo.lastLogin')}</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                            {displayAccount.last_login_at ? 
                                new Date(displayAccount.last_login_at).toLocaleString() : 
                                t('security.securityInfo.notLoggedIn')
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderSettings = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">{t('loading')}</span>
                </div>
            )
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                    <Button variant="outline" size="sm" onClick={fetchAccountDetails}>
                        {t('retry')}
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('settings.title')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('settings.description')}
                    </p>
                </div>

                {/* Profile Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t('settings.sections.profile')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('settings.profile.displayName')}
                            </label>
                            <input
                                type="text"
                                value={displayAccount.nickname || displayAccount.username || ''}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('settings.profile.language')}
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">English</option>
                                <option value="zh">中文</option>
                                <option value="es">Español</option>
                                <option value="ar">العربية</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('settings.profile.timezone')}
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
                                <option value="America/New_York">America/New_York (UTC-5)</option>
                                <option value="Europe/London">Europe/London (UTC+0)</option>
                                <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('settings.profile.location')}
                            </label>
                            <input
                                type="text"
                                placeholder="Nhập vị trí..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {t('settings.sections.privacy')}
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.privacy.accountType')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Kiểm soát ai có thể xem nội dung của bạn
                                </p>
                            </div>
                            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                <option value="public">{t('settings.privacy.public')}</option>
                                <option value="private">{t('settings.privacy.private')}</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.privacy.allowComments')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Cho phép người khác bình luận video
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.privacy.allowDuets')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Cho phép người khác tạo duet với video
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.privacy.allowDownloads')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Cho phép tải xuống video
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.privacy.whoCanMessage')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Kiểm soát ai có thể gửi tin nhắn
                                </p>
                            </div>
                            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                <option value="everyone">{t('settings.privacy.everyone')}</option>
                                <option value="friends">{t('settings.privacy.friends')}</option>
                                <option value="nobody">{t('settings.privacy.nobody')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Automation Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        {t('settings.sections.automation')}
                    </h4>
                    <div className="space-y-6">
                        {/* Enable Automation */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div>
                                <label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    {t('settings.automation.enableAutomation')}
                                </label>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Bật/tắt tất cả tính năng tự động hóa
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* Auto Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.automation.autoFollow')}
                                </label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.automation.autoLike')}
                                </label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.automation.autoComment')}
                                </label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.automation.autoShare')}
                                </label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Daily Limits */}
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                {t('settings.automation.dailyLimits')}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('settings.automation.followLimit')}
                                    </label>
                                    <input
                                        type="number"
                                        defaultValue="50"
                                        min="0"
                                        max="200"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('settings.automation.likeLimit')}
                                    </label>
                                    <input
                                        type="number"
                                        defaultValue="100"
                                        min="0"
                                        max="500"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('settings.automation.commentLimit')}
                                    </label>
                                    <input
                                        type="number"
                                        defaultValue="20"
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Timing Settings */}
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                Cài đặt thời gian
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('settings.automation.delayBetweenActions')} (giây)
                                    </label>
                                    <input
                                        type="number"
                                        defaultValue="30"
                                        min="10"
                                        max="300"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('settings.automation.randomDelay')} (±giây)
                                    </label>
                                    <input
                                        type="number"
                                        defaultValue="15"
                                        min="0"
                                        max="60"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Working Hours */}
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                {t('settings.automation.workingHours')}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bắt đầu
                                    </label>
                                    <input
                                        type="time"
                                        defaultValue="09:00"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Kết thúc
                                    </label>
                                    <input
                                        type="time"
                                        defaultValue="18:00"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        {t('settings.sections.notifications')}
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.notifications.emailNotifications')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Nhận thông báo qua email
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.notifications.taskCompleted')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Thông báo khi tác vụ hoàn thành
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.notifications.taskFailed')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Thông báo khi tác vụ thất bại
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.notifications.dailyReports')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Báo cáo hoạt động hàng ngày
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.notifications.accountWarnings')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Cảnh báo bảo mật tài khoản
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* API Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        {t('settings.sections.api')}
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('settings.api.rateLimit')}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {t('settings.api.requestsPerMinute')}
                                    </label>
                                    <input
                                        type="number"
                                        defaultValue="60"
                                        min="1"
                                        max="300"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {t('settings.api.requestsPerHour')}
                                    </label>
                                    <input
                                        type="number"
                                        defaultValue="1000"
                                        min="1"
                                        max="5000"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {t('settings.api.requestsPerDay')}
                                    </label>
                                    <input
                                        type="number"
                                        defaultValue="10000"
                                        min="1"
                                        max="50000"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('settings.api.webhookUrl')}
                            </label>
                            <input
                                type="url"
                                placeholder="https://your-webhook-url.com/endpoint"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('settings.api.debugMode')}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Bật chế độ debug cho API
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        {t('settings.actions.save')}
                    </Button>
                    <Button variant="outline" className="flex-1">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {t('settings.actions.reset')}
                    </Button>
                    <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        {t('settings.actions.export')}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={900}
            className="z-[60]"
            closable={false}
        >
            <div className="flex flex-col h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t('title')}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={fetchAccountDetails}
                                disabled={loading}
                                className="p-2"
                            >
                                <Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {t('refresh')}
                            </div>
                        </div>
                        <div className="relative group">
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="p-2"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {t('edit')}
                            </div>
                        </div>
                        <div className="relative group">
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="p-2"
                            >
                                <Play className="w-4 h-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {t('start')}
                            </div>
                        </div>
                        <div className="relative group">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onClose}
                                className="p-2"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {t('close')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'stats' && renderStats()}
                    {activeTab === 'activity' && renderActivity()}
                    {activeTab === 'security' && renderSecurity()}

                </div>
            </div>
        </Dialog>
    )
}

export default AccountDetailModal
