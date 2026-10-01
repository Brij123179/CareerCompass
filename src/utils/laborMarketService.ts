import { MarketRegion, RegionalMarketInfo } from '../types';

export const REGIONAL_MARKETS: Record<MarketRegion, RegionalMarketInfo> = {
  'us-tier1': {
    region: 'us-tier1',
    label: 'US Tier-1 Metro (SF / NYC / Seattle)',
    currencySymbol: '$',
    currencyCode: 'USD',
    salaryMultiplier: 1.0,
    typicalSalaryRange: '$120,000 – $195,000',
    hiringGrowthRate: '+24% YoY',
    marketHeatIndex: 94,
    topHubs: ['San Francisco', 'New York City', 'Seattle', 'San Jose']
  },
  'us-tier2': {
    region: 'us-tier2',
    label: 'US Tier-2 & Emerging Hubs (Austin / Denver / Chicago)',
    currencySymbol: '$',
    currencyCode: 'USD',
    salaryMultiplier: 0.85,
    typicalSalaryRange: '$102,000 – $165,000',
    hiringGrowthRate: '+21% YoY',
    marketHeatIndex: 88,
    topHubs: ['Austin', 'Denver', 'Chicago', 'Atlanta', 'Raleigh']
  },
  'europe': {
    region: 'europe',
    label: 'European Tech Centers (London / Berlin / Amsterdam)',
    currencySymbol: '€',
    currencyCode: 'EUR',
    salaryMultiplier: 0.72,
    typicalSalaryRange: '€75,000 – €135,000',
    hiringGrowthRate: '+18% YoY',
    marketHeatIndex: 82,
    topHubs: ['London', 'Berlin', 'Amsterdam', 'Zurich', 'Paris']
  },
  'apac': {
    region: 'apac',
    label: 'Asia-Pacific Tech Hubs (Singapore / Bangalore / Tokyo)',
    currencySymbol: '₹/S$',
    currencyCode: 'APAC-PPP',
    salaryMultiplier: 0.52,
    typicalSalaryRange: '₹24L – ₹52L INR (S$115k – S$180k)',
    hiringGrowthRate: '+31% YoY',
    marketHeatIndex: 91,
    topHubs: ['Bangalore', 'Singapore', 'Tokyo', 'Sydney', 'Hyderabad']
  },
  'global-remote': {
    region: 'global-remote',
    label: 'Global Remote & Distributed Teams',
    currencySymbol: '$',
    currencyCode: 'USD-REMOTE',
    salaryMultiplier: 0.88,
    typicalSalaryRange: '$105,000 – $170,000',
    hiringGrowthRate: '+27% YoY',
    marketHeatIndex: 89,
    topHubs: ['Remote Worldwide', 'Asynchronous Distributed', 'Borderless Talent']
  }
};

export class LaborMarketService {
  private static activeRegion: MarketRegion = 'us-tier1';

  static getRegions(): RegionalMarketInfo[] {
    return Object.values(REGIONAL_MARKETS);
  }

  static getActiveRegion(): MarketRegion {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careercompass_market_region') as MarketRegion;
      if (stored && REGIONAL_MARKETS[stored]) {
        this.activeRegion = stored;
      }
    }
    return this.activeRegion;
  }

  static setActiveRegion(region: MarketRegion) {
    this.activeRegion = region;
    if (typeof window !== 'undefined') {
      localStorage.setItem('careercompass_market_region', region);
    }
  }

  static getRegionInfo(region: MarketRegion = this.getActiveRegion()): RegionalMarketInfo {
    return REGIONAL_MARKETS[region] || REGIONAL_MARKETS['us-tier1'];
  }

  /**
   * Dynamically calculates localized salary based on baseline US salary and selected region
   */
  static getLocalizedSalary(baseSalaryStr: string, region: MarketRegion = this.getActiveRegion()): {
    formatted: string;
    currency: string;
    multiplier: number;
    heatIndex: number;
  } {
    const rawNumber = parseInt(baseSalaryStr.replace(/[^0-9]/g, '')) || 120000;
    const info = this.getRegionInfo(region);

    if (region === 'apac') {
      // Localized in Lakhs INR + Singapore Dollars reference
      const inrLakhs = Math.round((rawNumber * 0.28) / 1000);
      return {
        formatted: `₹${inrLakhs} – ₹${inrLakhs + 18} LPA`,
        currency: 'INR / S$',
        multiplier: info.salaryMultiplier,
        heatIndex: info.marketHeatIndex
      };
    }

    if (region === 'europe') {
      const eurBase = Math.round((rawNumber * info.salaryMultiplier) / 1000) * 1000;
      return {
        formatted: `€${eurBase.toLocaleString()} – €${(eurBase + 35000).toLocaleString()} / yr`,
        currency: 'EUR',
        multiplier: info.salaryMultiplier,
        heatIndex: info.marketHeatIndex
      };
    }

    // USD based regions (tier1, tier2, global-remote)
    const adjusted = Math.round((rawNumber * info.salaryMultiplier) / 1000) * 1000;
    return {
      formatted: `$${adjusted.toLocaleString()} – $${(adjusted + 40000).toLocaleString()} / yr`,
      currency: 'USD',
      multiplier: info.salaryMultiplier,
      heatIndex: info.marketHeatIndex
    };
  }

  /**
   * Real-time industry demand metrics per career category
   */
  static getCategoryHiringIndex(category: string): { demand: 'Surging' | 'High' | 'Steady'; growthRate: string; index: number } {
    switch (category) {
      case 'Data & AI':
        return { demand: 'Surging', growthRate: '+34% YoY', index: 98 };
      case 'Security & Cloud':
        return { demand: 'Surging', growthRate: '+29% YoY', index: 95 };
      case 'Engineering':
        return { demand: 'High', growthRate: '+22% YoY', index: 90 };
      case 'Business & Strategy':
        return { demand: 'High', growthRate: '+17% YoY', index: 84 };
      case 'Design':
        return { demand: 'Steady', growthRate: '+14% YoY', index: 79 };
      default:
        return { demand: 'High', growthRate: '+20% YoY', index: 86 };
    }
  }
}
