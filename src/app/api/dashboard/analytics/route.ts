import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Define types for our data
type Farmer = {
  id: number;
  full_name: string;
  national_id: string;
  birth_date: string;
  education: string;
  gender: string;
  phone_number: string;
  address: string;
  farmer_group: string;
  photo_url: string;
};

type ClimateData = {
  id: number;
  plot_id: number;
  date: string;
  rainfall_mm: number;
  temperature_celsius: number;
  humidity_percent: number;
  wind_speed_kmh: number;
};

type PestData = {
  id: number;
  plot_id: number;
  threat_type: string;
  severity: string;
  detected_at: string;
  recommendations: string;
  image_url: string;
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch all necessary data in parallel
    const [plotsRes, farmersRes, climateRes, pestRes] = await Promise.all([
      supabase.from('plots').select(`
        *,
        polygon:polygon::jsonb
      `),
      supabase.from('farmers').select('*'),
      supabase.from('climate_data').select('*').order('date', { ascending: true }),
      supabase.from('pest_monitoring').select('*').order('detected_at', { ascending: true })
    ]);

    // Check for errors
    if (plotsRes.error) throw plotsRes.error;
    if (farmersRes.error) throw farmersRes.error;
    if (climateRes.error) throw climateRes.error;
    if (pestRes.error) throw pestRes.error;

    // Process data for analytics
    const plotsData = plotsRes.data || [];
    const farmersData = farmersRes.data || [];
    const climateData = climateRes.data || [];
    const pestData = pestRes.data || [];

    // Prepare analytics data
    const analyticsData = {
      // Summary counts
      totalPlots: plotsData.length,
      totalFarmers: farmersData.length,
      totalClimateRecords: climateData.length,
      totalPestRecords: pestData.length,
      
      // Climate data aggregated by month
      climateByMonth: processClimateDataByMonth(climateData),
      
      // Pest data aggregated by type
      pestByType: processPestDataByType(pestData),
      
      // Farmer data aggregated by group
      farmersByGroup: processFarmersByGroup(farmersData),
      
      // Activity data (simplified)
      activityData: processActivityData(climateData, pestData)
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}

// Process climate data aggregated by month
function processClimateDataByMonth(climateData: ClimateData[]) {
  const monthlyData: Record<string, { temperature: number; rainfall: number; count: number }> = {};
  
  climateData.forEach(record => {
    const date = new Date(record.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { temperature: 0, rainfall: 0, count: 0 };
    }
    
    monthlyData[monthYear].temperature += record.temperature_celsius;
    monthlyData[monthYear].rainfall += record.rainfall_mm;
    monthlyData[monthYear].count += 1;
  });
  
  // Calculate averages
  return Object.entries(monthlyData).map(([month, data]) => ({
    month: month,
    temperature: data.count > 0 ? data.temperature / data.count : 0,
    rainfall: data.count > 0 ? data.rainfall / data.count : 0
  })).slice(-12); // Last 12 months
}

// Process pest data aggregated by type
function processPestDataByType(pestData: PestData[]) {
  const pestTypeCount: Record<string, number> = {};
  
  pestData.forEach(record => {
    const pestType = record.threat_type || 'Unknown';
    pestTypeCount[pestType] = (pestTypeCount[pestType] || 0) + 1;
  });
  
  return Object.entries(pestTypeCount).map(([name, value]) => ({
    name,
    value
  }));
}

// Process farmers aggregated by group
function processFarmersByGroup(farmersData: Farmer[]) {
  const groupCount: Record<string, number> = {};
  
  farmersData.forEach(farmer => {
    const group = farmer.farmer_group || 'Tidak Ada Kelompok';
    groupCount[group] = (groupCount[group] || 0) + 1;
  });
  
  return Object.entries(groupCount).map(([group, count]) => ({
    group,
    count
  }));
}

// Process activity data (simplified)
function processActivityData(climateData: ClimateData[], pestData: PestData[]) {
  // Combine and sort data by date
  const combinedData = [
    ...climateData.map(item => ({ date: item.date, type: 'climate' })),
    ...pestData.map(item => ({ date: item.detected_at, type: 'pest' }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group by month
  const monthlyActivity: Record<string, { monitoring: number; recommendations: number }> = {};
  
  combinedData.forEach(item => {
    const date = new Date(item.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyActivity[monthYear]) {
      monthlyActivity[monthYear] = { monitoring: 0, recommendations: 0 };
    }
    
    if (item.type === 'climate') {
      monthlyActivity[monthYear].monitoring += 1;
    } else if (item.type === 'pest') {
      monthlyActivity[monthYear].recommendations += 1;
    }
  });
  
  return Object.entries(monthlyActivity).map(([month, data]) => ({
    month,
    monitoring: data.monitoring,
    recommendations: data.recommendations
  })).slice(-6); // Last 6 months
}