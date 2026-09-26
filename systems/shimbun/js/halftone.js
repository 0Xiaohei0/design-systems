/* ============================================================
   SHIMBUN - halftone press
   A WebGL2 surface treatment: the paper resolves into printed
   dots, and the pointer presses ink into it the way a plate
   bites hardest where it is pushed hardest.

   Contract (see STANDARD.md §6):
   - Enhancement only. The static design underneath is complete,
     and the canvas stays transparent until its first frame.
   - Colours are READ FROM TOKENS at runtime, never hardcoded,
     so the treatment survives a theme flip.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    cell: 7.0,        // halftone pitch, device px
    angle: 15.0,      // screen angle, degrees - the classic single-colour angle
    radius: 0.34,     // pointer reach, in screen widths
    bite: 0.55,       // extra tone at the centre of the press
    stiffness: 58,    // pointer spring
    damping: 9,
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
    "uniform vec2 uM;",          // pointer, 0..1, spring-followed
    "uniform float uEngage;",    // 0..1, pointer present
    "uniform vec3 uPaper;",
    "uniform vec3 uInk;",
    "uniform vec3 uAccent;",
    "uniform float uCell, uAngle, uRadius, uBite;",
    "out vec4 o;",

    // The plate's own inking: slow drifting bands, heavier toward the foot.
    // Deliberately smooth - a halftone screen turns any gradient into texture,
    // so the source tone does not need detail of its own.
    "float tone(vec2 p){",
    "  float t = uTime * 0.06;",
    "  float a = sin(p.x * 3.1 + t) * 0.5 + 0.5;",
    "  float b = sin(p.x * 1.7 - p.y * 2.3 + t * 1.3) * 0.5 + 0.5;",
    "  float foot = 1.0 - smoothstep(0.0, 1.0, p.y);",
    "  return clamp(0.16 + 0.30 * a * b + 0.34 * foot, 0.0, 1.0);",
    "}",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes;",
    "  float asp = uRes.x / max(uRes.y, 1.0);",
    "  vec2 p = vec2(uv.x * asp, uv.y);",

    "  float T = tone(p);",

    // The press: a gaussian well under the pointer.
    "  vec2 m = vec2(uM.x * asp, uM.y);",
    "  float d = distance(p, m) / max(uRadius, 0.01);",
    "  float press = exp(-d * d) * uEngage;",
    "  T = clamp(T + uBite * press, 0.0, 1.0);",

    // The screen itself: rotate the pixel grid, tile it, and grow a dot whose
    // AREA tracks tone - hence sqrt, not a linear ramp.
    "  float ca = cos(uAngle), sa = sin(uAngle);",
    "  mat2 R = mat2(ca, sa, -sa, ca);",
    "  vec2 g = (R * gl_FragCoord.xy) / max(uCell, 1.0);",
    "  vec2 cell = fract(g) - 0.5;",
    "  float r = length(cell);",
    "  float rad = sqrt(T) * 0.62;",
    "  float aa = 1.2 / max(uCell, 1.0);",
    // Ascending and inverted: smoothstep with edge0 > edge1 is undefined in
    // GLSL ES, and drivers disagree about what it does.
    "  float cov = 1.0 - smoothstep(rad - aa, rad + aa, r);",

    // Where the press is deepest the ink warms toward the accent.
    "  vec3 ink = mix(uInk, uAccent, clamp(press * 1.6, 0.0, 1.0));",
    "  o = vec4(mix(uPaper, ink, cov), 1.0);",
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
  // computed style rather than duplicated here. Re-read on every theme change.
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

    var paper = [1, 1, 1], ink = [0, 0, 0], accent = [1, 0, 0];
    function refreshTokens() {
      paper = readToken("--bg", paper);
      ink = readToken("--ink", ink);
      accent = readToken("--accent", accent);
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

    // Pointer on a spring, so the press has weight and settles rather than
    // snapping - the same restraint the motion section documents.
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
      gl.uniform3fv(U("uPaper"), paper);
      gl.uniform3fv(U("uInk"), ink);
      gl.uniform3fv(U("uAccent"), accent);
      gl.uniform1f(U("uCell"), CONFIG.cell * Math.min(window.devicePixelRatio || 1, CONFIG.dprCap));
      gl.uniform1f(U("uAngle"), CONFIG.angle * Math.PI / 180);
      gl.uniform1f(U("uRadius"), CONFIG.radius);
      gl.uniform1f(U("uBite"), CONFIG.bite);
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

    // Off screen it stops. A decorative surface has no claim on a frame budget
    // when nobody is looking at it.
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (still) { mx = tx = 0.5; my = ty = 0.5; engage = 0; draw(); return; }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("inkCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      // No WebGL2: the CSS halftone underneath is the whole design, so just
      // reveal it and say so rather than leaving an empty box.
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
