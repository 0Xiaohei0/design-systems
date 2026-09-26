/* ============================================================
   BENRAN - still water
   A WebGL2 surface treatment: the paper below the horizon becomes
   still water seen at a low angle. Flat hairline rings travel out
   from under the resting object; the pointer moves the source on a
   spring, and a press drops one ink ring into the surface.

   Contract (see STANDARD.md section 3):
   - Enhancement only. The static design underneath is complete,
     and the canvas stays transparent until its first frame.
   - Colours are READ FROM TOKENS at runtime, never hardcoded, so
     the treatment survives a theme flip. The shader can only emit
     mixes of --paper, --trace and --ink: there is no path to the
     accent, because the seal is never water.
   - Lines only. Every mark is a 1px ring; nothing is filled, so
     the emptiness rule holds inside the canvas too.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    horizon: 0.62,    // horizon height, 0..1 from the bottom - matches the 38% overlay
    pitch: 26.0,      // ring spacing, CSS px (scaled by DPR); 5.2px front to back after the squash
    flat: 5.0,        // vertical squash: rings seen at a low angle
    reach: 0.26,      // ring fade distance, in canvas widths
    speed: 0.22,      // rings emitted per second
    rest: [0.5, 0.58],// where the source sits when nobody is touching it
    dropSpeed: 0.22,  // ink ring growth, canvas widths per second
    dropFade: 0.9,    // ink ring decay per second
    stiffness: 34,    // pointer spring - slower than a cursor, like water
    damping: 8,
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
    "uniform vec2 uSrc;",         // ring source, 0..1, spring-followed
    "uniform float uEngage;",     // 0..1, pointer present
    "uniform float uHorizon, uPitch, uFlat, uReach, uSpeed, uLine;",
    "uniform vec2 uDropP;",       // where the last press landed, 0..1
    "uniform float uDropAge, uDropSpeed, uDropFade;",
    "uniform vec3 uPaper;",
    "uniform vec3 uTrace;",
    "uniform vec3 uInk;",
    "out vec4 o;",

    // A 1px line centred on every integer of a smooth field f. fwidth turns
    // field units into device pixels, so the line keeps one weight whether
    // the ring is seen edge-on at its flanks or broad at its front.
    "float ring(float f, float w){",
    "  float px = abs(fract(f + 0.5) - 0.5) / max(fwidth(f), 1e-4);",
    "  return 1.0 - smoothstep(w * 0.5 - 0.5, w * 0.5 + 0.5, px);",
    "}",

    "void main(){",
    "  vec2 p = gl_FragCoord.xy;",
    "  float hz = uHorizon * uRes.y;",
    // Water lies below the horizon only. Ascending smoothstep, inverted.
    "  float water = 1.0 - smoothstep(hz - 1.5, hz, p.y);",

    // Distance from the source in a squashed metric: circles on the water,
    // flat ellipses to the eye.
    "  vec2 q = p - uSrc * uRes;",
    "  q.y *= uFlat;",
    "  float d = length(q);",
    "  float reach = max(uReach * uRes.x, 1.0);",
    "  float lift = smoothstep(uPitch * 0.8, uPitch * 2.6, d);",
    "  float amp = exp(-d / reach) * lift * (0.55 + 0.45 * uEngage);",
    "  float rings = ring(d / uPitch - uTime * uSpeed, uLine) * amp;",

    // The press: one ink ring growing from where it landed, then gone.
    "  vec2 k = p - uDropP * uRes;",
    "  k.y *= uFlat;",
    "  float r = uDropAge * uDropSpeed * uRes.x;",
    "  float dk = (length(k) - r) / max(uPitch, 1.0);",
    "  float drop = 0.0;",
    "  if (uDropAge < 6.0) {",
    "    float px = abs(dk) / max(fwidth(dk), 1e-4);",
    "    drop = (1.0 - smoothstep(uLine * 0.5 - 0.5, uLine * 0.5 + 0.5, px)) * exp(-uDropAge * uDropFade);",
    "  }",

    // Paper, then trace, then ink. No other colour is reachable.
    "  vec3 c = mix(uPaper, uTrace, clamp(rings, 0.0, 1.0) * water);",
    "  c = mix(c, uInk, clamp(drop * 0.6, 0.0, 1.0) * water);",
    "  o = vec4(c, 1.0);",
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

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

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
    var running = false, drawn = false;

    var paper = [1, 1, 1], trace = [0.6, 0.77, 0.74], ink = [0, 0, 0];
    function refreshTokens() {
      paper = readToken("--paper", paper);
      trace = readToken("--trace", trace);
      ink = readToken("--ink", ink);
      // A settled frame has no loop to pick the new colours up, so repaint it.
      if (drawn && !running) draw();
    }
    refreshTokens();
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
    size();

    // The source never climbs above the waterline.
    var srcTop = CONFIG.horizon - 0.03;

    // Pointer on a spring, so the rings drift after the hand the way water
    // lags behind whatever disturbed it, instead of snapping to the cursor.
    var sx = CONFIG.rest[0], sy = CONFIG.rest[1], vx = 0, vy = 0;
    var tx = sx, ty = sy, engage = 0, engageV = 0, engageT = 0;
    var dropX = 0.5, dropY = 0.5, dropAge = 99;

    function toLocal(e) {
      var r = canvas.getBoundingClientRect();
      return [
        clamp((e.clientX - r.left) / r.width, 0, 1),
        Math.min(1 - (e.clientY - r.top) / r.height, srcTop)
      ];
    }
    canvas.addEventListener("pointermove", function (e) {
      var l = toLocal(e);
      tx = l[0]; ty = l[1]; engageT = 1;
    });
    canvas.addEventListener("pointerleave", function () {
      tx = CONFIG.rest[0]; ty = CONFIG.rest[1]; engageT = 0;
    });
    canvas.addEventListener("pointerdown", function (e) {
      if (still) return;
      var l = toLocal(e);
      dropX = l[0]; dropY = l[1]; dropAge = 0;
    });

    var t = 0, last = 0;

    function draw() {
      var d = dpr();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uTime"), t);
      gl.uniform2f(U("uSrc"), sx, sy);
      gl.uniform1f(U("uEngage"), clamp(engage, 0, 1));
      gl.uniform1f(U("uHorizon"), CONFIG.horizon);
      gl.uniform1f(U("uPitch"), CONFIG.pitch * d);
      gl.uniform1f(U("uFlat"), CONFIG.flat);
      gl.uniform1f(U("uReach"), CONFIG.reach);
      gl.uniform1f(U("uSpeed"), CONFIG.speed);
      gl.uniform1f(U("uLine"), d);
      gl.uniform2f(U("uDropP"), dropX, dropY);
      gl.uniform1f(U("uDropAge"), dropAge);
      gl.uniform1f(U("uDropSpeed"), CONFIG.dropSpeed);
      gl.uniform1f(U("uDropFade"), CONFIG.dropFade);
      gl.uniform3fv(U("uPaper"), paper);
      gl.uniform3fv(U("uTrace"), trace);
      gl.uniform3fv(U("uInk"), ink);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!drawn) { drawn = true; canvas.style.opacity = "1"; }
    }

    function step(dt) {
      t += dt;
      dropAge += dt;
      var damp = Math.exp(-CONFIG.damping * dt);
      vx += (tx - sx) * CONFIG.stiffness * dt; vx *= damp; sx += vx * dt;
      vy += (ty - sy) * CONFIG.stiffness * dt; vy *= damp; sy += vy * dt;
      engageV += (engageT - engage) * CONFIG.stiffness * dt;
      engageV *= damp;
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

    addEventListener("resize", function () {
      size();
      if (!running) draw();
    });

    // Off screen it stops. A decorative surface has no claim on a frame budget
    // when nobody is looking at it.
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (still) {
        // One settled frame: rings at rest under the object, no press, no loop.
        sx = tx = CONFIG.rest[0]; sy = ty = CONFIG.rest[1]; engage = 0; dropAge = 99; t = 0;
        draw();
        return;
      }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("waterCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      // No WebGL2: the static ripple underneath is the whole design, so reveal
      // it and say so rather than leaving an empty frame.
      canvas.style.display = "none";
      var stage = canvas.parentNode;
      stage.classList.add("is-fallback");
      var cap = stage.parentNode.querySelector(".b-screen-cap");
      if (cap) cap.textContent = "Static fallback - no WebGL2 on this machine";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
