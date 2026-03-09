import { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';

const eventTypes = [
  { value: '', label: 'Type d\'événement' },
  { value: 'festival', label: 'Festival' },
  { value: 'private', label: 'Événement privé' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'collab', label: 'Collaboration artistique' },
  { value: 'other', label: 'Autre' },
];

const budgetRanges = [
  { value: '', label: 'Budget estimé' },
  { value: 'volunteer', label: 'Bénévole / échange' },
  { value: 'small', label: '< 500 €' },
  { value: 'medium', label: '500 – 1 500 €' },
  { value: 'large', label: '1 500 – 5 000 €' },
  { value: 'custom', label: '> 5 000 € / sur mesure' },
];

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--neon-high)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--neon-high)]/20 transition-all duration-200 appearance-none';

const selectClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--neon-high)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--neon-high)]/20 transition-all duration-200 appearance-none cursor-pointer';

export default function BookingForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const subject = encodeURIComponent(`Booking: ${data.get('eventType') || 'Inquiry'} — ${data.get('venue') || 'TBD'}`);
    const body = encodeURIComponent(
      `Nom: ${data.get('name')}\nEmail: ${data.get('email')}\nType: ${data.get('eventType')}\nDate: ${data.get('date')}\nLieu: ${data.get('venue')}\nBudget: ${data.get('budget')}\n\n${data.get('message')}`
    );
    window.location.href = `mailto:parvagues@nech.pl?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section id="booking" className="max-w-5xl mx-auto px-6 py-24 md:py-32">
      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase">
        Booking
      </h2>
      <div className="h-px bg-white/10 mt-4 mb-4" />
      <p className="text-sm text-[var(--text-muted)] mb-12 max-w-lg">
        Intéressé·e par un live? Remplis le formulaire ci-dessous
        ou écris directement à{' '}
        <a href="mailto:parvagues@nech.pl" className="text-[var(--neon-high)]/80 hover:text-[var(--neon-high)] transition-colors">
          parvagues@nech.pl
        </a>
      </p>

      {submitted ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 text-center">
          <p className="font-display font-semibold text-lg mb-2">Merci !</p>
          <p className="text-sm text-[var(--text-muted)]">
            Ton client mail devrait s&apos;ouvrir avec le formulaire pré-rempli.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 text-xs text-[var(--text-muted)] hover:text-white transition-colors tracking-wider underline underline-offset-4"
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <div className="grid sm:grid-cols-2 gap-5">
            <input
              name="name"
              type="text"
              placeholder="Nom"
              required
              className={inputClass}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className={inputClass}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <select name="eventType" required className={selectClass}>
              {eventTypes.map((t) => (
                <option key={t.value} value={t.value} disabled={!t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              name="date"
              type="date"
              className={`${inputClass} text-[var(--text-muted)]`}
            />
          </div>

          <input
            name="venue"
            type="text"
            placeholder="Lieu / Ville"
            className={inputClass}
          />

          <select name="budget" className={selectClass}>
            {budgetRanges.map((b) => (
              <option key={b.value} value={b.value} disabled={!b.value}>
                {b.label}
              </option>
            ))}
          </select>

          <textarea
            name="message"
            placeholder="Décris ton projet, l'ambiance, tes attentes..."
            rows={5}
            className={`${inputClass} resize-none`}
          />

          <button
            type="submit"
            className="flex items-center gap-3 px-8 py-3.5 bg-white text-[var(--surface)] font-display font-bold text-sm tracking-[0.15em] uppercase rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300"
          >
            <FaEnvelope className="w-4 h-4" />
            Envoyer
          </button>
        </form>
      )}
    </section>
  );
}
