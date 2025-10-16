import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getSetting } from "@/lib/api";

export async function HeroSection() {
  const [title, subtitle, buttonText] = await Promise.all([
    getSetting('heroTitle'),
    getSetting('heroSubtitle'),
    getSetting('heroButtonText'),
  ]);

  const heroContent = {
    title: title || "A Secure, Fast, and Reliable Private Service",
    subtitle: subtitle || "Novao provides a seamless and secure internet experience, protecting your privacy without compromising on speed.",
    buttonText: buttonText || "Get Your Free Trial",
  }

  return (
    <section className="relative py-20 md:py-32">
       <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold md:text-7xl">
            {heroContent.title}
          </h1>
          <p className="mt-6 text-lg text-foreground/80 md:text-xl">
            {heroContent.subtitle}
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/login">{heroContent.buttonText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
