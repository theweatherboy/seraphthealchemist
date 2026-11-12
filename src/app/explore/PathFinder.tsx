'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Service } from '@/data/services';
import { findPath, pathQuestions } from '@/lib/path-finder';
import styles from './explore.module.css';

export default function PathFinder({ services }: { services: Service[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus();
  }, [step]);
  const complete = step === pathQuestions.length;
  const question = pathQuestions[step];
  const result = complete ? findPath(answers, services) : null;

  return <div className={styles.page}>
    <Link href="/" className={styles.quietLink}>← Back to the sanctuary</Link>
    <header className={styles.header}>
      <p className={styles.eyebrow}>Your own beginning</p>
      <h1>Explore your path</h1>
      <p>A few moments of reflection. A starting point that feels like you.</p>
    </header>
    <section className={styles.panel} aria-label="Path questionnaire">
      {!complete ? <>
        <p className={styles.eyebrow}>Question {step + 1} of {pathQuestions.length}</p>
        <progress className={styles.progress} value={step + 1} max={pathQuestions.length} aria-label="Questionnaire progress" />
        <h2 ref={heading} tabIndex={-1}>{question.title}</h2>
        <p>{question.hint}</p>
        <form onSubmit={event => { event.preventDefault(); if (answers[step] !== undefined) setStep(step + 1); }}>
          <fieldset className={styles.options}>
            <legend className={styles.srOnly}>{question.title}</legend>
            {question.options.map((option, index) => <label className={styles.option} key={option.label}>
              <input type="radio" name={`question-${step}`} value={index} required checked={answers[step] === index} onChange={() => setAnswers(previous => { const next = [...previous]; next[step] = index; return next; })} />
              <span>{option.label}</span>
            </label>)}
          </fieldset>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
            <button type="submit" className={styles.primary} disabled={answers[step] === undefined}>{step === pathQuestions.length - 1 ? 'Discover my path' : 'Continue'} <span aria-hidden="true">→</span></button>
          </div>
        </form>
        <p className={styles.note}>About a minute · No account needed. Your answers stay in this page and reset when you reload.</p>
      </> : result && <>
        <p className={styles.eyebrow}>Your suggested starting point</p>
        <h2 ref={heading} tabIndex={-1}>{result.title}</h2>
        <p>{result.practice}</p>
        <p>{result.experience}</p>
        <div className={styles.next}>
          <h3>One next step</h3><p>{result.next.copy}</p>
          <Link className={styles.primary} href={result.next.href}>{result.next.label} →</Link>
        </div>
        <h3>Services to explore</h3>
        <p>Suggestions based on your intentions and how you are arriving today. Choose only what feels right for you.</p>
        {result.matches.length ? <div className={styles.matches}>{result.matches.map(({ service, reason }) => <article key={service.slug} className={styles.match}>
          <p className={styles.eyebrow}>{service.categoryLabel}</p>
          <h3>{service.title}</h3><p>{reason}</p>
          <p>{service.subtitle}</p>
          <p className={styles.price}>${service.price} · {service.duration}</p>
          <Link className={styles.quietLink} href={`/services/${service.slug}`}>View session & booking details →</Link>
        </article>)}</div> : <p>There is no clear service match yet. A conversation with Seraph can help you explore the possibilities.</p>}
        <details className={styles.summary}><summary>Your reflections</summary><dl>{pathQuestions.map((item, index) => <div key={item.title}><dt>{item.title}</dt><dd>{item.options[answers[index]]?.label}</dd></div>)}</dl></details>
        <div className={styles.actions}>
          <button className={styles.secondary} onClick={() => setStep(0)}>Edit answers</button>
          <button className={styles.secondary} onClick={() => { setAnswers([]); setStep(0); }}>Start again</button>
          <Link className={styles.quietLink} href="/services">Browse all services</Link>
        </div>
      </>}
    </section>
    <p className={styles.footer}>A path unfolds one step at a time. You are welcome to explore.</p>
  </div>;
}
