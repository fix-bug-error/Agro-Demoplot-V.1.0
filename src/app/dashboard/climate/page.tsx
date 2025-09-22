"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Cloud,
  CloudRain,
  Calendar,
  ThermometerSun
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// Mock data types
type ClimateData = {
  id: number;
  plot_id: number;
  date: string;
  rainfall_mm: number;
  temperature_celsius: number;
  humidity_percent: number;
  wind_speed_kmh: number;
};

type Plot = {
  id: number;
  farmer_id: number;
  plot_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  map_image_url: string;
};

export default function ClimatePage() {
  const [selectedPlot, setSelectedPlot] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [climateData, setClimateData] = useState<ClimateData[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [plotsRes, climateRes] = await Promise.all([
          fetch('/api/dashboard/plots'),
          fetch('/api/dashboard/climate')
        ]);
        
        // Check if all requests were successful
        if (!plotsRes.ok || !climateRes.ok) {
          throw new Error('Failed to fetch climate data');
        }
        
        // Parse JSON responses
        const [plotsData, climateData] = await Promise.all([
          plotsRes.json(),
          climateRes.json()
        ]);
        
        // Sort plots to ensure Demoplot 1, Demoplot 2, ..., Demoplot 10 order
        const sortedPlots = [...plotsData].sort((a, b) => {
          // Extract numbers from plot names like "Demoplot 1", "Demoplot 2", etc.
          const numA = a.plot_name.match(/\d+/);
          const numB = b.plot_name.match(/\d+/);
          
          if (numA && numB) {
            return parseInt(numA[0]) - parseInt(numB[0]);
          }
          
          // If no numbers found, sort alphabetically
          return a.plot_name.localeCompare(b.plot_name);
        });
        
        setPlots(sortedPlots || []);
        setClimateData(climateData || []);
        
        // Set default selected plot
        if (plotsData.length > 0) {
          setSelectedPlot(plotsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Gagal memuat data iklim: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter data based on selected plot
  const filteredData = climateData.filter(data => data.plot_id === selectedPlot);
  
  // Get limited data based on selected time range
  const getLimitedDataByTimeRange = (data: ClimateData[], range: "week" | "month" | "year") => {
    // Show different portions based on time range
    switch (range) {
      case "week":
        // Show last 7 records (approximates a week if daily data)
        return data.slice(0, Math.min(7, data.length));
      case "month":
        // Show more data for month view
        return data.slice(0, Math.min(30, data.length));
      case "year":
        // Show even more data for year view
        return data.slice(0, Math.min(90, data.length));
      default:
        return data.slice(0, data.length);
    }
  };
  
  const timeRangeLimitedData = getLimitedDataByTimeRange(filteredData, timeRange);
  
  // Calculate average values for the selected time range
  const calculateAverages = (data: ClimateData[]) => {
    if (data.length === 0) {
      return {
        avgRainfall: 0,
        avgTemperature: 0,
        avgHumidity: 0,
        avgWindSpeed: 0
      };
    }
    
    const sum = data.reduce((acc, item) => {
      acc.rainfall += item.rainfall_mm;
      acc.temperature += item.temperature_celsius;
      acc.humidity += item.humidity_percent;
      acc.windSpeed += item.wind_speed_kmh;
      return acc;
    }, { rainfall: 0, temperature: 0, humidity: 0, windSpeed: 0 });
    
    return {
      avgRainfall: sum.rainfall / data.length,
      avgTemperature: sum.temperature / data.length,
      avgHumidity: sum.humidity / data.length,
      avgWindSpeed: sum.windSpeed / data.length
    };
  };
  
  const averages = calculateAverages(timeRangeLimitedData);
  
  // Get current plot

  // Prepare chart data
  const chartData = timeRangeLimitedData.map(data => ({
    date: new Date(data.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    temperature: data.temperature_celsius,
    rainfall: data.rainfall_mm,
    humidity: data.humidity_percent,
    wind: data.wind_speed_kmh
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data iklim...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Data Klimatologi</h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select 
            value={selectedPlot}
            onChange={(e) => setSelectedPlot(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm max-w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          >
            {plots.map(plot => (
              <option key={plot.id} value={plot.id}>
                {plot.plot_name}
              </option>
            ))}
          </select>
          <div className="flex rounded-md overflow-hidden border w-full md:w-auto max-w-full">
            <Button 
              variant={timeRange === "week" ? "default" : "outline"}
              size="sm"
              className="rounded-none border-0 flex-1"
              onClick={() => setTimeRange("week")}
            >
              Minggu
            </Button>
            <Button 
              variant={timeRange === "month" ? "default" : "outline"}
              size="sm"
              className="rounded-none border-0 border-l flex-1"
              onClick={() => setTimeRange("month")}
            >
              Bulan
            </Button>
            <Button 
              variant={timeRange === "year" ? "default" : "outline"}
              size="sm"
              className="rounded-none border-0 border-l flex-1"
              onClick={() => setTimeRange("year")}
            >
              Tahun
            </Button>
          </div>
        </div>
      </div>
      {/* Summary Cards */}
      {/* Mobile: Temperature & Rainfall in first row, Humidity & Wind Speed in second row */}
      {/* Desktop: All 4 cards in one row */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                <ThermometerSun className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suhu</p>
                <p className="text-xs text-muted-foreground">Rata-rata</p>
                <p className="text-xl font-bold">
                  {averages.avgTemperature.toFixed(1)} <span className="text-sm font-normal">°C</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <CloudRain className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Curah Hujan</p>
                <p className="text-xs text-muted-foreground">Rata-rata</p>
                <p className="text-xl font-bold">
                  {averages.avgRainfall.toFixed(1)} <span className="text-sm font-normal">mm</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-full">
                <Droplets className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kelembapan</p>
                <p className="text-xs text-muted-foreground">Rata-rata</p>
                <p className="text-xl font-bold">
                  {averages.avgHumidity.toFixed(1)} <span className="text-sm font-normal">%</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <Wind className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kecepatan Angin</p>
                <p className="text-xs text-muted-foreground">Rata-rata</p>
                <p className="text-xl font-bold">
                  {averages.avgWindSpeed.toFixed(1)} <span className="text-sm font-normal">km/h</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Mobile and tablet layout */}
      <div className="grid grid-cols-1 lg:hidden gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                  <ThermometerSun className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suhu</p>
                  <p className="text-xs text-muted-foreground">Rata-rata</p>
                  <p className="text-xl font-bold">
                    {averages.avgTemperature.toFixed(1)} <span className="text-sm font-normal">°C</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <CloudRain className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Curah Hujan</p>
                  <p className="text-xs text-muted-foreground">Rata-rata</p>
                  <p className="text-xl font-bold">
                    {averages.avgRainfall.toFixed(1)} <span className="text-sm font-normal">mm</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-full">
                  <Droplets className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kelembapan</p>
                  <p className="text-xs text-muted-foreground">Rata-rata</p>
                  <p className="text-xl font-bold">
                    {averages.avgHumidity.toFixed(1)} <span className="text-sm font-normal">%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <Wind className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kecepatan Angin</p>
                  <p className="text-xs text-muted-foreground">Rata-rata</p>
                  <p className="text-xl font-bold">
                    {averages.avgWindSpeed.toFixed(1)} <span className="text-sm font-normal">km/h</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThermometerSun className="h-5 w-5" />
              Suhu (°C)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    name="Suhu (°C)" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="h-5 w-5" />
              Curah Hujan (mm)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="rainfall" 
                    name="Curah Hujan (mm)" 
                    fill="#3b82f6" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Kelembapan (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    name="Kelembapan (%)" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="h-5 w-5" />
              Kecepatan Angin (km/h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="wind" 
                    name="Kecepatan Angin (km/h)" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Data Historis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <div className="inline-block align-middle min-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      <span className="hidden sm:inline">Tanggal</span>
                      <span className="sm:hidden">Tgl</span>
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      <span className="hidden sm:inline">Suhu (°C)</span>
                      <ThermometerSun className="sm:hidden h-4 w-4" />
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      <span className="hidden sm:inline">Curah Hujan (mm)</span>
                      <CloudRain className="sm:hidden h-4 w-4" />
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      <span className="hidden sm:inline">Kelembapan (%)</span>
                      <Droplets className="sm:hidden h-4 w-4" />
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      <span className="hidden sm:inline">Angin (km/h)</span>
                      <Wind className="sm:hidden h-4 w-4" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timeRangeLimitedData.map((data) => (
                    <tr key={data.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-2 py-1 whitespace-nowrap text-xs">{new Date(data.date).toLocaleDateString('id-ID')}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">{data.temperature_celsius}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">{data.rainfall_mm}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">{data.humidity_percent}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">{data.wind_speed_kmh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}