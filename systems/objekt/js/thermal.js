/* ============================================================
   OBJEKT - thermal head
   A WebGL2 surface treatment: a sheet of die-cut labels feeding
   slowly out of a thermal printer. The pointer is the print head -
   where it passes, the stock darkens in square thermal dots, and
   what it printed feeds away with the paper and cools off.

   Contract (see STANDARD.md §3):
   - Enhancement only. The static design underneath is complete,
     and the canvas stays transparent until its first frame.
   - Colours are READ FROM TOKENS at runtime, never hardcoded, and
     the shader can emit exactly three of them: stock, ink, and the
     die line. It has no way to produce a gradient or a hue.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    dot: 4.0,          // thermal dot pitch, CSS px (scaled by DPR)
    labelW: 34,        // label pitch across, in dots
    labelH: 22,        // label pitch down, in dots
    feed: 3.0,         // paper feed, dots per second
    radius: 0.075,     // head reach, in stage heights
    heat: 0.34,        // heat one pass leaves; dwelling stacks it up to solid
    cool: 0.9,         // cooling time constant, seconds
    trail: 32,         // head samples kept (must match TRAIL in the shader)
    sampleMs: 45,      // how often the head drops a sample
    stiffness: 60,     // pointer spring
    damping: 10,
    dprCap: 2
  };

  var VERT =
    "#version 300 es\n" +
    "void main(){vec2 v=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(v*2.0-1.0,0.,1.);}";

  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "#define TRAIL " + CONFIG.trail,
    "uniform vec2 uRes;",
    "uniform float uFeedPx;",             // how far the sheet has fed, device px
    "uniform vec3 uTrail[TRAIL];",        // head samples: x, y in SHEET space (px), heat
    "uniform vec3 uStock;",
    "uniform vec3 uInk;",
    "uniform vec3 uCut;",
    "uniform float uDot, uLine, uRadius;",
    "uniform vec2 uLabel;",               // label pitch, in dots
    "out vec4 o;",

    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",

    // 4x4 ordered dither. A thermal head has no grey - every dot is on or
    // off - so tone becomes the density of burnt dots, exactly as on paper.
    "float bayer2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }",
    "float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }",

    // What the label was already printed with before it reached the head:
    // a solid index block, three rows of data, one barcode. Hard 0 or 1.
    "float printed(vec2 lp, vec2 lid){",
    "  float W = uLabel.x, H = uLabel.y;",
    "  float seed = hash(lid);",
    "  float ink = 0.0;",
    // index block, top left
    "  if (lp.x >= 3.0 && lp.x < 8.0 && lp.y >= H - 8.0 && lp.y < H - 3.0) ink = 1.0;",
    // data rows: every other dot row, broken into mono-width words
    "  if (lp.x >= 10.0 && lp.x < W - 3.0 && lp.y >= H - 8.0 && lp.y < H - 3.0 && mod(lp.y, 2.0) < 1.0) {",
    "    float word = floor((lp.x - 10.0) / 3.0);",
    "    float len = 4.0 + floor(hash(vec2(lp.y, seed * 91.0)) * (W - 17.0) / 3.0);",
    "    if (word < len && mod(lp.x - 10.0, 3.0) < 2.0) ink = 1.0;",
    "  }",
    // barcode: one-dot bars of irregular width
    "  if (lp.x >= 3.0 && lp.x < W - 3.0 && lp.y >= 4.0 && lp.y < 11.0) {",
    "    ink = step(0.48, hash(vec2(lp.x, seed * 57.0)));",
    "  }",
    "  return ink;",
    "}",

    "void main(){",
    "  vec2 px = gl_FragCoord.xy;",
    // Sheet space: the paper moves up, so a point on it is where it is on
    // screen minus how far it has fed.
    "  vec2 sp = vec2(px.x, px.y - uFeedPx);",
    "  vec2 cell = floor(sp / uDot);",
    "  vec2 f = fract(sp / uDot);",
    "  vec2 lid = floor(cell / uLabel);",
    "  vec2 lp = cell - lid * uLabel;",

    // Heat is sampled once per dot, at the dot centre, so a dot is burnt or
    // not as a whole. The head is a line across the paper, so heat spreads
    // further across than it does along the feed.
    "  vec2 cc = (cell + 0.5) * uDot;",
    "  float R = uRadius * uRes.y;",
    "  float heat = 0.0;",
    "  for (int i = 0; i < TRAIL; i++) {",
    "    vec3 s = uTrail[i];",
    "    vec2 d = (cc - s.xy) / R;",
    "    d.y *= 2.2;",
    "    heat += s.z * exp(-(d.x * d.x + d.y * d.y));",
    "  }",
    "  float burn = step(bayer4(cell) + 0.03, heat);",

    // Square dots with a hairline gap between them, as a real head leaves.
    "  float inDot = step(0.1, f.x) * step(0.1, f.y);",
    "  float ink = max(printed(lp, lid), burn) * inDot;",

    // Die line: a hairline where one label ends and the next begins.
    "  vec2 lpx = sp - lid * uLabel * uDot;",
    "  float cut = max(1.0 - step(uLine, lpx.x), 1.0 - step(uLine, lpx.y));",

    "  vec3 col = mix(uStock, uCut, cut);",
    "  o = vec4(mix(col, uInk, ink * (1.0 - cut)), 1.0);",
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

    var stock = [1, 1, 1], ink = [0, 0, 0], cut = [0.5, 0.5, 0.5];
    function refreshTokens() {
      stock = readToken("--stock-base", stock);
      ink = readToken("--ink", ink);
      cut = readToken("--ink-dis", cut);
      if (still || !running) draw();
    }

    var dpr = 1;
    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    }

    // The head follows the pointer on a spring, so it has the weight of a
    // carriage and settles instead of snapping - the same restraint as the
    // sticker lift. Positions here are device px, y up.
    var hx = 0, hy = 0, vx = 0, vy = 0, tx = 0, ty = 0;
    var engage = 0, engageV = 0, engageT = 0, placed = false;

    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) * dpr;
      ty = (r.bottom - e.clientY) * dpr;
      if (!placed) { hx = tx; hy = ty; placed = true; }
      engageT = 1;
    });
    canvas.addEventListener("pointerleave", function () { engageT = 0; });

    // Trail: ring of samples in SHEET space, so what the head printed rides
    // up with the paper. Heat per sample is recomputed each frame from age.
    var N = CONFIG.trail;
    var sx = new Float32Array(N), sy = new Float32Array(N), sHeat = new Float32Array(N), sAge = new Float32Array(N);
    var packed = new Float32Array(N * 3);
    var head = 0, sinceSample = 0;
    var life = N * CONFIG.sampleMs / 1000;
    for (var i = 0; i < N; i++) sAge[i] = 1e3;

    var t = 0, running = false, last = 0;
    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function feedPx() { return t * CONFIG.feed * CONFIG.dot * dpr; }

    function draw() {
      for (var i = 0; i < N; i++) {
        packed[i * 3] = sx[i];
        packed[i * 3 + 1] = sy[i];
        // Exponential cooling, and a linear retirement over the trail's life so
        // the oldest sample fades out instead of vanishing when it is reused.
        var retire = Math.max(0, 1 - sAge[i] / life);
        packed[i * 3 + 2] = sHeat[i] * Math.exp(-sAge[i] / CONFIG.cool) * retire;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uFeedPx"), feedPx());
      gl.uniform3fv(U("uTrail"), packed);
      gl.uniform3fv(U("uStock"), stock);
      gl.uniform3fv(U("uInk"), ink);
      gl.uniform3fv(U("uCut"), cut);
      gl.uniform1f(U("uDot"), CONFIG.dot * dpr);
      gl.uniform1f(U("uLine"), Math.max(1, Math.round(dpr)));
      gl.uniform1f(U("uRadius"), CONFIG.radius);
      gl.uniform2f(U("uLabel"), CONFIG.labelW, CONFIG.labelH);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = "1";
    }

    function step(dt) {
      t += dt;
      var k = CONFIG.stiffness, damp = Math.exp(-CONFIG.damping * dt);
      vx += (tx - hx) * k * dt; vx *= damp; hx += vx * dt;
      vy += (ty - hy) * k * dt; vy *= damp; hy += vy * dt;
      engageV += (engageT - engage) * k * dt; engageV *= damp; engage += engageV * dt;

      for (var i = 0; i < N; i++) sAge[i] += dt;
      sinceSample += dt * 1000;
      if (sinceSample >= CONFIG.sampleMs) {
        sinceSample = 0;
        sx[head] = hx;
        sy[head] = hy - feedPx();
        sHeat[head] = CONFIG.heat * Math.max(0, Math.min(1, engage));
        sAge[head] = 0;
        head = (head + 1) % N;
      }
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
      if (still || !running) draw();
    });

    // Off screen it stops. A decorative surface has no claim on a frame budget
    // when nobody is looking at it.
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (still) { draw(); return; }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("thermalCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      // No WebGL2: the die-cut sheet underneath is the whole design, so reveal
      // it and say so rather than leaving an empty box.
      canvas.style.display = "none";
      var stage = canvas.parentNode;
      stage.classList.add("is-fallback");
      var cap = stage.parentNode.querySelector(".shader-cap");
      if (cap) cap.textContent = "Static fallback - no WebGL2 on this machine";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
