import React, { useState, useEffect } from "react";
import { Film, Award, TrendingUp, Sparkles, ChevronRight, ChevronLeft, ShieldCheck, Zap, Layers, Eye, RefreshCw, CheckCircle2 } from "lucide-react";

const PACKAGING_FILM_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    title: "High-Speed BOPP Extrusion Line #1",
    subtitle: "Automated 8.7m Bruckner line producing ultra-clear sealing films at 480 m/min.",
    category: "BOPP FILMS",
    badgeColor: "bg-emerald-500 text-stone-950",
    specs: "Thickness: 15µ - 40µ • Tensile Strength: 140 MPa"
  },
  {
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    title: "Metallized BOPET & Vacuum Deposition Desk",
    subtitle: "Mirror-finish aluminum metallization for premium snack barrier and UV protection.",
    category: "METALLIZED FOIL",
    badgeColor: "bg-amber-500 text-stone-950",
    specs: "OD: 2.2 - 2.8 • OTR < 0.5 cc/m²/day"
  },
  {
    url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    title: "Precision Slitting & Roll Rewinding Desk",
    subtitle: "Laser-guided slitting machines preparing customized master rolls for packaging converters.",
    category: "SLITTING DESK",
    badgeColor: "bg-sky-500 text-stone-950",
    specs: "Slit Width: 50mm - 2000mm • Zero-taper winding"
  },
  {
    url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    title: "Co-Extruded CPP & Barrier Sealing Plant",
    subtitle: "3-layer and 5-layer cast polypropylene lines engineered for retort pouches and medical packaging.",
    category: "CPP BARRIER",
    badgeColor: "bg-purple-500 text-white",
    specs: "Seal Initiation Temp: 105°C • Puncture Resistant"
  },
  {
    url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80",
    title: "Eco-Green Recyclable Monomaterial Films",
    subtitle: "Pioneering sustainable 100% recyclable polyolefin laminate solutions for global food brands.",
    category: "SUSTAINABILITY",
    badgeColor: "bg-teal-500 text-white",
    specs: "ISCC Plus Certified • 30% Post-Consumer Recyclate"
  }
];

const POLYMER_GRADES = [
  {
    code: "BOPP",
    name: "Biaxially Oriented Polypropylene",
    uses: "Snack wrappers, biscuit wraps, confectionery, adhesive tapes, garment bags.",
    highlight: "Market leader in clarity & moisture barrier"
  },
  {
    code: "BOPET",
    name: "Biaxially Oriented Polyethylene Terephthalate",
    uses: "Hot-fill juice pouches, metallic balloons, roasting bags, electrical insulation.",
    highlight: "Unmatched tensile strength & aroma barrier"
  },
  {
    code: "CPP",
    name: "Cast Polypropylene Sealing Films",
    uses: "Retort food pouches, bakery packaging, stationery folders, textile wraps.",
    highlight: "Superior heat sealability & tear resistance"
  },
  {
    code: "EVOH",
    name: "High-Barrier Co-Extruded Films",
    uses: "Ready-to-eat meals, processed meat, oxygen-sensitive pharmaceutical products.",
    highlight: "Zero oxygen transmission & extended shelf life"
  }
];

interface PackagingFilmShowcaseProps {
  compact?: boolean;
}

