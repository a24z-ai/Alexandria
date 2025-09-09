interface AlexandriaConfig {
  apiUrl?: string;
}

declare global {
  interface Window {
    ALEXANDRIA_CONFIG?: AlexandriaConfig;
  }
}

export {};