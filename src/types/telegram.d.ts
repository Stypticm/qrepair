export {};

declare global {
  interface TelegramWebApp {
    ready(): void;
    expand(): void;
    close(): void;
    initData: string;
    initDataUnsafe: any;
    platform: string;
    isExpanded: boolean;

    MainButton: {
      setText(text: string): void;
      show(): void;
      hide(): void;
      onClick(cb: () => void): void;
    };

    BackButton: {
      show(): void;
      hide(): void;
      onClick(cb: () => void): void;
    };

    HapticFeedback: {
      impactOccurred(
        style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
      ): void;
    };

    [key: string]: any;
  }

  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
