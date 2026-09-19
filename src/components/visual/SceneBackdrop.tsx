'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { createThreadRenderer, type ThreadScene } from './thread-renderer';
import { createSilkRenderer } from './silk-renderer';
import styles from './scene-backdrop.module.css';
type SceneBackdropProps = {
    poster: string;
    scene: ThreadScene;
    className: string;
    label: string;
    priority?: boolean;
};
/** Sharp still artwork with independently rendered, continuous flowing light. */
export default function SceneBackdrop({ poster, scene, className, label, priority = false }: SceneBackdropProps) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const pausedRef = useRef(false);
    const sync = useRef<() => void>(() => { });
    const [paused, setPaused] = useState(false);
    useEffect(() => {
        const element = canvas.current;
        if (!element)
            return;
        const silk = createSilkRenderer(element, scene);
        const context = silk ? null : element.getContext('2d');
        if (!silk && !context)
            return;
        const render = context ? createThreadRenderer(context, scene) : null;
        const preference = matchMedia('(prefers-reduced-motion: reduce)');
        let visible = false, frame = 0, last = 0, elapsed = 0;
        let width = 1, height = 1, ratio = 1, positionX = .5, positionY = .5;
        const draw = () => {
            const scale = Math.max(width / 1536, height / 1024);
            const x = (width - 1536 * scale) * positionX * ratio;
            const y = (height - 1024 * scale) * positionY * ratio;
            if (silk) silk.draw(elapsed, { scale: ratio * scale, x, y });
            else if (context && render) {
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, element.width, element.height);
                context.setTransform(ratio * scale, 0, 0, ratio * scale, x, y);
                render(elapsed);
            }
        };
        const tick = (now: number) => {
            elapsed += last ? Math.min((now - last) / 1000, .05) : 0;
            last = now;
            draw();
            frame = requestAnimationFrame(tick);
        };
        const update = () => {
            cancelAnimationFrame(frame);
            frame = 0;
            last = 0;
            const running = visible && !pausedRef.current && !preference.matches && !document.hidden;
            element.dataset.running = String(running);
            if (running)
                frame = requestAnimationFrame(tick);
        };
        sync.current = update;
        const resize = () => {
            const bounds = element.getBoundingClientRect();
            width = bounds.width;
            height = bounds.height;
            ratio = Math.min(devicePixelRatio || 1, 2);
            element.width = Math.round(width * ratio);
            element.height = Math.round(height * ratio);
            const position = getComputedStyle(element).objectPosition.split(' ');
            positionX = Number.isFinite(parseFloat(position[0])) ? parseFloat(position[0]) / 100 : .5;
            positionY = Number.isFinite(parseFloat(position[1])) ? parseFloat(position[1]) / 100 : .5;
            draw();
        };
        const observer = new IntersectionObserver(entries => {
            visible = entries.some(entry => entry.isIntersecting);
            update();
        }, { threshold: .01 });
        const sizeObserver = new ResizeObserver(resize);
        resize();
        observer.observe(element);
        sizeObserver.observe(element);
        preference.addEventListener('change', update);
        document.addEventListener('visibilitychange', update);
        window.addEventListener('resize', resize);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            sizeObserver.disconnect();
            preference.removeEventListener('change', update);
            document.removeEventListener('visibilitychange', update);
            window.removeEventListener('resize', resize);
            silk?.dispose();
            sync.current = () => { };
        };
    }, [scene]);
    const toggle = () => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); sync.current(); };
    return <>
    <div className={className + ' ' + styles.backdrop} aria-hidden="true">
      <Image src={poster} alt="" fill sizes="100vw" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined}/>
      <canvas ref={canvas} className={styles.threads} data-scene={scene}/>
    </div>
    <button type="button" className={styles.control} data-hero={priority || undefined} aria-label={(paused ? 'Play ' : 'Pause ') + label + ' animation'} aria-pressed={paused} onClick={toggle}>
      {paused ? <Play size={13} aria-hidden="true"/> : <Pause size={13} aria-hidden="true"/>}<span>{paused ? 'Play motion' : 'Pause motion'}</span>
    </button>
  </>;
}
