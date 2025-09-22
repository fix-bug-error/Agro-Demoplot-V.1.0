"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plot } from "@/types";
import { LandPlot } from "lucide-react";

interface MobilePlotSelectorProps {
  plots: Plot[];
  selectedPlot: number | null;
  onPlotSelect: (plotId: number) => void;
}

export function MobilePlotSelector({ plots, selectedPlot, onPlotSelect }: MobilePlotSelectorProps) {
  const currentPlot = plots.find(p => p.id === selectedPlot);

  if (plots.length === 0) {
    return null;
  }

  // Sort plots by name to ensure Demoplot 1, Demoplot 2, etc. order
  const sortedPlots = [...plots].sort((a, b) => {
    // Extract numbers from plot names like "Demoplot 1", "Demoplot 2", etc.
    const numA = a.plot_name.match(/\d+/);
    const numB = b.plot_name.match(/\d+/);
    
    if (numA && numB) {
      return parseInt(numA[0]) - parseInt(numB[0]);
    }
    
    // If no numbers found, sort alphabetically
    return a.plot_name.localeCompare(b.plot_name);
  });

  return (
    <div className="flex items-center gap-2">
      <LandPlot className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={selectedPlot?.toString() || ""} 
        onValueChange={(value) => onPlotSelect(Number(value))}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Select Plot" />
        </SelectTrigger>
        <SelectContent>
          {sortedPlots.map((plot) => (
            <SelectItem key={plot.id} value={plot.id.toString()}>
              {plot.plot_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}