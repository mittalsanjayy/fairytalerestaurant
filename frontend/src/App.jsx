import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import ScrollToTop from '@/components/layout/ScrollToTop'
import PageTransition from '@/components/motion/PageTransition'
import RouteLoader from '@/components/ui/RouteLoader'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// Route-level code splitting: each page ships as its own chunk.
const Home = lazy(() => import('@/pages/Home'))
const NotFound = lazy(() => import('@/pages/NotFound'))
// The owner dashboard is its own chunk and renders outside the public site shell (no header, footer or intro).
const AdminApp = lazy(() => import('@/admin/AdminApp'))

// Dev-only design system page. In production builds this evaluates to null and is tree-shaken away.
const StyleGuide = import.meta.env.DEV ? lazy(() => import('@/pages/StyleGuide')) : null

export default function App() {
  const location = useLocation()

  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
          <AdminApp />
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Layout>
        <ScrollToTop />
        <Suspense fallback={<RouteLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <PageTransition>
                    <Home />
                  </PageTransition>
                }
              />
              {StyleGuide ? (
                <Route
                  path="/styleguide"
                  element={
                    <PageTransition>
                      <StyleGuide />
                    </PageTransition>
                  }
                />
              ) : null}
              <Route
                path="*"
                element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  )
}
