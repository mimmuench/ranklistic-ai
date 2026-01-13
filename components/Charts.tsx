import React from 'react';

// --- RADAR CHART (SPIDER GRAPH) ---
interface RadarData {
  label: string;
  score: number; // 0-10
}

export const RadarChart: React.FC<{ data: RadarData[]; size?: number }> = ({ data, size = 300 }) => {
  const center = size / 2;
  const radius = (size / 2) - 40; // Padding for labels
  const angleSlice = (Math.PI * 2) / data.length;

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleSlice - Math.PI / 2; // Start from top
    const r = (value / 10) * radius; // Normalize 0-10 score to radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Build the polygon path string
  const pathData = data.map((d, i) => {
    const { x, y } = getCoordinates(d.score, i);
    return `${x},${y}`;
  }).join(' ');

  // Grid levels (2, 4, 6, 8, 10)
  const levels = [2, 4, 6, 8, 10];

  return (
    <div className="relative flex justify-center items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid (Concentric Polygons) */}
        {levels.map((level) => (
          <polygon
            key={level}
            points={data.map((_, i) => {
              const { x, y } = getCoordinates(level, i);
              return `${x},${y}`;
            }).join(' ')}
            fill="transparent"
            stroke="#374151" // gray-700
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Axes (Lines from center) */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(10, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#374151"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon (Filled Area) */}
        <polygon
          points={pathData}
          fill="rgba(249, 115, 22, 0.2)" // Orange with opacity
          stroke="#F97316" // Orange-500
          strokeWidth="2"
        />

        {/* Data Points (Dots) */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(d.score, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#F97316"
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{d.label}: {d.score}/10</title>
            </circle>
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          // Push labels out a bit further than radius
          const angle = i * angleSlice - Math.PI / 2;
          const labelRadius = radius + 25;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400 text-[10px] uppercase font-bold tracking-wider"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// --- GAUGE CHART (SPEEDOMETER) ---
export const GaugeChart: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  // Score 0-10
  const percentage = score * 10;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let color = '#ef4444'; // Red
  if (score > 4) color = '#eab308'; // Yellow
  if (score > 7) color = '#22c55e'; // Green

  return (
    <div className="relative w-32 h-32 flex flex-col items-center justify-center">
      <svg className="transform -rotate-90 w-32 h-32">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#1f2937" // gray-800
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-gray-400 uppercase">{label}</span>
      </div>
    </div>
  );
};

// --- SIMPLE BAR CHART ---
export const SimpleBar: React.FC<{ value: string; label: string; type: 'demand' | 'competition' }> = ({ value, label, type }) => {
    let width = '10%';
    let color = 'bg-gray-500';
    
    // Normalize "High/Medium/Low" to width & color
    const val = value.toLowerCase();
    
    if (type === 'demand') {
        if (val === 'high') { width = '90%'; color = 'bg-green-500'; }
        else if (val === 'medium') { width = '60%'; color = 'bg-blue-500'; }
        else { width = '30%'; color = 'bg-gray-500'; }
    } else {
        // Competition (Inverse: Low competition is good/green)
        if (val === 'low') { width = '30%'; color = 'bg-green-500'; }
        else if (val === 'medium') { width = '60%'; color = 'bg-yellow-500'; }
        else { width = '90%'; color = 'bg-red-500'; }
    }

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-bold">{value}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-full rounded-full ${color} transition-all duration-1000`} 
                    style={{ width }}
                ></div>
            </div>
        </div>
    );
};