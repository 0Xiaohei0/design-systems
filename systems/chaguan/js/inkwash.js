/* ============================================================
   CHAGUAN - ink wash
   A WebGL2 surface treatment: a sheet of absorbent paper with a
   disc behind three ridges of ink wash, each darkest at its crest
   and thinning into mist below. The pointer is a loaded brush -
   where it rests, ink blooms into the paper with a frayed edge
   and a darker tidemark, the way wet ink creeps along fibres.

   Contract (see STANDARD.md section 3):
   - Enhancement only. The static design underneath is complete,
     and the canvas stays transparent until its first frame.
   - Colours are READ FROM TOKENS at runtime (--paper, --disc,
     --ink), never hardcoded, so the treatment survives a theme
     flip. The last line of the shader only mixes those three, so
     it cannot emit a colour the palette does not already have.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    reach: 0.2,        // brush bloom radius, in stage heights
    bleed: 0.6,        // how far ink feathers past a hard edge, 0..1
    fibre: 0.04,       // paper fibre showing through as faint ink
    drift: 0.018,      // ridge drift, stage widths per second
    discAt: [0.7, 0.62], // disc centre, 0..1 from the bottom-left
    discR: 0.17,       // disc radius, in stage heights
    stiffness: 40,     // pointer spring: heavier than a cursor
    damping: 8,
    settle: 12.0,      // the time used for the reduced-motion frame
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
    "uniform vec2 uM;",          // brush, 0..1, spring-followed
    "uniform float uEngage;",    // 0..1, brush on the paper
    "uniform vec3 uPaper;",
    "uniform vec3 uDisc;",
    "uniform vec3 uInk;",
    "uniform float uReach, uBleed, uFibre, uDrift, uDiscR;",
    "uniform vec2 uDiscAt;",
    "out vec4 o;",

    "float hash(vec2 p){",
    "  p = fract(p * vec2(123.34, 456.21));",
    "  p += dot(p, p + 45.32);",
    "  return fract(p.x * p.y);",
    "}",
    "float vnoise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),",
    "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "float fbm(vec2 p){",
    "  float s = 0.0, a = 0.5;",
    "  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }",
    "  return s;",
    "}",
    // Layer ink the way washes do: each pass darkens what is under it
    // without ever overshooting full ink.
    "float over(float a, float b){ return 1.0 - (1.0 - a) * (1.0 - b); }",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes;",
    "  float asp = uRes.x / max(uRes.y, 1.0);",
    "  vec2 p = vec2(uv.x * asp, uv.y);",

    // The disc: a flat pigment with a slightly ragged rim, never soft.
    "  vec2 dc = vec2(uDiscAt.x * asp, uDiscAt.y);",
    "  float rim = (fbm(p * 9.0) - 0.5) * 0.012;",
    "  float disc = 1.0 - smoothstep(uDiscR - 0.004, uDiscR + 0.004, distance(p, dc) + rim);",

    // Paper fibre: sparse, long, slightly slanted streaks - read as the
    // faintest ink, so the paper texture stays inside the palette.
    "  float fibre = smoothstep(0.7, 0.98, vnoise(vec2(p.x * 5.0 + p.y * 2.0, p.y * 150.0 - p.x * 20.0)));",
    "  float ink = uFibre * fibre;",

    // Three ridges, far to near. Each is darkest along its crest and thins
    // into mist below it; the nearer the ridge, the heavier the load.
    "  for (int i = 0; i < 3; i++) {",
    "    float fi = float(i);",
    "    float x = p.x * (1.3 + fi * 0.7) + uTime * uDrift * (0.4 + fi * 0.6) + fi * 11.0;",
    "    float crest = 0.5 - fi * 0.13 + (fbm(vec2(x, fi * 3.1)) - 0.5) * (0.34 - fi * 0.06);",
    "    float below = crest - p.y + (fbm(p * 14.0 + fi * 5.0) - 0.5) * uBleed * 0.05;",
    "    float body = smoothstep(0.0, 0.004 + uBleed * 0.02, below);",
    "    float mist = 1.0 - smoothstep(0.0, 0.18 + fi * 0.06, below);",
    "    ink = over(ink, (0.2 + fi * 0.24) * body * (0.3 + 0.7 * mist));",
    "  }",

    // The brush: a bloom with a frayed edge, a dense core, and a tidemark
    // where the wet front stalls.
    "  vec2 m = vec2(uM.x * asp, uM.y);",
    "  float r = distance(p, m);",
    "  float ang = atan(p.y - m.y, p.x - m.x);",
    "  float fray = fbm(vec2(ang * 3.0 + 7.0, r * 16.0 - uTime * 0.25));",
    "  float reach = max(uReach * uEngage * (0.8 + 0.4 * fray * uBleed), 0.001);",
    "  float bloom = 1.0 - smoothstep(reach * 0.5, reach, r);",
    "  float core = 1.0 - smoothstep(0.0, reach * 0.4, r);",
    "  float tw = reach * 0.07 + 0.001;",
    // Squared by hand: pow() with a negative base is undefined in GLSL ES.
    "  float tq = (r - reach * 0.82) / tw;",
    "  float tide = exp(-tq * tq);",
    "  ink = over(ink, uEngage * clamp(bloom * 0.42 + core * 0.4 + tide * 0.22, 0.0, 1.0));",

    // Only three pigments exist, so only three can come out.
    "  o = vec4(mix(mix(uPaper, uDisc, disc), uInk, clamp(ink, 0.0, 1.0)), 1.0);",
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

  // The tokens are the source of truth for colour, so they are read from the
  // live computed style rather than copied here, and re-read on theme change.
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
    var t = still ? CONFIG.settle : 0, running = false, last = 0, drawn = false;

    var paper = [1, 1, 1], disc = [0.8, 0.6, 0.4], ink = [0, 0, 0];
    function refreshTokens() {
      paper = readToken("--paper", paper);
      disc = readToken("--disc", disc);
      ink = readToken("--ink", ink);
      // A looping stage picks the new colours up on its next frame; a still
      // one has to be told.
      if (drawn && !running) draw();
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

    // The brush follows the pointer on a spring, so it has weight and
    // arrives rather than snapping - it should feel loaded with ink.
    var mx = 0.5, my = 0.5, mvx = 0, mvy = 0;
    var tx = 0.5, ty = 0.5, engage = 0, engageV = 0, engageT = 0;

    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1 - (e.clientY - r.top) / r.height;
      engageT = 1;
    });
    canvas.addEventListener("pointerleave", function () { engageT = 0; });

    function draw() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uTime"), t);
      gl.uniform2f(U("uM"), mx, my);
      gl.uniform1f(U("uEngage"), Math.max(0, Math.min(1, engage)));
      gl.uniform3fv(U("uPaper"), paper);
      gl.uniform3fv(U("uDisc"), disc);
      gl.uniform3fv(U("uInk"), ink);
      gl.uniform1f(U("uReach"), CONFIG.reach);
      gl.uniform1f(U("uBleed"), CONFIG.bleed);
      gl.uniform1f(U("uFibre"), CONFIG.fibre);
      gl.uniform1f(U("uDrift"), CONFIG.drift);
      gl.uniform1f(U("uDiscR"), CONFIG.discR);
      gl.uniform2f(U("uDiscAt"), CONFIG.discAt[0], CONFIG.discAt[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      drawn = true;
      canvas.style.opacity = "1";
    }

    function step(dt) {
      t += dt;
      var k = CONFIG.stiffness, decay = Math.exp(-CONFIG.damping * dt);
      mvx += (tx - mx) * k * dt; mvx *= decay; mx += mvx * dt;
      mvy += (ty - my) * k * dt; mvy *= decay; my += mvy * dt;
      engageV += (engageT - engage) * k * dt; engageV *= decay; engage += engageV * dt;
    }

    function frame(ms) {
      if (!running) return;
      var dt = last ? Math.min((ms - last) / 1000, 0.05) : 0.016;
      last = ms;
      step(dt);
      draw();
      requestAnimationFrame(frame);
    }

    addEventListener("resize", function () {
      size();
      if (!running) draw();
    });

    // Off screen it stops: a decorative surface has no claim on a frame
    // budget nobody is watching.
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (still) { if (visible) { engage = 0; draw(); } return; }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("washCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      // No WebGL2: the CSS wash underneath is the whole design, so reveal it
      // and say so rather than leave an empty box.
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
