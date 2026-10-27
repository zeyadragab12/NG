import { StrictMode, useEffect, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { MiniMap } from './components/MiniMap'
import { Nav } from './components/Nav'
import { PageTransition } from './components/PageTransition'
import { ToneManager } from './components/ToneManager'
import { RegisterProvider } from './components/RegisterDialog'
import { FACILITIES } from './data/facilities'
import { scrollToTarget, startScrollFx } from './fx/engine'
import { FacilityPage } from './pages/Facility'
import { Home } from './pages/Home'
import './index.css'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => startScrollFx(), [])
  useLayoutEffect(() => {
    if (!hash) {
      scrollToTarget(0, true)
      return
    }
    // wait for the new page to lay out before jumping to the section
    const id = requestAnimationFrame(() => {
      const el = document.getElementById(hash.slice(1))
      if (el) scrollToTarget(el, true)
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, hash])
  return null
}

function App() {
  return (
    <RegisterProvider>
      <ScrollManager />
      <Nav />
      <ToneManager />
      <MiniMap />
      <PageTransition />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {FACILITIES.map((f) => (
            <Route key={f.slug} path={`/${f.slug}`} element={<FacilityPage facility={f} />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </RegisterProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
