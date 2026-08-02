"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { CopyPhoneButton } from "@/components/CopyPhoneButton";
import { OpenStatusBadge } from "@/components/OpenStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";
import { Clock3, Mail, MapPin, MessageCircle, Phone, Train } from "lucide-react";

export function ContactSidebar() {
  return (
    <aside className="space-y-4">
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-panel p-6 text-panel-fg">
        <BorderBeam size={80} duration={9} borderWidth={1.25} />
        <div className="relative">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80">
              Coordonnées
            </Badge>
            <Badge variant="info" className="border-transparent bg-[#4ba3ff]/20 text-[#9ec9f5]">
              Atelier Yerres
            </Badge>
          </div>
          <OpenStatusBadge tone="dark" className="mt-4 w-full justify-start" />
          <ul className="mt-5 space-y-4">
            <li>
              <div className="flex items-center justify-between gap-3">
                <a href={siteConfig.phoneHref} className="flex items-center gap-3 hover:text-teal">
                  <Phone className="h-5 w-5 text-teal" aria-hidden />
                  <span className="text-lg font-semibold">{siteConfig.phone}</span>
                </a>
                <CopyPhoneButton />
              </div>
            </li>
            <li>
              <a
                href={siteConfig.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-teal"
              >
                <MessageCircle className="h-5 w-5 text-teal" aria-hidden />
                WhatsApp · {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={siteConfig.emailHref} className="flex items-center gap-3 hover:text-teal">
                <Mail className="h-5 w-5 text-teal" aria-hidden />
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-start gap-3 text-white/80">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
              <span>
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:text-teal"
                >
                  {siteConfig.street}
                  <br />
                  {siteConfig.postalCode} {siteConfig.city}
                </a>
                <span className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                  <Train className="h-3.5 w-3.5" aria-hidden />
                  {siteConfig.transport}
                </span>
              </span>
            </li>
            <li className="flex items-center gap-3 text-white/70">
              <Clock3 className="h-5 w-5 text-teal" aria-hidden />
              {siteConfig.hours}
            </li>
          </ul>
          <div className="mt-6 grid gap-2">
            <Button href={siteConfig.phoneHref} className="w-full">
              Appeler {siteConfig.phone}
            </Button>
            <Button
              href={siteConfig.whatsappHref}
              variant="secondary"
              className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              href={siteConfig.mapsDirectionsUrl}
              variant="secondary"
              className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              Itinéraire vers l’atelier
            </Button>
          </div>
          <p className="mt-4 text-xs text-white/45">{siteConfig.guarantee}</p>
        </div>
      </div>
    </aside>
  );
}
