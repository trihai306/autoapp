'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Menu from '@/components/ui/Menu'
import Question from './Question'
import { questionList, questionCategory } from '../constants'
import isLastChild from '@/utils/isLastChild'
import { useTranslations } from 'next-intl'

const Faq = () => {
    const t = useTranslations('account.pricing')
    const [selectedCategory, setSelectedCategory] = useState('subscription')

    return (
        <Card>
            <h3 className="mt-2">{t('faq')}</h3>
            <div className="flex flex-col md:flex-row gap-4 md:gap-20 mt-8">
                <div className="min-w-[230px]">
                    <Menu>
                        {Object.entries(questionList).map(([key]) => (
                            <Menu.MenuItem
                                key={key}
                                isActive={key === selectedCategory}
                                eventKey={key}
                                onSelect={setSelectedCategory}
                            >
                                {t(questionCategory[key])}
                            </Menu.MenuItem>
                        ))}
                    </Menu>
                </div>
                <div className="max-w-[800px] my-2">
                    <div className="">
                        {t.raw('faqList')[selectedCategory].map(
                            (question, index) => (
                                <Question
                                    key={question.title}
                                    title={question.title}
                                    content={question.content}
                                    border={
                                        !isLastChild(
                                            t.raw('faqList')[selectedCategory],
                                            index,
                                        )
                                    }
                                    isFirstChild={index === 0}
                                />
                            ),
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default Faq
