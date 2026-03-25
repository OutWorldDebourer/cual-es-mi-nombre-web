import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
};

export default function PrivacyPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Política de Privacidad
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: 16 de marzo de 2026
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          1. Información que Recopilamos
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Recopilamos la información que nos proporcionas al crear tu cuenta,
          incluyendo tu número de teléfono. También recopilamos los mensajes que
          envías a través del asistente para procesar tus solicitudes (notas,
          eventos, recordatorios).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          2. Cómo Usamos tu Información
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Utilizamos tu información para operar y mejorar el servicio. Tus
          mensajes son procesados por inteligencia artificial para entender tus
          instrucciones. No utilizamos tu contenido personal para entrenar
          modelos de IA.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          3. Compartir Información con Terceros
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          No vendemos tu información personal. Compartimos datos solo con los
          servicios necesarios para operar la plataforma: WhatsApp (mensajería),
          Google Calendar (eventos), MercadoPago (pagos) y Supabase
          (almacenamiento). Cada servicio opera bajo sus propias políticas de
          privacidad.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Seguridad de los Datos</h2>
        <p className="leading-relaxed text-muted-foreground">
          Implementamos medidas de seguridad estándar de la industria para
          proteger tu información. Esto incluye cifrado en tránsito, políticas de
          acceso por fila en la base de datos y almacenamiento seguro de
          credenciales. Sin embargo, ningún sistema es completamente seguro.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Tus Derechos</h2>
        <p className="leading-relaxed text-muted-foreground">
          Tienes derecho a acceder, corregir o eliminar tu información personal
          en cualquier momento. Puedes exportar tus notas y recordatorios o
          solicitar la eliminación completa de tu cuenta contactando a nuestro
          equipo de soporte.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">6. Cookies</h2>
        <p className="leading-relaxed text-muted-foreground">
          Utilizamos cookies esenciales para mantener tu sesión activa y
          preferencias de tema (claro/oscuro). No utilizamos cookies de
          seguimiento ni de publicidad de terceros.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          7. Cambios a esta Política
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Podemos actualizar esta Política de Privacidad periódicamente. Te
          notificaremos de cualquier cambio significativo a través de WhatsApp o
          publicando la nueva política en esta página con una fecha de
          actualización revisada.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">8. Contacto</h2>
        <p className="leading-relaxed text-muted-foreground">
          Si tienes preguntas sobre esta Política de Privacidad o sobre cómo
          manejamos tus datos, puedes contactarnos a través de nuestro canal de
          soporte en WhatsApp o enviando un mensaje a nuestras redes sociales.
        </p>
      </section>
    </article>
  );
}
