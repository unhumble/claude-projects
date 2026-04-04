import { MapPin, UtensilsCrossed, Bike } from 'lucide-react';

const STEPS = [
  {
    icon: MapPin,
    step: '01',
    title: 'Filiale wählen',
    description: 'Gib deine Postleitzahl ein. Wir finden automatisch die nächste Filiale in deiner Nähe.',
    color: 'text-brand-red',
    bg: 'bg-brand-red/10',
  },
  {
    icon: UtensilsCrossed,
    step: '02',
    title: 'Pizza zusammenstellen',
    description: 'Wähle aus über 15 Pizzen, passe Größe und Belag nach deinen Wünschen an und füge Pasta oder Drinks dazu.',
    color: 'text-brand-orange',
    bg: 'bg-brand-orange/10',
  },
  {
    icon: Bike,
    step: '03',
    title: 'Lieferung verfolgen',
    description: 'Deine Bestellung wird frisch zubereitet und du kannst den Status bis zur Haustür live verfolgen.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-bg-secondary">
      <div className="container-wide">
        <div className="text-center mb-14">
          <p className="text-brand-red text-sm font-semibold tracking-wide uppercase mb-2">So einfach</p>
          <h2 className="section-heading">In 3 Schritten bestellen</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, idx) => (
            <div key={step.step} className="relative text-center group">
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] right-0 h-px bg-gradient-to-r from-border to-transparent z-0" />
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div className={`mx-auto w-20 h-20 ${step.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon size={32} className={step.color} />
                </div>

                {/* Step number */}
                <span className="inline-block text-xs font-bold tracking-widest text-text-faint uppercase mb-3">
                  Schritt {step.step}
                </span>

                <h3 className="font-bold text-text-warm text-xl mb-3">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
