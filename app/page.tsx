"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { supabase } from "@/lib/supabase";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import dynamic from 'next/dynamic';

// Import komponenti
import InstagramSlider from "./components/InstagramSlider";
const MapComponent = dynamic(() => import("./components/MapComponent"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const translations: Record<string, any> = {
  hr: {
    navMenu: "Karta Pića",
    navEvents: "Sunset Sessions",
    navGallery: "Lookbook",
    navTeam: "Ambijent",
    navReserve: "Rezervacija",
    heroTitle: "AMORE",
    heroSubtitle: "Novigrad — Obala okusa.",
    eventsTitle: "Ljetna Pozornica",
    eventsDesc: "Ekskluzivni trenuci na rubu mora.",
    noEvents: "Uskoro objavljujemo nove Sunset Sessionse i ljetne događaje u Novigradu.",
    galleryTitle: "Editorial Lookbook",
    galleryDesc: "Trenuci zabilježeni kroz objektiv ljetne estetike.",
    aboutTitle: "Estetika Obale",
    aboutDesc: "Amore nije samo bar. To je arhitektura trenutka, dizajnirana da slavi more, sunce i vrhunsku uslugu.",
    menuTitle: "Kolekcija",
    menuDesc: "Birana selekcija okusa.",
    calcTitle: "Vaš Stol",
    calcDesc: "Zatražite svoje mjesto uz more.",
    btnOffer: "Zatraži Rezervaciju",
    viewAllGallery: "Vidi cijelu galeriju"
  }
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState("hr");
  const t = translations[lang] || translations["hr"];

  const [hoveredDrink, setHoveredDrink] = useState<any>(null);
  const [selectedDrink, setSelectedDrink] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<any>(null);
  const [isFullGalleryOpen, setIsFullGalleryOpen] = useState(false);

  // Audio Player State & Data from Supabase
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlist, setPlaylist] = useState<any[]>([
    { title: "Rio Sunset Mix", artist: "Amore Resident", src: "/Rio.mp3" }
  ]);

  const togglePlay = () => {
    if (!audioRef.current || playlist.length === 0) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.log("Audio play error:", e));
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIdx);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const [estStep, setEstStep] = useState(1);
  const [estSpace, setEstSpace] = useState("");
  const [estArea, setEstArea] = useState(2); 
  const [estComplexity, setEstComplexity] = useState("");
  const [formData, setFormData] = useState({ ime: "", email: "", napomena: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const [eventsData, setEventsData] = useState<any[]>([]);
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Dohvat svih podataka iz Supabase baze
  useEffect(() => {
    async function fetchData() {
      const { data: events } = await supabase.from('events').select('*');
      if (events) setEventsData(events);

      const { data: gallery } = await supabase.from('gallery').select('*');
      if (gallery) setGalleryData(gallery);

      const { data: music } = await supabase.from('playlist').select('*');
      if (music && music.length > 0) setPlaylist(music);

      const { data: menu } = await supabase.from('menu_items').select('*');
      if (menu) setDrinks(menu);

      setTimeout(() => ScrollTrigger.refresh(), 500);
    }
    fetchData();
  }, []);

  useGSAP(() => {
    gsap.utils.toArray('.reveal-mask').forEach((mask: any) => {
      gsap.fromTo(mask, 
        { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }, 
        { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1.5, ease: "power4.out", scrollTrigger: { trigger: mask, start: "top 85%" } }
      );
    });

    gsap.utils.toArray('.text-up').forEach((text: any) => {
      gsap.fromTo(text, 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: text, start: "top 90%" } }
      );
    });
  }, { scope: containerRef });

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const templateParams = { ime: formData.ime, email: formData.email, prostor: estSpace, kvadratura: `${estArea} osoba`, zahtjevnost: estComplexity, napomena: formData.napomena };
    emailjs.send("service_psdfetf", "template_j1t9maq", templateParams, "gYVlZ6VIti-McZc3o")
      .then(() => {
        setNotification({ show: true, message: "Zahtjev poslan.", type: "success" });
        setIsSubmitting(false); setEstStep(1); setFormData({ ime: "", email: "", napomena: "" });
        setTimeout(() => setNotification(p => ({ ...p, show: false })), 3000);
      })
      .catch(() => {
        setNotification({ show: true, message: "Greška.", type: "error" });
        setIsSubmitting(false);
        setTimeout(() => setNotification(p => ({ ...p, show: false })), 3000);
      });
  };

  const snappySpring = { type: "spring" as const, stiffness: 300, damping: 25 };

  const previewGallery = galleryData.slice(0, 5);
  const remainingCount = galleryData.length - 5;

  return (
    <main ref={containerRef} className="bg-[#EAE6DF] min-h-screen text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#EAE6DF] scroll-smooth">
      
      {/* AUDIO ELEMENT */}
      {playlist.length > 0 && (
        <audio 
          ref={audioRef} 
          src={playlist[currentTrackIndex]?.src} 
          onEnded={nextTrack} 
        />
      )}

      {/* FLOATING SOUNDTRACK PLAYER */}
      {playlist.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40 bg-[#1A1A1A] text-[#EAE6DF] px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-neutral-800 backdrop-blur-md">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#D35400] text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shrink-0"
          >
            {isPlaying ? <span className="text-xs font-bold">❚❚</span> : <span className="text-xs font-bold ml-0.5">▶</span>}
          </button>

          <div className="flex flex-col max-w-[140px] sm:max-w-[180px] overflow-hidden">
            <span className="text-[10px] uppercase tracking-widest text-[#D35400] font-semibold truncate">
              {isPlaying ? "Sada svira" : "Soundtrack"}
            </span>
            <span className="text-xs font-serif truncate text-neutral-200">
              {playlist[currentTrackIndex]?.title || "Rio.mp3"}
            </span>
          </div>

          <div className="hidden sm:flex items-end gap-0.5 h-4 ml-2">
            {[0.4, 0.8, 0.3, 0.9].map((h, i) => (
              <span 
                key={i} 
                className={`w-0.5 bg-[#D35400] transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-1'}`}
                style={{ height: isPlaying ? `${h * 100}%` : '4px', animationDelay: `${i * 0.15}s` }}
              ></span>
            ))}
          </div>

          <button onClick={nextTrack} className="text-neutral-400 hover:text-white text-xs uppercase tracking-widest pl-2 border-l border-neutral-800" title="Sljedeća">➔</button>
        </div>
      )}

      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-8 left-1/2 -translate-x-1/2 z-[200]">
            <div className="bg-[#1A1A1A] text-[#EAE6DF] px-6 py-3 rounded-full text-xs tracking-widest uppercase flex items-center gap-3 shadow-lg">
              <span>{notification.type === "success" ? "✓" : "✕"}</span> {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-6 right-6 md:top-8 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 bg-[#1A1A1A] text-[#EAE6DF] rounded-full flex flex-col items-center justify-center gap-[5px] hover:scale-105 transition-transform cursor-pointer shadow-lg"
      >
        <div className="w-5 md:w-6 h-[1px] bg-current"></div>
        <div className="w-5 md:w-6 h-[1px] bg-current"></div>
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ clipPath: "circle(0% at 100% 0)" }} animate={{ clipPath: "circle(150% at 100% 0)" }} exit={{ clipPath: "circle(0% at 100% 0)" }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 bg-[#1A1A1A] text-[#EAE6DF] z-[100] flex flex-col justify-between p-8 md:p-12 overflow-y-auto"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                  <Image src="/amore_logo.png" alt="Amore Logo" fill sizes="48px" className="object-cover" />
                </div>
                <span className="font-serif text-2xl md:text-3xl italic">Amore</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-xs md:text-sm uppercase tracking-widest hover:text-[#D35400] transition-colors mt-2">Zatvori [X]</button>
            </div>
            
            <nav className="flex flex-col gap-6 md:gap-8 mt-12">
              <Link href="#meni" onClick={() => setIsMenuOpen(false)} className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tighter hover:text-[#D35400] transition-colors">{t.navMenu}</Link>
              <Link href="#dogadaji" onClick={() => setIsMenuOpen(false)} className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tighter hover:text-[#D35400] transition-colors">{t.navEvents}</Link>
              <Link href="#galerija" onClick={() => setIsMenuOpen(false)} className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tighter hover:text-[#D35400] transition-colors">{t.navGallery}</Link>
              <Link href="#ambijent" onClick={() => setIsMenuOpen(false)} className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tighter hover:text-[#D35400] transition-colors">{t.navTeam}</Link>
              <Link href="#rezervacija" onClick={() => setIsMenuOpen(false)} className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tighter italic text-[#D35400]">{t.navReserve}</Link>
            </nav>

            <div className="flex justify-between items-end border-t border-neutral-800 pt-8 mt-12">
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-neutral-500">Novigrad, HR</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative w-full h-[100dvh] flex flex-col justify-end p-6 md:p-12 pb-16 md:pb-24">
        <div className="absolute inset-0 z-0 reveal-mask">
          <Image src="/hero.jpg" alt="Amore Hero" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[#1A1A1A]/30"></div>
        </div>
        
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 text-[#EAE6DF]">
          <div>
            <h1 className="text-[20vw] md:text-[15vw] leading-[0.8] font-serif tracking-tighter mb-2 md:mb-4 text-up">{t.heroTitle}</h1>
            <p className="text-xs md:text-lg tracking-[0.2em] uppercase text-up font-light ml-1 md:ml-2">{t.heroSubtitle}</p>
          </div>
          <div className="text-up w-full md:w-auto mt-4 md:mt-0">
            <a href="#rezervacija" className="inline-block w-full md:w-auto px-8 py-4 bg-[#EAE6DF] text-[#1A1A1A] rounded-full text-[10px] md:text-xs uppercase tracking-widest font-semibold text-center hover:bg-[#D35400] hover:text-white transition-colors">
              {t.btnOffer}
            </a>
          </div>
        </div>
      </section>

      <section id="galerija" className="py-24 md:py-48 px-6 pt-28 md:pt-48 max-w-7xl mx-auto">
        <div className="text-up mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[#D35400] text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold mb-4 block">Visual Archive</span>
            <h2 className="text-4xl md:text-7xl font-serif tracking-tighter mb-4">{t.galleryTitle}</h2>
            <p className="text-neutral-600 text-sm md:text-base tracking-wide">{t.galleryDesc}</p>
          </div>
          {galleryData.length > 5 && (
            <button 
              onClick={() => setIsFullGalleryOpen(true)}
              className="w-max px-8 py-4 bg-[#1A1A1A] text-[#EAE6DF] rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#D35400] hover:text-white transition-colors shadow-md"
            >
              {t.viewAllGallery} ({galleryData.length})
            </button>
          )}
        </div>

        {galleryData.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 uppercase tracking-widest text-xs">Lookbook se uskoro puni fotografijama...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            {previewGallery.map((item, index) => {
              
              // Custom Bento-Box Grid logika (zanemarujemo bazu)
              let spanClass = "md:col-span-4 md:row-span-1"; 
              if (index === 0) spanClass = "md:col-span-8 md:row-span-2"; // Velika slika lijevo (zauzima 2 reda)
              else if (index === 1) spanClass = "md:col-span-4 md:row-span-1"; // Gore desno
              else if (index === 2) spanClass = "md:col-span-4 md:row-span-1"; // Ispod prve desno
              else if (index === 3) spanClass = "md:col-span-6 md:row-span-1"; // Donji red lijevo
              else if (index === 4) spanClass = galleryData.length > 5 ? "md:col-span-3 md:row-span-1" : "md:col-span-6 md:row-span-1"; // Donji red sredina/desno

              return (
                <motion.div 
                  key={item.id || index}
                  onClick={() => setSelectedGalleryImage(item)}
                  whileHover={{ scale: 0.99 }}
                  transition={{ duration: 0.4 }}
                  className={`relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-pointer group shadow-md ${spanClass}`}
                >
                  <Image 
                    src={item.image} 
                    alt={item.title || "Amore Lookbook"} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                    <span className="text-[#EAE6DF] text-xs uppercase tracking-widest font-light">{item.title}</span>
                    <span className="text-[#D35400] text-[10px] uppercase tracking-[0.2em] mt-1">Povećaj [+]</span>
                  </div>
                </motion.div>
              );
            })}

            {galleryData.length > 5 && (
              <div 
                onClick={() => setIsFullGalleryOpen(true)}
                className="md:col-span-3 md:row-span-1 rounded-[1.5rem] md:rounded-[2rem] bg-[#1A1A1A] text-[#EAE6DF] flex flex-col items-center justify-center p-8 cursor-pointer group hover:bg-[#D35400] transition-colors shadow-md"
              >
                <span className="text-3xl font-serif mb-2 group-hover:scale-110 transition-transform">+{remainingCount}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-center">{t.viewAllGallery}</span>
              </div>
            )}
          </div>
        )}
      </section>

      <section id="ambijent" className="py-24 md:py-48 px-6 pt-28 md:pt-48 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center border-t border-neutral-300">
        <div className="md:col-span-5 text-up">
          <span className="text-[#D35400] text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold mb-4 md:mb-6 block">Filozofija</span>
          <h2 className="text-4xl md:text-6xl font-serif tracking-tighter leading-tight">{t.aboutTitle}</h2>
        </div>
        <div className="md:col-span-7 md:pl-12 text-up">
          <p className="text-lg md:text-3xl font-light leading-relaxed text-neutral-600">
            {t.aboutDesc} <span className="italic font-serif text-[#1A1A1A]">Pijesak, staklo i vrhunski destilati u simfoniji zalaska sunca.</span>
          </p>
        </div>
      </section>

      {/* DOGAĐAJI */}
      <section id="dogadaji" className="py-24 md:py-32 bg-[#1A1A1A] text-[#EAE6DF] px-6 pt-28 md:pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-left md:text-center mb-16 md:mb-24 text-up">
            <h2 className="text-4xl md:text-7xl font-serif tracking-tighter mb-2 md:mb-4">{t.eventsTitle}</h2>
            <p className="text-[10px] md:text-sm tracking-widest uppercase text-neutral-400">{t.eventsDesc}</p>
          </div>

          {eventsData.length === 0 ? (
            <div className="bg-[#EAE6DF] text-[#1A1A1A] p-12 md:p-20 rounded-[2rem] text-center max-w-2xl mx-auto shadow-2xl">
              <span className="text-[#D35400] text-xs uppercase tracking-[0.2em] font-semibold block mb-3">Uskoro</span>
              <h3 className="text-3xl font-serif mb-4">Nadolazeći ljetni program</h3>
              <p className="text-neutral-600 text-sm tracking-wide leading-relaxed">{t.noEvents}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {eventsData.map((ev) => (
                <div 
                  key={ev.id} 
                  className="flex flex-col md:flex-row items-center gap-6 md:gap-16 bg-[#EAE6DF] text-[#1A1A1A] p-6 md:p-12 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl"
                >
                  <div className="w-full md:w-1/2 h-56 md:h-[450px] relative rounded-[1rem] md:rounded-3xl overflow-hidden reveal-mask">
                    <Image src={ev.image} alt={ev.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col justify-center px-2 py-4 md:p-0">
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                      <span className="text-[#D35400] text-[10px] md:text-xs tracking-widest uppercase font-semibold">{ev.location}</span>
                      {ev.event_date && (
                        <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono bg-neutral-200/60 px-3 py-1 rounded-full">
                          {ev.event_date} {ev.duration ? `• ${ev.duration}` : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl md:text-6xl font-serif tracking-tighter mb-4 md:mb-6 leading-none">{ev.title}</h3>
                    <p className="text-neutral-600 text-sm md:text-lg leading-relaxed mb-6 md:mb-8">{ev.description}</p>
                    <button onClick={() => setSelectedEvent(ev)} className="w-max px-6 py-3 border border-[#1A1A1A] rounded-full text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-[#EAE6DF] transition-colors">Detalji</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KARTA PIĆA */}
      <section id="meni" className="py-24 md:py-48 px-6 pt-28 md:pt-48 max-w-5xl mx-auto relative">
        <div className="text-up mb-12 md:mb-20">
          <h2 className="text-5xl md:text-7xl font-serif tracking-tighter mb-4">{t.menuTitle}</h2>
          <div className="w-full h-[1px] bg-neutral-300 mt-6 md:mt-8"></div>
        </div>

        {drinks.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 uppercase tracking-widest text-xs">Meni se uskoro ažurira...</div>
        ) : (
          <ul className="relative z-10">
            {drinks.map((drink, i) => (
              <li 
                key={drink.id || i} 
                className="text-up group relative border-b border-neutral-300 py-6 md:py-8 flex flex-col md:flex-row md:items-center justify-between cursor-pointer"
                onMouseEnter={() => setHoveredDrink(drink)}
                onMouseLeave={() => setHoveredDrink(null)}
                onClick={() => setSelectedDrink(drink)}
              >
                <div className="flex items-center gap-4 md:gap-6 mb-2 md:mb-0">
                  <span className="text-neutral-400 font-serif text-sm md:text-lg italic w-6 md:w-auto">0{i + 1}</span>
                  <h3 className="text-2xl md:text-5xl font-light tracking-tight group-hover:italic group-hover:text-[#D35400] transition-all duration-300">{drink.name}</h3>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-16 w-full md:w-auto pl-[3.25rem] md:pl-0">
                  <span className="text-neutral-500 text-[10px] md:text-xs uppercase tracking-widest">{drink.category}</span>
                  <span className="text-lg md:text-xl font-serif">{drink.price}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden lg:block absolute top-1/2 right-[-20%] -translate-y-1/2 pointer-events-none z-0 w-80 h-[400px]">
          <AnimatePresence>
            {hoveredDrink && (
              <motion.div 
                key={hoveredDrink.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl"
              >
                <Image src={hoveredDrink.image} alt={hoveredDrink.name} fill sizes="33vw" priority className="object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* REZERVACIJA */}
      <section id="rezervacija" className="py-24 md:py-32 bg-white text-[#1A1A1A] px-6 pt-28 md:pt-32">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-serif tracking-tighter mb-12 md:mb-16 text-center">{t.calcTitle}</h2>
          
          <div className="text-[9px] md:text-xs uppercase tracking-widest flex justify-between border-b border-neutral-200 pb-4 mb-10 md:mb-16">
            <span className={estStep === 1 ? 'text-[#D35400] font-bold' : 'text-neutral-400'}>01. Mjesto</span>
            <span className={estStep === 2 ? 'text-[#D35400] font-bold text-center' : 'text-neutral-400 text-center'}>02. Detalji</span>
            <span className={estStep === 3 ? 'text-[#D35400] font-bold text-right' : 'text-neutral-400 text-right'}>03. Kontakt</span>
          </div>

          <AnimatePresence mode="wait">
            {estStep === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-2 md:gap-4">
                {["Terasa uz more", "Lounge", "VIP Separe"].map(space => (
                  <button key={space} onClick={() => { setEstSpace(space); setEstStep(2); }} className="w-full text-left py-4 md:py-6 text-xl md:text-4xl font-light hover:italic hover:text-[#D35400] transition-all border-b border-neutral-100">
                    {space}
                  </button>
                ))}
              </motion.div>
            )}

            {estStep === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-10 md:mb-12">
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-neutral-500 mb-4 md:mb-6 block">Broj gostiju</span>
                  <div className="flex items-end gap-4 border-b border-neutral-200 pb-4">
                    <span className="text-5xl md:text-6xl font-serif">{estArea}</span>
                    <input type="range" min="1" max="20" value={estArea} onChange={e => setEstArea(Number(e.target.value))} className="w-full h-1 bg-neutral-200 accent-[#1A1A1A] cursor-pointer mb-2" />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-10 md:mb-12">
                  <button onClick={() => setEstComplexity("Standard")} className={`w-full py-4 text-[10px] md:text-xs uppercase tracking-widest rounded-full border ${estComplexity === "Standard" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-neutral-300 hover:border-[#1A1A1A]"}`}>Standard</button>
                  <button onClick={() => setEstComplexity("VIP")} className={`w-full py-4 text-[10px] md:text-xs uppercase tracking-widest rounded-full border ${estComplexity === "VIP" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-neutral-300 hover:border-[#1A1A1A]"}`}>VIP Paket</button>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setEstStep(1)} className="text-[10px] md:text-xs uppercase tracking-widest font-semibold border-b border-transparent hover:border-[#1A1A1A] pb-1">Nazad</button>
                  <button onClick={() => { if(!estComplexity) setEstComplexity("Standard"); setEstStep(3); }} className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-[#D35400] border-b border-transparent hover:border-[#D35400] pb-1">Dalje</button>
                </div>
              </motion.div>
            )}

            {estStep === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <form onSubmit={handleSendEmail} className="flex flex-col gap-6 md:gap-8">
                  <input required type="text" placeholder="Ime i prezime *" value={formData.ime} onChange={e => setFormData({...formData, ime: e.target.value})} className="w-full bg-transparent border-b border-neutral-300 py-3 md:py-4 text-lg md:text-xl outline-none focus:border-[#D35400] transition-colors rounded-none" />
                  <input required type="email" placeholder="E-mail *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent border-b border-neutral-300 py-3 md:py-4 text-lg md:text-xl outline-none focus:border-[#D35400] transition-colors rounded-none" />
                  <input type="text" placeholder="Napomena (vrijeme dolaska)..." value={formData.napomena} onChange={e => setFormData({...formData, napomena: e.target.value})} className="w-full bg-transparent border-b border-neutral-300 py-3 md:py-4 text-lg md:text-xl outline-none focus:border-[#D35400] transition-colors rounded-none" />
                  
                  <div className="flex justify-between items-center mt-6 md:mt-8">
                    <button type="button" onClick={() => setEstStep(2)} className="text-[10px] md:text-xs uppercase tracking-widest font-semibold">Nazad</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 md:px-8 py-3 md:py-4 bg-[#D35400] text-white rounded-full text-[10px] md:text-xs uppercase tracking-widest font-semibold disabled:opacity-50 hover:bg-[#b04500] transition-colors">
                      {isSubmitting ? "Slanje..." : "Pošalji"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* LOKACIJA I KARTA */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-7xl font-serif tracking-tighter mb-4">Pronađite nas</h2>
          <p className="text-xs uppercase tracking-widest text-neutral-500">Škverska 2, Novigrad</p>
        </div>
        <MapComponent />
      </section>

      {/* INSTAGRAM SLIDER */}
      <InstagramSlider />

      {/* NOVI TM STUDIO FOOTER */}
      <footer className="py-16 border-t border-neutral-300 bg-[#EAE6DF] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          
          {/* LOKACIJA I RADNO VRIJEME */}
          <div className="flex flex-col gap-3 md:w-1/3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#D35400]">Info</span>
            <div>
              <p className="text-[11px] md:text-xs uppercase tracking-widest text-neutral-600 mb-1">Škverska 2, 52466 Novigrad</p>
              <p className="text-[11px] md:text-xs uppercase tracking-widest text-neutral-600 font-medium">Pon - Ned: 09:00 — 02:00</p>
            </div>
          </div>

          {/* CENTRALNI LOGO */}
          <div className="md:w-1/3 flex justify-center">
            <h2 className="text-4xl md:text-6xl font-serif tracking-tighter opacity-20 hover:opacity-100 transition-opacity duration-500 cursor-default">
              AMORE
            </h2>
          </div>

          {/* TM STUDIO WATERMARK & COPYRIGHT */}
          <div className="flex flex-col gap-2 md:items-end md:w-1/3">
            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400">
              © {new Date().getFullYear()} Sva prava pridržana.
            </p>
            <a 
              href="https://instagram.com/tvoj_tm_studio_profil" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 hover:text-[#D35400] transition-colors flex items-center justify-center md:justify-end gap-1"
            >
              Digitalno iskustvo: <span className="font-bold tracking-widest text-[#1A1A1A]">TM Studio</span>
            </a>
          </div>
          
        </div>
      </footer>

      {/* MODAL ZA CIJELU GALERIJU */}
      <AnimatePresence>
        {isFullGalleryOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-12 overflow-y-auto">
            <div className="absolute inset-0 bg-[#1A1A1A]/95 backdrop-blur-md" onClick={() => setIsFullGalleryOpen(false)}></div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={snappySpring} className="relative w-full max-w-7xl min-h-[85vh] bg-[#1A1A1A] text-[#EAE6DF] rounded-[2rem] p-8 md:p-16 z-10 flex flex-col shadow-2xl border border-neutral-800">
              <div className="flex justify-between items-center mb-12 border-b border-neutral-800 pb-6">
                <div>
                  <span className="text-[#D35400] text-xs uppercase tracking-[0.2em] font-semibold block mb-1">Arhiva</span>
                  <h3 className="text-3xl md:text-5xl font-serif">Sve fotografije</h3>
                </div>
                <button onClick={() => setIsFullGalleryOpen(false)} className="text-xs uppercase tracking-widest bg-neutral-800 px-5 py-3 rounded-full hover:bg-neutral-700 transition-colors">Zatvori [X]</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galleryData.map((item, idx) => (
                  <div key={item.id || idx} onClick={() => { setSelectedGalleryImage(item); }} className="relative h-72 rounded-2xl overflow-hidden cursor-pointer group shadow-lg">
                    <Image src={item.image} alt={item.title || "Gallery"} fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-xs tracking-widest uppercase">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX ZA SLIKU */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-12">
            <div className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-md" onClick={() => setSelectedGalleryImage(null)}></div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={snappySpring} className="relative w-full max-w-5xl h-[80vh] rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col bg-neutral-900 border border-neutral-800">
              <button onClick={() => setSelectedGalleryImage(null)} className="absolute top-6 right-8 text-xs uppercase tracking-widest text-white z-20 bg-black/50 px-4 py-2 rounded-full hover:bg-black transition-colors">Zatvori [X]</button>
              <div className="relative w-full h-full">
                <Image src={selectedGalleryImage.image} alt={selectedGalleryImage.title || "Lookbook"} fill sizes="100vw" className="object-contain" />
              </div>
              {selectedGalleryImage.title && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white text-center">
                  <p className="font-serif text-xl tracking-wide">{selectedGalleryImage.title}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ZA PIĆA & DOGAĐAJI */}
      <AnimatePresence>
        {(selectedDrink || selectedEvent) && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-12">
            <div className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm" onClick={() => { setSelectedDrink(null); setSelectedEvent(null); }}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={snappySpring} className="relative bg-[#EAE6DF] text-[#1A1A1A] w-full max-w-5xl h-auto md:h-[80vh] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl z-10 max-h-[90vh]">
              
              <div className="w-full md:w-1/2 h-48 md:h-full relative shrink-0">
                <Image src={selectedDrink ? selectedDrink.image : selectedEvent.image} alt="Modal visual" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
              
              <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center relative overflow-y-auto">
                <button onClick={() => { setSelectedDrink(null); setSelectedEvent(null); }} className="absolute top-4 right-4 md:top-6 md:right-8 text-[10px] md:text-sm uppercase tracking-widest hover:text-[#D35400] bg-white/50 md:bg-transparent rounded-full px-3 py-1 md:p-0">Zatvori [X]</button>
                
                <span className="text-[#D35400] text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold mb-3 md:mb-4 block">
                  {selectedDrink ? selectedDrink.category : selectedEvent.location}
                </span>
                
                <h3 className="text-3xl md:text-5xl font-serif tracking-tighter mb-4 md:mb-8 leading-none">
                  {selectedDrink ? selectedDrink.name : selectedEvent.title}
                </h3>
                
                <p className="text-sm md:text-xl font-light text-neutral-600 mb-8 md:mb-12">
                  {selectedDrink ? (selectedDrink.description || selectedDrink.desc) : selectedEvent.description}
                </p>

                {selectedDrink && <span className="text-2xl md:text-3xl font-serif border-b border-neutral-300 pb-2 md:pb-4 mb-6 md:mb-8 w-max">{selectedDrink.price}</span>}
                
                <a href="#rezervacija" onClick={() => { setSelectedDrink(null); setSelectedEvent(null); }} className="w-full md:w-max text-center px-8 py-4 bg-[#1A1A1A] text-white rounded-full text-[10px] md:text-xs uppercase tracking-widest font-semibold hover:bg-[#D35400] transition-colors">
                  Rezerviraj stol
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}