import AnalyticDashboard from './_components/AnalyticDashboard'
import getAnalyticDashboard from '@/server/actions/analytic/getAnalyticDashboard'

const emptyMetric = { value: 0, growShrink: 0 };

const emptyAnalyticsData = {
    webAnalytic: { 
        pageView: emptyMetric, 
        avgTimeOnPage: { value: 'N/A', growShrink: 0 }, 
        series: [], 
        date: [] 
    },
    metrics: {
        visitors: emptyMetric,
        conversionRate: emptyMetric,
        adCampaignClicks: emptyMetric,
    },
    topPages: [],
    deviceSession: { series: [], labels: [], percentage: [] },
    topChannel: { visitors: 0, channels: [] },
    traffic: [],
}

const defaultData = {
    thisMonth: emptyAnalyticsData,
    thisWeek: emptyAnalyticsData,
    thisYear: emptyAnalyticsData,
}

export default async function Page() {
    const response = await getAnalyticDashboard()

    // Không cần kiểm tra unauthorized nữa!
    // Nếu có lỗi 401, người dùng đã bị redirect ở bước trước.

    const data = response.success ? response.data : defaultData

    return <AnalyticDashboard data={data} />
}
