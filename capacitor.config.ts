import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.shoesstore.management",
  appName: "Shoes Store Management",
  webDir: "dist-mobile",
  android: {
    allowMixedContent: false,
  },
};

export default config;
