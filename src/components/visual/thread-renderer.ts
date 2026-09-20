export type ThreadScene = 'dawn' | 'portal' | 'starlight';
export type ThreadPointer = { x: number; y: number; strength: number; radius: number };
type Point = readonly [number, number];
type Guide = { x: number; y: number; nx: number; ny: number };

// The artwork and threads share this 1536 x 1024 coordinate plane and cover crop.
const routes: Record<ThreadScene, Point[][]> = {
    dawn: [
        [[-100, 235], [100, 300], [210, 510], [470, 700], [800, 727], [1120, 739], [1420, 575], [1650, 430]],
        [[-100, 865], [210, 813], [520, 744], [790, 695], [1120, 772], [1390, 815], [1650, 850]],
        [[1320, -100], [1290, 120], [1480, 240], [1590, 385], [1430, 580], [1110, 751]],
    ],
    portal: [
        [[-100, 540], [180, 603], [380, 691], [530, 650], [760, 700], [1070, 772], [1340, 752], [1640, 825]],
        [[760, 540], [858, 437], [1075, 317], [1070, 230], [920, 213], [826, 307], [802, 480], [980, 592], [1030, 726], [1320, 802], [1640, 746]],
    ],
    starlight: [
        [[-100, 355], [130, 414], [260, 543], [430, 490], [670, 582], [900, 563], [1100, 544], [1320, 490], [1630, 638]],
        [[-100, 650], [200, 585], [440, 553], [710, 585], [920, 580], [1220, 514], [1620, 600]],
    ],
};
const colors = ['196,212,228', '178,214,235', '209,196,231'];
const pearls = ['240,247,255', '230,246,255', '245,234,255'];
const shadows = ['131,150,170', '112,147,170', '145,130,172'];
const samples = 160;
const tau = Math.PI * 2;

function randomGenerator() {
    let seed = 98173;
    return () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}

function spline(points: Point[], progress: number): Point {
    const f = progress * (points.length - 1);
    const i = Math.min(points.length - 2, Math.floor(f));
    const t = f - i, t2 = t * t, t3 = t2 * t;
    const a = points[Math.max(0, i - 1)], b = points[i];
    const c = points[i + 1], d = points[Math.min(points.length - 1, i + 2)];
    const at = (axis: 0 | 1) => .5 * (2 * b[axis] + (-a[axis] + c[axis]) * t +
        (2 * a[axis] - 5 * b[axis] + 4 * c[axis] - d[axis]) * t2 + (-a[axis] + 3 * b[axis] - 3 * c[axis] + d[axis]) * t3);
    return [at(0), at(1)];
}

function threadPath(points: Point[], start = 0, end = points.length - 1) {
    const path = new Path2D();
    path.moveTo(...points[start]);
    for (let i = start; i < end; i++) {
        const a = points[Math.max(0, i - 1)], b = points[i];
        const c = points[i + 1], d = points[Math.min(points.length - 1, i + 2)];
        path.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6,
            c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]);
    }
    return path;
}

export function getThreadGuides(scene: ThreadScene) {
    return routes[scene].map(route => Array.from({ length: samples + 1 }, (_, i): Guide => {
        const p = spline(route, i / samples);
        const next = spline(route, Math.min(1, (i + .2) / samples));
        const previous = spline(route, Math.max(0, (i - .2) / samples));
        const dx = next[0] - previous[0], dy = next[1] - previous[1];
        const length = Math.hypot(dx, dy) || 1;
        return { x: p[0], y: p[1], nx: -dy / length, ny: dx / length };
    }));
}

function lightSprite(color: string) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, 'rgba(240,249,255,.45)');
    glow.addColorStop(.18, `rgba(${color},.2)`);
    glow.addColorStop(.45, `rgba(${color},.06)`);
    glow.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 64, 64);
    const facet = ctx.createLinearGradient(20, 18, 43, 46);
    facet.addColorStop(0, '#9ac8e4');
    facet.addColorStop(.47, '#f0f8ff');
    facet.addColorStop(.5, '#c0c9e3');
    facet.addColorStop(1, '#e7d2f2');
    ctx.fillStyle = facet;
    ctx.beginPath();
    ctx.moveTo(32, 8); ctx.lineTo(44, 32); ctx.lineTo(32, 56); ctx.lineTo(20, 32);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(244,250,255,.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 5); ctx.lineTo(32, 59); ctx.moveTo(14, 32); ctx.lineTo(50, 32);
    ctx.stroke();
    return canvas;
}

