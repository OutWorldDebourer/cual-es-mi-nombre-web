import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cuál es mi nombre — Tu asistente virtual",
    short_name: "Cuál es mi nombre",
    description:
      "Gestiona tu calendario, notas y recordatorios desde WhatsApp con IA.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#007382",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
