'use client'
import UserForm from '../_components/UserForm'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { useTranslations } from 'next-intl'

const NewUser = () => {
    const t = useTranslations('userManagement')
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <h3>{t('createTitle')}</h3>
                    <UserForm mode="add" />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default NewUser
