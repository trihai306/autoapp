'use client'

import HeroContent from './HeroContent'
import NavigationBar from './NavigationBar'
import Features from './Features'
import LandingFooter from './LandingFooter'
import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import HowItWorks from './HowItWorks'
import UseCases from './UseCases'
import About from './About' // Import component mới
import Contact from './Contact' // Import component mới

const Landing = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="px-4 lg:px-0 text-base bg-white dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            <div className="relative">
                <div
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='50' height='50' fill='none' stroke='${
                            mode === MODE_LIGHT
                                ? 'rgb(0 0 0 / 0.04)'
                                : 'rgb(255 255 255 / 0.04)'
                        }'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
                    }}
                    className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_5%,transparent_70%)] pointer-events-none select-none"
                ></div>
                <HeroContent mode={mode} />
            </div>
            <Features />
            <HowItWorks />
            <About /> 
            <UseCases />
            <Contact />
            <LandingFooter mode={mode} />
        </main>
    )
}

export default Landing
