"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Download,
  BarChart3,
  TrendingUp,
  Bug,
  Users,
  Calendar
} from "lucide-react";

// Define types for our data
type AnalyticsData = {
  totalPlots: number;
  totalFarmers: number;
  totalClimateRecords: number;
  totalPestRecords: number;
  climateByMonth: { month: string; temperature: number; rainfall: number }[];
  pestByType: { name: string; value: number }[];
  farmersByGroup: { group: string; count: number }[];
  activityData: { month: string; monitoring: number; recommendations: number }[];
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("year");
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("csv");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('/api/dashboard/analytics');
        
        if (!res.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await res.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch analytics data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleExport = () => {
    // In a real implementation, this would export the data
    alert("Mengekspor data dalam format " + exportFormat.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data analitik...</p>
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

  if (!analyticsData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Tidak ada data analitik tersedia</p>
      </div>
    );
  }

  // Use real data instead of mock data
  const climateData = analyticsData.climateByMonth.map(item => ({
    date: getMonthName(item.month),
    temperature: Math.round(item.temperature * 100) / 100,
    rainfall: Math.round(item.rainfall * 100) / 100
  }));

  const pestData = analyticsData.pestByType;
  const farmerGroupData = analyticsData.farmersByGroup;
  
  const activityData = analyticsData.activityData.map(item => ({
    month: getMonthName(item.month),
    monitoring: item.monitoring,
    recommendations: item.recommendations
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Analitik</h1>
        <div className="flex flex-wrap gap-2">
        <div className="flex rounded-md overflow-hidden border">
          <Button 
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            className="rounded-none border-0"
            onClick={() => setTimeRange("month")}
          >
            Bulan
          </Button>
          <Button 
            variant={timeRange === "quarter" ? "default" : "outline"}
            size="sm"
            className="rounded-none border-0 border-l"
            onClick={() => setTimeRange("quarter")}
          >
            Kuartal
          </Button>
          <Button 
            variant={timeRange === "year" ? "default" : "outline"}
            size="sm"
            className="rounded-none border-0 border-l"
            onClick={() => setTimeRange("year")}
          >
            Tahun
          </Button>
        </div>
        <div className="flex rounded-md overflow-hidden border">
          <select 
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as "csv" | "excel" | "pdf")}
            className="border-0 rounded-l-md px-3 py-2 text-sm"
          >
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
          <Button 
            onClick={handleExport}
              className="rounded-l-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Ekspor
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Petani</p>
                <p className="text-2xl font-bold">{analyticsData.totalFarmers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Plot</p>
                <p className="text-2xl font-bold">{analyticsData.totalPlots}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                <Bug className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ancaman Terdeteksi</p>
                <p className="text-2xl font-bold">{analyticsData.totalPestRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kelompok Tani</p>
                <p className="text-2xl font-bold">{farmerGroupData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tren Suhu & Curah Hujan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={climateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temperature" 
                    name="Suhu (°C)" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="rainfall" 
                    name="Curah Hujan (mm)" 
                    stroke="#3b82f6" 
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
              <Bug className="h-5 w-5" />
              Distribusi Ancaman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pestData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Jumlah Terdeteksi" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribusi Kelompok Tani
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={farmerGroupData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="group"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {farmerGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Aktivitas Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="monitoring" name="Monitoring" fill="#3b82f6" />
                  <Bar dataKey="recommendations" name="Rekomendasi" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to convert month string to readable format
function getMonthName(monthString: string): string {
  const [, month] = monthString.split('-');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return monthNames[parseInt(month) - 1] || monthString;
}