export default function PackagingFilmShowcase({ compact = false }: PackagingFilmShowcaseProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(0);
  const [imageList, setImageList] = useState(PACKAGING_FILM_IMAGES);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/site-config");
        if (res.ok) {
          const data = await res.json();
          if (data && data.showcaseImages && data.showcaseImages.length > 0) {
            setImageList(data.showcaseImages);
          }
        }
      } catch (err) {
        console.warn("Notice: showcase config momentarily unavailable", err);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % imageList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, imageList.length]);

  const slide = imageList[currentSlide] || PACKAGING_FILM_IMAGES[0];

  return (
    <div className="bg-stone-900 text-stone-100 rounded-sm border border-stone-800 shadow-xl overflow-hidden mb-8 relative">
      {/* Background ambient foil shimmer & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.18),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main Showcase Header */}
      <div className="p-4 sm:p-6 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 bg-stone-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-md text-stone-950 shadow-md transform rotate-3 hover:rotate-0 transition">
            <Film className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black font-serif tracking-tight text-white">
                PACKAGING FILM INDUSTRY <span className="text-amber-400 font-mono text-sm uppercase tracking-widest font-normal">● LIVE PLANT FEED</span>
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> 100% AUDIT VERIFIED
              </span>
            </div>
            <p className="text-xs text-stone-400 font-serif italic">
              Explore live extrusion machinery, slitting desks, and polymer grade specifications across our alliance plants.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded border transition flex items-center gap-1 cursor-pointer ${
              isAutoPlaying
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-stone-800 border-stone-700 text-stone-400 hover:text-white"
            }`}
          >
            {isAutoPlaying ? "⏸ Auto-Playing Reel" : "▶ Resume Reel"}
          </button>
          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded border border-stone-700">
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentSlide((prev) => (prev - 1 + PACKAGING_FILM_IMAGES.length) % PACKAGING_FILM_IMAGES.length);
              }}
              className="p-1 hover:bg-stone-700 rounded text-stone-300 transition cursor-pointer"
              title="Previous Photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-stone-300 font-bold">
              {currentSlide + 1} / {PACKAGING_FILM_IMAGES.length}
            </span>
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentSlide((prev) => (prev + 1) % PACKAGING_FILM_IMAGES.length);
              }}
              className="p-1 hover:bg-stone-700 rounded text-stone-300 transition cursor-pointer"
              title="Next Photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Moving HD Image Carousel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px] relative z-10">
        {/* Left/Main Side: HD Photo Slider */}
        <div className="lg:col-span-7 relative bg-stone-950 overflow-hidden min-h-[280px] sm:min-h-[340px] flex items-end group">
          {/* Animated image transition */}
          <img
            key={currentSlide}
            src={slide.url}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 via-transparent to-transparent hidden lg:block" />

          {/* Slide Details Overlay */}
          <div className="relative z-10 p-5 sm:p-6 w-full space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded shadow-xs ${slide.badgeColor}`}>
                {slide.category}
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-stone-900/80 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ LIVE PRODUCTION FEED
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight drop-shadow-md">
              {slide.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-serif max-w-xl line-clamp-2 leading-relaxed drop-shadow">
              {slide.subtitle}
            </p>
            <div className="pt-2 flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-amber-200 bg-stone-900/90 border border-stone-700 px-2.5 sm:px-3 py-1.5 rounded w-fit max-w-full backdrop-blur-md">
              <Layers className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="break-words sm:whitespace-normal">{slide.specs}</span>
            </div>
          </div>

          {/* Slide Progress Dots */}
          <div className="absolute top-4 right-4 z-10 flex gap-1.5 bg-stone-900/80 p-1.5 rounded-full backdrop-blur-md border border-stone-700">
            {imageList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentSlide(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide ? "bg-amber-400 w-5" : "bg-stone-600 hover:bg-stone-400"
                }`}
                title={`View slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Interactive Polymer Grade Selector & Alliance Knowledge Base */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-stone-900/95 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-800 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Polymer Grade Knowledge Base
              </span>
              <span className="text-[9px] font-mono text-stone-500">CLICK TO EXPLORE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {POLYMER_GRADES.map((grade, idx) => {
                const isSelected = selectedGrade === idx;
                return (
                  <button
                    key={grade.code}
                    onClick={() => setSelectedGrade(idx)}
                    className={`p-2.5 rounded text-left border transition cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/60 text-white shadow-sm"
                        : "bg-stone-800/60 border-stone-700/80 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-bl" />
                    )}
                    <p className="font-mono font-black text-xs text-amber-400 mb-0.5 flex items-center justify-between">
                      <span>{grade.code}</span>
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-amber-400" />}
                    </p>
                    <p className="font-sans text-[10px] font-medium text-stone-300 line-clamp-1">
                      {grade.name.split(" ")[0]} Film
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedGrade !== null && (
              <div className="p-3.5 bg-stone-800/80 rounded border border-stone-700 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-400 rounded-full inline-block" />
                    {POLYMER_GRADES[selectedGrade].code} • {POLYMER_GRADES[selectedGrade].name}
                  </span>
                </div>
                <p className="text-xs font-serif text-stone-300 leading-relaxed">
                  <span className="text-stone-400 font-sans text-[10px] uppercase font-bold block mb-0.5">Primary Applications:</span>
                  {POLYMER_GRADES[selectedGrade].uses}
                </p>
                <div className="pt-1 border-t border-stone-700/60 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-semibold">
                  <Zap className="h-3 w-3" />
                  <span>Highlight: {POLYMER_GRADES[selectedGrade].highlight}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-stone-800/40 rounded border border-stone-800">
              <p className="text-base font-black text-white font-mono">15µ - 100µ</p>
              <p className="text-[9px] text-stone-400 font-mono uppercase">Thickness Range</p>
            </div>
            <div className="p-2 bg-stone-800/40 rounded border border-stone-800">
              <p className="text-base font-black text-amber-400 font-mono">10% CAGR</p>
              <p className="text-[9px] text-stone-400 font-mono uppercase">India Film Growth</p>
            </div>
            <div className="p-2 bg-stone-800/40 rounded border border-stone-800">
              <p className="text-base font-black text-emerald-400 font-mono">2,400+ MT</p>
              <p className="text-[9px] text-stone-400 font-mono uppercase">Daily Capacity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
