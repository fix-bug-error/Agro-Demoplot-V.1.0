import * as L from 'leaflet';

declare module 'leaflet' {
  interface MapOptions {
    gestureHandling?: boolean;
  }

  interface Map {
    gestureHandling: {
      enable: () => void;
      disable: () => void;
    };
  }

  interface GestureHandlingOptions {
    text?: {
      touch?: string;
      scroll?: string;
      scrollMac?: string;
    };
    duration?: number;
  }

  namespace GestureHandling {
    function initialize(map: L.Map, options?: GestureHandlingOptions): void;
  }

  const GestureHandling: typeof L.Handler & {
    new(map: L.Map, options?: GestureHandlingOptions): L.Handler;
  };

  interface Map {
    addHandler(type: 'gestureHandling', handler: typeof L.Handler): this;
  }
}