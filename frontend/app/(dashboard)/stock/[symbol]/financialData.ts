// Balance Sheet & Management Call data for stock detail pages

export interface QuarterlyData {
    quarter: string;
    revenue: number;
    netProfit: number;
    operatingMargin: number;
    eps: number;
}

export interface YearlyData {
    year: string;
    revenue: number;
    netProfit: number;
    totalAssets: number;
    totalDebt: number;
    equity: number;
    operatingCashFlow: number;
}

export interface EarningsCall {
    quarter: string;
    date: string;
    keyPromises: string[];
    deliveryStatus: "met" | "partially_met" | "missed";
    summary: string;
    highlights: string[];
}

export interface FinancialProfile {
    quarterly: QuarterlyData[];
    yearly: YearlyData[];
    earningsCalls: EarningsCall[];
}

const FINANCIALS: Record<string, FinancialProfile> = {
    RELIANCE: {
        quarterly: [
            { quarter: "Q3 FY25", revenue: 241068, netProfit: 21930, operatingMargin: 17.2, eps: 32.4 },
            { quarter: "Q2 FY25", revenue: 235481, netProfit: 19878, operatingMargin: 16.8, eps: 29.4 },
            { quarter: "Q1 FY25", revenue: 230513, netProfit: 17448, operatingMargin: 15.9, eps: 25.8 },
            { quarter: "Q4 FY24", revenue: 226312, netProfit: 18952, operatingMargin: 16.5, eps: 28.0 },
        ],
        yearly: [
            { year: "FY25 (9M)", revenue: 707062, netProfit: 59256, totalAssets: 1600000, totalDebt: 310000, equity: 720000, operatingCashFlow: 95000 },
            { year: "FY24", revenue: 894542, netProfit: 73670, totalAssets: 1520000, totalDebt: 295000, equity: 680000, operatingCashFlow: 118000 },
        ],
        earningsCalls: [
            { quarter: "Q3 FY25", date: "Jan 2025", keyPromises: ["5G subscriber target 500M by Mar 2025", "New energy EBITDA breakeven by FY26", "Retail store expansion to 20,000"], deliveryStatus: "partially_met", summary: "Jio at 470M subs (94% of target). New energy on track. Retail at 18,500 stores.", highlights: ["Jio ARPU grew 12% QoQ post tariff hike", "Digital services EBITDA margin crossed 55%", "O2C segment impacted by weak GRMs"] },
            { quarter: "Q2 FY25", date: "Oct 2024", keyPromises: ["Jio tariff hike implementation", "Retail revenue growth 25% YoY", "Commission green hydrogen pilot plant"], deliveryStatus: "met", summary: "All 3 promises delivered. Tariff hike drove 15% ARPU increase. Retail grew 27%.", highlights: ["Tariff hike boosted wireless ARPU to ₹195", "Reliance Retail revenue surged 27% YoY", "Green hydrogen pilot commissioned in Jamnagar"] },
            { quarter: "Q1 FY25", date: "Jul 2024", keyPromises: ["Launch Jio AirFiber in 500 cities", "Improve O2C margins to 8%+", "Complete Shein JV store launch"], deliveryStatus: "partially_met", summary: "AirFiber in 430 cities. O2C margins at 7.2%. Shein launch delayed.", highlights: ["AirFiber gained 2M subscribers", "Retail added 1,200 new stores in Q1", "O2C margins pressured by global crude volatility"] },
            { quarter: "Q4 FY24", date: "Apr 2024", keyPromises: ["Full-year dividend increase", "Complete Jio Financial listing milestones", "Reduce net debt by ₹15,000 Cr"], deliveryStatus: "met", summary: "Dividend up 25%. JFS milestones met. Net debt reduced ₹18,200 Cr.", highlights: ["Special dividend of ₹9/share declared", "JFS received all regulatory clearances", "Net debt-free status maintained at standalone level"] },
        ],
    },
    TCS: {
        quarterly: [
            { quarter: "Q3 FY25", revenue: 63973, netProfit: 12380, operatingMargin: 24.5, eps: 34.2 },
            { quarter: "Q2 FY25", revenue: 62613, netProfit: 11909, operatingMargin: 24.1, eps: 32.9 },
            { quarter: "Q1 FY25", revenue: 62613, netProfit: 12040, operatingMargin: 24.7, eps: 33.2 },
            { quarter: "Q4 FY24", revenue: 61237, netProfit: 12434, operatingMargin: 25.1, eps: 34.4 },
        ],
        yearly: [
            { year: "FY25 (9M)", revenue: 189199, netProfit: 36329, totalAssets: 142000, totalDebt: 3200, equity: 95000, operatingCashFlow: 42000 },
            { year: "FY24", revenue: 240567, netProfit: 46099, totalAssets: 138000, totalDebt: 2800, equity: 89000, operatingCashFlow: 52000 },
        ],
        earningsCalls: [
            { quarter: "Q3 FY25", date: "Jan 2025", keyPromises: ["Revenue growth guidance 6-8%", "Fresher hiring 40,000 in FY25", "AI-led deal wins >$2B TCV"], deliveryStatus: "partially_met", summary: "Growth at 5.3% (below lower band). Hired 35,000. AI deals at $1.8B.", highlights: ["BFSI vertical showed recovery with 3.5% QoQ growth", "Cloud services grew 28% YoY", "Attrition dropped to 12.3% from 14.1%"] },
            { quarter: "Q2 FY25", date: "Oct 2024", keyPromises: ["Margin expansion 50-100 bps", "Large deal TCV >$3B", "North America recovery"], deliveryStatus: "met", summary: "Margins expanded 60 bps. Large deals at $3.2B. NA grew 1.8% QoQ.", highlights: ["Operating margin improved to 24.1%", "Record 6 mega deals signed ($100M+ each)", "North America showed sequential improvement"] },
            { quarter: "Q1 FY25", date: "Jul 2024", keyPromises: ["Maintain 25%+ margins", "Accelerate Gen AI practice hiring", "Win 3+ mega deals"], deliveryStatus: "met", summary: "Margins at 24.7%. Hired 5,000 AI specialists. Won 4 mega deals.", highlights: ["Gen AI practice crossed 10,000 consultants", "Won landmark BFSI transformation deal in UK", "Employee utilization improved to 83%"] },
            { quarter: "Q4 FY24", date: "Apr 2024", keyPromises: ["FY25 guidance optimistic", "Dividend payout 80%+", "Launch 3 new AI platforms"], deliveryStatus: "met", summary: "Positive guidance given. Payout at 82%. Launched TCS AI.Cloud, WisdomNext 2.0, and Pace Port AI.", highlights: ["TCS AI.Cloud platform announced for enterprise", "Final dividend ₹28/share declared", "FY24 net addition: 12,000 employees"] },
        ],
    },
    HDFCBANK: {
        quarterly: [
            { quarter: "Q3 FY25", revenue: 85210, netProfit: 16735, operatingMargin: 42.1, eps: 22.1 },
            { quarter: "Q2 FY25", revenue: 82820, netProfit: 16820, operatingMargin: 41.8, eps: 22.2 },
            { quarter: "Q1 FY25", revenue: 80490, netProfit: 16175, operatingMargin: 40.9, eps: 21.3 },
            { quarter: "Q4 FY24", revenue: 78660, netProfit: 14696, operatingMargin: 39.8, eps: 19.4 },
        ],
        yearly: [
            { year: "FY25 (9M)", revenue: 248520, netProfit: 49730, totalAssets: 3650000, totalDebt: 2840000, equity: 410000, operatingCashFlow: 85000 },
            { year: "FY24", revenue: 308200, netProfit: 56730, totalAssets: 3480000, totalDebt: 2710000, equity: 385000, operatingCashFlow: 105000 },
        ],
        earningsCalls: [
            { quarter: "Q3 FY25", date: "Jan 2025", keyPromises: ["Loan growth 18-20%", "NIM stabilization at 3.5%+", "GNPA below 1.3%"], deliveryStatus: "met", summary: "Loan growth 19.2%. NIM at 3.58%. GNPA at 1.24%.", highlights: ["Retail loans grew 22% YoY", "Post-merger deposit integration completed", "Credit cost stable at 45 bps"] },
            { quarter: "Q2 FY25", date: "Oct 2024", keyPromises: ["Complete merger integration by Dec 2024", "LDR improvement to 88%", "Digital account opening 70%+"], deliveryStatus: "partially_met", summary: "Integration done. LDR at 89.5% (slightly above). Digital onboarding at 72%.", highlights: ["Merged entity fully integrated on all tech platforms", "Current account grew 15% post-merger synergies", "Rural branches expanded by 800"] },
            { quarter: "Q1 FY25", date: "Jul 2024", keyPromises: ["Post-merger NIM guidance 3.4-3.6%", "Cost-to-income below 42%", "Slippages controlled under 0.5%"], deliveryStatus: "met", summary: "NIM at 3.47%. C/I ratio at 40.9%. Slippages at 0.42%.", highlights: ["Mortgage book grew 28% to ₹7.5L Cr", "HDFC Ltd loan book fully re-priced", "No sharp deterioration in asset quality"] },
            { quarter: "Q4 FY24", date: "Apr 2024", keyPromises: ["Post-merger synergy target ₹4,000 Cr by FY26", "Branch consolidation plan", "Maintain ROA above 1.9%"], deliveryStatus: "met", summary: "On track for synergies. 200 branch consolidations done. ROA at 2.05%.", highlights: ["First full quarter as merged entity", "Combined book largest in private sector", "Technology integration roadmap announced"] },
        ],
    },
    INFY: {
        quarterly: [
            { quarter: "Q3 FY25", revenue: 41764, netProfit: 6806, operatingMargin: 21.3, eps: 16.4 },
            { quarter: "Q2 FY25", revenue: 40986, netProfit: 6506, operatingMargin: 21.1, eps: 15.7 },
            { quarter: "Q1 FY25", revenue: 39315, netProfit: 6368, operatingMargin: 21.0, eps: 15.4 },
            { quarter: "Q4 FY24", revenue: 37923, netProfit: 7969, operatingMargin: 21.7, eps: 19.2 },
        ],
        yearly: [
            { year: "FY25 (9M)", revenue: 122065, netProfit: 19680, totalAssets: 112000, totalDebt: 4800, equity: 76000, operatingCashFlow: 24500 },
            { year: "FY24", revenue: 148833, netProfit: 27234, totalAssets: 108000, totalDebt: 4200, equity: 72000, operatingCashFlow: 31000 },
        ],
        earningsCalls: [
            { quarter: "Q3 FY25", date: "Jan 2025", keyPromises: ["Revenue growth guidance raised to 4.5-5%", "Margin band 20-22%", "Large deal TCV $4B+"], deliveryStatus: "met", summary: "Growth at 4.8%. Margins at 21.3%. Large deals at $4.3B.", highlights: ["Guidance raised for 2nd consecutive quarter", "Strong deal pipeline in financial services", "Topaz AI platform adoption accelerating"] },
            { quarter: "Q2 FY25", date: "Oct 2024", keyPromises: ["Improve deal conversion rate", "Expand Europe revenue share", "Launch 2 Gen AI industry solutions"], deliveryStatus: "met", summary: "Conversion up 15%. Europe now 32% of revenue. Launched AI solutions for BFSI and retail.", highlights: ["European business grew 8% QoQ", "Won $1.5B Telco transformation deal", "Topaz AI generated $600M pipeline"] },
            { quarter: "Q1 FY25", date: "Jul 2024", keyPromises: ["FY25 revenue growth 3-4%", "Margin expansion from Project Maximus", "Gen AI deal wins >$500M"], deliveryStatus: "partially_met", summary: "Growth tracking at 3.2%. Margins flat. Gen AI deals at $420M.", highlights: ["Slow start to the year with macro headwinds", "Project Maximus savings offset by wage hikes", "Healthcare and manufacturing showed strength"] },
            { quarter: "Q4 FY24", date: "Apr 2024", keyPromises: ["Strong order close for FY24", "Announce buyback", "Expand Topaz AI capabilities"], deliveryStatus: "met", summary: "Record Q4 deals. ₹9,300 Cr buyback announced. Topaz 2.0 launched.", highlights: ["Largest-ever quarterly deal signings at $7.4B", "Buyback at ₹1,850/share (8% premium)", "Topaz AI platform expanded to 12 industry verticals"] },
        ],
    },
    ICICIBANK: {
        quarterly: [
            { quarter: "Q3 FY25", revenue: 46460, netProfit: 11792, operatingMargin: 43.5, eps: 16.8 },
            { quarter: "Q2 FY25", revenue: 44700, netProfit: 11746, operatingMargin: 43.2, eps: 16.7 },
            { quarter: "Q1 FY25", revenue: 43290, netProfit: 11059, operatingMargin: 42.8, eps: 15.7 },
            { quarter: "Q4 FY24", revenue: 41420, netProfit: 10708, operatingMargin: 42.3, eps: 15.2 },
        ],
        yearly: [
            { year: "FY25 (9M)", revenue: 134450, netProfit: 34597, totalAssets: 2190000, totalDebt: 1720000, equity: 260000, operatingCashFlow: 62000 },
            { year: "FY24", revenue: 164103, netProfit: 40888, totalAssets: 2080000, totalDebt: 1640000, equity: 240000, operatingCashFlow: 78000 },
        ],
        earningsCalls: [
            { quarter: "Q3 FY25", date: "Jan 2025", keyPromises: ["Loan growth 16-18%", "Maintain GNPA below 2.2%", "ROA above 2.2%"], deliveryStatus: "met", summary: "Loan growth 16.8%. GNPA at 2.15%. ROA at 2.36%.", highlights: ["Business banking grew 32% YoY", "iMobile Pay crossed 60M users", "Provisions coverage ratio at 82%"] },
            { quarter: "Q2 FY25", date: "Oct 2024", keyPromises: ["Expand rural portfolio 20%+", "Digital loan disbursals 40%+", "NIM above 4.3%"], deliveryStatus: "met", summary: "Rural up 22%. Digital disbursals at 43%. NIM at 4.36%.", highlights: ["iMobile marketplace GMV grew 5x", "Rural branches added: 500 in H1", "Personal loan book quality remained strong"] },
            { quarter: "Q1 FY25", date: "Jul 2024", keyPromises: ["Sustain 20%+ profit growth", "Keep credit costs under 50 bps", "Expand SME lending book 25%+"], deliveryStatus: "partially_met", summary: "Profit grew 18.3%. Credit costs at 44 bps. SME grew 21%.", highlights: ["Slightly below profit growth guidance", "SME lending quality surprised positively", "Launched ICICI Stack 3.0 for MSMEs"] },
            { quarter: "Q4 FY24", date: "Apr 2024", keyPromises: ["Full-year ROA target 2.2%+", "Complete tech modernization Phase 2", "Dividend payout 25%+"], deliveryStatus: "met", summary: "FY24 ROA at 2.4%. Tech Phase 2 completed. Payout at 26%.", highlights: ["Record annual profit of ₹40,888 Cr", "Core banking platform fully migrated", "Total dividend ₹10/share for FY24"] },
        ],
    },
};

