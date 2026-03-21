/**
 * Neural Network Animation - Standalone JavaScript
 * Forms recognizable shapes: camera, knife, plane, heart, binary tree
 * Extracted from working .dummy/index.html implementation
 */

(function() {
  'use strict';

  // Wait for both DOM and React to be ready
  function waitForCanvas() {
    console.log('[Neural Animation] Waiting for canvas...');
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
      console.log('[Neural Animation] Canvas found! Initializing...');
      initNeuralAnimation(canvas);
    } else {
      console.log('[Neural Animation] Canvas not found, retrying in 100ms...');
      // React hasn't rendered yet, try again in 100ms
      setTimeout(waitForCanvas, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForCanvas);
  } else {
    waitForCanvas();
  }

  function initNeuralAnimation(canvas) {

    const ctx = canvas.getContext('2d');
    const N = 150;
    let W, H, heroH, CX, CY, SCALE;

    function resize() {
      const hero = canvas.parentElement;
      if (!hero) return;
      heroH = hero.offsetHeight;
      const dim = Math.round(heroH * 1.575);
      canvas.width = dim;
      canvas.height = dim;
      canvas.style.width = dim + 'px';
      canvas.style.height = dim + 'px';
      W = dim;
      H = dim;
      CX = W / 2;
      CY = H / 2;
      SCALE = Math.min(W, H) * 0.38;
    }

    resize();
    window.addEventListener('resize', resize);

    function genShape(name) {
      const p = [];
      function seg(ax, ay, bx, by, n) {
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1);
          p.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
        }
      }
      function arc(cx, cy, rx, ry, a0, a1, n) {
        for (let i = 0; i < n; i++) {
          const a = a0 + (a1 - a0) * (i / (n - 1));
          p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
        }
      }

      if (name === 'photo') {
        const bx = -0.68, by = -0.28, bw = 1.36, bh = 0.66, r = 0.11;
        seg(bx + r, by, bx + bw - r, by, 9);
        arc(bx + bw - r, by + r, r, r, -Math.PI / 2, 0, 4);
        seg(bx + bw, by + r, bx + bw, by + bh - r, 5);
        arc(bx + bw - r, by + bh - r, r, r, 0, Math.PI / 2, 4);
        seg(bx + bw - r, by + bh, bx + r, by + bh, 9);
        arc(bx + r, by + bh - r, r, r, Math.PI / 2, Math.PI, 4);
        seg(bx, by + bh - r, bx, by + r, 5);
        arc(bx + r, by + r, r, r, Math.PI, Math.PI * 1.5, 4);
        arc(0.06, by + bh / 2 + 0.04, 0.23, 0.23, 0, Math.PI * 2, 12);
        arc(0.06, by + bh / 2 + 0.04, 0.13, 0.13, 0, Math.PI * 2, 8);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          p.push([0.06 + Math.cos(a) * 0.04, by + bh / 2 + 0.04 + Math.sin(a) * 0.04]);
        }
        seg(-0.18, by, -0.18, by - 0.17, 3);
        seg(-0.18, by - 0.17, 0.22, by - 0.17, 4);
        seg(0.22, by - 0.17, 0.22, by, 3);
        arc(-0.46, by - 0.08, 0.07, 0.07, 0, Math.PI * 2, 5);
      } else if (name === 'food') {
        // Croissant - exact replica with 7 triangular segments
        const segments = 7;
        const startAngle = Math.PI * 0.20;
        const endAngle = Math.PI * 1.80;
        const angleSpan = endAngle - startAngle;
        
        // Outer crescent (detailed)
        for (let i = 0; i < 30; i++) {
          const t = i / 29;
          const a = startAngle + t * angleSpan;
          p.push([Math.cos(a) * 0.65, Math.sin(a) * 0.65]);
        }
        
        // Inner crescent (detailed)
        for (let i = 0; i < 30; i++) {
          const t = i / 29;
          const a = startAngle + t * angleSpan;
          p.push([Math.cos(a) * 0.30, Math.sin(a) * 0.30]);
        }
        
        // 7 triangular segments with gaps
        for (let seg = 0; seg < segments; seg++) {
          const segmentAngle = startAngle + (seg + 0.5) * (angleSpan / segments);
          
          // Left edge of segment
          for (let i = 0; i < 6; i++) {
            const t = i / 5;
            const r = 0.30 + t * 0.35;
            const offset = -0.08;
            p.push([Math.cos(segmentAngle + offset) * r, Math.sin(segmentAngle + offset) * r]);
          }
          
          // Right edge of segment
          for (let i = 0; i < 6; i++) {
            const t = i / 5;
            const r = 0.30 + t * 0.35;
            const offset = 0.08;
            p.push([Math.cos(segmentAngle + offset) * r, Math.sin(segmentAngle + offset) * r]);
          }
          
          // Segment tip (outer edge)
          const tipAngle = segmentAngle;
          for (let i = 0; i < 3; i++) {
            const offset = -0.08 + i * 0.08;
            p.push([Math.cos(tipAngle + offset) * 0.65, Math.sin(tipAngle + offset) * 0.65]);
          }
        }
        
        // Pointed ends
        seg(-0.56, -0.38, -0.62, -0.44, 4);
        seg(0.56, -0.38, 0.62, -0.44, 4);
      } else if (name === 'travel') {
        arc(0, 0, 0.10, 0.70, 0, Math.PI * 2, 14);
        for (let i = 0; i < 18; i++) {
          const t = i / 17;
          const a = Math.PI + t * Math.PI;
          p.push([Math.cos(a) * 0.78, Math.sin(a) * 0.13 - 0.06]);
        }
        seg(-0.78, -0.06, -0.22, -0.27, 5);
        seg(0.22, -0.27, 0.78, -0.06, 5);
        arc(0, -0.70, 0.10, 0.10, Math.PI, Math.PI * 2, 6);
        for (let i = 0; i < 8; i++) {
          const t = i / 7;
          const a = Math.PI + t * Math.PI;
          p.push([Math.cos(a) * 0.33, Math.sin(a) * 0.09 + 0.56]);
        }
        seg(-0.33, 0.56, -0.09, 0.42, 3);
        seg(0.09, 0.42, 0.33, 0.56, 3);
        arc(-0.48, -0.09, 0.055, 0.13, 0, Math.PI * 2, 5);
        arc(0.48, -0.09, 0.055, 0.13, 0, Math.PI * 2, 5);
        seg(0, -0.70, 0, 0.70, 7);
      } else if (name === 'life') {
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
      } else {
        // Fractal tree with recursive branching - fills entire width
        function branch(x1, y1, angle, length, depth) {
          if (depth === 0 || length < 0.02) return;
          
          // Calculate end point
          const x2 = x1 + Math.cos(angle) * length;
          const y2 = y1 + Math.sin(angle) * length;
          
          // Draw branch line
          const steps = Math.max(2, Math.floor(length * 15));
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            p.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
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

      while (p.length < N) p.push(p[Math.floor(Math.random() * Math.max(1, p.length - 1))]);
      return p.slice(0, N);
    }

    // State machine constants
    const SHAPES = ['photo', 'food', 'travel', 'life', 'code'];
    
    // Function to get colors based on theme
    function getColors() {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      const isLight = theme === 'light' || theme === 'sepia';
      
      if (isLight) {
        return {
          photo: 'rgba(8,145,178,',      // Darker cyan for light themes
          food: 'rgba(217,119,6,',       // Darker yellow for light themes
          travel: 'rgba(124,58,237,',    // Darker purple for light themes
          life: 'rgba(5,150,105,',       // Darker green for light themes
          code: 'rgba(15,23,42,'         // Dark slate for light themes
        };
      }
      
      // Default dark theme colors
      return {
        photo: 'rgba(0,212,255,',
        food: 'rgba(255,193,7,',
        travel: 'rgba(168,85,247,',
        life: 'rgba(0,245,160,',
        code: 'rgba(255,255,255,'
      };
    }
    
    let COLORS = getColors();
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      COLORS = getColors();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    const FORM_FRAMES = 300;      // 5s @ 60fps
    const HOLD_FRAMES = 600;      // 10s @ 60fps
    const DISSOLVE_FRAMES = 120;  // 2s @ 60fps
    const ST_FORM = 0, ST_HOLD = 1, ST_DISSOLVE = 2;

    // Initialize nodes
    const nodes = Array.from({ length: N }, (_, i) => ({
      x: (Math.random() - 0.5) * 1.6,
      y: (Math.random() - 0.5) * 1.5,
      tx: 0, ty: 0,
      ox: 0, oy: 0,
      phase: i * 0.19,
      r: 0.7 + Math.random() * 1.6
    }));

    let shapeIdx = 0;
    let state = ST_FORM;
    let stateT = 0;
    let activeColor = COLORS['photo'];

    function scatterNodes() {
      nodes.forEach(n => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.60 + Math.random() * 0.80;
        n.ox = Math.cos(angle) * radius;
        n.oy = Math.sin(angle) * radius;
        n.x = n.ox;
        n.y = n.oy;
      });
    }

    function loadShape(name) {
      const pts = genShape(name);
      const order = [...Array(N).keys()].sort(() => Math.random() - 0.5);
      pts.forEach((pt, i) => {
        nodes[order[i]].tx = pt[0];
        nodes[order[i]].ty = pt[1];
      });
      nodes.forEach(n => {
        n.ox = n.x;
        n.oy = n.y;
      });
      activeColor = COLORS[name];
    }

    // Easing functions
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const easeInCubic = t => t * t * t;

    // Initialize
    scatterNodes();
    loadShape(SHAPES[0]);
    state = ST_FORM;
    stateT = 0;
    
    // Dispatch initial shape event
    setTimeout(() => {
      const event = new CustomEvent('neuralShapeChange', {
        detail: { shape: SHAPES[0] }
      });
      window.dispatchEvent(event);
    }, 100);

    // Listen for forced shape changes from pill clicks
    window.addEventListener('forceShapeChange', (e) => {
      const requestedShape = e.detail.shape;
      const requestedIdx = SHAPES.indexOf(requestedShape);
      
      if (requestedIdx !== -1 && requestedIdx !== shapeIdx) {
        // Force immediate transition to requested shape
        shapeIdx = requestedIdx;
        
        // Set current positions as origin
        nodes.forEach(n => {
          n.ox = n.x;
          n.oy = n.y;
        });
        
        // Load the new shape
        loadShape(SHAPES[shapeIdx]);
        
        // Start forming immediately
        state = ST_FORM;
        stateT = 0;
      }
    });

    let mouseX = 0, mouseY = 0;
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    });

    function toPixel(nx, ny) {
      return [CX + nx * SCALE, CY + ny * SCALE];
    }

    function drawNeural() {
      ctx.clearRect(0, 0, W, H);
      stateT++;

      // State transitions
      if (state === ST_FORM) {
        const t = Math.min(1, stateT / FORM_FRAMES);
        const e = easeOutCubic(t);
        nodes.forEach(n => {
          n.x = n.ox + (n.tx - n.ox) * e;
          n.y = n.oy + (n.ty - n.oy) * e;
        });
        if (stateT >= FORM_FRAMES) {
          nodes.forEach(n => {
            n.x = n.tx;
            n.y = n.ty;
          });
          state = ST_HOLD;
          stateT = 0;
        }
      } else if (state === ST_HOLD) {
        nodes.forEach(n => {
          n.x = n.tx;
          n.y = n.ty;
        });
        if (stateT >= HOLD_FRAMES) {
          nodes.forEach(n => {
            n.ox = n.tx;
            n.oy = n.ty;
          });
          nodes.forEach(n => {
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.65 + Math.random() * 0.85;
            n.tx = Math.cos(angle) * radius;
            n.ty = Math.sin(angle) * radius;
          });
          state = ST_DISSOLVE;
          stateT = 0;
        }
      } else if (state === ST_DISSOLVE) {
        const t = Math.min(1, stateT / DISSOLVE_FRAMES);
        const e = easeInCubic(t);
        nodes.forEach(n => {
          n.x = n.ox + (n.tx - n.ox) * e;
          n.y = n.oy + (n.ty - n.oy) * e;
        });
        if (stateT >= DISSOLVE_FRAMES) {
          shapeIdx = (shapeIdx + 1) % SHAPES.length;
          nodes.forEach(n => {
            n.ox = n.x;
            n.oy = n.y;
          });
          loadShape(SHAPES[shapeIdx]);
          
          // Dispatch custom event to notify React component
          const event = new CustomEvent('neuralShapeChange', {
            detail: { shape: SHAPES[shapeIdx] }
          });
          window.dispatchEvent(event);
          
          state = ST_FORM;
          stateT = 0;
        }
      }

      // Draw connections
      const CON = state === ST_HOLD ? 0.22 : 0.32;
      const baseAlpha = state === ST_HOLD ? 0.45 : 0.25;
      const lineWidth = state === ST_HOLD ? 1.1 : 0.7;

      for (let i = 0; i < N; i++) {
        const a = nodes[i], [ax, ay] = toPixel(a.x, a.y);
        for (let j = i + 1; j < N; j++) {
          const b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CON) {
            const alpha = (1 - dist / CON) * baseAlpha;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            const [bx, by] = toPixel(b.x, b.y);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = activeColor + alpha + ')';
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        }
      }

      // Mouse attractor
      const mnx = (mouseX - CX) / SCALE, mny = (mouseY - CY) / SCALE;
      nodes.forEach(n => {
        const dx = mnx - n.x, dy = mny - n.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.45) {
          const alpha = (1 - dist / 0.45) * 0.35;
          const [nx, ny] = toPixel(n.x, n.y);
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = activeColor + alpha + ')';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      });

      // Draw nodes with 3D depth effect
      nodes.forEach((n, idx) => {
        n.phase += 0.018;
        const pulse = state === ST_HOLD ? Math.sin(n.phase) * 0.3 + 0.7 : Math.sin(n.phase) * 0.4 + 0.6;
        const [px, py] = toPixel(n.x, n.y);
        
        // 3D depth: nodes closer to center appear larger and brighter
        const distFromCenter = Math.sqrt(n.x * n.x + n.y * n.y);
        const depthFactor = 1.2 - Math.min(distFromCenter * 0.5, 0.6); // 0.6 to 1.2
        
        const radius = state === ST_HOLD ? n.r * 1.1 * depthFactor + 0.4 : n.r * pulse * depthFactor + 0.3;
        const alpha = state === ST_HOLD ? 0.75 * depthFactor : (0.35 + pulse * 0.45) * depthFactor;
        
        // Outer glow for 3D effect
        if (state === ST_HOLD) {
          ctx.beginPath();
          ctx.arc(px, py, radius * 2.2, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius * 2.2);
          gradient.addColorStop(0, activeColor + (alpha * 0.3) + ')');
          gradient.addColorStop(1, activeColor + '0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        
        // Main node with gradient for depth
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        const nodeGradient = ctx.createRadialGradient(px - radius * 0.3, py - radius * 0.3, 0, px, py, radius);
        nodeGradient.addColorStop(0, activeColor + Math.min(alpha * 1.3, 1) + ')');
        nodeGradient.addColorStop(1, activeColor + (alpha * 0.6) + ')');
        ctx.fillStyle = nodeGradient;
        ctx.fill();
      });

      requestAnimationFrame(drawNeural);
    }

    drawNeural();
  }
})();

// Made with Bob
