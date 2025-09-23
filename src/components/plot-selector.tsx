"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plot } from "@/types";
import { LandPlot, ChevronDown } from "lucide-react";

interface PlotSelectorProps {
  plots: Plot[];
  selectedPlot: number | null;
  onPlotSelect: (plotId: number) => void;
}

export function PlotSelector({ plots, selectedPlot, onPlotSelect }: PlotSelectorProps) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 px-3 py-2 h-9 font-normal border-border hover:bg-accent hover:text-accent-foreground w-[160px]"
        >
          <LandPlot className="h-4 w-4" />
          <span className="truncate max-w-[120px]">
            {currentPlot ? currentPlot.plot_name : "Select Plot"}
          </span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto"
      >
        {sortedPlots.map((plot) => (
          <DropdownMenuItem
            key={plot.id}
            onSelect={() => onPlotSelect(plot.id)}
            className="py-2"
          >
            {plot.plot_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}