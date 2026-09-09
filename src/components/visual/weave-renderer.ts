type Point = { x: number; y: number };
type Knot = readonly [number, number];
type Guide = Point & { nx: number; ny: number };
export type WeavePointer = Point & { strength: number };

// Open, looping routes extend past every edge. Reversing x is intentional: a
// filament must be able to curl back on itself, rather than remain a y=f(x) wave.
const ROUTES: readonly (readonly Knot[])[] = [
  [[-.18,.24],[.10,.32],[.23,.44],[.25,.67],[.42,.76],[.59,.62],[.72,.49],[.87,.53],[1.18,.32]],
  [[.12,1.20],[.18,.91],[.34,.68],[.46,.70],[.39,.85],[.23,.74],[.17,.48],[.28,.26],[.22,-.20]],
  [[1.12,1.18],[.88,.91],[.77,.69],[.84,.53],[.96,.38],[.86,.29],[.75,.43],[.77,.66],[.93,.78],[1.18,.65]],
  [[-.18,.86],[.12,.76],[.31,.61],[.49,.66],[.68,.80],[.85,.66],[.86,.46],[.96,.18],[1.07,-.18]],
  [[.69,-.20],[.67,.12],[.78,.28],[.80,.48],[.64,.65],[.50,.82],[.58,1.20]],
  [[-.18,.48],[.08,.55],[.22,.73],[.32,.65],[.28,.43],[.09,.31],[.04,-.18]],
  [[1.18,.84],[.92,.87],[.81,.77],[.89,.67],[.98,.77],[.89,.94],[.71,.80],[.59,.68],[.37,.61],[-.18,.68]],
];
const COLORS = ['#ef7833', '#ffc15d', '#ffe095', '#bddf9e', '#82e6df', '#75c7ff', '#9398ff', '#cc9bff'];
const TAU = Math.PI * 2;
const clamp = (n: number, low = 0, high = 1) => Math.min(high, Math.max(low, n));

function randomGenerator() {
  let state = 81473;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}

function spline(a: number, b: number, c: number, d: number, t: number) {
  return .5 * ((2*b) + (-a+c)*t + (2*a-5*b+4*c-d)*t*t + (-a+3*b-3*c+d)*t*t*t);
}

function sampleGuide(knots: readonly Knot[], count: number, width: number, height: number): Guide[] {
  const points = Array.from({ length: count + 1 }, (_, i) => {
    const position = i / count * (knots.length - 1);
    const j = Math.min(knots.length - 2, Math.floor(position));
    const a = knots[Math.max(0, j-1)], b = knots[j], c = knots[j+1], d = knots[Math.min(knots.length-1, j+2)];
    return { x: spline(a[0],b[0],c[0],d[0],position-j)*width, y: spline(a[1],b[1],c[1],d[1],position-j)*height };
  });
  return points.map((p, i) => {
    const before = points[Math.max(0, i-1)], after = points[Math.min(count, i+1)];
    const length = Math.hypot(after.x-before.x, after.y-before.y) || 1;
    return { ...p, nx: -(after.y-before.y)/length, ny: (after.x-before.x)/length };
  });
}

// One continuous cubic path, including matching tangents at every join.
function threadPath(points: Point[]) {
  const path = new Path2D();
  path.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length-1; i++) {
    const a = points[Math.max(0,i-1)], b = points[i], c = points[i+1], d = points[Math.min(points.length-1,i+2)];
    path.bezierCurveTo(b.x+(c.x-a.x)/6, b.y+(c.y-a.y)/6, c.x-(d.x-b.x)/6, c.y-(d.y-b.y)/6, c.x,c.y);
  }
  return path;
}

function lightSprite(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const glow = ctx.createRadialGradient(32,32,0,32,32,32);
  glow.addColorStop(0, '#fffbea'); glow.addColorStop(.045, '#fffbea');
  glow.addColorStop(.12, color+'dc'); glow.addColorStop(.32, color+'54');
  glow.addColorStop(.65, color+'10'); glow.addColorStop(1, color+'00');
  ctx.fillStyle = glow; ctx.fillRect(0,0,64,64);
  return canvas;
}

type Filament = {
  family: number; phase: number; offset: number; spread: number; frequency: number;
  speed: number; width: number; alpha: number; accent: boolean; wisp: boolean;
  direction: number; points: Point[];
};

