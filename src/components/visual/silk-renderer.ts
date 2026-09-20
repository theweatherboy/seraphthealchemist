import { getThreadGuides, type ThreadPointer, type ThreadScene } from './thread-renderer';

export type ThreadViewport = { scale: number; x: number; y: number };

// A compact, smooth attraction field: the route is unchanged outside the cursor radius.
const attraction = `
uniform vec4 uPointer;
vec2 attract(vec2 p, float depth) {
    vec2 delta = uPointer.xy - p;
    float falloff = 1. - smoothstep(0., uPointer.w, length(delta));
    return p + delta * falloff * falloff * uPointer.z * mix(.28, .65, depth);
}`;

const vertex = `
attribute vec4 aGuide;
attribute vec2 aUv;
attribute vec4 aStyle;
attribute vec4 aFiber;
attribute float aDepth;
uniform float uTime;
uniform vec4 uView;
varying vec2 vUv;
varying vec4 vStyle;
varying vec2 vCrossSection;
varying vec2 vSurface;
${attraction}
void main() {
    float u = aUv.x, phase = aStyle.x;
    float center = sin(u * aStyle.y - uTime * .65 + phase) * aStyle.z
        + sin(u * 23. + uTime * .32 + phase * 1.7) * 9.
        + sin(u * 6. - uTime * .2 + phase) * 12.;
    float spread = 4. + 25. * pow(abs(sin(u * 11. + phase - uTime * .23)), 2.)
        + 8. * pow(abs(sin(u * 27. + phase + uTime * .17)), 2.);
    center += aFiber.x * spread
        + sin(u * (15. + aFiber.y * 2.) - uTime * .55 + aFiber.y) * (4. + abs(aFiber.x) * 8.)
        + sin(u * 63. + aFiber.y * 3. + uTime * .25) * .25;
    float twist = sin(u * 18. - uTime * .38 + aFiber.y);
    float depth = clamp(aDepth + twist * .12, 0., 1.);
    float taper = .68 + .48 * pow(abs(sin(u * 24. - uTime * .8 + aFiber.y)), 4.);
    float width = aFiber.z * taper * mix(2.8, 4.2, depth);
    vec2 axis = aGuide.xy + aGuide.zw * (center + twist * (5. + aDepth * 7.));
    vec2 p = attract(axis, depth) + aGuide.zw * aUv.y * width;
    gl_Position = vec4(p * uView.xy + uView.zw, 0., 1.);
    vUv = aUv;
    vStyle = vec4(aFiber.y, aStyle.w, aFiber.w, aFiber.z);
    // Interpolate physical distance so tapered quads cannot zigzag the hot core.
    vCrossSection = vec2(aUv.y * width, width);
    vSurface = vec2(depth, twist);
}`;

const fragment = `
precision highp float;
uniform float uTime;
varying vec2 vUv;
varying vec4 vStyle;
varying vec2 vCrossSection;
varying vec2 vSurface;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(hash(i), hash(i + vec2(1.,0.)), f.x),
        mix(hash(i + vec2(0.,1.)), hash(i + vec2(1.,1.)), f.x), f.y);
}
void main() {
    float u = vUv.x, y = vCrossSection.x / vCrossSection.y, phase = vStyle.x;
    float shimmer = noise(vec2(u * 65. - uTime * 2.2, phase));
    float depth = vSurface.x;
    float light = .72 + .28 * smoothstep(.25, .9, shimmer);
    // A translucent crystal body, shaded facets and narrow refracted edges.
    float body = exp(-y * y * mix(12., 22., depth));
    float ridge = y + .10 + vSurface.y * .065;
    float sheen = exp(-ridge * ridge * mix(100., 200., depth));
    float edge = smoothstep(-.3, .32, y);
    float rim = exp(-pow(y - .26 - vSurface.y * .08, 2.) * 650.);
    float halo = exp(-y * y * 5.) * .03;
    float glint = smoothstep(.78, .96, noise(vec2(u * 160. - uTime * .6, phase * 3.)));
    float alpha = (body * .37 + sheen * .46 + rim * .16 + glint * sheen * .3 + halo)
        * light * vStyle.z * mix(.32, 1., depth);
    // A slow, smooth color band travels along each strand and blends back to its start.
    float spectrum = fract(u * .62 - uTime * .018 + phase * .09 + vSurface.y * .035);
    float stage = spectrum * 3.;
    float segment = smoothstep(.08, .92, fract(stage));
    vec3 champagne = vec3(.89, .77, .57);
    vec3 ice = vec3(.60, .82, .94);
    vec3 lavender = vec3(.81, .70, .91);
    vec3 fromColor = mix(champagne, ice, step(1., stage));
    vec3 toColor = mix(ice, lavender, step(1., stage));
    fromColor = mix(fromColor, lavender, step(2., stage));
    toColor = mix(toColor, champagne, step(2., stage));
    vec3 prism = mix(fromColor, toColor, segment);
    vec3 color = prism;
    color *= mix(.97, .72, edge) * mix(.88, 1., depth);
    float reflection = (sheen * (.57 + .2 * shimmer) + rim * .12 + glint * sheen * .25) * mix(.55, 1., depth);
    color = mix(color, vec3(.94, .97, 1.), min(reflection, .92));
    float ends = smoothstep(0., .035, u) * (1. - smoothstep(.94, 1., u));
    gl_FragColor = vec4(color, min(alpha, .88) * ends);
}`;

