import { useState } from 'react'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar.jsx'

function Home() {
    const [count, setCount] = useState(0)

    return (
        <>
            <Navbar />
            <h1>Home</h1>
        </>
    )
}

export default Home;