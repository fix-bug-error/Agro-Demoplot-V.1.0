export type Plot = {
  id: number;
  farmer_id: number;
  plot_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  map_image_url: string;
  demoplot_hectares?: number;
  altitude?: number;
  list_of_plants?: string;
  number_of_coffee?: number;
  number_of_shade_trees?: number;
  created_at?: string;
  updated_at?: string;
  polygon?: Record<string, unknown> | unknown[] | string | null;
};

export type Farmer = {
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

export type ClimateData = {
  id: number;
  plot_id: number;
  date: string;
  temperature_celsius: number;
  rainfall_mm: number;
  humidity_percent: number;
  wind_speed_kmh: number;
};

export type PestMonitoring = {
  id: number;
  plot_id: number;
  threat_type: string;
  threat_name: string;
  scientific_name: string;
  observation_date: string;
  status: string;
  description: string;
  recommended_action: string;
  image_url: string | null;
  detected_at: string;
};

export type AIRecommendation = {
  id: number;
  plot_id: number;
  recommendation_text: string;
  recommendation_date: string;
  priority_level: string;
  category: string;
};