// A tapered, irregular brush of light, rather than a constant-width neon stroke.
function silkPath(points: Point[], time: number, phase: number, width: number) {
    const path = new Path2D();
    const edges: Point[] = [];
    for (let i = 0; i < points.length; i++) {
        const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy) || 1;
        const u = i / samples;
        const taper = .12 + Math.sin(u * 31 - time * 1.1 + phase) ** 6 * .65 +
            Math.sin(u * 17 - time * .7 + phase * 2) ** 12 * 1.5;
        const radius = width * taper;
        const x = points[i][0], y = points[i][1];
        if (i === 0) path.moveTo(x - dy / length * radius, y + dx / length * radius);
        else path.lineTo(x - dy / length * radius, y + dx / length * radius);
        edges.push([x + dy / length * radius, y - dx / length * radius]);
    }
    for (let i = edges.length - 1; i >= 0; i--) path.lineTo(...edges[i]);
    path.closePath();
    return path;
}

function attract(point: [number, number], depth: number, pointer: ThreadPointer) {
    const dx = pointer.x - point[0], dy = pointer.y - point[1];
    const distance = Math.min(1, Math.hypot(dx, dy) / pointer.radius);
    const falloff = 1 - distance * distance * (3 - 2 * distance);
    const pull = falloff * falloff * pointer.strength * (.28 + .37 * depth);
    point[0] += dx * pull;
    point[1] += dy * pull;
}

function refractedGradient(context: CanvasRenderingContext2D, points: Point[], phase: number, opacity = .5) {
    const start = points[0], end = points[samples];
    const gradient = context.createLinearGradient(start[0], start[1], end[0], end[1]);
    const offset = (phase % tau) / tau;
    const colors = [
        [0, `rgba(226,201,156,${opacity})`],
        [.36, `rgba(168,216,237,${opacity})`],
        [.69, `rgba(215,195,236,${opacity})`],
        [1, `rgba(226,201,156,${opacity})`],
    ] as const;
    for (const [position, color] of colors)
        gradient.addColorStop((position + offset * .06) % 1, color);
    return gradient;
}

