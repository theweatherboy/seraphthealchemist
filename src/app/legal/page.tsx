import React from 'react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 px-6 py-20 font-serif">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
            Terms & Conditions
          </h1>
          <p className="text-gray-500 italic">The Laws of the Sanctuary</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Nature of Services</h2>
          <p>
            Seraph, The Alchemist, provides digital content, spiritual guidance, and alchemical explorations.
            All materials provided in the Grimoire and through various services are for educational,
            entertainment, and spiritual purposes only.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. No Guarantees & Liability</h2>
          <p>
            The path of alchemy is a personal journey. Seraph, The Alchemist, makes no guarantees,
            promises, or warranties regarding specific outcomes, spiritual awakenings, or material gains
            resulting from the use of this sanctuary.
          </p>
          <p className="font-bold text-gray-200">
            By interacting with this site, you agree that Seraph, The Alchemist, is not liable for any
            direct, indirect, or consequential losses or damages arising from the application of the
            knowledge found herein.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Refund Policy</h2>
          <p>
            Due to the digital nature of the offerings and the immediate delivery of esoteric knowledge,
            all transactions are final. No refunds or credits will be issued once access to
            restricted content or services has been granted.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Intellectual Property</h2>
          <p>
            All original content, sigils, and texts within the sanctuary are the intellectual property of
            Seraph, The Alchemist. Unauthorized reproduction or distribution of these materials
            is strictly prohibited.
          </p>
        </section>

        <footer className="pt-10 border-t border-gray-800 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Seraph, The Alchemist. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