export function createWeaveRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const bloom = document.createElement('canvas');
  const light = bloom.getContext('2d')!;
  const softBloom = document.createElement('canvas');
  const softLight = softBloom.getContext('2d')!;
  const sprites = COLORS.map(lightSprite);
  let width = 1, height = 1, dpr = 1, mobile = false;
  let guides: Guide[][] = [], filaments: Filament[] = [];
  let spectrum: CanvasGradient, core: CanvasGradient;

  function resize(w: number, h: number, pixelRatio: number) {
    width = Math.max(1,w); height = Math.max(1,h); mobile = width < 700;
    dpr = Math.min(pixelRatio, mobile ? 1.75 : 2);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx!.setTransform(dpr,0,0,dpr,0,0);
    // Blur only the small light buffer, not the full-resolution composite.
    bloom.width = softBloom.width = Math.ceil(width/3);
    bloom.height = softBloom.height = Math.ceil(height/3);
    light.setTransform(1/3,0,0,1/3,0,0);
    spectrum = ctx!.createLinearGradient(0,0,width,height*.08);
    core = ctx!.createLinearGradient(0,0,width,height*.08);
    COLORS.forEach((color,i) => spectrum.addColorStop(i/(COLORS.length-1),color));
    core.addColorStop(0,'#ffcb83'); core.addColorStop(.4,'#fff0bf');
    core.addColorStop(.62,'#d1fff4'); core.addColorStop(.82,'#c5e8ff'); core.addColorStop(1,'#e3cfff');
    guides = ROUTES.map(route => sampleGuide(route, mobile ? 64 : 88,width,height));
    const random = randomGenerator();
    const perFamily = mobile ? 13 : 23;
    filaments = ROUTES.flatMap((_,family) => Array.from({ length:perFamily }, (_,i) => ({
      family, phase:random()*TAU, offset:(random()-.5)*16,
      spread:7+random()*22, frequency:2+random()*2, speed:.10+random()*.09,
      width:.35+random()*.50, alpha:.18+random()*.30, accent:i%7===0,
      wisp:i%6===5, direction:family%2 ? -1 : 1,
      points:guides[family].map(() => ({ x:0,y:0 })),
    })));
  }

  function draw(time: number, pointer: WeavePointer) {
    if (!filaments.length) return;
    ctx!.globalCompositeOperation = 'source-over'; ctx!.globalAlpha = 1;
    ctx!.clearRect(0,0,width,height); light.clearRect(0,0,width,height);
    ctx!.lineCap = light.lineCap = 'round'; ctx!.lineJoin = light.lineJoin = 'round';
    const scale = clamp(Math.min(width,height)/850,.55,1.25);
    const radius = mobile ? 120 : 190;
    const hoverLight = ctx!.createRadialGradient(pointer.x,pointer.y,8,pointer.x,pointer.y,radius);
    hoverLight.addColorStop(0,'#fff3d5ed'); hoverLight.addColorStop(.35,'#b9e9ffad'); hoverLight.addColorStop(1,'#8ccfff00');

    for (const strand of filaments) {
      const guide = guides[strand.family];
      const familyPhase = strand.family*1.19;
      const breathing = .7+.3*Math.sin(time*.12+familyPhase);
      for (let i=0; i<guide.length; i++) {
        const u = i/(guide.length-1), g = guide[i];
        // Shared drift carries the bundle; independent offsets braid and release.
        const envelope = .4+.6*Math.pow(Math.sin(u*9+familyPhase+time*.08),2);
        const braid = Math.sin(u*TAU*strand.frequency+strand.phase+time*strand.speed*strand.direction);
        const spread = strand.spread*(strand.wisp ? 2.8 : 1)*envelope;
        const detail = Math.sin(u*72+strand.phase+time*.09)*2.2 + Math.sin(u*123+strand.phase*4-time*.12)*.65;
        const offset = (strand.offset + braid*spread*breathing + detail)*scale;
        const drift = Math.sin(u*7+time*.14+familyPhase)*12*scale;
        let x = g.x+g.nx*(offset+drift)+Math.sin(time*.09+u*5+familyPhase)*8*scale;
        let y = g.y+g.ny*(offset+drift)+Math.cos(time*.11+u*6+familyPhase)*10*scale;
        if (pointer.strength > .001) {
          const dx=x-pointer.x, dy=y-pointer.y;
          // A smooth magnetic eddy bends AROUND the cursor; no hard field edge.
          const influence = Math.exp(-(dx*dx+dy*dy)/(radius*radius*.65))*pointer.strength;
          x += (-dy*.22+dx*.075)*influence;
          y += ( dx*.22+dy*.075)*influence;
        }
        strand.points[i].x=x; strand.points[i].y=y;
      }
      const path = threadPath(strand.points);
      const shimmer = .80+.20*Math.sin(time*.32+strand.phase);
      const alpha = strand.alpha*shimmer*(strand.wisp ? .5 : 1);
      ctx!.strokeStyle = spectrum; ctx!.lineWidth = strand.width; ctx!.globalAlpha = alpha;
      ctx!.stroke(path);
      if (strand.accent) {
        // Colored energy around a narrow hot core. Only accents seed the bloom.
        ctx!.globalCompositeOperation = 'lighter';
        ctx!.globalAlpha = .11; ctx!.lineWidth = 3.2; ctx!.stroke(path);
        ctx!.strokeStyle = core; ctx!.globalAlpha = .62*shimmer;
        ctx!.lineWidth = .65; ctx!.stroke(path);
        ctx!.globalCompositeOperation = 'source-over';
        light.strokeStyle = spectrum; light.globalAlpha = .40; light.lineWidth = 6;
        light.stroke(path);
      }
      if (pointer.strength > .01) {
        // Local light travels with the bent curve, without whitening whole strands.
        ctx!.globalCompositeOperation='lighter'; ctx!.strokeStyle=hoverLight;
        ctx!.globalAlpha=pointer.strength*(strand.accent ? .85 : .48);
        ctx!.lineWidth=strand.accent ? 1.3 : strand.width+.25; ctx!.stroke(path);
        ctx!.globalCompositeOperation='source-over';
      }
    }

    softLight.clearRect(0,0,softBloom.width,softBloom.height);
    softLight.filter='blur(2px)'; softLight.drawImage(bloom,0,0);
    ctx!.save(); ctx!.globalAlpha=.85; ctx!.globalCompositeOperation='lighter';
    ctx!.drawImage(softBloom,0,0,width,height); ctx!.restore();

    // Small light knots follow the actual filaments in both directions.
    ctx!.globalCompositeOperation='lighter';
    for (const [index,strand] of filaments.entries()) {
      // Pinpricks of light remain attached to fine strands, including the wisps.
      for (let bead=0; bead<2; bead++) {
        const progress=((strand.phase/TAU+bead*.43+time*.003*strand.direction)%1+1)%1;
        const position=progress*(strand.points.length-1), i=Math.floor(position);
        const a=strand.points[i], b=strand.points[Math.min(i+1,strand.points.length-1)];
        const x=a.x+(b.x-a.x)*(position-i), y=a.y+(b.y-a.y)*(position-i);
        const size=(5+3*Math.sin(strand.phase+time*.2)**2)*scale;
        ctx!.globalAlpha=strand.wisp ? .25 : .5;
        ctx!.drawImage(sprites[Math.round(clamp(x/width)*(COLORS.length-1))],x-size/2,y-size/2,size,size);
      }
      if (!strand.accent && index%9!==0) continue;
      const progress = ((strand.phase/TAU+time*.007*strand.direction)%1+1)%1;
      const position = progress*(strand.points.length-1), i=Math.floor(position);
      const a=strand.points[i], b=strand.points[Math.min(i+1,strand.points.length-1)];
      const x=a.x+(b.x-a.x)*(position-i), y=a.y+(b.y-a.y)*(position-i);
      const size=(strand.accent ? 32 : 15)*scale;
      const pulse=.55+.45*Math.pow(Math.sin(time*.6+strand.phase),4);
      ctx!.globalAlpha=pulse*(strand.accent ? .90 : .52);
      const sprite=sprites[Math.round(clamp(x/width)*(COLORS.length-1))];
      ctx!.drawImage(sprite,x-size/2,y-size/2,size,size);
      if (strand.accent && index%2===0) {
        const flare=5*scale*pulse;
        ctx!.strokeStyle=core; ctx!.globalAlpha=.65*pulse; ctx!.lineWidth=.5;
        ctx!.beginPath(); ctx!.moveTo(x-flare,y); ctx!.lineTo(x+flare,y);
        ctx!.moveTo(x,y-flare); ctx!.lineTo(x,y+flare); ctx!.stroke();
      }
    }
    if (pointer.strength > .01) {
      ctx!.globalAlpha=.55*pointer.strength;
      const sprite=sprites[Math.round(clamp(pointer.x/width)*(COLORS.length-1))];
      ctx!.drawImage(sprite,pointer.x-100,pointer.y-100,200,200);
    }
    ctx!.globalAlpha=1; ctx!.globalCompositeOperation='source-over';
  }
  return { resize, draw };
}
