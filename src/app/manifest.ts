import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cuál es mi nombre — Tu asistente virtual",
    short_name: "Cuál es mi nombre",
    description:
      "Gestiona tu calendario, notas y recordatorios desde WhatsApp con IA.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#111111",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
