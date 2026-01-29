import { motion } from "framer-motion";
import { User, MapPin, Briefcase, GraduationCap } from "lucide-react";

export function About() {
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
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">About Me</h2>
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
              <p className="text-lg text-muted-foreground leading-relaxed">
                I am a passionate Front-End Software Engineer based in Lagos, Nigeria. 
                With a strong foundation in Computer Science from the University of Ilorin, 
                I specialize in building efficient, accessible, and high-performance web applications.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                My journey involves creating sophisticated dashboards, intuitive design tools, 
                and robust e-commerce platforms. I thrive on solving complex problems with 
                clean code and modern technologies like React, Vue.js, and Next.js.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                { icon: User, label: "Experience", value: "2+ Years" },
                { icon: Briefcase, label: "Role", value: "Frontend Eng." },
                { icon: MapPin, label: "Location", value: "Lagos, NG" },
                { icon: GraduationCap, label: "Education", value: "B.Sc CS" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group"
                >
                  <item.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-bold font-display">{item.value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