const dustVertex = `
attribute vec4 aGuide;
attribute vec2 aUv;
attribute vec4 aStyle;
uniform float uTime;
uniform vec4 uView;
uniform float uRatio;
varying float vLight;
${attraction}
void main() {
    float phase = aStyle.x, u = aUv.x;
    float center = sin(u * 12. - uTime * .65 + phase) * 30.
        + sin(u * 23. + uTime * .32 + phase * 1.7) * 9.;
    float travel = fract(aStyle.z + uTime * .12);
    vec2 tangent = vec2(aGuide.w, -aGuide.z);
    vec2 p = aGuide.xy + aGuide.zw * (center + aUv.y)
        + tangent * ((travel - .5) * 65.);
    p = attract(p, .55);
    gl_Position = vec4(p * uView.xy + uView.zw, 0., 1.);
    gl_PointSize = aStyle.y * uRatio;
    vLight = (.18 + .82 * pow(abs(sin(uTime * .55 + phase * 5.)), 8.)) * sin(travel * 3.14159);
}`;

const dustFragment = `
precision mediump float;
varying float vLight;
void main() {
    vec2 p = gl_PointCoord * 2. - 1.;
    float diamond = 1. - smoothstep(.5, .72, abs(p.x) + abs(p.y) * .82);
    float facet = smoothstep(-.08, .08, p.x + p.y * .7);
    float core = exp(-dot(p * 6., p * 6.));
    float rays = exp(-abs(p.x) * 34. - abs(p.y) * 2.8) + exp(-abs(p.y) * 34. - abs(p.x) * 2.8);
    vec3 color = mix(vec3(.57, .76, .88), vec3(.94, .95, 1.), facet);
    color = mix(color, vec3(.91, .77, .96), step(0., p.x) * step(p.y, 0.) * .3);
    color = mix(color, vec3(.96, .985, 1.), min(core + rays, 1.));
    gl_FragColor = vec4(color, (diamond * .4 + core * .45 + rays * .26) * vLight);
}`;

