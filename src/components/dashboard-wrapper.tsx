"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PlotSelector } from "@/components/plot-selector";
import { MobilePlotSelector } from "@/components/mobile-plot-selector";
import type { Plot } from "@/types";

import { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

type DashboardWrapperProps = {
  children: ReactNode;
  plots: Plot[];
  selectedPlot: number | null;
  onPlotSelect: (plotId: number) => void;
};

export function DashboardWrapper({ 
  children, 
  plots, 
  selectedPlot, 
  onPlotSelect 
}: DashboardWrapperProps) {
  const [plotSelectorContainer, setPlotSelectorContainer] = useState<HTMLElement | null>(null);
  const [mobilePlotSelectorContainer, setMobilePlotSelectorContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Set the container elements after component mounts
    const container = document.getElementById('plot-selector-container');
    const mobileContainer = document.getElementById('mobile-plot-selector-container');
    setPlotSelectorContainer(container);
    setMobilePlotSelectorContainer(mobileContainer);
    
    // No cleanup needed as createPortal handles this automatically
  }, [plots, selectedPlot]);
  
  return (
    <TooltipProvider>
      <>
        {children}
        {/* Desktop Plot Selector */}
        {plotSelectorContainer && plots.length > 0 && createPortal(
          <PlotSelector 
            plots={plots} 
            selectedPlot={selectedPlot} 
            onPlotSelect={onPlotSelect} 
          />,
          plotSelectorContainer
        )}
        {/* Mobile Plot Selector */}
        {mobilePlotSelectorContainer && plots.length > 0 && createPortal(
          <MobilePlotSelector 
            plots={plots} 
            selectedPlot={selectedPlot} 
            onPlotSelect={onPlotSelect} 
          />,
          mobilePlotSelectorContainer
        )}
      </>
    </TooltipProvider>
  );
}