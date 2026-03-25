import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio",
};

export default function TermsPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Términos de Servicio
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: 16 de marzo de 2026
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          1. Aceptación de los Términos
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Al acceder o utilizar la plataforma &quot;Cual es mi nombre&quot;,
          aceptas quedar vinculado por los presentes Términos de Servicio. Si no
          estás de acuerdo con alguna parte de estos términos, no podrás acceder
          al servicio.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          2. Descripción del Servicio
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          &quot;Cual es mi nombre&quot; es un asistente inteligente basado en
          inteligencia artificial que opera a través de WhatsApp. Permite
          gestionar calendarios, tomar notas, configurar recordatorios y más
          mediante lenguaje natural.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. Cuentas de Usuario</h2>
        <p className="leading-relaxed text-muted-foreground">
          Para utilizar el servicio debes crear una cuenta proporcionando un
          número de teléfono válido. Eres responsable de mantener la
          confidencialidad de tu cuenta y de todas las actividades que ocurran
          bajo la misma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Uso Aceptable</h2>
        <p className="leading-relaxed text-muted-foreground">
          Te comprometes a utilizar el servicio de forma legal y respetuosa. Está
          prohibido utilizar la plataforma para enviar contenido ofensivo,
          realizar actividades fraudulentas o intentar comprometer la seguridad
          del sistema.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          5. Pagos y Suscripciones
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          El servicio ofrece planes de suscripción mensual. Los pagos se
          procesan a través de MercadoPago. Los créditos no utilizados dentro del
          periodo de facturación no se acumulan para el siguiente mes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          6. Propiedad Intelectual
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Todo el contenido, diseño, código y funcionalidad de la plataforma son
          propiedad de &quot;Cual es mi nombre&quot;. El contenido que generes
          (notas, recordatorios, eventos) te pertenece a ti.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          7. Limitación de Responsabilidad
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          El servicio se proporciona &quot;tal cual&quot;. No garantizamos que el
          servicio será ininterrumpido o libre de errores. En ningún caso
          seremos responsables por daños indirectos, incidentales o
          consecuentes derivados del uso del servicio.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">8. Modificaciones</h2>
        <p className="leading-relaxed text-muted-foreground">
          Nos reservamos el derecho de modificar estos términos en cualquier
          momento. Te notificaremos de cambios significativos por WhatsApp o
          correo electrónico. El uso continuado del servicio después de las
          modificaciones constituye tu aceptación de los nuevos términos.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">9. Contacto</h2>
        <p className="leading-relaxed text-muted-foreground">
          Si tienes preguntas sobre estos Términos de Servicio, puedes
          contactarnos a través de nuestro canal de soporte en WhatsApp o
          enviando un mensaje a nuestras redes sociales.
        </p>
      </section>
    </article>
  );
}
