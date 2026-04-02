import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './Home.css'
import Hero from '../../components/Hero/Hero.jsx'
import Features from '../../components/Features/Features.jsx'
import CallToAction from '../../components/CallToAction/CallToAction.jsx'

function Home() {
    const location = useLocation()

    useEffect(() => {
        if (location.hash === '#kategori') {
            const target = document.getElementById('kategori')
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }
    }, [location.hash])

    return (
        <main>
            <Hero />
            <section id="kategori" className="kategori-anchor">
                <Features />
            </section>
            <CallToAction />
        </main>
    )
}

export default Home;