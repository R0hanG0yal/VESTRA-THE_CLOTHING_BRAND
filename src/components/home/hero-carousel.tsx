'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import Link from 'next/link'

const slides = [
  {
    image: "/editorial/hero-architectural-pavilion.jpg",
    objectPosition: "center 20%",
    title: "Autumn / Winter 24",
    subtitle: "Pure Wool Architecture",
    cta: "Shop Now",
    link: "/shop"
  },
  {
    image: "/editorial/hero-campaign-trio.jpg",
    objectPosition: "center 15%",
    title: "Tailored Suiting",
    subtitle: "Pearl & Slate Collection",
    cta: "Explore Styles",
    link: "/shop"
  },
  {
    image: "/editorial/hero-editorial-sage.jpg",
    objectPosition: "center 20%",
    title: "Premium Outerwear",
    subtitle: "Zero Synthetic Fusing",
    cta: "Shop Jackets",
    link: "/shop"
  }
]

export function HeroCarousel() {
  const autoplay = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: false, align: 'start' },
    [autoplay.current]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
    autoplay.current.reset()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
    autoplay.current.reset()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index)
    autoplay.current.reset()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section className="relative w-full mt-16 sm:mt-20 select-none">
      {/* Embla viewport */}
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: 'clamp(280px, 60vw, 680px)' }}
        ref={emblaRef}
      >
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] min-w-0 h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: slide.objectPosition,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.25) 100%)',
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
                <p className="text-white/80 text-xs sm:text-sm font-medium uppercase tracking-[0.25em] drop-shadow-md mb-3">
                  {slide.subtitle}
                </p>
                <h1 className="text-white font-black uppercase drop-shadow-xl leading-none"
                  style={{ fontSize: 'clamp(2rem, 5.5vw, 5rem)', letterSpacing: '-0.01em' }}>
                  {slide.title}
                </h1>
                <Link
                  href={slide.link}
                  className="mt-8 pointer-events-auto inline-block bg-white text-black font-bold uppercase tracking-widest shadow-2xl hover:bg-white/90 active:scale-95 transition-all duration-200"
                  style={{ padding: '14px 40px', fontSize: '11px', letterSpacing: '0.18em' }}
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-black/40 hover:bg-black/70 text-white transition-all duration-200 backdrop-blur-sm"
        style={{ width: 44, height: 44 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-black/40 hover:bg-black/70 text-white transition-all duration-200 backdrop-blur-sm"
        style={{ width: 44, height: 44 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            style={{
              height: 4,
              borderRadius: 2,
              width: index === selectedIndex ? 32 : 8,
              background: index === selectedIndex ? '#fff' : 'rgba(255,255,255,0.45)',
              transition: 'width 0.4s ease, background 0.3s ease',
              cursor: 'pointer',
              border: 'none',
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  )
}
