import Card from '@/components/ui/Card'
import Plans from './_components/Plans'
import PaymentCycleToggle from './_components/PaymentCycleToggle'
import Faq from './_components/Faq'
import PaymentDialog from './_components/PaymentDialog'
import getPricingPlans from '@/server/actions/account/getPricingPlans'
import { getTranslations } from 'next-intl/server'

export default async function Page({ searchParams }) {
    const params = await searchParams
    const data = await getPricingPlans()
    const t = await getTranslations('account.pricing')

    return (
        <>
            <Card className="mb-4">
                <div className="flex items-center justify-between mb-8">
                    <h3>{t('title')}</h3>
                    <PaymentCycleToggle />
                </div>
                <Plans
                    data={data}
                    subcription={params.subcription}
                    cycle={params.cycle}
                />
            </Card>
            <Faq />
            <PaymentDialog />
        </>
    )
}
