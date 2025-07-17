import { Button } from '@/components/ui/button';
import { Info, ShoppingCart, Smartphone } from 'lucide-react';
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <section className="w-full flex flex-col items-center justify-center px-4">
      <div className="flex flex-row justify-between w-full">
        {[
          { icon: Smartphone, label: 'Sell' },
          { icon: ShoppingCart, label: 'Accessories' },
          { icon: Info, label: 'Status' },
        ].map(({ icon: Icon, label }, index) => (
          <Button
            key={index}
            className="w-26 h-26 bg-blue-200 flex flex-col items-center justify-between"
            disabled
          >
            <Icon className="size-12 text-blue-950" />
            <span className="text-lg font-bold text-blue-900">{label}</span>
          </Button>
        ))}
      </div>

      <Link
        href="/learn-more"
        className="text-blue-300 underline text-md hover:text-blue-500 transition"
      >
        Learn more
      </Link>
    </section>
  );
};

export default Footer;
