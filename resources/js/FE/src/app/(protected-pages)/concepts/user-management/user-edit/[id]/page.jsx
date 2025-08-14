import UserForm from '../../_components/UserForm'
import Container from '@/components/shared/Container'
import getUser from '@/server/actions/user/getUser'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { getTranslations } from 'next-intl/server'


const UserEdit = async (props) => {
    const { id } = await props.params
    const user = await getUser(id)
    const t = await getTranslations('userManagement')
    // console.log('User data in page:', user)

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <h3>{t('editTitle')}</h3>
                    <UserForm mode="edit" user={user} />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default UserEdit
