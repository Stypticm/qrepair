'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, ShieldCheck, Smartphone, Truck, Wrench } from 'lucide-react';

const actions = [
  { title: 'Оценить устройство', subtitle: 'Узнайте стоимость за 60 секунд', href: '/buyback', icon: Smartphone, image: '/assets/pricing.jpg' },
  { title: 'Ремонт', subtitle: 'Качественный ремонт с гарантией', href: '/repair', icon: Wrench, image: '/assets/master.jpg' },
];
const benefits = [{ label: 'Гарантия до 12 мес.', icon: ShieldCheck }, { label: 'Проверка оригинала', icon: BadgeCheck }, { label: 'Быстрая доставка', icon: Truck }];

export function ClubHome() {
  return (
    <main className="club-home w-full flex-1 flex flex-col justify-between text-white relative pb-28 md:pb-24 min-h-dvh md:min-h-full">
      <div className="club-home__content relative mx-auto w-full max-w-[1360px] px-4 pt-[max(16px,env(safe-area-inset-top))] sm:px-7 lg:px-10 flex-1 flex flex-col justify-between">
        <div className="club-home__group">
          <div className="club-home__top">
            <div className="club-home__logo" aria-label="Qoqos">
              <span>Q</span><i>Ø</i>
            </div>
            <p className="club-home__quality">QUALITY MATTERS</p>
          </div>

          <div className="club-home__center">
            <h1>Техника.<br />Которой доверяют.</h1>
            <p className="club-home__intro">Покупка, ремонт и продажа премиальной техники и аксессуаров в одном месте.</p>

            <section className="club-home__actions" aria-label="Основные действия">
              {actions.map(({ title, subtitle, href, icon: Icon, image }) => (
                <Link key={href} href={href} className="club-home__action">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="club-home__action-image"
                  />
                  <span className="club-home__action-overlay" aria-hidden="true" />
                  <span className="club-home__action-icon">
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong>{title}</strong>
                    <small>{subtitle}</small>
                  </span>
                  <ArrowUpRight className="club-home__arrow" size={18} />
                </Link>
              ))}
            </section>
          </div>
        </div>

        <section className="club-home__benefits" aria-label="Преимущества">
          {benefits.map(({ label, icon: Icon }) => (
            <div key={label}>
              <Icon size={16} />
              <span>{label}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