const MF_FINANCIALS: Record<string, any> = {
    "PARAG PARIKH FLEXI CAP FUND DIRECT GROWTH": {
        performance: [
            { period: "1 Year", return: 28.4, benchmark: 22.1, status: "met" },
            { period: "3 Year (CAGR)", return: 22.5, benchmark: 18.2, status: "met" },
            { period: "5 Year (CAGR)", return: 24.8, benchmark: 16.5, status: "met" },
        ],
        insights: "Superior downside protection and quality focus. Significant alpha generated through US tech exposure."
    },
    "QUANT SMALL CAP FUND DIRECT GROWTH": {
        performance: [
            { period: "1 Year", return: 62.5, benchmark: 45.2, status: "met" },
            { period: "3 Year (CAGR)", return: 35.8, benchmark: 28.4, status: "met" },
            { period: "5 Year (CAGR)", return: 45.2, benchmark: 32.1, status: "met" },
        ],
        insights: "Momentum-driven strategy. Very high churn but exceptional returns in bullish small-cap cycles."
    },
    "KOTAK LARGE AND MID CAP FUND DIRECT GROWTH": {
        performance: [
            { period: "1 Year", return: 32.1, benchmark: 28.7, status: "met" },
            { period: "3 Year (CAGR)", return: 19.4, benchmark: 17.5, status: "met" },
            { period: "5 Year (CAGR)", return: 18.2, benchmark: 15.8, status: "met" },
        ],
        insights: "Balanced growth and value. Strong selection in mid-cap IT and BFSI sectors."
    }
};

