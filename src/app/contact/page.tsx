"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';

const SITE_SEQUENCE = ['/', '/grimoire', '/services', '/forge', '/support', '/legal', '/contact'];

export default function ContactPage() {
  useScrollNavigation(6, SITE_SEQUENCE);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    intent: 'reading',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Your message has been sent into the ether. Seraph will respond when the stars align.');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center"
      >
        <h1 className="font-arcane text-5xl md:text-7xl text-seraphic-gold mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
          Begin Your Journey
        </h1>
        <p className="font-celestial text-xl text-moon-ivory/60 mb-12">
          Reach out to start a session, collaborate, or simply ask a question.
        </p>

        <form onSubmit={handleSubmit} className="text-left space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-arcane text-seraphic-gold text-sm uppercase tracking-widest">Your Name</label>
              <input
                type="text"
                required
                className="bg-void-purple/30 border border-seraphic-gold/30 p-3 rounded-xl text-moon-ivory focus:border-seraphic-gold focus:outline-none transition-colors"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-arcane text-seraphic-gold text-sm uppercase tracking-widest">Your Email</label>
              <input
                type="email"
                required
                className="bg-void-purple/30 border border-seraphic-gold/30 p-3 rounded-xl text-moon-ivory focus:border-seraphic-gold focus:outline-none transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-arcane text-seraphic-gold text-sm uppercase tracking-widest">Your Intent</label>
            <select
              className="bg-void-purple/30 border border-seraphic-gold/30 p-3 rounded-xl text-moon-ivory focus:border-seraphic-gold focus:outline-none transition-colors appearance-none"
              value={formData.intent}
              onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
            >
              <option value="reading">I want a reading</option>
              <option value="healing">I'm interested in healing</option>
              <option value="collaborate">I want to collaborate</option>
              <option value="question">I have a question</option>
              <option value="work">I want to work with you</option>
              <option value="other">Something else</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-arcane text-seraphic-gold text-sm uppercase tracking-widest">Your Message</label>
            <textarea
              required
              rows={5}
              className="bg-void-purple/30 border border-seraphic-gold/30 p-3 rounded-xl text-moon-ivory focus:border-seraphic-gold focus:outline-none transition-colors"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-seraphic-gold text-obsidian font-arcane text-xl rounded-xl hover:bg-moon-ivory transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            <Send size={20} />
            <span>SEND INTO THE ETHER</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
