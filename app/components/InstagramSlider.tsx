"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const images = ["/hero.jpg", "/amore_logo.png", "/hero.jpg", "/hero.jpg", "/amore_logo.png"]; 

export default function InstagramSlider() {
  return (
    <div className="w-full overflow-hidden bg-[#1A1A1A] py-12">
      <motion.div 
        className="flex gap-4 px-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
      >
        {[...images, ...images].map((src, i) => (
          <div key={i} className="w-40 h-40 md:w-64 md:h-64 relative rounded-2xl overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all cursor-pointer">
            <Image src={src} alt="Instagram" fill className="object-cover" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}