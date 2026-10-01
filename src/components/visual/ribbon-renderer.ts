import { getThreadGuides, type ThreadPointer, type ThreadScene } from './thread-renderer';

type Point = { x: number; y: number; turn: number };

/** Signed cross-sections turn through edge-on folds. Light travels along the cloth. */
export function createRibbonRenderer(context: CanvasRenderingContext2D, scene: ThreadScene) {
    const guides = getThreadGuides(scene);
    const bands = 32;
    const trace = (points: Point[]) => {
        context.beginPath();
        points.forEach((p, i) => i ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y));
    };
    return (time: number, pointer: ThreadPointer) => {
        context.save();
        context.lineJoin = context.lineCap = 'round';
        guides.forEach((guide, route) => {
            const upper = scene === 'sanctuary' && route === 1;
            const phase = route * 2.4 + (scene === 'vision' ? 1.8 : 0);
            const width = scene === 'offerings' && route === 0 ? 35 : upper ? 76 : 88;
            const surface = (v: number) => guide.map((g, i): Point => {
                const u = i / (guide.length - 1);
                const wave = u * 18 - time * 1.05 + phase;
                const turn = u * 11.8 - time * .62 + phase;
                const taper = upper ? .08 + .92 * Math.max(0, Math.min(1, (u - .43) / .28)) : .85 + .15 * Math.sin(u * 9 + phase);
                const radius = width * taper * (1 + .22 * Math.sin(wave * .63));
                const flutter = Math.sin(wave) * 23 + Math.sin(u * 31 - time * 1.8 + phase) * 5;
                const cross = v * radius * Math.cos(turn);
                const belly = (1 - v * v) * radius * .32 * Math.sin(wave + v * 2);
                const along = v * radius * Math.sin(turn) * .42;
                const offset = flutter + cross + belly;
                let x = g.x + g.nx * offset - g.ny * along;
                let y = g.y + g.ny * offset + g.nx * along;
                const distance = Math.hypot(pointer.x - x, pointer.y - y);
                const attraction = Math.max(0, 1 - distance / pointer.radius) ** 2 * pointer.strength * .2;
                x += (pointer.x - x) * attraction;
                y += (pointer.y - y) * attraction;
                return { x, y, turn };
            });
            const mesh = Array.from({ length: bands + 1 }, (_, b) => surface(b / bands * 2 - 1));
            for (let b = 0; b < bands; b++) {
                const v = (b + .5) / bands * 2 - 1;
                const light = context.createLinearGradient(guide[0].x, 0, guide[guide.length - 1].x, 0);
                for (let stop = 0; stop <= 32; stop++) {
                    const u = stop / 32;
                    const turn = u * 11.8 - time * .62 + phase;
                    const ridge = Math.sin(turn + v * 2.5 + Math.sin(u * 19 - time) * .6);
                    const sheen = Math.pow(Math.max(0, ridge), 8);
                    const pearl = Math.pow(Math.abs(v), 5) * .12 + sheen * .62;
                    const prism = u * 39 + v * 5 - time * .75;
                    const red = Math.round(211 + 34 * Math.sin(prism) + sheen * 10);
                    const green = Math.round(201 + 30 * Math.sin(prism + 2.1) + sheen * 20);
                    const blue = Math.round(188 + 45 * Math.sin(prism + 4.2) + sheen * 20);
                    light.addColorStop(u, `rgba(${red},${green},${blue},${.14 + pearl})`);
                }
                // Continuous strips avoid the visible tessellation of individually filled cells.
                trace([...mesh[b], ...mesh[b + 1].slice().reverse()]);
                context.closePath();
                context.fillStyle = light;
                context.fill();
            }
            for (const v of [-1, 1, -.42, .55]) {
                const points = surface(v);
                trace(points);
                context.strokeStyle = Math.abs(v) === 1 ? 'rgba(249,215,159,.52)' : 'rgba(255,237,207,.18)';
                context.lineWidth = Math.abs(v) === 1 ? 1.1 : .65;
                context.stroke();
                for (let i = 0; i < points.length - 1; i++) {
                    const u = i / (points.length - 1);
                    const glint = Math.pow(Math.max(0, Math.sin(u * 31 - time * 1.5 + v * 3)), 18);
                    if (glint < .2) continue;
                    trace([points[i], points[i + 1]]);
                    context.strokeStyle = `rgba(255,205,126,${glint * .24})`;
                    context.lineWidth = 6;
                    context.stroke();
                    context.strokeStyle = `rgba(255,242,206,${glint * .9})`;
                    context.lineWidth = 1.4;
                    context.stroke();
                }
            }
            for (const v of [-1.3, 1.35]) {
                trace(surface(v));
                context.strokeStyle = 'rgba(241,181,102,.35)';
                context.lineWidth = .6;
                context.stroke();
            }
        });
        context.restore();
    };
}
