import { motion } from "framer-motion";
import {
  Code,
  Server,
  Smartphone,
  PenTool,
  Layout,
  Database,
} from "lucide-react";
import type { PortfolioData } from "@shared/schema";

const categoryIcons = {
  layout: Layout,
  server: Server,
  smartphone: Smartphone,
  penTool: PenTool,
  code: Code,
  database: Database,
};

type SkillsProps = {
  data: PortfolioData["skills"];
};

export function Skills({ data }: SkillsProps) {
  return (
    <section id="skills" className="py-20 md:py-32 bg-secondary/20">
      <div className="container mx-auto px-6">
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
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {data.subheading}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.categories.map((category, idx) => {
            const Icon = categoryIcons[category.icon];
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-lg hover:shadow-xl hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display mb-4">
                  {category.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
