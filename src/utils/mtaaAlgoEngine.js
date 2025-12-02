// src/utils/mtaaAlgoEngine.js

// --- HOUSEHUNT PROPRIETARY ALGORITHM ENGINE (FRONTEND MIRROR) ---
// This engine calculates the "Mtaa Score" and "Cost of Living" 
// based on weighted consensus and time-decayed user reviews.

const WEIGHTS = {
  WATER: 0.35,        // Water is life in Nairobi (Highest Weight)
  SECURITY: 0.30,     // Crucial for livability
  ACCESSIBILITY: 0.20,// Roads & Fare
  AMENITIES: 0.15     // Convenience
};

// --- 1. SCORING MAPS (The Knowledge Base) ---
const SCORES = {
  WATER: {
    '24/7 Council Water': 100,
    'Rationed (Weekly)': 65, // Manageable with tanks
    'Borehole Only (Salty)': 45,
    'Frequent Shortages': 10
  },
  ROAD: {
    'Tarmac': 100,
    'Cabro': 95,
    'Murram (All Weather)': 60,
    'Rough Road': 30,
    'Muddy when raining': 10
  },
  SECURITY_NIGHT: {
    'Very Safe': 100,
    'Safe until 10pm': 75,
    'Risky after dark': 40,
    'Unsafe': 10
  },
  NOISE: {
    'Silent': 100,
    'Moderate': 70,
    'Noisy (Club/Road)': 30
  }
};

// --- 2. TIME DECAY FUNCTION ---
// Reviews lose 15% relevance every 3 months.
// This ensures the "Mtaa Score" reflects the CURRENT reality.
const calculateTimeWeight = (date) => {
  const now = new Date();
  const reviewDate = new Date(date);
  const diffMonths = (now.getFullYear() - reviewDate.getFullYear()) * 12 + (now.getMonth() - reviewDate.getMonth());
  
  // Decay formula: Weight = 1 / (1 + 0.15 * months)
  return Math.max(0.1, 1 / (1 + 0.15 * diffMonths));
};

// --- 3. CORE CALCULATOR ---
export const calculateAdvancedMtaaScore = (experiences) => {
  if (!experiences || experiences.length === 0) return null;

  let scoreWater = 0, scoreSecurity = 0, scoreAccess = 0, scoreAmenities = 0;
  let totalWeight = 0;

  // Aggregate Data Buckets
  let rentSum = 0, rentCount = 0;
  let farePeakSum = 0, fareOffPeakSum = 0, fareCount = 0;

  experiences.forEach(exp => {
    const timeWeight = calculateTimeWeight(exp.createdAt);
    
    // A. Water Score
    const waterVal = SCORES.WATER[exp.utilities?.waterConsistency] || 0;
    scoreWater += (waterVal * timeWeight);

    // B. Security Score (Base Rating + Night Factor)
    const baseSec = (exp.security?.rating || 3) * 20; // Convert 1-5 to 0-100
    const nightSec = SCORES.SECURITY_NIGHT[exp.security?.safeAtNight] || 50;
    const combinedSec = (baseSec * 0.6) + (nightSec * 0.4); // 60% Rating, 40% Night Safety
    scoreSecurity += (combinedSec * timeWeight);

    // C. Accessibility Score
    const roadVal = SCORES.ROAD[exp.accessibility?.roadCondition] || 50;
    scoreAccess += (roadVal * timeWeight);

    // D. Amenities Score (Bonus Points)
    let amenityPoints = 50; // Start at average
    if (exp.amenities?.proximityToMamaMboga) amenityPoints += 15;
    if (exp.amenities?.proximityToKiosk) amenityPoints += 10;
    if (exp.amenities?.noiseLevel === 'Silent') amenityPoints += 25;
    if (exp.amenities?.noiseLevel === 'Noisy (Club/Road)') amenityPoints -= 25;
    scoreAmenities += (amenityPoints * timeWeight);

    // E. Cost Data (Unweighted averages, but filtered for valid numbers)
    if (exp.rentalDetails?.monthlyRent > 0) {
      rentSum += exp.rentalDetails.monthlyRent;
      rentCount++;
    }
    
    // Fare Logic
    const peakFare = exp.accessibility?.matatuFarePeak;
    if (peakFare > 0) {
      farePeakSum += peakFare;
      // Use reported offpeak or fallback to peak if missing
      fareOffPeakSum += (exp.accessibility.matatuFareOffPeak || peakFare);
      fareCount++;
    }

    totalWeight += timeWeight;
  });

  // Prevent divide by zero
  if (totalWeight === 0) return null;

  // Final Calculations
  const finalWater = scoreWater / totalWeight;
  const finalSecurity = scoreSecurity / totalWeight;
  const finalAccess = scoreAccess / totalWeight;
  const finalAmenities = scoreAmenities / totalWeight;

  const mtaaIndex = Math.round(
    (finalWater * WEIGHTS.WATER) +
    (finalSecurity * WEIGHTS.SECURITY) +
    (finalAccess * WEIGHTS.ACCESSIBILITY) +
    (finalAmenities * WEIGHTS.AMENITIES)
  );

  return {
    mtaaIndex, // The "Master Score" (0-100)
    breakdown: {
      water: Math.round(finalWater),
      security: Math.round(finalSecurity),
      roads: Math.round(finalAccess),
      vibe: Math.round(finalAmenities)
    },
    averages: {
      rent: rentCount > 0 ? Math.round(rentSum / rentCount) : 0,
      commutePeak: fareCount > 0 ? Math.round(farePeakSum / fareCount) : 0,
      commuteOffPeak: fareCount > 0 ? Math.round(fareOffPeakSum / fareCount) : 0
    }
  };
};

// --- 4. COST OF LIVING PROJECTION ---
export const calculateProjectedCostOfLiving = (mtaaData, lifestyle = 'Standard') => {
  if (!mtaaData || !mtaaData.averages) return null;

  const avgRent = mtaaData.averages.rent;
  const dailyFare = (mtaaData.averages.commutePeak + mtaaData.averages.commuteOffPeak); // Round trip
  const monthlyTransport = dailyFare * 22; // 22 Work days

  let foodBase = 15000; 
  if (lifestyle === 'Budget') foodBase = 10000;
  if (lifestyle === 'Premium') foodBase = 25000;

  const estimatedTotal = avgRent + monthlyTransport + foodBase;

  return {
    estimatedTotal,
    breakdown: {
      rent: avgRent,
      transport: monthlyTransport,
      foodAndUtilities: foodBase
    }
  };
};