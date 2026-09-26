/* ============================================================
   KONBINI - pixel sky
   A WebGL2 surface treatment for the field: the one gradient,
   redrawn as pixel art. The sky is cut into whole pixels on an
   integer grid, its three stops are ordered-dithered into each
   other, and snow falls through it one cell at a time. The
   pointer is a lamp: it lifts the sky under it one tone toward
   the horizon, and pushes the snow sideways as wind.

   The shader can only ever emit four exact colours - the three
   field stops and --lit - because every pixel is a choice
   between tokens, never a mix of them. The pixel rule stays
   structural: there is no anti-aliasing to switch off.

   Contract (see STANDARD.md §3):
   - Enhancement only. The static design underneath is the
     complete field gradient, and the canvas stays transparent
     until its first frame.
   - Colours are READ FROM TOKENS at runtime, never hardcoded,
     and re-read on a theme flip or an OS scheme change.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    px: 4,            // one sky pixel, in CSS px; rounded to whole device px
    split: 0.55,      // where the middle stop sits, from the top - same as the CSS gradient
    spread: 3.0,      // how tightly the dither band hugs each boundary (1 = full-width dither)
    density: 0.012,   // share of cells holding a flake in the near layer
    fall: 7.0,        // near-layer fall speed, cells per second
    radius: 0.42,     // lamp reach, in stage heights
    lift: 0.55,       // how far the lamp pushes the sky toward the horizon stop
    wind: 14.0,       // wind at the stage edge, cells per second
    breeze: 1.5,      // resting wind when the pointer is away, cells per second
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
    "uniform float uPx;",         // sky pixel size, whole device px
    "uniform vec2 uM;",           // lamp, 0..1, spring-followed
    "uniform float uEngage;",     // 0..1, pointer present
    "uniform float uDrift;",      // accumulated wind, in cells
    "uniform vec3 uTop;",
    "uniform vec3 uMid;",
    "uniform vec3 uLow;",
    "uniform vec3 uSnow;",
    "uniform float uSplit, uSpread, uDensity, uFall, uRadius, uLift;",
    "out vec4 o;",

    // 4x4 Bayer matrix: the classic ordered dither, normalised to (0,1).
    "const float BAYER[16] = float[16](",
    "   0.0,  8.0,  2.0, 10.0,",
    "  12.0,  4.0, 14.0,  6.0,",
    "   3.0, 11.0,  1.0,  9.0,",
    "  15.0,  7.0, 13.0,  5.0);",
    "float bayer(vec2 c){",
    "  int i = int(mod(c.x, 4.0)) + 4 * int(mod(c.y, 4.0));",
    "  return (BAYER[i] + 0.5) / 16.0;",
    "}",

    "float hash(vec2 p){",
    "  p = fract(p * vec2(123.34, 456.21));",
    "  p += dot(p, p + 45.32);",
    "  return fract(p.x * p.y);",
    "}",

    // One snow layer. The column moves with the wind as a whole cell, and
    // each column falls at its own speed, one whole cell per step.
    "float flake(vec2 c, float depth, float speed, float density){",
    // Both offsets wrap at 1024 cells so the hash never sees a number large
    // enough to lose its fractional digits on a long-running page.
    "  float col = mod(c.x - floor(uDrift * depth), 1024.0);",
    "  float v = speed * (0.6 + 0.8 * hash(vec2(col, 7.0 * depth)));",
    "  float row = c.y + mod(floor(uTime * v + 100.0 * hash(vec2(col, 13.0))), 1024.0);",
    "  return step(hash(vec2(col, row) + depth * 31.0), density);",
    "}",

    "void main(){",
    "  vec2 c = floor(gl_FragCoord.xy / uPx);",        // the cell: whole pixels only
    "  vec2 grid = max(floor(uRes / uPx), vec2(1.0));",
    "  float fromTop = 1.0 - (c.y + 0.5) / grid.y;",   // 0 at the top, 1 at the foot

    // The lamp: distance measured in cells so it stays round on any aspect.
    "  vec2 m = floor(uM * grid);",
    "  float d = distance(c, m) / max(uRadius * grid.y, 1.0);",
    "  float lamp = exp(-d * d) * uEngage;",
    "  float u = clamp(fromTop + uLift * lamp, 0.0, 1.0);",

    // Which pair of stops, and how far between them.
    "  vec3 a = uTop; vec3 b = uMid;",
    "  float f = u / uSplit;",
    "  if (u >= uSplit) { a = uMid; b = uLow; f = (u - uSplit) / (1.0 - uSplit); }",
    // Squeeze the transition toward the boundary between bands, so the sky
    // reads as flat bands with dithered seams rather than as noise.
    "  f = clamp((f - 0.5) * uSpread + 0.5, 0.0, 1.0);",
    "  vec3 sky = f > bayer(c) ? b : a;",

    // Snow: a near layer and a sparser, slower far layer.
    "  float s = max(flake(c, 1.0, uFall, uDensity),",
    "                flake(c, 0.5, uFall * 0.45, uDensity * 0.6));",

    "  o = vec4(mix(sky, uSnow, s), 1.0);",            // s is 0 or 1: a choice, not a blend
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

    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var running = false;

    var top = [0, 0, 1], mid = [0, 0, 1], low = [0, 0, 1], snow = [1, 1, 1];
    function refreshTokens() {
      top = readToken("--field-top", top);
      mid = readToken("--field-mid", mid);
      low = readToken("--field-low", low);
      snow = readToken("--lit", snow);
      if (!running) draw(); // a paused or reduced-motion stage still follows the theme
    }

    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    }

    // Pointer and wind on springs, so the lamp has weight and the snow leans
    // into a gust rather than snapping sideways.
    var mx = 0.5, my = 0.5, mvx = 0, mvy = 0;
    var tx = 0.5, ty = 0.5, engage = 0, engageV = 0, engageT = 0;
    var wind = CONFIG.breeze, windV = 0, drift = 0;

    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1 - (e.clientY - r.top) / r.height;
      engageT = 1;
    });
    canvas.addEventListener("pointerleave", function () { engageT = 0; });

    var t = 0, last = 0;

    function draw() {
      var dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uTime"), t);
      gl.uniform1f(U("uPx"), Math.max(1, Math.round(CONFIG.px * dpr)));
      gl.uniform2f(U("uM"), mx, my);
      gl.uniform1f(U("uEngage"), Math.max(0, Math.min(1, engage)));
      gl.uniform1f(U("uDrift"), drift);
      gl.uniform3fv(U("uTop"), top);
      gl.uniform3fv(U("uMid"), mid);
      gl.uniform3fv(U("uLow"), low);
      gl.uniform3fv(U("uSnow"), snow);
      gl.uniform1f(U("uSplit"), CONFIG.split);
      gl.uniform1f(U("uSpread"), CONFIG.spread);
      gl.uniform1f(U("uDensity"), CONFIG.density);
      gl.uniform1f(U("uFall"), CONFIG.fall);
      gl.uniform1f(U("uRadius"), CONFIG.radius);
      gl.uniform1f(U("uLift"), CONFIG.lift);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = "1";
    }

    function step(dt) {
      t += dt;
      var k = CONFIG.stiffness, damp = Math.exp(-CONFIG.damping * dt);
      mvx += (tx - mx) * k * dt; mvx *= damp; mx += mvx * dt;
      mvy += (ty - my) * k * dt; mvy *= damp; my += mvy * dt;
      engageV += (engageT - engage) * k * dt; engageV *= damp; engage += engageV * dt;
      // Wind: the lamp's side of centre sets the gust; away, a light breeze.
      var windT = engageT ? (tx - 0.5) * 2 * CONFIG.wind : CONFIG.breeze;
      windV += (windT - wind) * k * dt; windV *= damp; wind += windV * dt;
      drift += wind * dt;
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
    new MutationObserver(refreshTokens).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"]
    });
    var mq = matchMedia("(prefers-color-scheme: dark)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(refreshTokens);

    addEventListener("resize", function () {
      size();
      if (!running) draw();
    });

    // Off screen it stops. A decorative surface has no claim on a frame budget
    // when nobody is looking at it.
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (still) {
        // One settled frame: lamp away, breeze at rest, snow where it lies.
        mx = tx = 0.5; my = ty = 0.5; engage = 0; t = 0; drift = 0;
        draw();
        return;
      }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("skyCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      // No WebGL2: the field gradient underneath is the whole design, so hide
      // the canvas and say so rather than leaving a dead box.
      canvas.style.display = "none";
      var cap = canvas.parentNode.parentNode.querySelector(".lbl");
      if (cap) cap.textContent = "static fallback - no webgl2 on this machine";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
