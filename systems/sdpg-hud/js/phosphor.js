/* ============================================================
   SDPG-HUD - phosphor sweep
   A WebGL2 surface treatment: a radar sweep decaying across a
   phosphor screen, scanlines, grain, and range rings that track
   the pointer. The pointer is the target.

   Contract (see STANDARD.md §6):
   - Enhancement only. The static design underneath is complete,
     and the canvas stays transparent until its first frame.
   - Colours are READ FROM TOKENS at runtime. The shader mixes
     between --ground and --ink and emits nothing else, so the
     system's no-chroma rule holds by construction rather than
     by care.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    sweepRate: 0.55,   // radians per second
    persist: 2.3,      // trail decay; higher is a shorter tail
    scanline: 0.14,    // scanline depth
    grain: 0.05,       // phosphor grain
    rings: 3,          // range rings around the target
    ringGap: 0.075,
    stiffness: 52,     // pointer spring
    damping: 9,
    dprCap: 1.75
  };

  var VERT =
    "#version 300 es\n" +
    "void main(){vec2 v=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(v*2.0-1.0,0.,1.);}";

  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "#define TAU 6.28318530718",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform vec2 uM;",
    "uniform float uEngage;",
    "uniform vec3 uGround;",
    "uniform vec3 uInk;",
    "uniform float uSweep, uPersist, uScan, uGrain, uRingGap;",
    "uniform int uRings;",
    "out vec4 o;",

    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",

    // A hairline of a given half-width, antialiased in screen space.
    // Written ascending and inverted: smoothstep with edge0 > edge1 is
    // undefined in GLSL ES, and drivers disagree about what it does.
    "float line(float d, float w, float px){ return 1.0 - smoothstep(w - px, w + px, abs(d)); }",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes;",
    "  float asp = uRes.x / max(uRes.y, 1.0);",
    "  vec2 p = vec2((uv.x - 0.5) * asp, uv.y - 0.5);",

    "  float ink = 0.0;",

    // --- graph-paper ground, the same grid the page carries ---
    "  vec2 ggrid = fract(uv * vec2(18.0 * asp, 18.0)) - 0.5;",
    "  ink += 0.10 * max(line(ggrid.x, 0.012, 0.02), line(ggrid.y, 0.012, 0.02));",

    // --- the sweep: a beam rotating about the centre, leaving persistence ---
    "  float ang = atan(p.y, p.x);",
    "  float beam = mod(uTime * uSweep, TAU);",
    "  float delta = mod(beam - ang, TAU);",
    "  float trail = exp(-delta * uPersist);",
    "  float reach = 1.0 - smoothstep(0.0, 0.62, length(p));",
    "  ink += trail * reach * 0.55;",
    "  ink += line(delta, 0.006, 0.01) * reach * 0.5;",   // the leading edge

    // --- range rings, locked to the pointer ---
    "  vec2 m = vec2((uM.x - 0.5) * asp, uM.y - 0.5);",
    "  float dm = distance(p, m);",
    "  float pulse = 0.5 + 0.5 * sin(uTime * 1.6);",
    "  for (int i = 1; i <= 4; i++) {",
    "    if (i > uRings) break;",
    "    float r = uRingGap * float(i) + 0.004 * pulse;",
    "    ink += line(dm - r, 0.0016, 0.0022) * uEngage * 0.85;",
    "  }",
    // crosshair ticks at the target
    "  float tick = max(line(p.y - m.y, 0.0016, 0.002) * step(abs(p.x - m.x), 0.035),",
    "                   line(p.x - m.x, 0.0016, 0.002) * step(abs(p.y - m.y), 0.035));",
    "  ink += tick * uEngage;",
    // a soft bloom so the target reads as hot phosphor
    "  ink += exp(-dm * dm * 26.0) * 0.22 * uEngage;",

    // --- screen character: scanlines and grain ---
    "  float scan = 0.5 + 0.5 * sin(gl_FragCoord.y * 1.5708);",
    "  ink *= 1.0 - uScan * scan;",
    "  ink += (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;",

    "  ink = clamp(ink, 0.0, 1.0);",
    // The one line that makes the no-chroma rule structural: the only colours
    // this shader can emit are the two tokens and the greys between them.
    "  o = vec4(mix(uGround, uInk, ink), 1.0);",
    "}"
  ].join("\n");

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function readToken(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return hexToRgb(v) || fallback;
  }
  function hexToRgb(h) {
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h || "");
    if (!m) return null;
    var s = m[1];
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    var n = parseInt(s, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function mount(canvas) {
    var gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return false;

    var prog = gl.createProgram();
    try {
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
      return false;
    }
    var U = function (n) { return gl.getUniformLocation(prog, n); };

    var ground = [0.9, 0.91, 0.92], ink = [0.08, 0.09, 0.11];
    function refreshTokens() {
      ground = readToken("--ground", ground);
      ink = readToken("--ink", ink);
    }
    refreshTokens();
    new MutationObserver(refreshTokens).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"]
    });
    var mq = matchMedia("(prefers-color-scheme: dark)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(refreshTokens);

    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    }
    size();

    var mx = 0.5, my = 0.5, mvx = 0, mvy = 0;
    var tx = 0.5, ty = 0.5, engage = 0, engageV = 0, engageT = 0;

    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1 - (e.clientY - r.top) / r.height;
      engageT = 1;
    });
    canvas.addEventListener("pointerleave", function () { engageT = 0; });

    var t = 0, running = false, last = 0;

    function draw() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uTime"), t);
      gl.uniform2f(U("uM"), mx, my);
      gl.uniform1f(U("uEngage"), Math.max(0, Math.min(1, engage)));
      gl.uniform3fv(U("uGround"), ground);
      gl.uniform3fv(U("uInk"), ink);
      gl.uniform1f(U("uSweep"), CONFIG.sweepRate);
      gl.uniform1f(U("uPersist"), CONFIG.persist);
      gl.uniform1f(U("uScan"), CONFIG.scanline);
      gl.uniform1f(U("uGrain"), CONFIG.grain);
      gl.uniform1f(U("uRingGap"), CONFIG.ringGap);
      gl.uniform1i(U("uRings"), CONFIG.rings);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = "1";
    }

    function step(dt) {
      t += dt;
      mvx += (tx - mx) * CONFIG.stiffness * dt; mvx *= Math.exp(-CONFIG.damping * dt); mx += mvx * dt;
      mvy += (ty - my) * CONFIG.stiffness * dt; mvy *= Math.exp(-CONFIG.damping * dt); my += mvy * dt;
      engageV += (engageT - engage) * CONFIG.stiffness * dt;
      engageV *= Math.exp(-CONFIG.damping * dt);
      engage += engageV * dt;
    }

    function frame(ms) {
      if (!running) return;
      var dt = last ? Math.min((ms - last) / 1000, 0.05) : 0.016;
      last = ms;
      step(dt);
      draw();
      requestAnimationFrame(frame);
    }

    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    addEventListener("resize", function () {
      size();
      if (still || !running) draw();
    });

    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (still) { engage = 1; mx = tx = 0.5; my = ty = 0.5; t = 1.2; draw(); return; }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("crtCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      canvas.style.display = "none";
      var stage = canvas.parentNode;
      stage.classList.add("is-fallback");
      var cap = stage.parentNode.querySelector(".shaderCap");
      if (cap) cap.textContent = "Static fallback - no WebGL2 on this machine";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
