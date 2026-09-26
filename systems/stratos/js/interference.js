/* ============================================================
   STRATOS - interference contours
   A WebGL2 surface treatment for black glass: two slow emitters
   ring outward, their interference is drawn as hairline contours,
   and the pointer becomes a third emitter. Inside a small reach
   around it the field is read out as segmented-bar cells - lit in
   the signal hue where the field peaks, outlined where it does not.

   Contract (see STANDARD.md section 3):
   - Enhancement only. The static design underneath is complete,
     and the canvas stays transparent until its first frame.
   - Colours are READ FROM TOKENS at runtime. The shader composites
     --ground, the --hairline mix of --ink, --ink and --signal, and
     emits nothing else - no glow, no fade, by construction.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    levels: 6.0,      // contour steps across the field's range
    wave: 34.0,       // emitter spatial frequency, radians per canvas height
    drift: 0.9,       // phase speed, radians per second - rings travel outward
    cell: 12,         // readout cell pitch, CSS px (9px cell + 3px gap, as .s-seg)
    gap: 3,           // gap between cells, CSS px (the .s-seg gap)
    reach: 0.14,      // radius of the readout around the pointer, canvas heights
    thresh: 0.6,      // field level above which a readout cell lights
    stiffness: 60,    // pointer spring
    damping: 10,
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
    "uniform float uDpr;",
    "uniform vec3 uGround, uInk, uSignal;",
    "uniform float uHair;",       // alpha of --hairline
    "uniform float uLevels, uWave, uDrift, uCell, uGap, uReach, uThresh;",
    "out vec4 o;",

    // The two resting emitters wander on slow Lissajous paths.
    "vec2 emitA(float asp){ return vec2(asp * (0.30 + 0.05 * sin(uTime * 0.11)), 0.38 + 0.06 * cos(uTime * 0.13)); }",
    "vec2 emitB(float asp){ return vec2(asp * (0.70 + 0.05 * cos(uTime * 0.09)), 0.64 + 0.06 * sin(uTime * 0.12)); }",

    // One ring source: a travelling cosine, softened with distance.
    "float ring(vec2 p, vec2 s){",
    "  float r = distance(p, s);",
    "  return cos(uWave * r - uDrift * uTime) / (1.0 + 3.0 * r);",
    "}",

    // The field, squashed smoothly into 0..1 - never clamped, because a clamped
    // plateau would draw as a filled contour. p is in canvas heights.
    "float field(vec2 p, float asp, vec2 m){",
    "  float f = ring(p, emitA(asp)) + ring(p, emitB(asp)) + ring(p, m) * uEngage;",
    "  return 0.5 + 0.5 * f / (1.0 + abs(f));",
    "}",

    "void main(){",
    "  vec2 frag = gl_FragCoord.xy;",
    "  float asp = uRes.x / max(uRes.y, 1.0);",
    "  vec2 p = frag / max(uRes.y, 1.0);",
    "  vec2 m = vec2(uM.x * asp, uM.y);",
    "  float px = uDpr;",                 // one CSS pixel, in device pixels

    // Hairline contours: distance to the nearest level, in screen pixels.
    // Ascending and inverted: smoothstep with edge0 > edge1 is undefined in
    // GLSL ES, and drivers disagree about what it does.
    "  float v = field(p, asp, m) * uLevels;",
    "  float fw = max(fwidth(v), 1e-4);",
    "  float nearest = (0.5 - abs(fract(v) - 0.5)) / fw;",
    "  float contour = 1.0 - smoothstep(0.25, 1.0, nearest / px);",

    // Readout cells: the field sampled once per cell, so every cell is flat.
    "  float pitch = uCell * px;",
    "  vec2 q = mod(frag, pitch);",
    "  vec2 cc = (floor(frag / pitch) + 0.5) * pitch;",
    "  vec2 cp = cc / max(uRes.y, 1.0);",
    "  float inReach = step(distance(cp, m), uReach * uEngage) * step(0.02, uEngage);",
    "  float g = uGap * px;",
    "  float body = step(g, q.x) * step(g, q.y);",
    "  float core = step(g + px, q.x) * step(q.x, pitch - px) * step(g + px, q.y) * step(q.y, pitch - px);",
    "  float lit = inReach * body * step(uThresh, field(cp, asp, m));",
    "  float outline = inReach * (body - core) * (1.0 - lit);",

    // Registration crosses on the resting emitters: 9px arms, 1px wide.
    "  float cross = 0.0;",
    "  for (int i = 0; i < 2; i++) {",
    "    vec2 e = (i == 0 ? emitA(asp) : emitB(asp)) * uRes.y;",
    "    vec2 d = abs(frag - e);",
    "    cross = max(cross, step(d.x, 0.5 * px) * step(d.y, 4.5 * px));",
    "    cross = max(cross, step(d.y, 0.5 * px) * step(d.x, 4.5 * px));",
    "  }",

    // Corner brackets around the pointer, the .s-frame mark at 36px.
    "  vec2 dm = abs(frag - m * uRes.y);",
    "  float B = 18.0 * px, arm = 7.0 * px;",
    "  float bx = step(abs(dm.x - B), 0.5 * px) * step(B - arm, dm.y) * step(dm.y, B + 0.5 * px);",
    "  float by = step(abs(dm.y - B), 0.5 * px) * step(B - arm, dm.x) * step(dm.x, B + 0.5 * px);",
    "  float bracket = max(bx, by) * step(0.5, uEngage);",

    // Composite. Only palette tokens can come out of this.
    "  vec3 col = uGround;",
    "  col = mix(col, uInk, uHair * max(contour, outline));",
    "  col = mix(col, uSignal, lit);",
    "  col = mix(col, uInk, max(cross, bracket));",
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
  // computed style rather than duplicated here. Accepts #hex, rgb() and rgba().
  function parseColour(v) {
    if (!v) return null;
    v = v.trim();
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
    if (m) {
      var s = m[1];
      if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
      var n = parseInt(s, 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
    }
    m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i.exec(v);
    if (m) {
      return [m[1] / 255, m[2] / 255, m[3] / 255, m[4] === undefined ? 1 : parseFloat(m[4])];
    }
    return null;
  }
  function readToken(name, fallback) {
    var c = parseColour(getComputedStyle(document.documentElement).getPropertyValue(name));
    return c || fallback;
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

    var ground = [0, 0, 0, 1], ink = [1, 1, 1, 1], signal = [1, 0.4, 0, 1], hair = [1, 1, 1, 0.22];
    function refreshTokens() {
      ground = readToken("--ground", ground);
      ink = readToken("--ink", ink);
      signal = readToken("--signal", signal);
      hair = readToken("--hairline", hair);
      if (still || !running) draw();
    }

    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    }

    // Pointer on a spring, so the readout has weight and settles rather than
    // snapping to the cursor.
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
    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function draw() {
      var dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uTime"), t);
      gl.uniform2f(U("uM"), mx, my);
      gl.uniform1f(U("uEngage"), Math.max(0, Math.min(1, engage)));
      gl.uniform1f(U("uDpr"), dpr);
      gl.uniform3f(U("uGround"), ground[0], ground[1], ground[2]);
      gl.uniform3f(U("uInk"), ink[0], ink[1], ink[2]);
      gl.uniform3f(U("uSignal"), signal[0], signal[1], signal[2]);
      gl.uniform1f(U("uHair"), hair[3]);
      gl.uniform1f(U("uLevels"), CONFIG.levels);
      gl.uniform1f(U("uWave"), CONFIG.wave);
      gl.uniform1f(U("uDrift"), CONFIG.drift);
      gl.uniform1f(U("uCell"), CONFIG.cell);
      gl.uniform1f(U("uGap"), CONFIG.gap);
      gl.uniform1f(U("uReach"), CONFIG.reach);
      gl.uniform1f(U("uThresh"), CONFIG.thresh);
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
    refreshTokens();

    // A theme flip changes the tokens; re-read them whichever way it came.
    new MutationObserver(refreshTokens).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"]
    });
    var mq = matchMedia("(prefers-color-scheme: dark)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(refreshTokens);

    addEventListener("resize", function () {
      size();
      if (still || !running) draw();
    });

    // Off screen it stops. A decorative surface has no claim on a frame budget
    // when nobody is looking at it.
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (still) {
        // One settled frame: emitters at rest, no pointer, no loop.
        t = 0; mx = tx = 0.5; my = ty = 0.5; engage = 0;
        draw();
        return;
      }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("fieldCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      // No WebGL2: the CSS rings underneath are the whole design, so reveal
      // them and say so rather than leaving an empty frame.
      canvas.style.display = "none";
      var stage = canvas.parentNode;
      stage.classList.add("is-fallback");
      var cap = stage.parentNode.querySelector(".shaderCap");
      if (cap) cap.textContent = "STATIC_FALLBACK / NO WEBGL2 ON THIS MACHINE";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
