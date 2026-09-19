import { getThreadGuides, type ThreadScene } from './thread-renderer';

export type ThreadViewport = { scale: number; x: number; y: number };

const vertex = `
attribute vec4 aGuide;
attribute vec2 aUv;
attribute vec4 aStyle;
attribute vec4 aFiber;
uniform float uTime;
uniform vec4 uView;
varying vec2 vUv;
varying vec4 vStyle;
varying vec2 vCrossSection;
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
    float taper = .45 + 1.3 * pow(abs(sin(u * 24. - uTime * .8 + aFiber.y)), 6.);
    float width = aFiber.z * taper * 4.;
    vec2 p = aGuide.xy + aGuide.zw * (center + aUv.y * width);
    gl_Position = vec4(p * uView.xy + uView.zw, 0., 1.);
    vUv = aUv;
    vStyle = vec4(aFiber.y, aStyle.w, aFiber.w, aFiber.z);
    // Interpolate physical distance so tapered quads cannot zigzag the hot core.
    vCrossSection = vec2(aUv.y * width, width);
}`;

const fragment = `
precision highp float;
uniform float uTime;
varying vec2 vUv;
varying vec4 vStyle;
varying vec2 vCrossSection;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(hash(i), hash(i + vec2(1.,0.)), f.x),
        mix(hash(i + vec2(0.,1.)), hash(i + vec2(1.,1.)), f.x), f.y);
}
void main() {
    float u = vUv.x, y = vCrossSection.x / vCrossSection.y, phase = vStyle.x;
    float shimmer = noise(vec2(u * 65. - uTime * 2.2, phase));
    float light = .62 + .38 * smoothstep(.12, .82, shimmer);
    float core = exp(-y * y * 155.);
    float sheath = exp(-y * y * 17.);
    // Hairline side fibers separate from the bright center as each ribbon twists.
    float side = y - (.32 + .18 * sin(u * 45. - uTime * .45 + phase));
    float hair = exp(-side * side * 850.) * .38;
    side = y + (.33 + .16 * sin(u * 37. + uTime * .4 + phase));
    hair += exp(-side * side * 950.) * .3;
    float halo = exp(-y * y * 5.) * .14;
    float alpha = (core * 1.65 + hair + sheath * .4 + halo) * light * vStyle.z;
    vec3 color = vStyle.y < .5 ? vec3(1., .72, .32) :
        (vStyle.y < 1.5 ? vec3(.43, .79, 1.) : vec3(.85, .55, 1.));
    vec3 pearl = vStyle.y < .5 ? vec3(1., .98, .86) :
        (vStyle.y < 1.5 ? vec3(.91, .985, 1.) : vec3(1., .91, 1.));
    color = mix(color, pearl, clamp(core * 1.3 + hair + shimmer * .18, 0., 1.));
    float ends = smoothstep(0., .035, u) * (1. - smoothstep(.94, 1., u));
    gl_FragColor = vec4(color, clamp(alpha, 0., .95) * ends);
}`;

const dustVertex = `
attribute vec4 aGuide;
attribute vec2 aUv;
attribute vec4 aStyle;
uniform float uTime;
uniform vec4 uView;
uniform float uRatio;
varying float vLight;
void main() {
    float phase = aStyle.x, u = aUv.x;
    float center = sin(u * 12. - uTime * .65 + phase) * 30.
        + sin(u * 23. + uTime * .32 + phase * 1.7) * 9.;
    float travel = fract(aStyle.z + uTime * .12);
    vec2 tangent = vec2(aGuide.w, -aGuide.z);
    vec2 p = aGuide.xy + aGuide.zw * (center + aUv.y)
        + tangent * ((travel - .5) * 65.);
    gl_Position = vec4(p * uView.xy + uView.zw, 0., 1.);
    gl_PointSize = aStyle.y * uRatio;
    vLight = (.5 + .5 * pow(abs(sin(uTime * .8 + phase * 5.)), 6.)) * sin(travel * 3.14159);
}`;

const dustFragment = `
precision mediump float;
varying float vLight;
void main() {
    vec2 p = gl_PointCoord * 2. - 1.;
    vec2 q = vec2(p.x * .8 + p.y * .6, -p.x * .6 + p.y * .8);
    float flake = exp(-dot(q * vec2(1.5, 4.), q * vec2(1.5, 4.)));
    float core = exp(-dot(p * 5., p * 5.));
    vec3 color = mix(vec3(.74, .46, .12), vec3(1., .99, .84), core);
    gl_FragColor = vec4(color, (flake * .9 + core) * vLight);
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
        return { program, buffer, mode, count: data.length / 14,
            guide: gl!.getAttribLocation(program, 'aGuide'), uv: gl!.getAttribLocation(program, 'aUv'), style: gl!.getAttribLocation(program, 'aStyle'),
            fiber: gl!.getAttribLocation(program, 'aFiber'),
            time: gl!.getUniformLocation(program, 'uTime'), view: gl!.getUniformLocation(program, 'uView'), ratio: gl!.getUniformLocation(program, 'uRatio') };
    }
    const fibers: number[] = [], dust: number[] = [];
    let seed = 39171;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    getThreadGuides(scene).forEach((guide, bundle) => {
        for (let family = 0; family < 3; family++) {
            const phase = family * 2.1 + bundle * 1.37;
            const frequency = 10 + random() * 4, amplitude = 25 + random() * 12;
            for (let strand = 0; strand < 14; strand++) {
                const offset = (random() - .5) * (strand > 10 ? 3.8 : 2);
                const twist = random() * 6.28;
                const width = strand < 3 ? 2.5 + random() * 2 : .4 + random() * 1.1;
                const alpha = strand < 3 ? 1 : .35 + random() * .5;
                const add = (i: number, side: number) => {
                    const p = guide[i];
                    fibers.push(p.x, p.y, p.nx, p.ny, i / (guide.length - 1), side, phase, frequency, amplitude, (family + bundle) % 3,
                        offset, twist, width, alpha);
                };
                for (let i = 0; i < guide.length - 1; i++) {
                    add(i, -1); add(i, 1); add(i + 1, -1);
                    add(i + 1, -1); add(i, 1); add(i + 1, 1);
                }
            }
            for (let i = 0; i < 260; i++) {
                const index = Math.floor(random() * guide.length), p = guide[index];
                const offset = (random() - .5) * (random() < .85 ? 100 : 180);
                dust.push(p.x, p.y, p.nx, p.ny, index / (guide.length - 1), offset, phase + random() * 2, 2 + random() ** 2 * 5, random(), 0, 0, 0, 0, 0);
            }
        }
    });
    const silk = mesh(program(vertex, fragment), fibers, gl.TRIANGLES);
    const motes = mesh(program(dustVertex, dustFragment), dust, gl.POINTS);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    return {
        draw(time: number, view: ThreadViewport) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            for (const m of [silk, motes]) {
                gl.useProgram(m.program);
                gl.bindBuffer(gl.ARRAY_BUFFER, m.buffer);
                for (const [location, size, offset] of [[m.guide, 4, 0], [m.uv, 2, 16], [m.style, 4, 24], [m.fiber, 4, 40]]) {
                    if (location < 0) continue;
                    gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, size, gl.FLOAT, false, 56, offset);
                }
                gl.uniform1f(m.time, time);
                gl.uniform1f(m.ratio, view.scale);
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
