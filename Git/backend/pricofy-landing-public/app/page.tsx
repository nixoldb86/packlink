import Hero from '@/components/Hero'
import MarketProblem from '@/components/MarketProblem'
import GlobalSolution from '@/components/GlobalSolution'
import Stats from '@/components/Stats'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <MarketProblem />
      <GlobalSolution />
      <Stats />
      <CTA />
      <Footer />
    </main>
  )
}
