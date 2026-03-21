import { useEffect, useRef } from 'react'
import { genShape, N, SHAPES, LABELS, COLORS } from '../../data/shapes.js'

const FORM_FRAMES     = 300   // 5 s @ 60 fps
const HOLD_FRAMES     = 600   // 10 s @ 60 fps
const DISSOLVE_FRAMES = 120   // 2 s @ 60 fps
const ST_FORM=0, ST_HOLD=1, ST_DISSOLVE=2

export default function NeuralCanvas({ activeShape, onShapeChange }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef({ shapeIdx:0, state:ST_FORM, stateT:0 })
  const nodesRef  = useRef([])
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // init nodes only if not already initialized
    if (nodesRef.current.length === 0) {
      nodesRef.current = Array.from({length:N}, (_,i) => ({
        x:(Math.random()-0.5)*1.6, y:(Math.random()-0.5)*1.5,
        tx:0, ty:0, ox:0, oy:0,
        phase: i*0.19, r:0.7+Math.random()*1.6,
      }))
    }

    let W, H, CX, CY, SCALE

    function resize() {
      const hero = canvas.parentElement
      if (!hero) return
      const heroH = hero.offsetHeight
      const dim   = Math.round(heroH * 1.575)
      canvas.width  = dim; canvas.height  = dim
      canvas.style.width  = dim+'px'; canvas.style.height = dim+'px'
      W=dim; H=dim; CX=dim/2; CY=dim/2; SCALE=Math.min(W,H)*0.38
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes = nodesRef.current
    const sr = stateRef.current

    function scatterNodes() {
      nodes.forEach(n => {
        const a=Math.random()*Math.PI*2, r=0.60+Math.random()*0.80
        n.ox=Math.cos(a)*r; n.oy=Math.sin(a)*r
        n.x=n.ox; n.y=n.oy
      })
    }
    function loadShape(name) {
      const pts=genShape(name)
      const order=[...Array(N).keys()].sort(()=>Math.random()-0.5)
      pts.forEach((pt,i)=>{ nodes[order[i]].tx=pt[0]; nodes[order[i]].ty=pt[1] })
      nodes.forEach(n=>{ n.ox=n.x; n.oy=n.y })
    }

    const easeOut   = t => 1-Math.pow(1-t,3)
    const easeIn    = t => t*t*t
    const easeInOut = t => t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2

    // scatter then form first shape
    scatterNodes()
    loadShape(SHAPES[sr.shapeIdx])
    sr.state=ST_FORM; sr.stateT=0

    let mouseX=0, mouseY=0
    function onMouseMove(e) {
      const rect=canvas.getBoundingClientRect(); mouseX=e.clientX-rect.left; mouseY=e.clientY-rect.top
    }
    canvas.addEventListener('mousemove', onMouseMove)

    function toPixel(nx,ny){ return [CX+nx*SCALE, CY+ny*SCALE] }

    function frame() {
      if (!canvas.parentElement) return
      ctx.clearRect(0,0,W,H)
      sr.stateT++

      if (sr.state===ST_FORM) {
        const t=Math.min(1,sr.stateT/FORM_FRAMES), e=easeOut(t)
        nodes.forEach(n=>{ n.x=n.ox+(n.tx-n.ox)*e; n.y=n.oy+(n.ty-n.oy)*e })
        if (sr.stateT>=FORM_FRAMES) {
          nodes.forEach(n=>{ n.x=n.tx; n.y=n.ty })
          sr.state=ST_HOLD; sr.stateT=0
        }
      }
      else if (sr.state===ST_HOLD) {
        nodes.forEach(n=>{ n.x=n.tx; n.y=n.ty })
        if (sr.stateT>=HOLD_FRAMES) {
          nodes.forEach(n=>{ n.ox=n.tx; n.oy=n.ty })
          nodes.forEach(n=>{
            const a=Math.random()*Math.PI*2, r=0.65+Math.random()*0.85
            n.tx=Math.cos(a)*r; n.ty=Math.sin(a)*r
          })
          sr.state=ST_DISSOLVE; sr.stateT=0
        }
      }
      else if (sr.state===ST_DISSOLVE) {
        const t=Math.min(1,sr.stateT/DISSOLVE_FRAMES), e=easeIn(t)
        nodes.forEach(n=>{ n.x=n.ox+(n.tx-n.ox)*e; n.y=n.oy+(n.ty-n.oy)*e })
        if (sr.stateT>=DISSOLVE_FRAMES) {
          sr.shapeIdx=(sr.shapeIdx+1)%SHAPES.length
          nodes.forEach(n=>{ n.ox=n.x; n.oy=n.y })
          loadShape(SHAPES[sr.shapeIdx])
          onShapeChange?.(SHAPES[sr.shapeIdx])
          sr.state=ST_FORM; sr.stateT=0
        }
      }

      const ac=COLORS[SHAPES[sr.shapeIdx]]
      const CON=sr.state===ST_HOLD?0.22:0.32
      const baseA=sr.state===ST_HOLD?0.45:0.25
      const lw=sr.state===ST_HOLD?1.1:0.7

      for (let i=0;i<N;i++) {
        const a=nodes[i],[ax,ay]=toPixel(a.x,a.y)
        for (let j=i+1;j<N;j++) {
          const b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy)
          if (dist<CON) {
            const alpha=(1-dist/CON)*baseA
            ctx.beginPath(); ctx.moveTo(ax,ay)
            const[bx,by]=toPixel(b.x,b.y); ctx.lineTo(bx,by)
            ctx.strokeStyle=ac+alpha+')'; ctx.lineWidth=lw; ctx.stroke()
          }
        }
      }

      const mnx=(mouseX-CX)/SCALE, mny=(mouseY-CY)/SCALE
      nodes.forEach(n=>{
        const dx=mnx-n.x,dy=mny-n.y,dist=Math.sqrt(dx*dx+dy*dy)
        if (dist<0.45) {
          const alpha=(1-dist/0.45)*0.35
          const[nx,ny]=toPixel(n.x,n.y)
          ctx.beginPath(); ctx.moveTo(nx,ny); ctx.lineTo(mouseX,mouseY)
          ctx.strokeStyle=ac+alpha+')'; ctx.lineWidth=0.9; ctx.stroke()
        }
      })

      nodes.forEach(n=>{
        n.phase+=0.018
        const pulse=sr.state===ST_HOLD?Math.sin(n.phase)*0.3+0.7:Math.sin(n.phase)*0.4+0.6
        const[px,py]=toPixel(n.x,n.y)
        const radius=sr.state===ST_HOLD?n.r*1.1+0.4:n.r*pulse+0.3
        ctx.beginPath(); ctx.arc(px,py,radius,0,Math.PI*2)
        ctx.fillStyle=ac+(sr.state===ST_HOLD?0.75:0.35+pulse*0.45)+')'; ctx.fill()
      })

      rafRef.current=requestAnimationFrame(frame)
    }
    rafRef.current=requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  // react to pill clicks from outside
  useEffect(() => {
    if (!activeShape) return
    const sr=stateRef.current
    const nodes=nodesRef.current
    if (!nodes.length) return
    const newIdx=SHAPES.indexOf(activeShape)
    if (newIdx<0) return
    sr.shapeIdx=newIdx
    nodes.forEach(n=>{ n.ox=n.x; n.oy=n.y })
    nodes.forEach(n=>{ const a=Math.random()*Math.PI*2,r=0.65+Math.random()*0.85; n.tx=Math.cos(a)*r; n.ty=Math.sin(a)*r })
    sr.state=ST_DISSOLVE; sr.stateT=0
  }, [activeShape])

  return (
    <canvas
      ref={canvasRef}
      id="neural-canvas"
      style={{
        position:'absolute',
        top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        zIndex:0,
        pointerEvents:'auto',
        display:'block',
      }}
    />
  )
}

// Made with Bob
