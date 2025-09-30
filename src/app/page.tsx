"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, MapPinned, Users, Thermometer, ThermometerSun, Bug, Brain, BarChart3, CloudSunRain, Coffee, LogIn, Mail, Copy, Microscope, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { BackToTopButton } from "@/components/back-to-top-button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { toast, Toaster } from "sonner";
import type { CarouselApi } from "@/components/ui/carousel";

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
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayTimeout = useRef<NodeJS.Timeout | null>(null);

  // AutoPlay function for mobile carousel
  useEffect(() => {
    if (!api) return;

    const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

    const autoplay = () => {
      if (isMobile()) {
        api.scrollNext();
      }
    };

    // Function to set/clear timeout based on screen size
    const setAutoplayTimeout = () => {
      // Clear existing timeout
      if (autoplayTimeout.current) {
        clearTimeout(autoplayTimeout.current);
      }

      // Set timeout if on mobile (only if we're on mobile)
      if (isMobile()) {
        autoplayTimeout.current = setTimeout(() => {
          autoplay();
          // After executing, schedule the next execution
          setAutoplayTimeout();
        }, 3000); // Changed to 3 seconds as 1 second might be too fast
      }
    };

    // Function to handle window resize
    const handleResize = () => {
      if (isMobile()) {
        // If we switched to mobile, start autoplay if not already running
        setAutoplayTimeout();
      } else {
        // If we switched to desktop, clear the timeout
        if (autoplayTimeout.current) {
          clearTimeout(autoplayTimeout.current);
          autoplayTimeout.current = null;
        }
      }
    };

    // Set up resize listener
    window.addEventListener('resize', handleResize);

    // First check
    setAutoplayTimeout();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (autoplayTimeout.current) {
        clearTimeout(autoplayTimeout.current);
      }
    };
  }, [api, currentSlide]); // Re-run when api or currentSlide changes

  // Update current slide when API changes
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect(); // Set initial slide

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-50 flex justify-between">
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Mail className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hubungi Kami</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-medium">admin@agrodemoplot.id</p>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      navigator.clipboard.writeText('admin@agrodemoplot.id');
                      toast.success('Email berhasil disalin!');
                    }}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
          
          {/* Dashboard Access Button - Positioned inside hero card on mobile */}
          <motion.div 
            className="flex md:hidden justify-center mt-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <SignedIn>
              <DashboardButton />
            </SignedIn>
          </motion.div>
        </motion.div>
        
        {/* Dashboard Access Button - Positioned half inside the card at the bottom on larger screens */}
        <motion.div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-[80%] sm:-translate-y-1/2 z-10 hidden md:flex"
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
        className="py-4 sm:py-24 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-6 sm:mb-16"
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
               {/* Feature 1 */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-row items-start text-left sm:flex-col sm:text-center sm:items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Informasi Dasar</h3>
                  <p className="text-muted-foreground">
                    Manajemen data petani dan kelompok tani dengan informasi komprehensif
                  </p>
                </div>
              </div>
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
              <div className="flex flex-row items-start text-left sm:flex-col sm:text-center sm:items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <MapPinned className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Peta Lahan Interaktif</h3>
                  <p className="text-muted-foreground">
                    Visualisasi geospasial plot lahan dengan data lokasi presisi tinggi
                  </p>
                </div>
              </div>
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
              <div className="flex flex-row items-start text-left sm:flex-col sm:text-center sm:items-center gap-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <CloudSunRain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Monitoring Iklim</h3>
                  <p className="text-muted-foreground">
                    Pelacakan data klimatologi untuk pengambilan keputusan optimal
                  </p>
                </div>
              </div>
            </motion.div>
            
                 {/* NEW Feature - Kondisi Tanah */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-row items-start text-left sm:flex-col sm:text-center sm:items-center gap-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Microscope className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Karakteristik Tanah</h3>
                  <p className="text-muted-foreground">
                    Akses informasi tanah untuk penggunaan lahan berkelanjutan
                  </p>
                </div>
              </div>
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
              <div className="flex flex-row items-start text-left sm:flex-col sm:text-center sm:items-center gap-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Bug className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Deteksi Ancaman</h3>
                  <p className="text-muted-foreground">
                    Identifikasi ancaman hama, penyakit dan gulma untuk tindakan pencegahan
                  </p>
                </div>
              </div>
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
              <div className="flex flex-row items-start text-left sm:flex-col sm:text-center sm:items-center gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Rekomendasi AI</h3>
                  <p className="text-muted-foreground">
                    Rekomendasi berbasis AI untuk pengelolaan kebun yang optimal
                  </p>
                </div>
              </div>
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
              <div className="flex flex-row items-start text-left sm:flex-col sm:text-center sm:items-center gap-4">
                <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Analitik Lanjutan</h3>
                  <p className="text-muted-foreground">
                    Statistik dan tren produksi untuk perencanaan strategis
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* NEW Feature - Agronomis Digital */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-row items-start text-left sm:flex-col sm:text-center sm:items-center gap-4">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Agronomis Digital</h3>
                  <p className="text-muted-foreground">
                    Tanyakan tentang pertanian, agronomi, atau praktik pertanian terbaik
                  </p>
                </div>
              </div>
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
          <div className="mt-4">
            {/* Desktop logos - grid layout for larger screens */}
            <div className="hidden md:grid grid-cols-7 gap-6 items-center justify-items-center max-w-4xl mx-auto">
              <div className="col-span-full text-left mb-4">
                <p>Powered By:</p>
              </div>
           
              <img 
                src="/next.svg" 
                alt="Next.js Logo" 
        
                height="100"
              />
              <img 
                src="/clerk.png" 
                alt="Clerk Logo" 
        
                height="100"
              />
              <img 
                src="/supabase.svg" 
                alt="Supabase Logo" 
         
                height="100"
              />
              <img 
                src="/leaflet.svg" 
                alt="Leaflet Logo" 
      
                height="100"
              />
          
              <img 
                src="/open-meteo.png" 
                alt="Open-Meteo Logo" 
       
                height="100"
              />
                  <img 
                src="/soilgrids.png" 
                alt="Soilgrids Logo" 
       
                height="100"
              />
              <img 
                src="/openai.png" 
                alt="OpenAI Logo" 
   
                height="100"
              />
            </div>
            
            {/* Mobile logos - carousel for smaller screens */}
            <div className="md:hidden mt-4 w-full overflow-hidden">
              <div className="text-left mb-4 px-4">
                <p>Powered By:</p>
              </div>
              <Carousel opts={{ align: "center", loop: true }} className="max-w-full mx-auto px-4" setApi={setApi}>
                <CarouselContent className="pb-4">
                 
                  <CarouselItem className="basis-full">
                    <div className="flex items-center justify-center">
                      <img 
                        src="/nextjs.png" 
                        alt="Next.js Logo" 
                        width="80"
                        height="80"
                        className="max-w-[80px] max-h-[80px] object-contain"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-full">
                    <div className="flex items-center justify-center">
                      <img 
                        src="/clerk.png" 
                        alt="Clerk Logo" 
                        width="80"
                        height="80"
                        className="max-w-[80px] max-h-[80px] object-contain"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-full">
                    <div className="flex items-center justify-center">
                      <img 
                        src="/supabase.png" 
                        alt="Supabase Logo" 
                        width="80"
                        height="80"
                        className="max-w-[80px] max-h-[80px] object-contain"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-full">
                    <div className="flex items-center justify-center">
                      <img 
                        src="/leaflet.svg" 
                        alt="Leaflet Logo" 
                        width="80"
                        height="80"
                        className="max-w-[80px] max-h-[80px] object-contain"
                      />
                    </div>
                  </CarouselItem>
               
                    
                  <CarouselItem className="basis-full">
                    <div className="flex items-center justify-center">
                      <img 
                        src="/open-meteo.png" 
                        alt="Open-Meteo Logo" 
                        width="80"
                        height="80"
                        className="max-w-[80px] max-h-[80px] object-contain"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-full">
                    <div className="flex items-center justify-center">
                      <img 
                        src="/soilgrids.png" 
                        alt="Soilgrids Logo" 
                        width="80"
                        height="80"
                        className="max-w-[80px] max-h-[80px] object-contain"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-full">
                    <div className="flex items-center justify-center">
                      <img 
                        src="/openai.png" 
                        alt="OpenAI Logo" 
                        width="80"
                        height="80"
                        className="max-w-[80px] max-h-[80px] object-contain"
                      />
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="max-md:size-6" />
                <CarouselNext className="max-md:size-6" />
              </Carousel>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-8 mt-6">
            <img 
              src="/agrodemoplot-logo.svg" 
              alt="AgroDemoplot Logo" 
              width="200"
              height="200"
              className="max-w-[200px] max-h-[200px] object-contain"
            />
            
          </div>
          
          <p className="mt-6">© {new Date().getFullYear()} · AgroDemoplot V.1.0</p>
        </div>
      </motion.footer>
      
      {/* Back to Top Button */}
      <BackToTopButton />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}