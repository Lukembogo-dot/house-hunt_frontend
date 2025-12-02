// --- HOUSEHUNT PROPRIETARY ALGORITHM ENGINE ---
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
  WATER_CONSISTENCY: {
    '24/7': 100,
    '24/7 Council Water': 100, // Backward compatibility
    'Rationed (Weekly)': 60,
    'Frequent Shortages': 10,
    'Rare/Unpredictable': 20
  },
  // Multiplier: How drinkable/usable is it?
  WATER_QUALITY_PENALTY: {
    'Fresh': 1.0,          // Perfect
    'Slightly Salty': 0.8, // 20% Penalty (Usable for washing)
    'Salty': 0.5           // 50% Penalty (Hard to live with)
  },
  ROAD: {
    'Tarmac': 100,
    'Cabro': 95,
    'Murram (All Weather)': 65,
    'Rough Road': 30
  },
  SECURITY_NIGHT: {
    'Very Safe': 100,
    'Safe until 10pm': 75,
    'Risky after dark': 40,
    'Unsafe': 10,
    'Unsafe (Avoid night walking)': 10
  }
};

// --- 2. TIME DECAY FUNCTION ---
// Reviews lose 15% relevance every 3 months.
const calculateTimeWeight = (date) => {
  const now = new Date();
  const reviewDate = new Date(date);
  const diffMonths = (now.getFullYear() - reviewDate.getFullYear()) * 12 + (now.getMonth() - reviewDate.getMonth());
  return Math.max(0.1, 1 / (1 + 0.15 * diffMonths));
};

// --- 3. CORE CALCULATOR ---
export const calculateAdvancedMtaaScore = (experiences) => {
  if (!experiences || experiences.length === 0) return null;

  let scoreWater = 0, scoreSecurity = 0, scoreAccess = 0, scoreAmenities = 0;
  let totalWeight = 0;
  
  let rentSum = 0, rentCount = 0;
  let farePeakSum = 0, fareOffPeakSum = 0, fareCount = 0;

  experiences.forEach(exp => {
    const timeWeight = calculateTimeWeight(exp.createdAt);
    
    // --- A. WATER SCORE (Advanced Logic) ---
    // 1. Base Score from Consistency
    let waterBase = SCORES.WATER_CONSISTENCY[exp.utilities?.waterConsistency] || 50;
    
    // 2. Adjust for Rationing Schedule (If Rationed)
    const schedule = exp.utilities?.waterRationingSchedule;
    if (schedule === '1-2 Days/Week') waterBase += 10; // Not too bad
    if (schedule === 'Weekends Only') waterBase += 5;  // Predictable
    if (schedule === '3-4 Days/Week') waterBase -= 10; // Annoying
    if (schedule === 'Weekdays Only') waterBase -= 5;

    // 3. Apply Quality Penalty
    const qualityMultiplier = SCORES.WATER_QUALITY_PENALTY[exp.utilities?.waterQuality] || 1.0;
    
    // Final Water Calculation
    scoreWater += (waterBase * qualityMultiplier * timeWeight);


    // --- B. SECURITY SCORE ---
    // 1. Base Rating (User's 1-5 Star Rating)
    const baseSec = (exp.security?.rating || 3) * 20; 
    
    // 2. Night Safety Factor
    const nightSec = SCORES.SECURITY_NIGHT[exp.security?.safeAtNight] || 50;
    
    // 3. Feature Bonus (Tangible Security)
    let featureBonus = 0;
    const feats = exp.security?.features || [];
    if (feats.includes('Electric Fence')) featureBonus += 5;
    if (feats.includes('24h Guard') || feats.includes('Night Guard')) featureBonus += 5;
    if (feats.includes('Biometric') || feats.includes('Biometric Entry')) featureBonus += 5;
    if (feats.includes('CCTV')) featureBonus += 3;

    // Weighted Mix: 60% Perception (Rating) + 40% Night Reality + Bonuses
    const combinedSec = Math.min(100, (baseSec * 0.6) + (nightSec * 0.4) + featureBonus);
    scoreSecurity += (combinedSec * timeWeight);


    // --- C. ACCESSIBILITY SCORE ---
    let roadScore = SCORES.ROAD[exp.accessibility?.roadCondition] || 50;
    
    // Rainy Season Reality Check
    const rainIssues = exp.accessibility?.rainySeasonFeatures || [];
    if (rainIssues.includes('Flooded')) roadScore -= 30; // Major penalty
    if (rainIssues.includes('Muddy')) roadScore -= 20;
    if (rainIssues.includes('Slippery')) roadScore -= 10;
    if (rainIssues.includes('Passable')) roadScore += 10;

    scoreAccess += (Math.max(0, roadScore) * timeWeight);


    // --- D. AMENITIES & VIBE SCORE ---
    let amenityPoints = 50;
    
    // Food Access
    if (exp.amenities?.supermarketNearby) amenityPoints += 15;
    if (exp.amenities?.foodAmenities?.length > 2) amenityPoints += 10; // Vibrant street food scene
    
    // Noise Factor
    const noise = exp.amenities?.noiseLevel;
    if (noise === 'Silent') amenityPoints += 25;
    if (noise === 'Moderate') amenityPoints += 10;
    if (noise && noise.includes('Noisy')) amenityPoints -= 25;

    scoreAmenities += (amenityPoints * timeWeight);


    // --- E. AVERAGES (Rent & Fare) ---
    if (exp.rentalDetails?.monthlyRent > 0) {
      rentSum += exp.rentalDetails.monthlyRent;
      rentCount++;
    }
    const peakFare = exp.accessibility?.matatuFarePeak;
    if (peakFare > 0) {
        farePeakSum += peakFare;
        // Use reported offpeak or fallback to peak if missing
        fareOffPeakSum += (exp.accessibility?.matatuFareOffPeak || peakFare);
        fareCount++;
    }

    totalWeight += timeWeight;
  });

  if (totalWeight === 0) return null;

  // Normalize Scores
  const finalWater = scoreWater / totalWeight;
  const finalSecurity = scoreSecurity / totalWeight;
  const finalAccess = scoreAccess / totalWeight;
  const finalAmenities = scoreAmenities / totalWeight;

  // Calculate Master Index
  const mtaaIndex = Math.round(
    (finalWater * WEIGHTS.WATER) +
    (finalSecurity * WEIGHTS.SECURITY) +
    (finalAccess * WEIGHTS.ACCESSIBILITY) +
    (finalAmenities * WEIGHTS.AMENITIES)
  );

  return {
    mtaaIndex,
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
export const calculateProjectedCostOfLiving = (mtaaStats, lifestyle = 'Standard') => {
  if (!mtaaStats || !mtaaStats.averages) return { estimatedTotal: 0 };

  const avgRent = mtaaStats.averages.rent || 0;
  // Estimate 22 working days x Round Trip
  const monthlyTransport = (mtaaStats.averages.commutePeak + mtaaStats.averages.commuteOffPeak) * 22 || 0; 

  let foodBase = 15000; 
  if (lifestyle === 'Budget') foodBase = 10000;
  if (lifestyle === 'Premium') foodBase = 25000;

  return {
    estimatedTotal: avgRent + monthlyTransport + foodBase,
    breakdown: {
      rent: avgRent,
      transport: monthlyTransport,
      foodAndUtilities: foodBase
    }
  };
};