'use client'
import Link from 'next/link'
import FeaturesSection from '@/components/FeaturesSection'
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useId,
  FC,
  PointerEvent,
} from 'react'
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl'

// ══════════════════════════════════════════════════════
//  CircularGallery (OGL)
// ══════════════════════════════════════════════════════
type GL = Renderer['gl']

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout)
    timeout = window.setTimeout(() => func.apply(this, args), wait)
  }
}
function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t
}
function autoBind(instance: any) {
  const proto = Object.getPrototypeOf(instance)
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor' && typeof instance[key] === 'function')
      instance[key] = instance[key].bind(instance)
  })
}
function getFontSize(font: string) {
  const match = font.match(/(\d+)px/)
  return match ? parseInt(match[1], 10) : 30
}
function createTextTexture(
  gl: GL,
  text: string,
  font = 'bold 30px monospace',
  color = 'black',
) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  ctx.font = font
  const tw = Math.ceil(ctx.measureText(text).width)
  const th = Math.ceil(getFontSize(font) * 1.2)
  canvas.width = tw + 20
  canvas.height = th + 20
  ctx.font = font
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  const texture = new Texture(gl, { generateMipmaps: false })
  texture.image = canvas
  return { texture, width: canvas.width, height: canvas.height }
}

class Title {
  gl: GL
  plane: Mesh
  renderer: Renderer
  text: string
  textColor: string
  font: string
  mesh!: Mesh
  constructor({
    gl,
    plane,
    renderer,
    text,
    textColor = '#545050',
    font = '30px sans-serif',
  }: any) {
    autoBind(this)
    this.gl = gl
    this.plane = plane
    this.renderer = renderer
    this.text = text
    this.textColor = textColor
    this.font = font
    this.createMesh()
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(
      this.gl,
      this.text,
      this.font,
      this.textColor,
    )
    const geometry = new Plane(this.gl)
    const program = new Program(this.gl, {
      vertex: `attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragment: `precision highp float;uniform sampler2D tMap;varying vec2 vUv;void main(){vec4 color=texture2D(tMap,vUv);if(color.a<0.1)discard;gl_FragColor=color;}`,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    })
    this.mesh = new Mesh(this.gl, { geometry, program })
    const aspect = width / height
    const tH = this.plane.scale.y * 0.15
    const tW = tH * aspect
    this.mesh.scale.set(tW, tH, 1)
    this.mesh.position.y = -this.plane.scale.y * 0.5 - tH * 0.5 - 0.05
    this.mesh.setParent(this.plane)
  }
}

class Media {
  extra = 0
  geometry: any
  gl: GL
  image: string
  index: number
  length: number
  renderer: Renderer
  scene: any
  screen: any
  text: string
  viewport: any
  bend: number
  textColor: string
  borderRadius: number
  font?: string
  program!: Program
  plane!: Mesh
  title!: Title
  scale!: number
  padding!: number
  width!: number
  widthTotal!: number
  x!: number
  speed = 0
  isBefore = false
  isAfter = false

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
  }: any) {
    this.geometry = geometry
    this.gl = gl
    this.image = image
    this.index = index
    this.length = length
    this.renderer = renderer
    this.scene = scene
    this.screen = screen
    this.text = text
    this.viewport = viewport
    this.bend = bend
    this.textColor = textColor
    this.borderRadius = borderRadius
    this.font = font
    this.createShader()
    this.createMesh()
    this.createTitle()
    this.onResize()
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true })
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform float uTime;uniform float uSpeed;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z=(sin(p.x*4.0+uTime)*1.5+cos(p.y*2.0+uTime)*1.5)*(0.1+uSpeed*0.5);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
      fragment: `precision highp float;uniform vec2 uImageSizes;uniform vec2 uPlaneSizes;uniform sampler2D tMap;uniform float uBorderRadius;varying vec2 vUv;float roundedBoxSDF(vec2 p,vec2 b,float r){vec2 d=abs(p)-b;return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r;}void main(){vec2 ratio=vec2(min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0));vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5,vUv.y*ratio.y+(1.0-ratio.y)*0.5);vec4 color=texture2D(tMap,uv);float d=roundedBoxSDF(vUv-0.5,vec2(0.5-uBorderRadius),uBorderRadius);float edgeSmooth=0.002;float alpha=1.0-smoothstep(-edgeSmooth,edgeSmooth,d);gl_FragColor=vec4(color.rgb,alpha);}`,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    })
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = this.image
    img.onload = () => {
      texture.image = img
      this.program.uniforms.uImageSizes.value = [
        img.naturalWidth,
        img.naturalHeight,
      ]
    }
  }
  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })
    this.plane.setParent(this.scene)
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    })
  }
  update(scroll: any, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra
    const x = this.plane.position.x
    const H = this.viewport.width / 2
    if (this.bend === 0) {
      this.plane.position.y = 0
      this.plane.rotation.z = 0
    } else {
      const B_abs = Math.abs(this.bend)
      const R = (H * H + B_abs * B_abs) / (2 * B_abs)
      const effectiveX = Math.min(Math.abs(x), H)
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX)
      if (this.bend > 0) {
        this.plane.position.y = -arc
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R)
      } else {
        this.plane.position.y = arc
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R)
      }
    }
    this.speed = scroll.current - scroll.last
    this.program.uniforms.uTime.value += 0.04
    this.program.uniforms.uSpeed.value = this.speed
    const planeOffset = this.plane.scale.x / 2
    const viewportOffset = this.viewport.width / 2
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal
      this.isBefore = this.isAfter = false
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal
      this.isBefore = this.isAfter = false
    }
  }
  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen
    if (viewport) {
      this.viewport = viewport
    }
    this.scale = this.screen.height / 1500
    this.plane.scale.y =
      (this.viewport.height * (900 * this.scale)) / this.screen.height
    this.plane.scale.x =
      (this.viewport.width * (700 * this.scale)) / this.screen.width
    this.plane.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ]
    this.padding = 2
    this.width = this.plane.scale.x + this.padding
    this.widthTotal = this.width * this.length
    this.x = this.width * this.index
  }
}

class App {
  container: HTMLElement
  scrollSpeed: number
  scroll: any
  onCheckDebounce: any
  renderer!: Renderer
  gl!: GL
  camera!: Camera
  scene!: Transform
  planeGeometry!: Plane
  medias: Media[] = []
  mediasImages: any[] = []
  screen!: any
  viewport!: any
  raf = 0
  boundOnResize!: () => void
  boundOnWheel!: (e: Event) => void
  boundOnTouchDown!: (e: any) => void
  boundOnTouchMove!: (e: any) => void
  boundOnTouchUp!: () => void
  isDown = false
  start = 0

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px sans-serif',
      scrollSpeed = 2,
      scrollEase = 0.05,
    }: any,
  ) {
    this.container = container
    this.scrollSpeed = scrollSpeed
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 }
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200)
    this.createRenderer()
    this.createCamera()
    this.createScene()
    this.onResize()
    this.createGeometry()
    this.createMedias(items, bend, textColor, borderRadius, font)
    this.update()
    this.addEventListeners()
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement)
  }
  createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.fov = 45
    this.camera.position.z = 20
  }
  createScene() {
    this.scene = new Transform()
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    })
  }
  createMedias(
    items: any,
    bend: number,
    textColor: string,
    borderRadius: number,
    font: string,
  ) {
    const galleryItems = items?.length ? items : []
    this.mediasImages = [...galleryItems, ...galleryItems]
    this.medias = this.mediasImages.map(
      (data, index) =>
        new Media({
          geometry: this.planeGeometry,
          gl: this.gl,
          image: data.image,
          index,
          length: this.mediasImages.length,
          renderer: this.renderer,
          scene: this.scene,
          screen: this.screen,
          text: data.text,
          viewport: this.viewport,
          bend,
          textColor,
          borderRadius,
          font,
        }),
    )
  }
  onTouchDown(e: any) {
    this.isDown = true
    this.scroll.position = this.scroll.current
    this.start = e.touches ? e.touches[0].clientX : e.clientX
  }
  onTouchMove(e: any) {
    if (!this.isDown) return
    const x = e.touches ? e.touches[0].clientX : e.clientX
    this.scroll.target =
      (this.scroll.position ?? 0) +
      (this.start - x) * (this.scrollSpeed * 0.025)
  }
  onTouchUp() {
    this.isDown = false
    this.onCheck()
  }
  onWheel(e: Event) {
    const we = e as WheelEvent
    this.scroll.target +=
      (we.deltaY > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2
    this.onCheckDebounce()
  }
  onCheck() {
    if (!this.medias?.[0]) return
    const width = this.medias[0].width
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width)
    const item = width * itemIndex
    this.scroll.target = this.scroll.target < 0 ? -item : item
  }
  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }
    this.renderer.setSize(this.screen.width, this.screen.height)
    this.camera.perspective({ aspect: this.screen.width / this.screen.height })
    const fov = (this.camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    this.viewport = { width: height * this.camera.aspect, height }
    this.medias?.forEach((m) =>
      m.onResize({ screen: this.screen, viewport: this.viewport }),
    )
  }
  update() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    )
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left'
    this.medias?.forEach((m) => m.update(this.scroll, direction))
    this.renderer.render({ scene: this.scene, camera: this.camera })
    this.scroll.last = this.scroll.current
    this.raf = window.requestAnimationFrame(this.update.bind(this))
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this)
    this.boundOnWheel = this.onWheel.bind(this)
    this.boundOnTouchDown = this.onTouchDown.bind(this)
    this.boundOnTouchMove = this.onTouchMove.bind(this)
    this.boundOnTouchUp = this.onTouchUp.bind(this)
    window.addEventListener('resize', this.boundOnResize)
    window.addEventListener('wheel', this.boundOnWheel)
    window.addEventListener('mousedown', this.boundOnTouchDown)
    window.addEventListener('mousemove', this.boundOnTouchMove)
    window.addEventListener('mouseup', this.boundOnTouchUp)
    window.addEventListener('touchstart', this.boundOnTouchDown)
    window.addEventListener('touchmove', this.boundOnTouchMove)
    window.addEventListener('touchend', this.boundOnTouchUp)
  }
  destroy() {
    window.cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.boundOnResize)
    window.removeEventListener('wheel', this.boundOnWheel)
    window.removeEventListener('mousedown', this.boundOnTouchDown)
    window.removeEventListener('mousemove', this.boundOnTouchMove)
    window.removeEventListener('mouseup', this.boundOnTouchUp)
    window.removeEventListener('touchstart', this.boundOnTouchDown)
    window.removeEventListener('touchmove', this.boundOnTouchMove)
    window.removeEventListener('touchend', this.boundOnTouchUp)
    const canvas = this.renderer?.gl?.canvas as HTMLCanvasElement
    canvas?.parentNode?.removeChild(canvas)
  }
}

function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px sans-serif',
  scrollSpeed = 2,
  scrollEase = 0.05,
}: any) {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!containerRef.current) return
    const app = new App(containerRef.current, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
    })
    return () => app.destroy()
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase])
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: 'grab',
      }}
    />
  )
}

// ══════════════════════════════════════════════════════
//  CurvedLoop marquee
// ══════════════════════════════════════════════════════
interface CurvedLoopProps {
  marqueeText?: string
  speed?: number
  curveAmount?: number
  direction?: 'left' | 'right'
  interactive?: boolean
}
const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = '',
  speed = 2,
  curveAmount = 0,
  direction = 'left',
  interactive = true,
}) => {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText)
    return (
      (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0'
    )
  }, [marqueeText])
  const measureRef = useRef<SVGTextElement | null>(null)
  const textPathRef = useRef<SVGTextPathElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const [spacing, setSpacing] = useState(0)
  const [offset, setOffset] = useState(0)
  const uid = useId()
  const pathId = `curve-${uid}`
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`
  const dragRef = useRef(false)
  const lastXRef = useRef(0)
  const dirRef = useRef<'left' | 'right'>(direction)
  const velRef = useRef(0)
  const totalText = spacing
    ? Array(Math.ceil(1800 / spacing) + 2)
        .fill(text)
        .join('')
    : text
  const ready = spacing > 0
  useEffect(() => {
    if (measureRef.current)
      setSpacing(measureRef.current.getComputedTextLength())
  }, [text])
  useEffect(() => {
    if (!spacing) return
    if (textPathRef.current) {
      textPathRef.current.setAttribute('startOffset', -spacing + 'px')
      setOffset(-spacing)
    }
  }, [spacing])
  useEffect(() => {
    if (!spacing || !ready) return
    let frame = 0
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed
        const cur = parseFloat(
          textPathRef.current.getAttribute('startOffset') || '0',
        )
        let next = cur + delta
        if (next <= -spacing) next += spacing
        if (next > 0) next -= spacing
        textPathRef.current.setAttribute('startOffset', next + 'px')
        setOffset(next)
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [spacing, speed, ready])
  const onPointerDown = (e: PointerEvent) => {
    if (!interactive) return
    dragRef.current = true
    lastXRef.current = e.clientX
    velRef.current = 0
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return
    const dx = e.clientX - lastXRef.current
    lastXRef.current = e.clientX
    velRef.current = dx
    const cur = parseFloat(
      textPathRef.current.getAttribute('startOffset') || '0',
    )
    let next = cur + dx
    if (next <= -spacing) next += spacing
    if (next > 0) next -= spacing
    textPathRef.current.setAttribute('startOffset', next + 'px')
    setOffset(next)
  }
  const endDrag = () => {
    if (!interactive) return
    dragRef.current = false
    dirRef.current = velRef.current > 0 ? 'right' : 'left'
  }
  return (
    <div
      style={{
        visibility: ready ? 'visible' : 'hidden',
        cursor: interactive ? 'grab' : 'auto',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg
        style={{
          userSelect: 'none',
          width: '100%',
          overflow: 'visible',
          display: 'block',
        }}
        viewBox="0 0 1440 80"
      >
        <text
          ref={measureRef}
          xmlSpace="preserve"
          style={{
            visibility: 'hidden',
            opacity: 0,
            pointerEvents: 'none',
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: '2.2rem',
            fontWeight: 700,
          }}
        >
          {text}
        </text>
        <defs>
          <path
            ref={pathRef}
            id={pathId}
            d={pathD}
            fill="none"
            stroke="transparent"
          />
        </defs>
        {ready && (
          <text
            xmlSpace="preserve"
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: '2.2rem',
              fontWeight: 700,
              letterSpacing: '0.07em',
              fill: '#b5f02a',
            }}
          >
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={offset + 'px'}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  Data
// ══════════════════════════════════════════════════════
const WORDS = [
  { word: 'ସାଥୀ', lang: 'Odia' },
  { word: 'FRIEND', lang: 'English' },
  { word: 'साथी', lang: 'Hindi' },
  { word: 'दोस्त', lang: 'Hindi' },
  { word: 'ALLY', lang: 'English' },
  { word: 'ସଖା', lang: 'Odia' },
  { word: 'COMPANION', lang: 'English' },
  { word: 'यार', lang: 'Hindi' },
  { word: 'ବନ୍ଧୁ', lang: 'Odia' },
]

const GALLERY_ITEMS = [
  {
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    text: 'Wheat Fields',
  },
  {
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    text: 'Rice Harvest',
  },
  {
    image:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    text: 'Fresh Produce',
  },
  {
    image:
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80',
    text: 'Livestock Care',
  },
  {
    image:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    text: 'Farm Life',
  },
  {
    image:
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&q=80',
    text: 'Crop Fields',
  },
  {
    image:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
    text: 'Paddy Season',
  },
  {
    image:
      'https://images.unsplash.com/photo-1584677626646-7c8f83690304?w=800&q=80',
    text: 'Soil & Seeds',
  },
]

const MASONRY = [
  {
    type: 'stat',
    icon: '🌾',
    value: '10,000+',
    label: 'Farmers Helped',
    accent: '#b5f02a',
    size: 'tall',
  },
  {
    type: 'info',
    icon: '📱',
    title: 'Works on Any Phone',
    desc: 'No smartphone needed. KrishiMitra works on basic Android devices, even with low connectivity.',
    size: 'normal',
  },
  {
    type: 'info',
    icon: '🗣️',
    title: 'Speaks Odia',
    desc: 'All responses are in Odia — the language farmers actually understand and trust.',
    size: 'normal',
  },
  {
    type: 'stat',
    icon: '⚡',
    value: '< 3 sec',
    label: 'AI Response Time',
    accent: '#f4f4f0',
    size: 'short',
  },
  {
    type: 'quote',
    icon: '💬',
    text: '"KrishiMitra saved my cattle when there was no vet for 40 km."',
    author: 'Farmer, Koraput',
    size: 'normal',
  },
  {
    type: 'stat',
    icon: '🔬',
    value: '94%',
    label: 'Diagnosis Accuracy',
    accent: '#b5f02a',
    size: 'short',
  },
  {
    type: 'info',
    icon: '🌐',
    title: 'Works Offline',
    desc: 'Core features like crop disease detection work without internet — built for rural Odisha.',
    size: 'normal',
  },
  {
    type: 'quote',
    icon: '💬',
    text: '"Finally an app that understands my problems in my own language."',
    author: 'Farmer, Kalahandi',
    size: 'tall',
  },
  {
    type: 'stat',
    icon: '🏥',
    value: '5+',
    label: 'Diseases Detected',
    accent: '#f4f4f0',
    size: 'short',
  },
  {
    type: 'info',
    icon: '🤝',
    title: 'Expert Backed',
    desc: 'AI trained on data from veterinarians and agricultural scientists across Odisha.',
    size: 'normal',
  },
  {
    type: 'stat',
    icon: '📍',
    value: '30+',
    label: 'Districts Covered',
    accent: '#b5f02a',
    size: 'short',
  },
  {
    type: 'info',
    icon: '🔒',
    title: 'Private & Safe',
    desc: 'Your farm data stays on your device. We never share or sell farmer information.',
    size: 'normal',
  },
]

const OUTLINE =
  '1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,0 0 12px rgba(0,0,0,0.95)'

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function MasonryCard({
  item,
  delay,
}: {
  item: (typeof MASONRY)[0]
  delay: number
}) {
  const { ref, visible } = useInView(0.08)
  const base: React.CSSProperties = {
    transition: `opacity 0.65s ${delay}ms ease, transform 0.65s ${delay}ms cubic-bezier(0.22,1,0.36,1)`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
  }
  if (item.type === 'stat') {
    const tall = item.size === 'tall'
    return (
      <div
        ref={ref}
        style={{
          ...base,
          background:
            item.accent === '#b5f02a' ? '#b5f02a' : 'rgba(255,255,255,0.06)',
          border:
            item.accent === '#b5f02a'
              ? 'none'
              : '1px solid rgba(244,244,240,0.08)',
          borderRadius: 2,
          padding: tall ? '48px 32px' : '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          gridRow: tall ? 'span 2' : 'span 1',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: tall ? '3rem' : '2rem' }}>{item.icon}</span>
        <span
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: tall ? '3.5rem' : '2.8rem',
            lineHeight: 1,
            color: item.accent === '#b5f02a' ? '#0d1a0d' : '#b5f02a',
            letterSpacing: '0.02em',
          }}
        >
          {item.value}
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:
              item.accent === '#b5f02a'
                ? 'rgba(13,26,13,0.7)'
                : 'rgba(244,244,240,0.55)',
          }}
        >
          {item.label}
        </span>
      </div>
    )
  }
  if (item.type === 'quote') {
    const tall = item.size === 'tall'
    return (
      <div
        ref={ref}
        style={{
          ...base,
          background: 'rgba(181,240,42,0.04)',
          border: '1px solid rgba(181,240,42,0.14)',
          borderRadius: 2,
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 16,
          gridRow: tall ? 'span 2' : 'span 1',
        }}
      >
        <span style={{ fontSize: '1.8rem' }}>💬</span>
        <p
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: tall ? '1.55rem' : '1.2rem',
            lineHeight: 1.3,
            color: '#f4f4f0',
            letterSpacing: '0.02em',
          }}
        >
          {item.text}
        </p>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#b5f02a',
          }}
        >
          — {item.author}
        </span>
      </div>
    )
  }
  return (
    <div
      ref={ref}
      style={{
        ...base,
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(244,244,240,0.07)',
        borderRadius: 2,
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 3,
          height: '100%',
          background:
            'linear-gradient(180deg,#b5f02a 0%,rgba(181,240,42,0.08) 100%)',
        }}
      />
      <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
      <h4
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: '1.2rem',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: '#f4f4f0',
          margin: 0,
        }}
      >
        {item.title}
      </h4>
      <p
        style={{
          fontSize: '0.82rem',
          color: 'rgba(244,244,240,0.55)',
          lineHeight: 1.7,
          fontWeight: 300,
          margin: 0,
        }}
      >
        {item.desc}
      </p>
    </div>
  )
}

