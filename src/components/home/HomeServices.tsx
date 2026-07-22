import { Reveal } from "@/components/Reveal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { services } from "@/lib/data/services";
import { formatPrice } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function HomeServices() {
  const featured = services.slice(0, 6);

  return (
    <Section>
      <SectionHeader
        eyebrow="Services"
        title="Tout ce qu’il faut pour faire revivre votre machine"
        description="Du diagnostic express au montage sur mesure, chaque prestation est pensée pour être claire, efficace et rassurante."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((service, i) => (
          <Reveal key={service.slug} delay={i * 60}>
            <Link
              href={`/services/${service.slug}`}
              className="group flex h-full flex-col rounded-[20px] border border-line bg-paper p-6 transition-[border-color,box-shadow,transform] duration-300 hover:border-teal/40 hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-soft text-teal">
                  <ServiceIcon name={service.icon} className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal" />
              </div>
              <h3 className="mt-5 text-xl leading-[1.35]">{service.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-[1.6] text-ink-muted">
                {service.excerpt}
              </p>
              <p className="mt-5 text-sm font-semibold text-ink">
                À partir de {formatPrice(service.priceFrom)}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-teal-deep"
        >
          Voir tous les services
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}
