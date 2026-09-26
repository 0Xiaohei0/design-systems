/* ============================================================
   SPROUT - furrow field
   A WebGL2 surface treatment: the board resolves into a field of
   whole pixel cells in mown stripes, with tufts that flick on a
   slow tick. Under the pointer, rings of cells lift in a pixel
   diamond and travel outward one whole cell per tick.

   Contract (see STANDARD.md §3):
   - Enhancement only. The static design underneath is complete,
     and the canvas stays transparent until its first frame.
   - Colours are READ FROM TOKENS at runtime, never hardcoded.
     The shader PICKS one of five token colours per cell and never
     blends two, so the system's no-gradient rule holds by
     construction: there is no mix() with a fractional weight.
   - Time is quantised to a tick and space to a cell, so the field
     moves the way the rest of the system moves - in steps.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    cell: 12,         // CSS px per field cell: 4 units of --px
    tick: 8,          // steps per second - the field's only clock
    stripe: 4,        // cells per mown stripe
    gap: 3,           // cells between ripple rings
    reach: 10,        // ring reach, in cells, at full engagement
    tuft: 0.045,      // share of cells that carry a tuft
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
    "uniform float uCell;",      // device px per cell, a whole number
    "uniform float uStep;",      // integer tick count
    "uniform vec2 uM;",          // pointer, 0..1, spring-followed
    "uniform float uReach;",     // integer cells, already scaled by engagement
    "uniform float uStripe, uGap, uTuft;",
    "uniform vec3 uGround, uInset, uAccent, uAccentLo, uGlint;",
    "out vec4 o;",

    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",

    "void main(){",
    // Whole cells only. Every decision below is made per cell, so nothing
    // finer than a cell can ever appear.
    "  vec2 c = floor(gl_FragCoord.xy / uCell);",

    // The board: mown stripes of ground and ground-inset.
    "  float band = mod(floor(c.x / uStripe), 2.0);",
    "  vec3 col = band < 0.5 ? uGround : uInset;",

    // Tufts: a few cells carry a sprout that flicks between its two greens,
    // each on its own phase of an eight-tick cycle.
    "  float h = hash(c);",
    "  if (h < uTuft) {",
    "    float phase = mod(uStep + floor(hash(c + 17.0) * 8.0), 8.0);",
    "    col = phase < 1.0 ? uAccent : uAccentLo;",
    "  }",

    // The ripple: Manhattan distance in cells draws a pixel diamond, and the
    // ring front sits where (distance - tick) is a multiple of the gap. Both
    // are integers, so the ring moves exactly one cell per tick.
    "  vec2 mc = floor(uM * uRes / uCell);",
    "  float d = abs(c.x - mc.x) + abs(c.y - mc.y);",
    "  if (uReach > 0.5 && d <= uReach) {",
    "    float k = mod(d - uStep, uGap);",
    "    bool near = d <= floor(uReach * 0.5);",
    "    if (k < 0.5) col = near ? uAccent : uAccentLo;",
    "    if (d < 0.5) col = uGlint;",
    "  }",

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

    var pal = {
      ground: [0.72, 0.81, 0.44], inset: [0.64, 0.74, 0.36],
      accent: [0.6, 0.75, 0.35], accentLo: [0.49, 0.65, 0.27], glint: [1, 1, 0.96]
    };
    var dirty = true;
    function refreshTokens() {
      pal.ground = readToken("--ground", pal.ground);
      pal.inset = readToken("--ground-inset", pal.inset);
      pal.accent = readToken("--accent", pal.accent);
      pal.accentLo = readToken("--accent-lo", pal.accentLo);
      pal.glint = readToken("--glint", pal.glint);
      dirty = true;
      if (!running) draw();
    }

    var cellPx = CONFIG.cell;
    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      cellPx = Math.max(1, Math.round(CONFIG.cell * dpr)); // whole device pixels per cell
      dirty = true;
    }

    // Pointer on a spring, so the ripple's centre has weight and settles
    // rather than snapping. The shader then snaps the sprung position to a
    // whole cell, so the weight is felt but the drawing stays on the grid.
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
    var drawn = { step: -1, cx: -1, cy: -1, reach: -1 };

    function state() {
      var reach = Math.round(CONFIG.reach * Math.max(0, Math.min(1, engage)));
      return {
        step: Math.floor(t * CONFIG.tick),
        cx: Math.floor(mx * canvas.width / cellPx),
        cy: Math.floor(my * canvas.height / cellPx),
        reach: reach
      };
    }

    function draw() {
      var s = state();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uCell"), cellPx);
      gl.uniform1f(U("uStep"), s.step);
      gl.uniform2f(U("uM"), mx, my);
      gl.uniform1f(U("uReach"), s.reach);
      gl.uniform1f(U("uStripe"), CONFIG.stripe);
      gl.uniform1f(U("uGap"), CONFIG.gap);
      gl.uniform1f(U("uTuft"), CONFIG.tuft);
      gl.uniform3fv(U("uGround"), pal.ground);
      gl.uniform3fv(U("uInset"), pal.inset);
      gl.uniform3fv(U("uAccent"), pal.accent);
      gl.uniform3fv(U("uAccentLo"), pal.accentLo);
      gl.uniform3fv(U("uGlint"), pal.glint);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      drawn = s;
      dirty = false;
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

    // The picture only changes when a whole step changes: a new tick, the
    // pointer crossing into a new cell, or the reach gaining a ring. Between
    // those the previous frame is still exactly right, so it is not redrawn.
    function frame(ms) {
      if (!running) return;
      var dt = last ? Math.min((ms - last) / 1000, 0.05) : 0.016;
      last = ms;
      step(dt);
      var s = state();
      if (dirty || s.step !== drawn.step || s.cx !== drawn.cx || s.cy !== drawn.cy || s.reach !== drawn.reach) {
        draw();
      }
      requestAnimationFrame(frame);
    }

    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    size();
    refreshTokens();
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
      if (still) { t = 0; engage = 0; draw(); return; }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("fieldCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      // No WebGL2: the CSS stripes underneath are the whole design, so just
      // reveal them and say so rather than leaving an empty box.
      canvas.style.display = "none";
      var stage = canvas.parentNode;
      stage.classList.add("is-fallback");
      var cap = stage.parentNode.querySelector(".stage-cap");
      if (cap) cap.textContent = "Static fallback - no WebGL2 on this machine";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