/** Translucent braided fibers with refracted highlights and small crystal glints. */
export function createThreadRenderer(context: CanvasRenderingContext2D, scene: ThreadScene) {
    const random = randomGenerator();
    const sprites = colors.map(lightSprite);
    const curves = getThreadGuides(scene);
    const bundles = curves.map((curve, bundle) => ({
        curve,
        groups: Array.from({ length: 3 }, (_, group) => ({
            color: (group + bundle) % colors.length,
            phase: group * 2.1 + bundle * 1.37,
            frequency: 10 + random() * 4,
            amplitude: 25 + random() * 12,
            centers: new Float32Array(samples + 1),
            spread: new Float32Array(samples + 1),
            fibers: Array.from({ length: 12 }, (_, i) => ({
                offset: (random() - .5) * 2,
                phase: random() * tau,
                frequency: 13 + random() * 23,
                width: .25 + random() * .6,
                alpha: .23 + random() * .45,
                depth: i < 2 ? .8 + random() * .2 : .15 + random() * .6,
                wisp: i > 9,
                core: i < 2,
                points: curve.map(() => [0, 0] as [number, number]),
            })).sort((a, b) => a.depth - b.depth),
        })),
        dust: Array.from({ length: 80 }, () => ({
            u: random(), group: Math.floor(random() * 3), phase: random() * tau,
            offset: (random() - .5) * (random() < .8 ? 65 : 150),
            size: .3 + random() ** 3 * 1.35, speed: .008 + random() * .018,
        })),
    }));

    return (time: number, pointer: ThreadPointer) => {
        context.save();
        context.lineCap = context.lineJoin = 'round';

        for (const { curve, groups } of bundles) {
            for (const group of groups) {
                const color = colors[group.color], pearl = pearls[group.color];
                for (let i = 0; i <= samples; i++) {
                    const u = i / samples, phase = group.phase;
                    group.centers[i] = Math.sin(u * group.frequency - time * .65 + phase) * group.amplitude +
                        Math.sin(u * 23 + time * .32 + phase * 1.7) * 9 +
                        Math.sin(u * 6 - time * .2 + phase) * 12;
                    // Bundles pinch to bright knots, then open into loose silk.
                    group.spread[i] = 2 + 22 * Math.sin(u * 11 + phase - time * .23) ** 2 +
                        6 * Math.sin(u * 27 + phase + time * .17) ** 2;
                }
                for (const fiber of group.fibers) {
                    for (let i = 0; i <= samples; i++) {
                        const u = i / samples, g = curve[i];
                        const detail = Math.sin(u * fiber.frequency + fiber.phase + time * .38) * 3.5 +
                            Math.sin(u * 77 + fiber.phase - time * .28) * .9;
                        const braid = Math.sin(u * 19 + fiber.phase - time * .45) * (fiber.core ? 7 : 4);
                        const offset = group.centers[i] + fiber.offset * group.spread[i] * (fiber.wisp ? 2.5 : 1) + detail + braid;
                        fiber.points[i][0] = g.x + g.nx * offset;
                        fiber.points[i][1] = g.y + g.ny * offset;
                        attract(fiber.points[i], fiber.depth, pointer);
                    }
                    const path = threadPath(fiber.points);
                    context.strokeStyle = refractedGradient(context, fiber.points, fiber.phase,
                        Math.min(.9, fiber.alpha * (fiber.wisp ? .35 : .8) * (.5 + fiber.depth * .5) * 1.1));
                    context.lineWidth = fiber.width * (.7 + fiber.depth * .5);
                    context.stroke(path);

                    if (fiber.core) {
                        // Keep a shaded transparent body underneath the refracted edge.
                        context.fillStyle = `rgba(${shadows[group.color]},.23)`;
                        context.fill(silkPath(fiber.points, time, fiber.phase, 2.6));
                        context.fillStyle = `rgba(${color},.4)`;
                        context.fill(silkPath(fiber.points, time, fiber.phase, 1.8));
                        const refraction = refractedGradient(context, fiber.points, fiber.phase, .47 * fiber.depth);
                        context.fillStyle = refraction;
                        context.fill(silkPath(fiber.points, time, fiber.phase, .55));
                    }
                }
            }
        }

        for (const { curve, groups, dust } of bundles) {
            // Faceted specks catch the light at irregular intervals along the braid.
            for (const mote of dust) {
                const u = (mote.u + time * mote.speed) % 1;
                const index = u * samples, i = Math.min(samples - 1, Math.floor(index)), f = index - i;
                const a = curve[i], b = curve[i + 1], group = groups[mote.group];
                const offset = group.centers[i] * .8 + mote.offset + Math.sin(time * .3 + mote.phase) * 5;
                const point: [number, number] = [a.x + (b.x - a.x) * f + a.nx * offset, a.y + (b.y - a.y) * f + a.ny * offset];
                attract(point, .55, pointer);
                const [x, y] = point;
                const glint = Math.sin(mote.phase + time * .85) ** 8;
                context.fillStyle = `rgba(194,219,242,${.2 + glint * .35})`;
                context.beginPath();
                context.moveTo(x, y - mote.size * 1.6);
                context.lineTo(x + mote.size * .7, y);
                context.lineTo(x, y + mote.size * 1.6);
                context.lineTo(x - mote.size * .7, y);
                context.closePath(); context.fill();
                if (mote.size > 1.5) {
                    context.globalAlpha = .2 + glint * .3;
                    const radius = 2 + glint * 4;
                    context.drawImage(sprites[0], x - radius, y - radius, radius * 2, radius * 2);
                    context.globalAlpha = 1;
                } else if (glint > .65) {
                    context.fillStyle = 'rgba(240,249,255,.5)';
                    context.fillRect(x, y, 1.1, .7);
                }
            }
            for (const group of groups) {
                for (let i = 0; i < 2; i++) {
                    const index = Math.floor(((i * .213 + group.phase * .073 + time * .038) % 1) * samples);
                    const [x, y] = group.fibers[i % 3].points[index];
                    const radius = 5 + 5 * Math.sin(time * .6 + i) ** 2;
                    context.globalAlpha = .3;
                    context.drawImage(sprites[group.color], x - radius, y - radius, radius * 2, radius * 2);
                    context.globalAlpha = 1;
                    context.strokeStyle = 'rgba(240,249,255,.35)';
                    context.lineWidth = .45;
                    context.beginPath();
                    context.moveTo(x - radius * .7, y); context.lineTo(x + radius * .7, y);
                    context.moveTo(x, y - radius * .4); context.lineTo(x, y + radius * .4);
                    context.stroke();
                }
            }
        }
        context.restore();
    };
}
