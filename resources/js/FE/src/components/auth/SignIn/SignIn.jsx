'use client'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './SignInForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useTheme from '@/utils/hooks/useTheme'
import { useTranslations } from 'next-intl'

const SignIn = ({
    signUpUrl = '/sign-up',
    forgetPasswordUrl = '/forgot-password',
    onSignIn,
    errorMessage = '', // Nhận errorMessage từ parent
}) => {
    const [message, setMessage] = useTimeOutMessage()
    const t = useTranslations('signIn')

    const mode = useTheme((state) => state.mode)

    // Kết hợp message từ hook và errorMessage từ prop
    const displayMessage = errorMessage || message

    return (
        <>
            <div className="mb-8">
                <Logo
                    type="streamline"
                    mode={mode}
                    imgClass="h-12 md:h-14 w-auto max-w-[120px]"
                />
            </div>
            <div className="mb-10">
                <h2 className="mb-2">{t('welcome')}</h2>
                <p className="font-semibold heading-text">{t('subtitle')}</p>
            </div>
            {displayMessage && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{displayMessage}</span>
                </Alert>
            )}
            <SignInForm
                setMessage={setMessage}
                errorMessage={errorMessage} // Truyền errorMessage xuống SignInForm
                passwordHint={
                    <div className="mb-7 mt-2">
                        <ActionLink
                            href={forgetPasswordUrl}
                            className="font-semibold heading-text mt-2 underline"
                            themeColor={false}
                        >
                            {t('forgotPassword')}
                        </ActionLink>
                    </div>
                }
                onSignIn={onSignIn}
            />

            <div>
                <div className="mt-6 text-center">
                    <span>{t('dontHaveAccount')} </span>
                    <ActionLink
                        href={signUpUrl}
                        className="heading-text font-bold"
                        themeColor={false}
                    >
                        {t('signUp')}
                    </ActionLink>
                </div>
            </div>
        </>
    )
}

export default SignIn
