import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import './Home.css'
import Hero from '../../components/Hero/Hero.jsx'
import Features from '../../components/Features/Features.jsx'
import CallToAction from '../../components/CallToAction/CallToAction.jsx'
import { fetchCourses } from '../../store/coursesSlice.js'
import { courseCategories } from '../../utils/courseCatalog.js'
import {
    featuredCoursesContent,
    heroContent,
    newsletterContent,
} from '../../utils/siteContent.js'

function Home() {
    const location = useLocation()
    const dispatch = useDispatch()
    const { items: courses, status, error } = useSelector((state) => state.courses)

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
                {status === 'loading' && (
                    <div className="page-container courses-loading" role="status">
                        <span className="courses-spinner" aria-hidden="true" />
                        Memuat kelas...
                    </div>
                )}
                {status === 'failed' && (
                    <div className="page-container courses-error" role="alert">
                        <p>Gagal memuat kelas: {error}</p>
                        <button type="button" onClick={() => dispatch(fetchCourses())}>
                            Coba lagi
                        </button>
                    </div>
                )}
                {status === 'succeeded' && (
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
