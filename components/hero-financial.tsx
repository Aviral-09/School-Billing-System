'use client'
import React from 'react'
import { ChevronRight } from 'lucide-react'
import { TimelineAnimation } from '@/components/timeline-animation'
import { useMediaQuery } from '@/components/use-media-query'
import MotionDrawer from '@/components/motion-drawer'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import { SCHOOL_CONFIG } from '@/lib/schoolConfig'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardPreview } from '@/components/dashboard-preview'

export const HeroFinancial = () => {
  const timelineRef = React.useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const router = useRouter()

  return (
    <section
      ref={timelineRef}
      className="min-h-screen bg-[#f7f9fc] text-[#1e293b] relative overflow-hidden flex flex-col items-center"
    >
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-50" />

      <svg
        width="358"
        height="483"
        viewBox="0 0 358 483"
        className="absolute top-0 z-1 left-0 pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_0_1)">
          <rect
            x="-86.9961"
            y="-33.114"
            width="72"
            height="541"
            rx="36"
            transform="rotate(-30.8182 -86.9961 -33.114)"
            fill="url(#paint0_linear_0_1)"
          />
        </g>
        <g filter="url(#filter1_f_0_1)">
          <rect
            x="-17"
            y="-135.113"
            width="50.0937"
            height="541"
            rx="25.0469"
            transform="rotate(-30.8182 -17 -135.113)"
            fill="url(#paint1_linear_0_1)"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_0_1"
            x="-137.641"
            y="-120.646"
            width="440.285"
            height="602.787"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="32"
              result="effect1_foregroundBlur_0_1"
            />
          </filter>
          <filter
            id="filter1_f_0_1"
            x="-71.707"
            y="-215.486"
            width="429.598"
            height="599.69"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="32"
              result="effect1_foregroundBlur_0_1"
            />
          </filter>
          <linearGradient
            id="paint0_linear_0_1"
            x1="-50.9961"
            y1="-33.114"
            x2="-50.9961"
            y2="507.886"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#91bbfb" />
            <stop offset="1" stopColor="#E6F1FF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_0_1"
            x1="8.04686"
            y1="-135.113"
            x2="8.04686"
            y2="405.887"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8dbafd" />
            <stop offset="1" stopColor="#c1d9f8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Soft Background Gradients */}
      <TimelineAnimation
        timelineRef={timelineRef}
        animationNum={5}
        className="absolute top-0 left-0 w-full h-[600px] bg-linear-to-b from-blue-50 via-blue-100 to-transparent opacity-100"
      />
      
      {isMobile && (
        <div className="flex gap-4 justify-between items-center px-5 w-full pt-4 relative z-10">
          <MotionDrawer
            direction="left"
            width={300}
            backgroundColor={'#ffffff'}
            clsBtnClassName="bg-neutral-800 border-r border-neutral-900 text-white"
            contentClassName="bg-white border-r border-neutral-200 text-black"
            btnClassName="bg-white text-black relative w-fit p-2 left-0 top-0 rounded-full shadow-xs border border-neutral-200"
          >
            <nav className="space-y-4 ">
              <div className="flex items-center gap-2 text-black">
                <div style={{ background: 'var(--color-electric-violet)', borderRadius: 8, padding: 6 }}>
                  <AcademicCapIcon style={{ width: 20, height: 20, color: '#fff' }} />
                </div>
                <span className="font-bold">{SCHOOL_CONFIG.shortName} Portal</span>
              </div>
              <a
                href="#features"
                className="block p-2 hover:bg-neutral-200 hover:text-black rounded-sm"
              >
                Features
              </a>
              <a
                href="#about"
                className="block p-2 hover:bg-neutral-200 hover:text-black rounded-sm"
              >
                About
              </a>
              <Link
                href="/login"
                className="block p-2 hover:bg-neutral-200 hover:text-black rounded-sm"
              >
                Sign In
              </Link>
              <a
                href="#about"
                className="block p-2 hover:bg-neutral-200 hover:text-black rounded-sm"
              >
                Contact
              </a>
            </nav>
          </MotionDrawer>
          <Link href="/login" className="bg-neutral-900 text-white px-3 py-3 relative z-2 flex gap-1 items-center rounded-xl font-bold text-sm hover:bg-black transition shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)]">
            Get Started <ChevronRight size={20} />
          </Link>
        </div>
      )}

      {/* Header */}
      {!isMobile && (
        <header className="relative z-10 w-full max-w-7xl mx-auto p-2 mt-4">
          <TimelineAnimation
            animationNum={1}
            timelineRef={timelineRef}
            className="bg-white/80 backdrop-blur-xl p-2 rounded-xl border border-white shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div style={{ background: 'var(--color-electric-violet)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AcademicCapIcon style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {SCHOOL_CONFIG.shortName} <span style={{ color: 'var(--color-electric-violet)' }}>Portal</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-neutral-500">
              <a href="#features" className="hover:text-[#3b82f6] transition">
                Features
              </a>
              <a href="#about" className="hover:text-[#3b82f6] transition">
                About
              </a>
            </nav>
            <Link href="/login" className="bg-neutral-900 text-white px-3 py-3 flex gap-1 items-center rounded-xl font-bold text-sm hover:bg-black transition shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)]">
              Sign In <ChevronRight size={20} />
            </Link>
          </TimelineAnimation>
        </header>
      )}

      {/* Hero Content */}
      <div className="relative z-10 text-center pt-24 pb-16 px-4 flex flex-col gap-6">
        <TimelineAnimation
          animationNum={1}
          timelineRef={timelineRef}
          className="bg-white w-fit mx-auto text-black px-1.5 py-1 rounded-full inline-flex items-center gap-2 shadow-lg shadow-blue-500/20 border-2 border-white"
        >
          <span className="bg-linear-to-br from-blue-500 to-blue-200 text-white px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-widest">
            Portal Live
          </span>
          <span className="text-sm font-medium">
            Welcome to the new fee management system
          </span>
        </TimelineAnimation>

        <TimelineAnimation
          as="h1"
          animationNum={2}
          timelineRef={timelineRef}
          className="sm:text-6xl text-5xl md:text-8xl font-medium tracking-tight text-neutral-900 max-w-6xl"
        >
          Make your school&apos;s <br /> billing seamless.
        </TimelineAnimation>

        <TimelineAnimation
          as="p"
          animationNum={3}
          timelineRef={timelineRef}
          className="text-xl md:text-2xl text-neutral-500 font-medium max-w-3xl mx-auto leading-relaxed px-4"
        >
          Take control of school fees with a next-generation billing software built to simplify, automate, and elevate operations.
        </TimelineAnimation>

        <div className="flex gap-4 justify-center">
          <TimelineAnimation
            as="button"
            onClick={() => router.push('/login')}
            animationNum={4}
            timelineRef={timelineRef}
            className="px-4 bg-linear-to-br from-blue-500 via-blue-400 to-blue-200 text-white text-xl rounded-lg shadow-sm transition py-2.5 border border-blue-300 cursor-pointer text-center"
          >
            Get Started
          </TimelineAnimation>
          <TimelineAnimation
            as="button"
            onClick={() => router.push('#features')}
            animationNum={5}
            timelineRef={timelineRef}
            className="px-4 bg-linear-to-br from-neutral-50 via-neutral-100 to-neutral-300 text-black text-xl rounded-lg shadow-sm transition py-2.5 border border-neutral-300 cursor-pointer text-center"
          >
            Learn more
          </TimelineAnimation>
        </div>
      </div>

      {/* Dashboard UI Frame — interactive preview */}
      <div className="w-full max-w-7xl mx-auto rounded-xl relative mt-10 px-4 pb-10">
        <TimelineAnimation
          animationNum={6}
          timelineRef={timelineRef}
          className="rounded-2xl"
        >
          <DashboardPreview />
        </TimelineAnimation>
      </div>
    </section>
  )
}
