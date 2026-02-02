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
      color: string;
      textColor: string;
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
    onViewportChanged(callback: (event: any) => void): void;
    offViewportChanged(callback: (event: any) => void): void;
    onEvent(event: string, callback: (event: any) => void): void;
    offEvent(event: string, callback: (event: any) => void): void;
    isVersionAtLeast(version: string): boolean;
    requestFullscreen(): void;
    colorScheme: 'light' | 'dark';
  }

  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
