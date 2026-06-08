import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OptiPress | Free Image Compressor & Resizer - Convert JPG to WebP, Crop Online",
  description:
    "Compress, crop, resize, and convert images online with OptiPress. Easily change image formats (convert JPG to WebP, PNG to JPG), crop photos online, and reduce image size in KB. 100% private and client-side.",
  keywords: [
    "image compressor",
    "compress image online",
    "free image resizer",
    "shrink photo size",
    "private photo crop",
    "png optimizer",
    "webp converter",
    "jpeg reducer",
    "client-side image compressor",
    "reduce image mb to kb",
    "image format change",
    "jpg to webp convert",
    "image crop online",
    "convert png to webp",
    "convert jpg to png",
    "change image format",
    "compress photo to 100kb",
    "compress image in kb",
    "reduce photo size in kb",
    "online image editor"
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://optipress.app",
  },
  openGraph: {
    title: "OptiPress | Free Private Image Compressor, Resizer & Converter",
    description:
      "Compress, crop, and convert photos (convert JPG to WebP, PNG, JPEG) instantly and privately in your browser. All operations happen client-side.",
    url: "https://optipress.app",
    siteName: "OptiPress",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OptiPress | Free Private Image Compressor, Resizer & Converter",
    description:
      "Compress, crop, and convert photos (convert JPG to WebP, PNG, JPEG) instantly and privately in your browser. All operations happen client-side.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OptiPress",
  },
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // WebApplication and FAQPage JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://optipress.app/#webapp",
        "name": "OptiPress",
        "url": "https://optipress.app",
        "description": "Free, privacy-first online image compressor and resizer. Crops, converts, and shrinks photos instantly in the browser without uploading files to any servers.",
        "applicationCategory": "ImageProcessingApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas support.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "100% Private Client-Side Compression",
          "Interactive Custom Image Cropping (Preset and free aspect ratios)",
          "Format conversion (JPEG, WebP, PNG, BMP, GIF)",
          "Image flip, rotation, and custom CSS color filters",
          "Visual comparison split slider preview"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://optipress.app/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How can I compress image files without losing quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "OptiPress uses advanced browser canvas scaling algorithms. By adjusting the sharpness quality slider and the scaling percentage, you can reduce the file size by up to 90% while preserving excellent visual clarity."
            }
          },
          {
            "@type": "Question",
            "name": "Is it safe to upload my pictures to online resizers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, with OptiPress it is completely safe. OptiPress runs entirely client-side. Your photos are loaded and processed locally in your browser and are never uploaded to any backend servers. Your data stays private."
            }
          },
          {
            "@type": "Question",
            "name": "What image formats are supported by OptiPress?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "OptiPress supports loading and optimizing all major web image formats, including JPEG, PNG, WebP, BMP, and static GIF frames. You can convert files between these formats on the fly."
            }
          },
          {
            "@type": "Question",
            "name": "Is OptiPress completely free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, OptiPress is 100% free with no hidden charges, no email registration, no watermark overlays, and no limits on file sizes or counts."
            }
          },
          {
            "@type": "Question",
            "name": "How can I convert images from JPG to WebP or PNG?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Converting formats (like JPG to WebP or PNG to JPEG) is built-in. Simply upload your image, select your desired format from the 'File Type' dropdown menu in the control panel, and save. The conversion runs instantly in your browser."
            }
          },
          {
            "@type": "Question",
            "name": "Can I crop my images online using OptiPress?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, OptiPress provides a fully interactive crop editor. Choose an aspect ratio preset (1:1, 16:9, 4:5) or click 'Draw Custom Box' and drag the corner and edge handles to frame your image perfectly."
            }
          },
          {
            "@type": "Question",
            "name": "Can I compress images to a specific size like 100KB or 50KB?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. As you adjust the quality and scale sliders, the 'Shrink Status' card shows the exact estimated output size in real-time. Adjust the sliders until the output size is under your target size (e.g. 100KB or 50KB) and click download."
            }
          }
        ]
      }
    ]
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Inject JSON-LD Schema markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
