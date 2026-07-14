import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './Home.css'
import Hero from '../../components/Hero/Hero.jsx'
import Features from '../../components/Features/Features.jsx'
import CallToAction from '../../components/CallToAction/CallToAction.jsx'
import { courseCategories } from '../../utils/courseCatalog.js'
import {
    featuredCoursesContent,
    heroContent,
    newsletterContent,
} from '../../utils/siteContent.js'

function Home() {
    const location = useLocation()
    const { items: courses, status, error } = useSelector((state) => state.courses)
    const isLoading = status === 'idle' || status === 'loading'

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
                {isLoading ? (
                    <p className="home-status">Memuat kelas…</p>
                ) : error && courses.length === 0 ? (
                    <p className="home-status" role="alert">{error}</p>
                ) : (
                    <Features
                        title={featuredCoursesContent.title}
                        subtitle={featuredCoursesContent.subtitle}
                        categories={courseCategories}
                        courses={courses}
                    />
                )}
            </section>
            <CallToAction {...newsletterContent} />
        </main>
    )
}

export default Home;
