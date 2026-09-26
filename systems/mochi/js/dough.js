/* ============================================================
   MOCHI - dough press
   A WebGL2 surface treatment: one soft pillow of ground material,
   lit from the top-left like every raised thing in the system,
   breathing very slightly. The pointer rests a fingertip on it;
   holding the button down presses a dimple in, the dough around
   the dimple swells, and the deepest point blushes.

   Contract (see STANDARD.md §3):
   - Enhancement only. The static design underneath is complete,
     and the canvas stays transparent until its first frame.
   - Colours are READ FROM TOKENS at runtime (--ground, --light,
     --shade, --cue), never hardcoded, so the treatment survives
     a theme flip. The shader only ever mixes the ground toward
     its own two lights, which is the material rule, restated.
   - Visibility-gated: it does not render off screen.
   - prefers-reduced-motion draws one settled frame, no loop.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    soft: 0.11,       // shoulder width of the pillow, in panel heights
    relief: 0.055,    // height-to-slope scale: how steep the lit shoulder reads
    reach: 0.13,      // radius of the fingertip, in panel heights
    depth: 1.8,       // dimple depth at full press, in pillow heights
    touch: 0.3,       // share of the depth a resting pointer gives before any press
    breath: 0.035,    // amplitude of the slow idle swell
    blush: 0.25,      // how far the deepest point warms toward --cue
    stiffness: 42,    // pointer spring
    damping: 8.5,
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
    "uniform float uEngage;",     // 0..1, pointer resting on the panel
    "uniform float uPress;",      // 0..1, button held
    "uniform vec3 uGround;",
    "uniform vec3 uLight;",
    "uniform vec3 uShade;",
    "uniform vec3 uCue;",
    "uniform float uSoft, uRelief, uReach, uDepth, uTouch, uBreath, uBlush;",
    "out vec4 o;",

    // Rounded box: the widget's own silhouette.
    "float sdBox(vec2 p, vec2 b, float r){",
    "  vec2 q = abs(p) - b + r;",
    "  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;",
    "}",

    "float asp;",
    "vec2 centre(){ return vec2(asp * 0.5, 0.5); }",
    "vec2 halfSize(){ return vec2(min(asp * 0.26, 0.4), 0.3); }",

    // 0 on the ground, 1 on the top. The shoulder is convex - steep where it
    // meets the ground, rounding over toward the top - which is what makes it
    // read as a pillow rather than a bevel.
    "float body(vec2 p){",
    "  float d = sdBox(p - centre(), halfSize(), 0.16);",
    "  float x = clamp(-d / uSoft, 0.0, 1.0);",
    "  float r = 1.0 - x;",
    "  return 1.0 - r * r * r;",
    "}",
    // A gentle dome over the whole top, so it is never a flat table.
    "float dome(vec2 p){",
    "  vec2 q = (p - centre()) / halfSize();",
    "  return clamp(1.0 - 0.5 * dot(q, q), 0.0, 1.0);",
    "}",

    // Height of the dough: pillow + idle swell + the fingertip.
    "float height(vec2 p, out float well){",
    "  float b = body(p);",
    "  float t = uTime;",
    "  float swell = sin(t * 0.8 + p.x * 2.1) * sin(t * 0.6 + p.y * 2.7);",
    "  vec2 m = vec2(uM.x * asp, uM.y);",
    "  float d = distance(p, m) / max(uReach, 0.01);",
    "  well = exp(-d * d);",
    "  float amount = uEngage * mix(uTouch, 1.0, uPress);",
    // Volume is kept, roughly: what the dimple pushes down comes up as a ring.
    "  float ring = exp(-(d - 1.35) * (d - 1.35) * 2.2);",
    "  float h = b * (1.0 + 0.2 * dome(p) + uBreath * swell);",
    "  h -= b * amount * uDepth * well;",
    "  h += b * amount * uDepth * 0.22 * ring;",
    "  return h;",
    "}",

    "void main(){",
    "  asp = uRes.x / max(uRes.y, 1.0);",
    "  vec2 p = vec2(gl_FragCoord.x / uRes.y, gl_FragCoord.y / uRes.y);",
    "  float e = 1.5 / uRes.y;",
    "  float well, w1, w2;",
    "  float h  = height(p, well);",
    "  float hx = height(p + vec2(e, 0.0), w1);",
    "  float hy = height(p + vec2(0.0, e), w2);",
    "  vec3 n = normalize(vec3(-(hx - h) / e * uRelief, -(hy - h) / e * uRelief, 1.0));",

    // The system's one light: top-left, fixed. Shading is the difference
    // from a flat surface, so the plateau is exactly --ground.
    "  vec3 L = normalize(vec3(-0.62, 0.62, 0.48));",
    "  float lit = dot(n, L) - L.z;",
    "  vec3 col = uGround;",
    "  col = mix(col, uLight, clamp(lit * 1.9, 0.0, 1.0) * 0.85);",
    "  col = mix(col, uShade, clamp(-lit * 1.9, 0.0, 1.0) * 0.55);",

    // Cast light and shade on the ground around the pillow: the raised
    // recipe, drawn instead of box-shadowed. Shade falls bottom-right.
    "  float b = body(p);",
    "  float off = 0.028;",
    "  float sh = 1.0 - smoothstep(-0.03, 0.07, sdBox(p - centre() - vec2(off, -off), halfSize(), 0.16));",
    "  float glow = 1.0 - smoothstep(-0.03, 0.06, sdBox(p - centre() + vec2(off, -off), halfSize(), 0.16));",
    "  float outside = step(0.0, sdBox(p - centre(), halfSize(), 0.16));",
    "  col = mix(col, uShade, sh * outside * 0.42);",
    "  col = mix(col, uLight, glow * outside * (1.0 - sh) * 0.85);",

    // Blush: the deepest point of the press warms toward --cue.
    "  float amount = uEngage * mix(uTouch, 1.0, uPress);",
    "  col = mix(col, uCue, clamp(well * amount * b * uBlush * 1.4, 0.0, uBlush));",
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

    var ground = [0.93, 0.91, 0.89], light = [1, 1, 1], shade = [0.65, 0.62, 0.56], cue = [0.84, 0.6, 0.63];
    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var running = false;

    function refreshTokens() {
      ground = readToken("--ground", ground);
      light = readToken("--light", light);
      shade = readToken("--shade", shade);
      cue = readToken("--cue", cue);
      if (!running) draw();
    }
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

    // Pointer on a spring, so the fingertip has weight and the dough settles
    // back rather than snapping flat.
    var mx = 0.5, my = 0.5, mvx = 0, mvy = 0, tx = 0.5, ty = 0.5;
    var engage = 0, engageV = 0, engageT = 0;
    var press = 0, pressV = 0, pressT = 0;

    function aim(e) {
      var r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1 - (e.clientY - r.top) / r.height;
      engageT = 1;
    }
    canvas.addEventListener("pointermove", aim);
    canvas.addEventListener("pointerdown", function (e) { aim(e); pressT = 1; });
    canvas.addEventListener("pointerup", function () { pressT = 0; });
    canvas.addEventListener("pointercancel", function () { pressT = 0; engageT = 0; });
    canvas.addEventListener("pointerleave", function () { pressT = 0; engageT = 0; });

    var t = 0, last = 0;

    function draw() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uTime"), t);
      gl.uniform2f(U("uM"), mx, my);
      gl.uniform1f(U("uEngage"), Math.max(0, Math.min(1, engage)));
      gl.uniform1f(U("uPress"), Math.max(0, Math.min(1, press)));
      gl.uniform3fv(U("uGround"), ground);
      gl.uniform3fv(U("uLight"), light);
      gl.uniform3fv(U("uShade"), shade);
      gl.uniform3fv(U("uCue"), cue);
      gl.uniform1f(U("uSoft"), CONFIG.soft);
      gl.uniform1f(U("uRelief"), CONFIG.relief);
      gl.uniform1f(U("uReach"), CONFIG.reach);
      gl.uniform1f(U("uDepth"), CONFIG.depth);
      gl.uniform1f(U("uTouch"), CONFIG.touch);
      gl.uniform1f(U("uBreath"), still ? 0 : CONFIG.breath);
      gl.uniform1f(U("uBlush"), CONFIG.blush);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = "1";
    }

    function spring(x, v, target, dt) {
      v += (target - x) * CONFIG.stiffness * dt;
      v *= Math.exp(-CONFIG.damping * dt);
      return [x + v * dt, v];
    }

    function step(dt) {
      t += dt;
      var s;
      s = spring(mx, mvx, tx, dt); mx = s[0]; mvx = s[1];
      s = spring(my, mvy, ty, dt); my = s[0]; mvy = s[1];
      s = spring(engage, engageV, engageT, dt); engage = s[0]; engageV = s[1];
      s = spring(press, pressV, pressT, dt); press = s[0]; pressV = s[1];
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

    addEventListener("resize", function () {
      size();
      if (!running) draw();
    });

    // Off screen it stops. A decorative surface has no claim on a frame budget
    // when nobody is looking at it.
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (still) { engage = 0; press = 0; draw(); return; }
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!visible) { running = false; }
    }, { threshold: 0.01 }).observe(canvas);

    return true;
  }

  function init() {
    var canvas = document.getElementById("doughCanvas");
    if (!canvas) return;
    if (!mount(canvas)) {
      // No WebGL2: the CSS pillow underneath is the whole design, so leave it
      // showing and say so rather than leaving a dead canvas on top.
      canvas.style.display = "none";
      var cap = canvas.parentNode.parentNode.querySelector(".shaderCap");
      if (cap) cap.textContent = "Static fallback - no WebGL2 on this machine";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