const DEFAULT_FINANCIALS: FinancialProfile = {
    quarterly: [
        { quarter: "Q3 FY25", revenue: 12000, netProfit: 1800, operatingMargin: 15.0, eps: 8.5 },
        { quarter: "Q2 FY25", revenue: 11500, netProfit: 1650, operatingMargin: 14.3, eps: 7.8 },
        { quarter: "Q1 FY25", revenue: 11200, netProfit: 1580, operatingMargin: 14.1, eps: 7.5 },
        { quarter: "Q4 FY24", revenue: 10800, netProfit: 1520, operatingMargin: 14.1, eps: 7.2 },
    ],
    yearly: [
        { year: "FY25 (9M)", revenue: 34700, netProfit: 5030, totalAssets: 45000, totalDebt: 8000, equity: 22000, operatingCashFlow: 6500 },
        { year: "FY24", revenue: 43500, netProfit: 6200, totalAssets: 42000, totalDebt: 7500, equity: 20000, operatingCashFlow: 8000 },
    ],
    earningsCalls: [
        { quarter: "Q3 FY25", date: "Jan 2025", keyPromises: ["Revenue growth 10-12%", "Margin expansion 100 bps", "New product launch in Q4"], deliveryStatus: "met", summary: "All guidance met. Revenue grew 10.5%. Margins expanded 110 bps.", highlights: ["Strong domestic demand", "Export revenue grew 8%", "R&D spend increased 15%"] },
        { quarter: "Q2 FY25", date: "Oct 2024", keyPromises: ["Cost optimization program", "Market share gains in core segments", "Capex of ₹500 Cr"], deliveryStatus: "partially_met", summary: "Cost program saved ₹120 Cr. Market share stable. Capex at ₹380 Cr.", highlights: ["Efficiency improvements in operations", "New markets entered in South India", "Working capital reduced by 8 days"] },
        { quarter: "Q1 FY25", date: "Jul 2024", keyPromises: ["FY25 growth guidance 10-15%", "Maintain dividend payout", "ESG compliance targets"], deliveryStatus: "met", summary: "Growth tracking above midpoint. Interim dividend declared. ESG rating upgraded.", highlights: ["Good start to the fiscal year", "Raw material costs trending favorable", "Employee productivity improved 12%"] },
        { quarter: "Q4 FY24", date: "Apr 2024", keyPromises: ["Record annual earnings", "Debt reduction ₹200 Cr", "Capacity expansion plan"], deliveryStatus: "met", summary: "Record profits achieved. Debt reduced ₹250 Cr. Phase 1 expansion approved.", highlights: ["Best-ever Q4 performance", "Board approved ₹800 Cr expansion", "Final dividend ₹5/share declared"] },
    ],
};

export function getFinancials(symbol: string): any {
    if (MF_FINANCIALS[symbol]) return MF_FINANCIALS[symbol];
    return FINANCIALS[symbol] || DEFAULT_FINANCIALS;
}
