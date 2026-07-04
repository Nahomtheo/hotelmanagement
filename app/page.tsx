"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThreeDBackground from "@/components/ui/bg";

export default function Page() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 3D Tilt transformation maps for grid cards
  const cardRotateX = useTransform(y, [-400, 400], [10, -10]);
  const cardRotateY = useTransform(x, [-400, 400], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      x.set(e.clientX - innerWidth / 2);
      y.set(e.clientY - innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <main className="relative min-h-screen overflow-hidden text-white bg-black [perspective:1400px]">
      
      {/* 
        3D Dynamic Background Layer 
        (Handles Hero Title, Sign In/Register navigation & Initial Viewport View)
      */}
      <div className="relative w-full h-screen">
        <ThreeDBackground />
      </div>

      {/* ================= EXPLORE SECTION (WITH 3D TILT EFFECT) ================= */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto mt-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-5xl font-bold mb-16"
        >
          Explore <span className="text-amber-500">Ethiopia</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Lalibela",
              img: "lalibela.jpg",
              desc: "Rock-hewn churches & ancient heritage",
            },
            {
              name: "Gondar",
              img: "gondar.jpg",
              desc: "Castles of Ethiopian kings",
            },
            {
              name: "Simien Mountains",
              img: "Simienm.jpg",
              desc: "Dramatic landscapes & wildlife",
            },
          ].map((place, i) => (
            <motion.div
              key={place.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ rotateX: cardRotateX, rotateY: cardRotateY }}
              whileHover={{ scale: 1.04, z: 30 }}
              className="relative group rounded-2xl overflow-hidden cursor-pointer shadow-2xl shadow-black/80 aspect-[4/5] transform-gpu border border-white/5 transition-all duration-200"
            >
              <img
                src={place.img}
                alt={place.name}
                className="h-full w-full object-cover group-hover:scale-110 transition duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent group-hover:via-black/40 transition duration-300" />
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <h3 className="text-2xl font-bold text-white mb-1 tracking-wide">{place.name}</h3>
                <p className="text-sm text-stone-300 opacity-90">{place.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= ROOMS SECTION (WITH UNIFIED 3D TILT FRAME WORK) ================= */}
      <section className="relative z-10 px-6 py-24 bg-zinc-950/50 backdrop-blur-md border-y border-white/5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-5xl font-bold mb-16"
        >
          Luxury <span className="text-amber-500">Rooms</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { name: "Deluxe Suite", price: "$120 / night", img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=600" },
            { name: "Executive Room", price: "$180 / night", img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600" },
            { name: "Royal Suite", price: "$250 / night", img: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=600" },
          ].map((room, i) => (
            <motion.div
              key={room.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ rotateX: cardRotateX, rotateY: cardRotateY }}
              whileHover={{ scale: 1.04, z: 40 }}
              className="rounded-2xl overflow-hidden bg-stone-900/30 border border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-2xl transform-gpu transition-all duration-200"
            >
              <img src={room.img} alt={room.name} className="h-64 w-full object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-white">{room.name}</h3>
                <p className="text-amber-500 mt-2 font-semibold text-lg">{room.price}</p>
                <button className="mt-5 w-full py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-500 transition shadow-md shadow-amber-950/20">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          {[
            { value: "120+", label: "Boutique Stays" },
            { value: "15K+", label: "Happy Guests" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-stone-900/30 border border-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-4xl font-extrabold text-amber-500">{stat.value}</h3>
              <p className="text-stone-300 mt-2 text-sm uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= AMENITIES ================= */}
      <section className="relative z-10 px-6 py-24 bg-zinc-950/40 backdrop-blur-md border-t border-white/5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-5xl font-bold mb-14"
        >
          Hotel <span className="text-amber-500">Amenities</span>
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-center">
          {[
            "Free WiFi", "Breakfast Included", "Airport Pickup", "24/7 Support",
            "Spa & Wellness", "City Tours", "Room Service", "Luxury Transport"
          ].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, borderColor: "rgba(245, 158, 11, 0.4)" }}
              className="bg-stone-900/40 border border-white/10 backdrop-blur-xl rounded-xl p-5 text-stone-200 font-medium transition-colors border-transparent"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-5xl font-bold mb-14"
        >
          What Guests <span className="text-amber-500">Say</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { name: "Sarah", text: "Absolutely beautiful experience. Ethiopian hospitality is unmatched." },
            { name: "Daniel", text: "Luxury rooms and stunning locations. Highly recommended!" },
            { name: "Amina", text: "Best travel booking platform for Ethiopia." },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-stone-900/30 border border-white/5 backdrop-blur-xl rounded-2xl p-8 flex flex-col justify-between shadow-lg"
            >
              <p className="text-stone-300 italic leading-relaxed">“{t.text}”</p>
              <h4 className="mt-6 text-amber-500 font-bold tracking-wide">— {t.name}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative z-10 px-6 py-32 text-center bg-gradient-to-b from-transparent to-black border-t border-white/5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold tracking-tight"
        >
          Ready to Experience Ethiopia?
        </motion.h2>
        <p className="text-stone-400 mt-4 max-w-md mx-auto">
          Join thousands of travelers discovering authentic stays across historic routes.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-xl shadow-amber-950/40"
        >
          Create Free Account
        </motion.button>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 px-6 py-16 border-t border-white/10 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-stone-400">
          <div>
            <h3 className="text-white font-bold text-lg tracking-wider">EthioStay</h3>
            <p className="text-sm mt-2 leading-relaxed">
              Luxury hotel booking platform inspired by classic East African hospitality.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="hover:text-amber-500 cursor-pointer transition">Hotels</li>
              <li className="hover:text-amber-500 cursor-pointer transition">Destinations</li>
              <li className="hover:text-amber-500 cursor-pointer transition">Offers</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Support</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="hover:text-amber-500 cursor-pointer transition">Help Center</li>
              <li className="hover:text-amber-500 cursor-pointer transition">Contact</li>
              <li className="hover:text-amber-500 cursor-pointer transition">FAQ</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="hover:text-amber-500 cursor-pointer transition">Privacy Policy</li>
              <li className="hover:text-amber-500 cursor-pointer transition">Terms</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-stone-600 mt-12 text-xs tracking-wide">
          &copy; {new Date().getFullYear()} EthioStay. All rights reserved.
        </p>
      </footer>

    </main>
  );
}