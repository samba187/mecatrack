/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // react-pdf s'appuie sur pdfkit/fontkit qui chargent leurs polices et
    // données à l'exécution via des require dynamiques. Sans ces réglages, le
    // bundler de Next ne les embarque pas et la génération PDF échoue sur
    // Vercel ("Cannot find module .../standard-fonts/Helvetica.cjs").
    serverComponentsExternalPackages: [
      "@react-pdf/renderer",
      "pdfkit",
      "fontkit",
    ],
    outputFileTracingIncludes: {
      "/api/pdf/**": ["./node_modules/pdfkit/js/**/*"],
      "/api/doc/**": ["./node_modules/pdfkit/js/**/*"],
    },
  },
};

export default nextConfig;