export default function HomePage() {
  const [index, setIndex] = useState(0)
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    setEntered(false)
    setLeaving(false)
    const r = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true)),
    )
    const t1 = setTimeout(() => setLeaving(true), 2400)
    const t2 = setTimeout(() => setIndex((i) => (i + 1) % WORDS.length), 2900)
    return () => {
      cancelAnimationFrame(r)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [index])

  const wordAnim: React.CSSProperties = {
    display: 'block',
    willChange: 'transform,opacity',
    transform: leaving
      ? 'translateY(-115%)'
      : entered
        ? 'translateY(0)'
        : 'translateY(115%)',
    opacity: leaving ? 0 : entered ? 1 : 0,
    transition: leaving
      ? 'transform .42s cubic-bezier(.55,0,.78,0),opacity .35s ease'
      : entered
        ? 'transform .56s cubic-bezier(.22,1,.36,1),opacity .44s ease'
        : 'none',
  }
  const langAnim: React.CSSProperties = {
    ...wordAnim,
    transition: leaving
      ? 'transform .42s .04s cubic-bezier(.55,0,.78,0),opacity .35s ease'
      : entered
        ? 'transform .56s .06s cubic-bezier(.22,1,.36,1),opacity .44s ease'
        : 'none',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        html, body { background: #0d1a0d !important; }

        .hero-bg { background: url('/home-bg.jpeg') center center / cover no-repeat; }

        .card-hover { position: relative; overflow: hidden; transition: background .25s, border-color .25s, transform .22s; }
        .card-hover::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #b5f02a; transform: scaleX(0); transform-origin: left; transition: transform .32s cubic-bezier(.22,1,.36,1); }
        .card-hover:hover::before { transform: scaleX(1); }
        .card-hover:hover { background: rgba(181,240,42,.06); border-color: rgba(181,240,42,.22); transform: translateY(-3px); }

        .stat-vert { writing-mode: vertical-rl; transform: rotate(180deg); }

        .marquee-strip {
          width: 100%; height: 50px; overflow: hidden;
          background: #2F4F3A;
          border-bottom: 1px solid rgba(181,240,42,0.2);
          display: flex; align-items: center; padding-top: 18px;
        }

        .gallery-section {
          width: 100%; height: 520px;
          background: #7F8C63;
          border-top: 1px solid rgba(181,240,42,0.08);
          position: relative; overflow: hidden;
        }
        .gallery-header {
          position: absolute; top: 32px; left: 48px; right: 48px;
          display: flex; align-items: baseline; gap: 20px; z-index: 2;
          pointer-events: none;
        }

        .masonry-grid { display: grid; grid-template-columns: repeat(4,1fr); grid-auto-rows: 200px; gap: 12px; }

        @media (max-width: 1200px) { .masonry-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 900px) {
          .hero-section    { grid-template-columns: 1fr !important; padding: 0 20px !important; padding-top: 20px !important; }
          .right-col       { display: none !important; }
          .bottom-strip    { grid-template-columns: 1fr !important; }
          .masonry-section { padding: 56px 20px !important; }
          .masonry-grid    { grid-template-columns: repeat(2,1fr); grid-auto-rows: 180px; }
          .heading-row     { gap: 12px !important; }
          .vert-line       { height: clamp(3.5rem,9vw,7rem) !important; }
          .footer-cta      { padding: 60px 20px !important; }
          .marquee-strip { height: 44px; padding-top: 3px; }
          .gallery-section { height: 400px; }
          .gallery-header  { left: 20px; right: 20px; top: 20px; }
        }
        @media (max-width: 600px) {
          .masonry-grid { grid-template-columns: 1fr; grid-auto-rows: auto; }
          .masonry-grid > * { grid-row: span 1 !important; min-height: 130px; }
          .heading-row  { gap: 8px !important; }
          .bottom-strip { grid-template-columns: 1fr !important; }
          .gallery-section { height: 340px; }
        }
      `}</style>

      <div
        style={{
          fontFamily: "'DM Sans',sans-serif",
          background: '#0d1a0d',
          color: '#f4f4f0',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        {/* ══ MARQUEE ══ */}
        <div className="marquee-strip">
          <CurvedLoop
            marqueeText="🌾 KRISHI MITRA &nbsp;•&nbsp; YOUR FARMING COMPANION &nbsp;•&nbsp; AI POWERED &nbsp;•&nbsp; ODISHA FARMERS &nbsp;•&nbsp; CROP DOCTOR &nbsp;•&nbsp; LIVESTOCK CARE &nbsp;•&nbsp;"
            speed={1.4}
            curveAmount={0}
            direction="left"
            interactive={true}
          />
        </div>

        {/* ══ HERO ══ */}
        <section
          className="hero-section hero-bg"
          style={{
            position: 'relative',
            minHeight: 'calc(100vh - 72px)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            padding: '0 48px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '60px 0 80px',
              gap: 28,
            }}
          >
            <div
              className="heading-row"
              style={{ display: 'flex', alignItems: 'center', gap: 20 }}
            >
              <h1
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 'clamp(4rem,10vw,9.5rem)',
                  lineHeight: 1,
                  letterSpacing: '0.01em',
                  color: '#0d1a0d', // ← CHANGED: dark green
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  textShadow: 'none', // ← CHANGED: no outline needed on dark text
                }}
              >
                KRISHI
              </h1>
              <div
                className="vert-line"
                style={{
                  width: 3,
                  height: 'clamp(4rem,10vw,9.5rem)',
                  background:
                    'linear-gradient(180deg,rgba(181,240,42,.12) 0%,#b5f02a 45%,rgba(181,240,42,.12) 100%)',
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    overflow: 'hidden',
                    height: 'clamp(3.8rem,9.8vw,9rem)',
                  }}
                >
                  <span
                    key={`w-${index}`}
                    style={{
                      fontFamily: "'Bebas Neue',sans-serif",
                      fontSize: 'clamp(3.8rem,9.8vw,9rem)',
                      lineHeight: 1,
                      color: '#1a5c0a', // ← CHANGED: dark green for contrast
                      textTransform: 'uppercase',
                      letterSpacing: '0.01em',
                      textShadow: 'none', // ← CHANGED
                      ...wordAnim,
                    }}
                  >
                    {WORDS[index].word}
                  </span>
                </div>
                <div style={{ overflow: 'hidden', height: '1.1rem' }}>
                  <span
                    key={`l-${index}`}
                    style={{
                      display: 'block',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#1a5c0a', // ← CHANGED: dark green
                      ...langAnim,
                    }}
                  >
                    {WORDS[index].lang}
                  </span>
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: '0.95rem',
                color: '#1a2e10', // ← CHANGED: dark for readability
                maxWidth: 360,
                lineHeight: 1.78,
                fontWeight: 500, // ← CHANGED: slightly bolder
                textShadow: 'none', // ← CHANGED
              }}
            >
              Modern solutions, AI technology, and expert support to help Odisha
              farmers grow more.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link
                href="/livestock"
                style={{
                  padding: '13px 28px',
                  background: '#0d1a0d', // ← CHANGED: dark bg for button
                  color: '#f4f4f0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  transition: 'background .18s,transform .15s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b5f02a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0d1a0d'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Explore Services
              </Link>
              <Link
                href="/crop"
                style={{
                  padding: '13px 28px',
                  border: '1.5px solid #0d1a0d', // ← CHANGED: dark border
                  color: '#0d1a0d', // ← CHANGED: dark text
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'border-color .18s,color .18s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#b5f02a'
                  e.currentTarget.style.color = '#1a5c0a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#0d1a0d'
                  e.currentTarget.style.color = '#0d1a0d'
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: '1.5px solid currentColor',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.5rem',
                  }}
                >
                  ▶
                </span>
                Watch Video
              </Link>
            </div>
          </div>

          {/* ══ RIGHT COL — 3D LEAF TREE ══ */}
          <div
            className="right-col"
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '60px 0 80px',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 480,
                height: 620,
                overflow: 'hidden',
                marginRight: 300,
                marginLeft: -60,
                padding: '20px',
              }}
            >
              {/* Full transparent blocker */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  pointerEvents: 'all',
                  background: 'transparent',
                }}
              />
              <iframe
                title="Leaf Tree - PS1 Low Poly"
                frameBorder={0}
                allowFullScreen
                allow="autoplay; fullscreen; xr-spatial-tracking"
                src="https://sketchfab.com/models/d799c08100974e1ba352fcd646cb0694/embed?autospin=1&autostart=1&ui_theme=dark&transparent=1&ui_infos=0&ui_watermark=0&ui_watermark_link=0&ui_controls=0&ui_stop=0&ui_inspector=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&preload=1"
                style={{
                  position: 'absolute',
                  top: '-60px',
                  left: '-180px',
                  width: 'calc(100% + 360px)',
                  height: 'calc(100% + 120px)',
                  border: 'none',
                  display: 'block',
                  background: 'transparent',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* stats badge */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: '1.5rem',
                    color: '#f4f4f0',
                    letterSpacing: '0.02em',
                    textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                  }}
                >
                  10,000+
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    color: 'rgba(244,244,240,0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    textAlign: 'right',
                    lineHeight: 1.4,
                  }}
                >
                  Farmers
                  <br />
                  Benefited
                </span>
              </div>
              <div
                className="stat-vert"
                style={{
                  background: 'rgba(13,26,13,0.9)',
                  border: '1px solid rgba(181,240,42,0.3)',
                  padding: '12px 8px',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#b5f02a',
                }}
              >
                95% Positive Feedback
              </div>
            </div>
          </div>
        </section>

        {/* ══ BOTTOM STRIP ══ */}
        <div
          className="bottom-strip"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            minHeight: 190,
          }}
        >
          <div
            style={{
              background: '#080f08',
              padding: '36px 48px',
              display: 'flex',
              alignItems: 'center',
              borderTop: '1px solid rgba(181,240,42,0.07)',
            }}
          >
            <p
              style={{
                fontSize: '0.78rem',
                fontWeight: 500,
                color: 'rgba(244,244,240,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                lineHeight: 1.9,
                maxWidth: 240,
              }}
            >
              Modern farming solutions, technology, and expert support to help
              farmers grow more.
            </p>
          </div>
          <div
            style={{
              background: '#1a3d10',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '4.5rem', opacity: 0.6 }}>🌿</span>
          </div>
          <div
            style={{
              background: '#f4f4f0',
              color: '#0d1a0d',
              padding: '36px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <h3
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: '1.5rem',
                lineHeight: 1.1,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Modern Agriculture Solutions
            </h3>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#444',
                lineHeight: 1.7,
                maxWidth: 280,
              }}
            >
              We are dedicated to transforming agriculture with modern
              technology, innovation, and expert guidance for every farmer in
              Odisha.
            </p>
          </div>
        </div>

        {/* ══ CIRCULAR GALLERY ══ */}
        <div
          className="gallery-section"
          style={{ paddingTop: '80px', paddingBottom: '20px' }}
        >
          <div className="gallery-header">
            <h2
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(2.2rem,5vw,4rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: '#f4f4f0',
                whiteSpace: 'nowrap',
              }}
            >
              From the Fields
            </h2>
            <div
              style={{
                flex: 1,
                height: 1,
                background: 'rgba(244,244,240,0.08)',
                alignSelf: 'center',
              }}
            />
            <span
              style={{
                fontSize: '0.72rem',
                color: 'rgba(244,244,240,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Scroll to explore
            </span>
          </div>
          <CircularGallery
            items={GALLERY_ITEMS}
            bend={2}
            textColor="#b5f02a"
            borderRadius={0.06}
            font="bold 26px sans-serif"
            scrollSpeed={2.5}
            scrollEase={0.06}
          />
        </div>

        {/* ══ FEATURES ══ */}
        <FeaturesSection />

        {/* ══ MASONRY ══ */}
        <section
          className="masonry-section"
          style={{
            padding: '96px 48px',
            background: '#080f08',
            borderTop: '1px solid rgba(181,240,42,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 20,
              marginBottom: 56,
            }}
          >
            <h2
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(2.2rem,5vw,4rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              Why Farmers Trust Us
            </h2>
            <div
              style={{
                flex: 1,
                height: 1,
                background: 'rgba(244,244,240,0.08)',
              }}
            />
            <span
              style={{
                fontSize: '0.72rem',
                color: 'rgba(244,244,240,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Impact & Stories
            </span>
          </div>
          <div className="masonry-grid">
            {MASONRY.map((item, i) => (
              <MasonryCard
                key={i}
                item={item}
                delay={Math.min(i % 4, 3) * 75}
              />
            ))}
          </div>
        </section>

        {/* ══ FOOTER CTA ══ */}
        <section
          className="footer-cta"
          style={{
            padding: '80px 48px',
            background: '#b5f02a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 'clamp(2.5rem,6vw,5rem)',
              color: '#0d1a0d',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}
          >
            Ready to Grow Smarter?
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'rgba(13,26,13,0.7)',
              maxWidth: 400,
              lineHeight: 1.78,
            }}
          >
            Join thousands of Odisha farmers already using KrishiMitra to
            protect their crops and livestock.
          </p>
          <Link
            href="/livestock"
            style={{
              padding: '14px 36px',
              background: '#0d1a0d',
              color: '#f4f4f0',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'background .18s,transform .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a3010'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0d1a0d'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Start for Free
          </Link>
        </section>
      </div>
    </>
  )
}
