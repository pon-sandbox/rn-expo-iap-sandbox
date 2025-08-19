declare namespace NodeJS {
  interface ProcessEnv {
    // Product ID is optional - defaults to {bundleId}.premium if not set
    EXPO_PUBLIC_PRODUCT_ID?: string;
  }
}