/** Static meshes, animated on the GPU; no full-resolution canvas blur per frame. */
export function createSilkRenderer(canvas: HTMLCanvasElement, scene: ThreadScene) {
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
    if (!gl) return null;
    const shaders: WebGLShader[] = [], programs: WebGLProgram[] = [], buffers: WebGLBuffer[] = [];
    function shader(type: number, source: string) {
        const result = gl!.createShader(type)!;
        shaders.push(result); gl!.shaderSource(result, source); gl!.compileShader(result);
        if (!gl!.getShaderParameter(result, gl!.COMPILE_STATUS)) throw Error(gl!.getShaderInfoLog(result) || 'Thread shader failed');
        return result;
    }
    function program(vs: string, fs: string) {
        const result = gl!.createProgram()!;
        programs.push(result);
        gl!.attachShader(result, shader(gl!.VERTEX_SHADER, vs));
        gl!.attachShader(result, shader(gl!.FRAGMENT_SHADER, fs));
        gl!.linkProgram(result);
        if (!gl!.getProgramParameter(result, gl!.LINK_STATUS)) throw Error(gl!.getProgramInfoLog(result) || 'Thread shader link failed');
        return result;
    }
    function mesh(program: WebGLProgram, data: number[], mode: number) {
        const buffer = gl!.createBuffer()!;
        buffers.push(buffer); gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
        gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(data), gl!.STATIC_DRAW);
        return { program, buffer, mode, count: data.length / 15,
            guide: gl!.getAttribLocation(program, 'aGuide'), uv: gl!.getAttribLocation(program, 'aUv'), style: gl!.getAttribLocation(program, 'aStyle'),
            fiber: gl!.getAttribLocation(program, 'aFiber'),
            depth: gl!.getAttribLocation(program, 'aDepth'), pointer: gl!.getUniformLocation(program, 'uPointer'),
            time: gl!.getUniformLocation(program, 'uTime'), view: gl!.getUniformLocation(program, 'uView'), ratio: gl!.getUniformLocation(program, 'uRatio') };
    }
    const fibers: number[] = [], dust: number[] = [];
    let seed = 39171;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const strands: { guide: ReturnType<typeof getThreadGuides>[number]; phase: number; frequency: number; amplitude: number; color: number; offset: number; twist: number; width: number; alpha: number; depth: number }[] = [];
    getThreadGuides(scene).forEach((guide, bundle) => {
        for (let family = 0; family < 3; family++) {
            const phase = family * 2.1 + bundle * 1.37;
            const frequency = 10 + random() * 4, amplitude = 25 + random() * 12;
            for (let strand = 0; strand < 14; strand++) {
                const offset = (random() - .5) * (strand > 10 ? 3.8 : 2);
                const twist = random() * 6.28;
                const width = strand < 3 ? 2.5 + random() * 2 : .45 + random() * 1.15;
                const alpha = strand < 3 ? .9 : .45 + random() * .4;
                const depth = strand < 3 ? .72 + random() * .28 : .12 + random() * .78;
                strands.push({ guide, phase, frequency, amplitude, color: (family + bundle) % 3, offset, twist, width, alpha, depth });
            }
            for (let i = 0; i < 110; i++) {
                const index = Math.floor(random() * guide.length), p = guide[index];
                const offset = (random() - .5) * (random() < .85 ? 100 : 180);
                const size = random() < .08 ? 7 + random() * 5 : 1.8 + random() ** 2 * 3.5;
                dust.push(p.x, p.y, p.nx, p.ny, index / (guide.length - 1), offset, phase + random() * 2, size, random(), 0, 0, 0, 0, 0, 0);
            }
        }
    });
    // Back fibers are softer and painted first so foreground crossings retain their shape.
    strands.sort((a, b) => a.depth - b.depth).forEach(({ guide, phase, frequency, amplitude, color, offset, twist, width, alpha, depth }) => {
        const add = (i: number, side: number) => {
            const p = guide[i];
            fibers.push(p.x, p.y, p.nx, p.ny, i / (guide.length - 1), side, phase, frequency, amplitude, color,
                offset, twist, width, alpha, depth);
        };
        for (let i = 0; i < guide.length - 1; i++) {
            add(i, -1); add(i, 1); add(i + 1, -1);
            add(i + 1, -1); add(i, 1); add(i + 1, 1);
        }
    });
    const silk = mesh(program(vertex, fragment), fibers, gl.TRIANGLES);
    const motes = mesh(program(dustVertex, dustFragment), dust, gl.POINTS);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    return {
        draw(time: number, view: ThreadViewport, pointer: ThreadPointer) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            for (const m of [silk, motes]) {
                gl.useProgram(m.program);
                gl.bindBuffer(gl.ARRAY_BUFFER, m.buffer);
                for (const [location, size, offset] of [[m.guide, 4, 0], [m.uv, 2, 16], [m.style, 4, 24], [m.fiber, 4, 40], [m.depth, 1, 56]]) {
                    if (location < 0) continue;
                    gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, size, gl.FLOAT, false, 60, offset);
                }
                gl.uniform1f(m.time, time);
                gl.uniform1f(m.ratio, view.scale);
                gl.uniform4f(m.pointer, pointer.x, pointer.y, pointer.strength, pointer.radius);
                gl.uniform4f(m.view, view.scale * 2 / canvas.width, -view.scale * 2 / canvas.height,
                    view.x * 2 / canvas.width - 1, 1 - view.y * 2 / canvas.height);
                gl.drawArrays(m.mode, 0, m.count);
            }
        },
        dispose() {
            buffers.forEach(buffer => gl.deleteBuffer(buffer));
            programs.forEach(program => gl.deleteProgram(program));
            shaders.forEach(shader => gl.deleteShader(shader));
        },
    };
}
