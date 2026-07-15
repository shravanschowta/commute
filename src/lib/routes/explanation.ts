import type { CommuteRoute, TransportSegment } from "@/types/route";

export interface DetailedExplanation {
  narrative: string;
  steps: string[];
  insights: string[];
}

export function generateRouteExplanation(route: CommuteRoute): DetailedExplanation {
  const steps: string[] = [];
  const insights: string[] = [];
  const segments = route.transportSegments;

  if (segments.length === 0) {
    return {
      narrative: "No journey details available.",
      steps: [],
      insights: [],
    };
  }

  // Generate steps
  segments.forEach((seg, index) => {
    const isFirst = index === 0;
    const isLast = index === segments.length - 1;

    let stepText = "";
    if (seg.mode === "walk") {
      const distStr = seg.distanceMeters >= 1000 
        ? `${(seg.distanceMeters / 1000).toFixed(1)} km` 
        : `${seg.distanceMeters} m`;
      
      if (isFirst) {
        stepText = `Start by walking ${distStr} (${seg.durationMinutes} mins) from your location to ${seg.to.name}.`;
      } else if (isLast) {
        stepText = `Finally, walk the last ${distStr} (${seg.durationMinutes} mins) to arrive at ${seg.to.name}.`;
      } else {
        stepText = `Walk ${distStr} (${seg.durationMinutes} mins) to connect to ${seg.to.name}.`;
      }
    } else if (seg.mode === "metro") {
      const lineName = seg.lineOrRoute || "Metro";
      stepText = `Board the Namma Metro ${lineName} at ${seg.from.name} and ride to ${seg.to.name} (${seg.durationMinutes} mins).`;
    } else if (seg.mode === "bus") {
      const busName = seg.lineOrRoute || "BMTC Bus";
      stepText = `Board the BMTC bus (${busName}) at ${seg.from.name} and ride to ${seg.to.name} (${seg.durationMinutes} mins).`;
    } else if (seg.mode === "uber") {
      stepText = `Book and board an Uber from ${seg.from.name} directly to ${seg.to.name} (${seg.durationMinutes} mins).`;
    } else {
      stepText = `Take ${seg.mode} transport from ${seg.from.name} to ${seg.to.name} (${seg.durationMinutes} mins).`;
    }
    steps.push(stepText);
  });

  // Generate Narrative
  const modesUsed = Array.from(new Set(segments.map(s => s.mode)));
  let narrative = "";

  const hasMetro = modesUsed.includes("metro");
  const hasBus = modesUsed.includes("bus");

  if (modesUsed.includes("uber") && segments.length === 1) {
    narrative = `This is a direct cab ride taking approximately ${route.totalTimeMinutes} minutes. It offers maximum comfort but is the most expensive option.`;
  } else {
    const walkMeters = route.walkingDistanceMeters;
    const walkMinutes = segments
      .filter((s) => s.mode === "walk")
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    narrative = `A multi-modal commute combining ${modesUsed.filter(m => m !== "walk").join(" and ")} transit. `;
    narrative += `It will take around ${route.totalTimeMinutes} minutes and cost ₹${route.totalCostInr}. `;
    narrative += `You'll walk a total of ${walkMeters >= 1000 ? `${(walkMeters / 1000).toFixed(1)} km` : `${walkMeters} m`} (${walkMinutes} mins) across the entire journey.`;
  }

  // Generate Insights
  const totalWalk = route.walkingDistanceMeters;
  if (totalWalk < 500 && !modesUsed.includes("uber")) {
    insights.push("⚡ Super convenient connection with very minimal walking (< 500m).");
  }
  if (route.carbonSavedKg > 0.8) {
    insights.push(`🌱 Eco-friendly route: Saves ${route.carbonSavedKg} kg of CO2 compared to a private car.`);
  }
  if (route.totalCostInr < 40 && (hasMetro || hasBus)) {
    insights.push("💰 Highly cost-effective public transport route.");
  }
  if (route.interchanges > 1) {
    insights.push("⚠️ Multiple transfers required. Pay close attention to connections.");
  }

  return {
    narrative,
    steps,
    insights,
  };
}
