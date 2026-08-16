'use client';

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, ShieldCheck, ShoppingBag, Smartphone, Truck, Wrench } from 'lucide-react';
import { ClubNavigation } from './ClubNavigation';

const actions = [
  { title: 'Оценить устройство', subtitle: 'Узнайте стоимость за 60 секунд', href: '/buyback', icon: Smartphone },
  { title: 'Ремонт', subtitle: 'Качественный ремонт с гарантией', href: '/repair', icon: Wrench },
  { title: 'Каталог', subtitle: 'Премиум техника и аксессуары', href: '/catalog', icon: ShoppingBag },
];
const benefits = [{ label: 'Гарантия до 12 мес.', icon: ShieldCheck }, { label: 'Проверка оригинала', icon: BadgeCheck }, { label: 'Быстрая доставка', icon: Truck }];

export function ClubHome() {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return <main className="club-home min-h-dvh overflow-hidden pb-28 text-white">
    <div className="club-home__glow club-home__glow--one" /><div className="club-home__glow club-home__glow--two" />
    <div className="relative mx-auto w-full max-w-[1360px] px-4 pt-[max(32px,env(safe-area-inset-top))] sm:px-7 lg:px-10 lg:pt-12">
      <section className="club-home__hero">
        <div className="club-home__copy"><div className="club-home__logo" aria-label="Qoqos"><span>Q</span><i>Ø</i></div><p className="club-home__quality">QUALITY MATTERS</p><h1>Техника.<br />Которой доверяют.</h1><p className="club-home__intro">Покупка, ремонт и продажа премиальной техники и аксессуаров в одном месте.</p></div>
      </section>
      <section className="club-home__actions" aria-label="Основные действия">{actions.map(({ title, subtitle, href, icon: Icon }) => <Link key={href} href={href} className="club-home__action"><span className="club-home__action-icon"><Icon size={21} /></span><span className="min-w-0 flex-1"><strong>{title}</strong><small>{subtitle}</small></span><ArrowUpRight className="club-home__arrow" size={19} /></Link>)}</section>
      <section className="club-home__benefits">{benefits.map(({ label, icon: Icon }) => <div key={label}><Icon size={18} /><span>{label}</span></div>)}</section>
      {/* <section className="club-home__catalog-promo"><div><p>ВИТРИНА QOQOS</p><h2>Новое поступление<br />уже в каталоге</h2><Link href="/catalog">Смотреть каталог <ArrowUpRight size={16} /></Link></div><div className="club-home__mini-products" aria-hidden="true"><div /><div /><div /></div></section> */}
    </div>
  </main>;
}
