import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";

const experiences = [
  {
    company: "Chronicles Software Dev Company",
    role: "Application/Web Developer",
    period: "Apr 2025 – Present",
    description: "Building interactive dashboards and optimizing the SuccessTab platform for improved user engagement and performance.",
  },
  {
    company: "Skyestudio",
    role: "Software Engineer",
    period: "Jun 2024 – Mar 2025",
    description: "Developed Skye Editor, a complex web-based design tool using Vue.js and Fabric.js with advanced canvas manipulation features.",
  },
  {
    company: "Tino",
    role: "Frontend Engineer",
    period: "Mar 2023 – Jun 2024",
    description: "Architected and built a high-performance e-commerce application using Next.js, focusing on SEO and conversion optimization.",
  },
  {
    company: "Kryzotech",
    role: "Software Developer",
    period: "Dec 2022 – Mar 2023",
    description: "Developed responsive user interfaces and robust RESTful APIs for various client projects.",
  },
];

export function Experience() {
  return (
    <section id="experience" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Professional Journey</h2>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`flex flex-col md:flex-row gap-8 md:gap-0 ${
                  idx % 2 === 0 ? "md:flex-row-reverse" : ""
                } relative`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-[28px] md:left-1/2 top-0 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 z-10 shadow-lg shadow-primary/50" />

                <div className="ml-16 md:ml-0 md:w-1/2 md:px-12">
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 mb-4">
                      <span className="inline-flex items-center gap-2 text-sm text-primary font-medium">
                        <Calendar className="w-4 h-4" /> {exp.period}
                      </span>
                      <h3 className="text-xl font-bold font-display">{exp.role}</h3>
                      <h4 className="text-base text-muted-foreground flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> {exp.company}
                      </h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
                
                {/* Empty side for layout balance */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
