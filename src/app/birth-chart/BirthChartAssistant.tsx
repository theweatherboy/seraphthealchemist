'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import type { AssistantReading, ChatMessage } from '@/lib/birth-chart-assistant';
import styles from './birth-chart-assistant.module.css';

export default function BirthChartAssistant({ reading }: { reading: AssistantReading | null }) {
  const id = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/birth-chart/assistant', { cache: 'no-store', signal: controller.signal }).then(response => response.json()).then(data => setAvailable(data.available === true)).catch(() => { if (!controller.signal.aborted) { setAvailable(true); setError('Unable to check the assistant connection. You can try sending your question.'); } });
    return () => { controller.abort(); requestRef.current?.abort(); };
  }, []);
  useEffect(() => {
    const panel = transcriptRef.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [messages, busy]);

  async function send(value: string) {
    const content = value.trim();
    if (!content || busy || available === false || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const previous = messages;
    const next: ChatMessage[] = [...previous, { role: 'user', content }];
    const history = next.slice(-9);
    while (history.length > 1 && history.reduce((count, message) => count + message.content.length, 0) > 22000) history.splice(0, 2);
    setMessages(next); setQuestion(''); setBusy(true); setError('');
    try {
      const context = reading ? {
        chart: reading.chart, from: reading.from, to: reading.to, timezone: reading.timezone,
        transits: reading.transits.map(({ body, target, aspect, date, exactAt }) => ({ body, target, aspect, date, exactAt })),
      } : null;
      const response = await fetch('/api/birth-chart/assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(55000)]),
      });
      const payload = await response.json();
      if (!response.ok || typeof payload.answer !== 'string' || !payload.answer.trim()) throw new Error(payload.error || 'The assistant could not answer. Please try again.');
      if (!controller.signal.aborted) setMessages([...next, { role: 'assistant', content: payload.answer }]);
    } catch (caught) {
      if (!controller.signal.aborted) {
        setMessages(previous); setQuestion(content);
        setError(caught instanceof Error && caught.name !== 'TimeoutError' ? caught.message : 'The reply took too long. Your question is saved below so you can retry.');
      }
    } finally {
      if (requestRef.current === controller) { requestRef.current = null; setBusy(false); }
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void send(question); }
  function clear() {
    requestRef.current?.abort(); requestRef.current = null;
    setBusy(false); setMessages([]); setError(''); setQuestion(''); inputRef.current?.focus();
  }
  const suggestions = reading ? ['Explain my Sun, Moon, and rising signs.', 'What growth themes stand out this year?', 'Which upcoming transits relate to relationships?'] : ['What does a birth chart tell me?', 'What is the difference between my Sun and rising sign?', 'How should I read a transit calendar?'];

  return <section className={styles.panel} aria-labelledby={`${id}-title`}>
    <header className={styles.heading}>
      <span className={styles.emblem} aria-hidden="true"><Sparkles size={23} /></span>
      <div><p className={styles.eyebrow}>A conversation with your sky</p><h2 id={`${id}-title`}>Your Celestial Companion</h2></div>
      <span className={styles.badge}>AI assistant</span>
    </header>
    <p className={styles.intro}>{reading ? 'Explore your placements, ask about a transit, or find a reflection to carry into the year ahead.' : 'Ask about astrology, or reveal your chart above for a conversation about your own placements and transits.'}</p>
    <div className={styles.context}><MessageCircle size={15} aria-hidden="true" />{reading ? 'Your calculated chart is ready to discuss' : 'General astrology guidance'}{messages.length > 0 && <button type="button" onClick={clear}>Clear chat</button>}</div>
    {available === false && <p className={styles.notice} role="status">Your companion is being connected. Please check back soon; you can still explore your chart and transit calendar.</p>}
    <div className={styles.suggestions} aria-label="Suggested questions">{suggestions.map(suggestion => <button key={suggestion} type="button" disabled={busy || available !== true} onClick={() => void send(suggestion)}>{suggestion}</button>)}</div>
    {(messages.length > 0 || busy) && <div ref={transcriptRef} className={styles.transcript} role="log" aria-label="Conversation with your AI assistant" aria-live="polite" aria-relevant="additions">
      {messages.map((message, index) => <div key={index} className={message.role === 'user' ? styles.user : styles.assistant}><span>{message.role === 'user' ? 'You' : 'Celestial Companion · AI'}</span><p>{message.content}</p></div>)}
      {busy && <p className={styles.thinking} role="status">Reflecting on your question…</p>}
    </div>}
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor={`${id}-question`}>What would you like to explore?</label>
      <textarea ref={inputRef} id={`${id}-question`} rows={3} maxLength={2000} value={question} disabled={busy || available === false} onChange={event => setQuestion(event.target.value)} placeholder={reading ? 'What does this Saturn transit mean for me?' : 'Ask a question about birth charts…'} aria-describedby={`${id}-privacy`} />
      <div className={styles.actions}><span>{question.length}/2,000</span><button type="submit" disabled={busy || !question.trim() || available !== true}>{busy ? 'Considering…' : 'Ask your companion'}<Send size={15} aria-hidden="true" /></button></div>
    </form>
    {error && <p className={styles.error} role="alert">{error}</p>}
      <p id={`${id}-privacy`} className={styles.privacy}>Sending a question shares your messages and, when available, chart placements and selected transits with Groq. Chat stays in this page until cleared or refreshed. AI interpretations can be mistaken; use them as prompts for reflection. <a href="/privacy-policy">Privacy details</a></p>
  </section>;
}
