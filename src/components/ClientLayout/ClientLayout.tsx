'use client';

import { List } from '@telegram-apps/telegram-ui';
import Header from '../Header/Header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
      <List>
        {/* <Header /> */}
        <section className="flex flex-col justify-between h-full">
          <div className="flex flex-col rounded-2xl m-1 p-2 h-full">
            {children}
          </div>
        </section>
      </List>
  );
}
