import { useEffect, useId, useRef, useState } from 'react'
import './GlassSurface.css'

/**
 * GlassSurface — adaptasi resmi komponen "Glass Surface" React Bits
 * (Apple-style liquid glass) dalam React JS + CSS biasa.
 *
 * Efek refraksi dihasilkan oleh SVG filter:
 * 1. `feImage` memuat displacement map yang dibuat sesuai ukuran elemen
 *    (gradien merah/biru + rounded rect yang di-blur).
 * 2. `feDisplacementMap` per kanal R/G/B membengkokkan backdrop.
 * 3. Kanal digabung (screen) lalu di-blur halus.
 * Lapisan ini dipakai lewat `backdrop-filter: url(#filter-id)`.
 *
 * Props: width, height, borderRadius, borderWidth, brightness, opacity,
 * blur, displace, backgroundOpacity, saturation, distortionScale,
 * redOffset, greenOffset, blueOffset, xChannel, yChannel, mixBlendMode,
 * refraction, shape, className, style, children.
 */
export default function GlassSurface({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0.5,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  refraction = true,
  shape,
  className = '',
  style = {},
  ...rest
}) {
  const uniqueId = useId().replace(/:/g, '-')
  const filterId = `glass-filter-${uniqueId}`
  const redGradId = `red-grad-${uniqueId}`
  const blueGradId = `blue-grad-${uniqueId}`
  const softId = `soft-${uniqueId}`

  const containerRef = useRef(null)
  const feImageRef = useRef(null)
  const redChannelRef = useRef(null)
  const greenChannelRef = useRef(null)
  const blueChannelRef = useRef(null)
  const gaussianBlurRef = useRef(null)

  const [boxSize, setBoxSize] = useState('')
  const [svgSupported, setSvgSupported] = useState(false)

  /* Pantau ukuran asli elemen (penting: displacement map harus 1:1). */
  useEffect(() => {
    const element = containerRef.current
    if (!element) return undefined

    const update = () => setBoxSize(`${element.offsetWidth}x${element.offsetHeight}`)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  /* Deteksi dukungan `backdrop-filter: url(#...)` (Chromium saja). */
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    const isFirefox = /Firefox/.test(navigator.userAgent)
    if (isWebkit || isFirefox) {
      setSvgSupported(false)
      return
    }

    const probe = document.createElement('div')
    probe.style.backdropFilter = `url(#${filterId})`
    setSvgSupported(probe.style.backdropFilter !== '')
  }, [filterId])

  /* Buat displacement map sesuai ukuran & props saat ini. */
  useEffect(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const actualWidth = rect.width || (typeof width === 'number' ? width : 400)
    const actualHeight = rect.height || (typeof height === 'number' ? height : 200)
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5)

    const svgContent = `
      <svg width="${actualWidth}" height="${actualHeight}" viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
          <filter id="${softId}" filterUnits="userSpaceOnUse" x="0" y="0" width="${actualWidth}" height="${actualHeight}" color-interpolation-filters="sRGB">
            <feGaussianBlur stdDeviation="${blur}" />
          </filter>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" filter="url(#${softId})" />
      </svg>
    `

    const mapUrl = `data:image/svg+xml,${encodeURIComponent(svgContent)}`
    feImageRef.current?.setAttribute('href', mapUrl)
  }, [
    boxSize,
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    mixBlendMode,
    redGradId,
    blueGradId,
    softId,
  ])

  /* Sinkronkan skala distorsi per kanal + blur output. */
  useEffect(() => {
    ;[
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset },
    ].forEach(({ ref, offset }) => {
      if (!ref.current) return
      ref.current.setAttribute('scale', (distortionScale + offset).toString())
      ref.current.setAttribute('xChannelSelector', xChannel)
      ref.current.setAttribute('yChannelSelector', yChannel)
    })

    gaussianBlurRef.current?.setAttribute('stdDeviation', displace.toString())
  }, [boxSize, distortionScale, redOffset, greenOffset, blueOffset, xChannel, yChannel, displace])

  const refractive = refraction && svgSupported && !shape

  const containerStyle = {
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    '--glass-frost': backgroundOpacity,
    '--glass-saturation': saturation,
    '--filter-id': `url(#${filterId})`,
    ...(shape
      ? {
          WebkitMaskImage: `url("${shape}")`,
          maskImage: `url("${shape}")`,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }
      : {}),
  }

  return (
    <div
      ref={containerRef}
      className={`glass-surface ${
        refractive ? 'glass-surface--svg' : 'glass-surface--fallback'
      }${className ? ` ${className}` : ''}`}
      style={containerStyle}
      {...rest}
    >
      <svg className="glass-surface__filter" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={feImageRef}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />

            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />

            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />

            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.5" />
          </filter>
        </defs>
      </svg>

      {!refractive && <span className="glass-surface__sheen" aria-hidden="true" />}
      {!refractive && <span className="glass-surface__rim" aria-hidden="true" />}

      <div className="glass-surface__content">{children}</div>
    </div>
  )
}
