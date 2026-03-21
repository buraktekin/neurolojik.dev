export const N = 150

export function genShape(name) {
  const p = []
  function seg(ax, ay, bx, by, n) {
    for (let i = 0; i < n; i++) { const t = i/(n-1); p.push([ax+(bx-ax)*t, ay+(by-ay)*t]) }
  }
  function arc(cx, cy, rx, ry, a0, a1, n) {
    for (let i = 0; i < n; i++) { const a = a0+(a1-a0)*(i/(n-1)); p.push([cx+Math.cos(a)*rx, cy+Math.sin(a)*ry]) }
  }

  if (name === 'photo') {
    const bx=-0.68,by=-0.28,bw=1.36,bh=0.66,r=0.11
    seg(bx+r,by,bx+bw-r,by,9); arc(bx+bw-r,by+r,r,r,-Math.PI/2,0,4)
    seg(bx+bw,by+r,bx+bw,by+bh-r,5); arc(bx+bw-r,by+bh-r,r,r,0,Math.PI/2,4)
    seg(bx+bw-r,by+bh,bx+r,by+bh,9); arc(bx+r,by+bh-r,r,r,Math.PI/2,Math.PI,4)
    seg(bx,by+bh-r,bx,by+r,5); arc(bx+r,by+r,r,r,Math.PI,Math.PI*1.5,4)
    arc(0.06,by+bh/2+0.04,0.23,0.23,0,Math.PI*2,12)
    arc(0.06,by+bh/2+0.04,0.13,0.13,0,Math.PI*2,8)
    for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;p.push([0.06+Math.cos(a)*0.04,by+bh/2+0.04+Math.sin(a)*0.04])}
    seg(-0.18,by,-0.18,by-0.17,3); seg(-0.18,by-0.17,0.22,by-0.17,4); seg(0.22,by-0.17,0.22,by,3)
    arc(-0.46,by-0.08,0.07,0.07,0,Math.PI*2,5)
  }
  else if (name === 'food') {
    // Croissant - exact replica with 7 triangular segments
    const segments = 7;
    const startAngle = Math.PI * 0.20;
    const endAngle = Math.PI * 1.80;
    const angleSpan = endAngle - startAngle;
    
    // Outer crescent (detailed)
    for(let i=0;i<30;i++){
      const t = i/29;
      const a = startAngle + t * angleSpan;
      p.push([Math.cos(a) * 0.65, Math.sin(a) * 0.65]);
    }
    
    // Inner crescent (detailed)
    for(let i=0;i<30;i++){
      const t = i/29;
      const a = startAngle + t * angleSpan;
      p.push([Math.cos(a) * 0.30, Math.sin(a) * 0.30]);
    }
    
    // 7 triangular segments with gaps
    for(let seg=0; seg<segments; seg++){
      const segmentAngle = startAngle + (seg + 0.5) * (angleSpan / segments);
      
      // Left edge of segment
      for(let i=0;i<6;i++){
        const t = i/5;
        const r = 0.30 + t * 0.35;
        const offset = -0.08;
        p.push([Math.cos(segmentAngle + offset) * r, Math.sin(segmentAngle + offset) * r]);
      }
      
      // Right edge of segment
      for(let i=0;i<6;i++){
        const t = i/5;
        const r = 0.30 + t * 0.35;
        const offset = 0.08;
        p.push([Math.cos(segmentAngle + offset) * r, Math.sin(segmentAngle + offset) * r]);
      }
      
      // Segment tip (outer edge)
      const tipAngle = segmentAngle;
      for(let i=0;i<3;i++){
        const offset = -0.08 + i * 0.08;
        p.push([Math.cos(tipAngle + offset) * 0.65, Math.sin(tipAngle + offset) * 0.65]);
      }
    }
    
    // Pointed ends
    seg(-0.56, -0.38, -0.62, -0.44, 4);
    seg(0.56, -0.38, 0.62, -0.44, 4);
  }
  else if (name === 'travel') {
    arc(0,0,0.10,0.70,0,Math.PI*2,14)
    for(let i=0;i<18;i++){const t=i/17;const a=Math.PI+t*Math.PI;p.push([Math.cos(a)*0.78,Math.sin(a)*0.13-0.06])}
    seg(-0.78,-0.06,-0.22,-0.27,5); seg(0.22,-0.27,0.78,-0.06,5)
    arc(0,-0.70,0.10,0.10,Math.PI,Math.PI*2,6)
    for(let i=0;i<8;i++){const t=i/7;const a=Math.PI+t*Math.PI;p.push([Math.cos(a)*0.33,Math.sin(a)*0.09+0.56])}
    seg(-0.33,0.56,-0.09,0.42,3); seg(0.09,0.42,0.33,0.56,3)
    arc(-0.48,-0.09,0.055,0.13,0,Math.PI*2,5); arc(0.48,-0.09,0.055,0.13,0,Math.PI*2,5)
    seg(0,-0.70,0,0.70,7)
  }
  else if (name === 'life') {
    // Home/House shape
    // Roof (triangle)
    seg(-0.65, 0.05, 0, -0.60, 12);
    seg(0, -0.60, 0.65, 0.05, 12);
    seg(-0.65, 0.05, 0.65, 0.05, 14);
    
    // House body (rectangle)
    seg(-0.55, 0.05, -0.55, 0.65, 10);
    seg(0.55, 0.05, 0.55, 0.65, 10);
    seg(-0.55, 0.65, 0.55, 0.65, 12);
    
    // Door
    seg(-0.15, 0.30, -0.15, 0.65, 6);
    seg(0.15, 0.30, 0.15, 0.65, 6);
    arc(0, 0.30, 0.15, 0.15, Math.PI, 0, 6);
    
    // Windows (2 windows)
    // Left window
    seg(-0.42, 0.15, -0.42, 0.40, 4);
    seg(-0.25, 0.15, -0.25, 0.40, 4);
    seg(-0.42, 0.15, -0.25, 0.15, 3);
    seg(-0.42, 0.40, -0.25, 0.40, 3);
    seg(-0.335, 0.15, -0.335, 0.40, 4);
    seg(-0.42, 0.275, -0.25, 0.275, 3);
    
    // Right window
    seg(0.25, 0.15, 0.25, 0.40, 4);
    seg(0.42, 0.15, 0.42, 0.40, 4);
    seg(0.25, 0.15, 0.42, 0.15, 3);
    seg(0.25, 0.40, 0.42, 0.40, 3);
    seg(0.335, 0.15, 0.335, 0.40, 4);
    seg(0.25, 0.275, 0.42, 0.275, 3);
    
    // Chimney
    seg(0.30, -0.35, 0.30, -0.15, 4);
    seg(0.45, -0.35, 0.45, -0.15, 4);
    seg(0.30, -0.35, 0.45, -0.35, 3);
  }
  else {
    // Fractal tree with recursive branching - fills entire width
    function branch(x1, y1, angle, length, depth) {
      if (depth === 0 || length < 0.02) return;
      
      // Calculate end point
      const x2 = x1 + Math.cos(angle) * length;
      const y2 = y1 + Math.sin(angle) * length;
      
      // Draw branch line
      const steps = Math.max(2, Math.floor(length * 15));
      for(let i=0; i<=steps; i++){
        const t = i / steps;
        p.push([x1 + (x2-x1)*t, y1 + (y2-y1)*t]);
      }
      
      // Recursive branches
      const angleSpread = 0.5; // Wider angle spread
      const lengthRatio = 0.7; // Branch length reduction
      
      // Left branch
      branch(x2, y2, angle - angleSpread, length * lengthRatio, depth - 1);
      // Right branch
      branch(x2, y2, angle + angleSpread, length * lengthRatio, depth - 1);
    }
    
    // Main trunk - start from bottom center, grow upward
    const trunkHeight = 0.35;
    seg(0, 0.75, 0, 0.75 - trunkHeight, 8);
    
    // Start recursive branching from top of trunk
    const startY = 0.75 - trunkHeight;
    const initialAngle = -Math.PI / 2; // Point upward
    const initialLength = 0.30; // Long initial branches
    const maxDepth = 6; // Deep recursion for many branches
    
    branch(0, startY, initialAngle, initialLength, maxDepth);
  }

  while (p.length < N) p.push(p[Math.floor(Math.random()*Math.max(1,p.length-1))])
  return p.slice(0, N)
}

export const SHAPES = ['photo','food','travel','life','code']
export const LABELS = ['// camera.silhouette','// croissant.layers','// fuselage.form','// home.shelter','// fractal.branches']
export const COLORS = {
  photo: 'rgba(0,212,255,',
  food:  'rgba(255,193,7,',
  travel:'rgba(168,85,247,',
  life:  'rgba(0,245,160,',
  code:  'rgba(255,255,255,',
}
