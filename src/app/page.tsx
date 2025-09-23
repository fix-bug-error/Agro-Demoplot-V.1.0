"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, MapPinned, Users, Thermometer, ThermometerSun, Bug, Brain, BarChart3, CloudSunRain, Coffee, LogIn } from "lucide-react";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { BackToTopButton } from "@/components/back-to-top-button";

function DashboardButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    // Simulate a small delay to show the loading state
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <Button 
      size="lg" 
      className="text-base sm:text-lg px-8 py-6 rounded-full cursor-pointer flex items-center gap-2"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          <span>Buka Dashboard</span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </Button>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <SimpleThemeToggle aria-label="Toggle theme" />
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" className="text-xs sm:text-sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center relative">
        <motion.div 
          className="bg-[url('/herocard.png')] bg-cover bg-center rounded-3xl p-8 sm:p-28 w-full max-w-5xl bg-white/30 aspect-[3/4] sm:aspect-[16/9] flex flex-col justify-center pb-44 sm:pb-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="mb-10 sm:mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="relative p-4 sm:p-6 rounded-full">
                <motion.img 
                  src="/agrodemoplot-logo.svg" 
                  alt="AgroDemoplot Logo" 
                  width="400"
                  height="400"
                  className="text-green-600 mx-auto drop-shadow-lg w-64 h-64 sm:w-[400px] sm:h-[400px]"
                  initial={{ opacity: 0, rotate: -10 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Dashboard Access Button - Positioned half inside the card at the bottom */}
        <motion.div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-[80%] sm:-translate-y-1/2 z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedIn>
              <DashboardButton />
            </SignedIn>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.section 
        className="py-16 sm:py-24 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Aplikasi Monitoring Kebun</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Solusi komprehensif untuk monitoring dan manajemen kebun kopi Anda
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
               {/* Feature 1 */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Informasi Dasar</h3>
              <p className="text-muted-foreground">
                Manajemen data petani dan kelompok tani dengan informasi komprehensif
              </p>
            </motion.div>
            {/* Feature 2 */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MapPinned className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Peta Lahan Interaktif</h3>
              <p className="text-muted-foreground">
                Visualisasi geospasial plot lahan dengan data lokasi presisi tinggi
              </p>
            </motion.div>
            
         
            {/* Feature 3 */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CloudSunRain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitoring Iklim</h3>
              <p className="text-muted-foreground">
                Pelacakan data klimatologi real-time untuk pengambilan keputusan optimal
              </p>
            </motion.div>
            
            {/* Feature 4 */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Bug className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deteksi Hama & Penyakit</h3>
              <p className="text-muted-foreground">
                Identifikasi dini ancaman hama dan penyakit untuk tindakan pencegahan
              </p>
            </motion.div>
            
            {/* Feature 5 */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rekomendasi AI</h3>
              <p className="text-muted-foreground">
                Rekomendasi berbasis AI untuk pengelolaan kebun yang optimal
              </p>
            </motion.div>
            
            {/* Feature 6 */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analitik Lanjutan</h3>
              <p className="text-muted-foreground">
                Statistik dan tren produksi untuk perencanaan strategis
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="py-8 text-center text-muted-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} AgroDemoplot. Hak Cipta Dilindungi.</p>
       
          <div className="flex items-center justify-center mt-2">
                <img 
                  src="/logoRP.svg" 
                  alt="RUMAHPETAni Logo" 
                  width="120"
                  height="120"
              
                />
              </div>
        </div>
      </motion.footer>
      
      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
}