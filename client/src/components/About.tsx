import { motion } from "framer-motion";
import { User, MapPin, Briefcase, GraduationCap } from "lucide-react";
import type { PortfolioData } from "@shared/schema";

const highlightIcons = {
  user: User,
  briefcase: Briefcase,
  mapPin: MapPin,
  graduationCap: GraduationCap,
};

type AboutProps = {
  data: PortfolioData["about"];
};

export function About({ data }: AboutProps) {
  return (
    <section id="about" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {data.heading}
            </h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="prose prose-lg dark:prose-invert"
            >
              {data.paragraphs.map((paragraph, index) => (
                <p
                  key={`${paragraph.slice(0, 20)}-${index}`}
                  className={`text-lg text-muted-foreground leading-relaxed ${
                    index > 0 ? "mt-4" : ""
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {data.highlights.map((item, i) => {
                const Icon = highlightIcons[item.icon];
                return (
                  <div
                    key={`${item.label}-${i}`}
                    className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group"
                  >
                    <Icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold font-display">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
