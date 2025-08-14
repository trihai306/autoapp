'use client'
import Segment from '@/components/ui/Segment'
import { usePricingStore } from '../_store/pricingStore'
import { useTranslations } from 'next-intl'

const PaymentCycleToggle = () => {
    const t = useTranslations('account.pricing')
    const { paymentCycle, setPaymentCycle } = usePricingStore()

    return (
        <Segment value={paymentCycle} onChange={(val) => setPaymentCycle(val)}>
            <Segment.Item value="monthly">{t('monthly')}</Segment.Item>
            <Segment.Item value="annually">{t('annually')}</Segment.Item>
        </Segment>
    )
}

export default PaymentCycleToggle
