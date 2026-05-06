import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './Home.css'
import Hero from '../../components/Hero/Hero.jsx'
import Features from '../../components/Features/Features.jsx'
import CallToAction from '../../components/CallToAction/CallToAction.jsx'
import { courseCatalog, courseCategories } from '../../utils/courseCatalog.js'
import {
    featuredCoursesContent,
    heroContent,
    newsletterContent,
} from '../../utils/siteContent.js'

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
            <Hero {...heroContent} />
            <section id="kategori" className="kategori-anchor">
                <Features
                    title={featuredCoursesContent.title}
                    subtitle={featuredCoursesContent.subtitle}
                    categories={courseCategories}
                    courses={courseCatalog}
                />
            </section>
            <CallToAction {...newsletterContent} />
        </main>
    )
}

export default Home;
