import type { PortfolioData } from "@shared/schema";
import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin, Mail } from "lucide-react";
import { Fragment } from "react";

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

type HeroProps = {
  data: PortfolioData["hero"];
};

export function Hero({ data }: HeroProps) {
  const highlightCount = data.highlights.length;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 space-y-8 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {data.availability}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
              {data.greeting} <br />
              <span className="gradient-text">{data.name}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed">
              {data.subheadline}{" "}
              {highlightCount > 0 && (
                <>
                  {data.highlights.map((item, index) => (
                    <Fragment key={`${item}-${index}`}>
                      <span className="text-foreground font-semibold">
                        {item}
                      </span>
                      {index < highlightCount - 2 && ", "}
                      {index === highlightCount - 2 && " and "}
                      {index === highlightCount - 1 && "."}
                    </Fragment>
                  ))}
                </>
              )}
              {highlightCount === 0 && "."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
          >
            <a
              href={data.primaryCta.href}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {data.primaryCta.label} <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={data.secondaryCta.href}
              target={data.secondaryCta.newTab ? "_blank" : undefined}
              rel={data.secondaryCta.newTab ? "noreferrer" : undefined}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-border bg-transparent hover:bg-muted/50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {data.secondaryCta.label} <Download className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center md:justify-start gap-6 pt-4"
          >
            {data.socials.map((social) => {
              const Icon = socialIcons[social.icon];
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-full bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all hover:scale-110"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex-1 relative w-full max-w-lg aspect-square"
        >
          {/* Abstract creative shape/placeholder for profile image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 rounded-[2rem] rotate-3 opacity-20 blur-xl" />
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 glass-card flex items-center justify-center bg-zinc-900/50">
            {/* Using a tech-focused abstract composition instead of stock photo */}
            <div className="relative z-10 p-8 text-center">
              {data.image?.url ? (
                <div className="w-28 h-28 mx-auto mb-6 rounded-2xl overflow-hidden border border-primary/30">
                  <img
                    src={data.image.url}
                    alt={data.image.alt || `${data.profileCard.name} portrait`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/30">
                  <span className="text-2xl font-semibold text-primary">DEV</span>
                </div>
              )}
              <h3 className="text-2xl font-display font-bold text-white mb-2">
                {data.profileCard.name}
              </h3>
              <p className="text-primary/80 font-mono text-sm">
                @{data.profileCard.location}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                {data.profileCard.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold font-display">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
