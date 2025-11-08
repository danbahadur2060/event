"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Users, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const stats = [
    { icon: Calendar, value: "500+", label: "Events", color: "#59deca" },
    { icon: Users, value: "50K+", label: "Developers", color: "#94eaff" },
    { icon: TrendingUp, value: "100+", label: "Cities", color: "#a78bfa" },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8"
      id="home"
    >
      {/* Animated gradient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.02}%, ${mousePosition.y * 0.02}%)`,
          transition: "transform 0.3s ease-out",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue/20 rounded-full blur-[120px] animate-pulse delay-1000"
        style={{
          transform: `translate(-${mousePosition.x * 0.02}%, -${mousePosition.y * 0.02}%)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Badge */}
        <div className="flex justify-center mb-8 animate-fade-in-down">
          <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 group hover:border-primary/40 transition-all duration-300 cursor-pointer">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-light-100 group-hover:text-primary transition-colors">
              🎉 Join 50,000+ developers worldwide
            </span>
          </div>
        </div>

        {/* Main heading with staggered animation */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-tight animate-fade-in-up">
            <span className="block text-gradient">
              Discover Events
            </span>
            <span className="block mt-2">
              <span className="text-gradient">That Shape</span>{" "}
              <span className="relative inline-block">
                <span className="text-gradient relative z-10">Tomorrow</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full animate-draw-line"
                  height="12"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C52.1667 5.66667 162.5 0.5 298 5.5"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#59deca" />
                      <stop offset="100%" stopColor="#94eaff" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </span>
          </h1>

          <p className="subheading max-w-2xl mx-auto text-xl text-light-100/80 animate-fade-in-up delay-200">
            From intimate meetups to global conferences—find hackathons, workshops, 
            and networking events tailored for developers like you.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
          <a
            href="#events"
            className="group relative px-8 py-4 bg-primary text-dark-100 rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50 w-full sm:w-auto text-center"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Explore Events
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>

          <a
            href="/events"
            className="group px-8 py-4 glass border border-primary/30 rounded-full font-semibold text-lg transition-all duration-300 hover:border-primary hover:bg-primary/10 w-full sm:w-auto text-center"
          >
            <span className="flex items-center justify-center gap-2">
              Browse All Events
              <Calendar className="w-5 h-5" />
            </span>
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up delay-500">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass p-6 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 group hover:scale-105 cursor-pointer"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${stat.color}20`,
                  }}
                >
                  <stat.icon
                    className="w-6 h-6 transition-colors"
                    style={{ color: stat.color }}
                  />
                </div>
                <div className="text-right">
                  <div
                    className="text-3xl font-bold font-martian-mono"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
              <p className="text-light-100 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Floating badges for visual interest */}
        <div className="hidden lg:block absolute top-20 left-10 animate-float">
          <div className="glass px-4 py-2 rounded-full border border-primary/20 text-sm">
            🚀 Next.js 16
          </div>
        </div>
        <div className="hidden lg:block absolute top-40 right-20 animate-float delay-1000">
          <div className="glass px-4 py-2 rounded-full border border-blue/20 text-sm">
            ⚡ Live Events
          </div>
        </div>
        <div className="hidden lg:block absolute bottom-32 left-20 animate-float delay-2000">
          <div className="glass px-4 py-2 rounded-full border border-primary/20 text-sm">
            🎯 Free Entry
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-scroll-down" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
