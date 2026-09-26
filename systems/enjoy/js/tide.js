/* ============================================================
   ENJOY - wallpaper tide
   A WebGL2 surface treatment: the desk's wave wallpaper, alive.
   Two lazy waves drift across the ground, the front one carries
   the system's 2px ink outline, and an outlined buoy rides it.
   The pointer leans the tide toward itself on a spring, and the
   buoy follows along the crest.

   The system forbids gradients, so the shader is built to be
   incapable of one: every region is a flat token colour, and the
   only in-between pixels are the one-pixel antialiased edges.

   Contract (see STANDARD.md §3):
   - Enhancement only. The static SVG tide under the canvas is the
     complete design, and the canvas stays transparent until its
     first frame.
   - Colours are READ FROM TOKENS at runtime, never hardcoded, and
     re-read on a data-theme flip or an OS colour-scheme change.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop. That
     frame matches the static SVG exactly.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    drift: 0.12,      // wave speed, radians of phase per second / 3
    swell: 0.6,       // how far the crest leans toward the pointer, 0..1
    reach: 0.18,      // width of the lean, in stage widths
    buoy: 14,         // buoy radius, CSS px
    line: 2,          // outline weight, CSS px - the system's --line
    shadow: 3,        // buoy shadow offset, CSS px - the --shadow-win offset
    stiffness: 40,    // pointer spring: softer than a control, it is water
    damping: 7,
    dprCap: 2
  };

  var VERT =
    "#version 300 es\n" +
    "void main(){vec2 v=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(v*2.0-1.0,0.,1.);}";

  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform vec2 uM;",           // pointer, 0..1, spring-followed
    "uniform float uEngage;",     // 0..1, pointer present
    "uniform vec3 uGround, uTint, uTint2, uInk, uShade;",
    "uniform float uDrift, uSwell, uReach, uBuoy, uLine, uShadow;",
    "out vec4 o;",

    // Height of a wave above the stage floor, in device px. base and amp are
    // in stage heights; lean is the pointer's pull, also in stage heights.
    "float wave(float x, float base, float amp, float ph, float lean){",
    "  float u = x / uRes.x;",
    "  float t = uTime * uDrift;",
    "  float h = base + amp * (0.62 * sin(u * 5.3 + t * 3.0 + ph)",
    "                        + 0.38 * sin(u * 11.9 - t * 4.1 + ph * 1.7));",
    "  float k = (u - uM.x) / max(uReach, 0.01);",
    "  h += lean * exp(-k * k);",
    "  return h * uRes.y;",
    "}",

    // Signed distance to the wave's edge, positive above it (outside).
    "float sdWave(vec2 p, float base, float amp, float ph, float lean){",
    "  float h = wave(p.x, base, amp, ph, lean);",
    "  float dh = 0.5 * (wave(p.x + 1.0, base, amp, ph, lean) - wave(p.x - 1.0, base, amp, ph, lean));",
    "  return (p.y - h) / sqrt(1.0 + dh * dh);",
    "}",

    // Flat coverage with a one-pixel edge. Both smoothsteps ascend and are
    // inverted: smoothstep with edge0 > edge1 is undefined in GLSL ES.
    "float fillCov(float d){ return 1.0 - smoothstep(-0.5, 0.5, d); }",
    "float lineCov(float d){ float w = uLine * 0.5; return 1.0 - smoothstep(w - 0.5, w + 0.5, abs(d)); }",

    "void main(){",
    "  vec2 p = gl_FragCoord.xy;",
    "  float H = uRes.y;",
    "  vec3 col = uGround;",

    // The sun: a flat disc of half-strength tint, pinned to the corner.
    "  vec2 sc = vec2(0.86 * uRes.x, 0.9 * H);",
    "  col = mix(col, mix(uGround, uTint, 0.55), fillCov(length(p - sc) - 0.26 * H));",

    // Back wave: wallpaper, half-strength tint, no outline. It leans half as far.
    "  float leanB = uEngage * uSwell * 0.5 * (uM.y - 0.52);",
    "  col = mix(col, mix(uGround, uTint, 0.5), fillCov(sdWave(p, 0.52, 0.05, 2.1, leanB)));",

    // The buoy rides the front crest: at rest it floats at 70%, engaged it
    // follows the pointer. Drawn before the front wave so the water covers
    // its lower third.
    "  float leanF = uEngage * uSwell * (uM.y - 0.34);",
    "  float bx = mix(0.7, uM.x, uEngage) * uRes.x;",
    "  float bob = sin(uTime * 1.6) * 0.012 * H;",
    "  vec2 bc = vec2(bx, wave(bx, 0.34, 0.06, 0.0, leanF) + uBuoy * 0.35 + bob);",
    "  float dBs = length(p - bc - vec2(uShadow, -uShadow)) - uBuoy;",
    "  col = mix(col, uShade, 0.9 * fillCov(dBs));",
    "  float dB = length(p - bc) - uBuoy;",
    "  col = mix(col, uTint2, fillCov(dB));",
    "  col = mix(col, uInk, lineCov(dB));",
    "  col = mix(col, uInk, lineCov(length(p - bc) - uBuoy * 0.45) * fillCov(dB));",

    // Front wave: full tint, and the one outline weight in ink.
    "  float dF = sdWave(p, 0.34, 0.06, 0.0, leanF);",
    "  col = mix(col, uTint, fillCov(dF));",
    "  col = mix(col, uInk, lineCov(dF));",

    "  o = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  // Tokens are the source of truth for colour, so they are read from the live
  // computed style rather than duplicated here.
  function readToken(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return hexToRgb(v) || fallback;
  }
  function hexToRgb(h) {
    if (!h) return null;
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h);
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

    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var running = false;

    var ground = [1, 1, 1], tint = [0.7, 0.9, 0.9], tint2 = [0.9, 0.8, 0.7], ink = [0, 0, 0], shade = [0, 0, 0];
    function refreshTokens() {
      ground = readToken("--ground", ground);
      tint = readToken("--tint", tint);
      tint2 = readToken("--tint-2", tint2);
      ink = readToken("--ink", ink);
      shade = readToken("--shadow-ink", shade);
      if (!running) draw(); // a paused or settled frame must still retheme
    }
    new MutationObserver(refreshTokens).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"]
    });
    var mq = matchMedia("(prefers-color-scheme: dark)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(refreshTokens);

    function dpr() { return Math.min(window.devicePixelRatio || 1, CONFIG.dprCap); }
    function size() {
      var r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr()));
      canvas.height = Math.max(1, Math.round(r.height * dpr()));
    }

    // Pointer on a spring, so the tide has weight and settles rather than
    // snapping to the cursor.
    var mx = 0.7, my = 0.34, mvx = 0, mvy = 0;
    var tx = 0.7, ty = 0.34, engage = 0, engageV = 0, engageT = 0;

    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1 - (e.clientY - r.top) / r.height;
      engageT = 1;
    });
    canvas.addEventListener("pointerleave", function () { engageT = 0; });

    var t = 0, last = 0;

    function draw() {
      var d = dpr();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uTime"), t);
      gl.uniform2f(U("uM"), mx, my);
      gl.uniform1f(U("uEngage"), Math.max(0, Math.min(1, engage)));
      gl.uniform3fv(U("uGround"), ground);
      gl.uniform3fv(U("uTint"), tint);
      gl.uniform3fv(U("uTint2"), tint2);
      gl.uniform3fv(U("uInk"), ink);
      gl.uniform3fv(U("uShade"), shade);
      gl.uniform1f(U("uDrift"), CONFIG.drift);
      gl.uniform1f(U("uSwell"), CONFIG.swell);
      gl.uniform1f(U("uReach"), CONFIG.reach);
      gl.uniform1f(U("uBuoy"), CONFIG.buoy * d);
      gl.uniform1f(U("uLine"), CONFIG.line * d);
      gl.uniform1f(U("uShadow"), CONFIG.shadow * d);
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

    size();
    refreshTokens(); // also paints the first frame

    addEventListener("resize", function () {
      size();
      if (!running) draw();
    });

    // Off screen it stops. Under reduced motion it never starts: one settled
    // frame at t = 0 with the pointer disengaged, identical to the SVG.
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (still) { t = 0; engage = 0; draw(); return; }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("tideCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      // No WebGL2: the static SVG tide underneath is the whole design, so
      // just remove the canvas and say so rather than leaving an empty box.
      canvas.remove();
      var cap = document.getElementById("tideCap");
      if (cap) cap.textContent = "Static fallback - no WebGL2 on this machine";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
