/**
 * Economic Terms Synonym Dictionary
 *
 * Provides contextual search by mapping economic terms, acronyms, and their translations.
 * Supports bidirectional search: acronyms ↔ full terms ↔ Arabic translations
 *
 * Categories:
 * 1. National Accounts
 * 2. Price Indices
 * 3. Labor Market
 * 4. Trade & Investment
 * 5. Demographics
 * 6. Social Indicators
 * 7. Housing
 * 8. Energy
 * 9. Tourism
 * 10. Other Economic Indicators
 */

// Type definition for term variations
type TermEntry = string[];

// Comprehensive economic terms dictionary
const economicTermsMap: Record<string, TermEntry> = {
  // ============================================================================
  // 1. NATIONAL ACCOUNTS (30 terms)
  // ============================================================================

  // GDP
  "gdp": ["GDP", "Gross Domestic Product", "الناتج المحلي الإجمالي"],
  "gross domestic product": ["GDP", "Gross Domestic Product", "الناتج المحلي الإجمالي"],
  "الناتج المحلي الإجمالي": ["GDP", "Gross Domestic Product", "الناتج المحلي الإجمالي"],

  // GNP
  "gnp": ["GNP", "Gross National Product", "الناتج القومي الإجمالي"],
  "gross national product": ["GNP", "Gross National Product", "الناتج القومي الإجمالي"],
  "الناتج القومي الإجمالي": ["GNP", "Gross National Product", "الناتج القومي الإجمالي"],

  // GNI
  "gni": ["GNI", "Gross National Income", "الدخل القومي الإجمالي"],
  "gross national income": ["GNI", "Gross National Income", "الدخل القومي الإجمالي"],
  "الدخل القومي الإجمالي": ["GNI", "Gross National Income", "الدخل القومي الإجمالي"],

  // GDP per Capita
  "gdp per capita": ["GDP per capita", "Per capita GDP", "نصيب الفرد من الناتج المحلي الإجمالي"],
  "per capita gdp": ["GDP per capita", "Per capita GDP", "نصيب الفرد من الناتج المحلي الإجمالي"],
  "نصيب الفرد من الناتج المحلي الإجمالي": ["GDP per capita", "Per capita GDP", "نصيب الفرد من الناتج المحلي الإجمالي"],

  // Consumption
  "consumption": ["Consumption", "Consumer spending", "الاستهلاك"],
  "consumer spending": ["Consumption", "Consumer spending", "الاستهلاك"],
  "الاستهلاك": ["Consumption", "Consumer spending", "الاستهلاك"],

  // Investment
  "investment": ["Investment", "Capital formation", "الاستثمار"],
  "capital formation": ["Investment", "Capital formation", "الاستثمار"],
  "الاستثمار": ["Investment", "Capital formation", "الاستثمار"],

  // Government spending
  "government spending": ["Government spending", "Public expenditure", "الإنفاق الحكومي"],
  "public expenditure": ["Government spending", "Public expenditure", "الإنفاق الحكومي"],
  "الإنفاق الحكومي": ["Government spending", "Public expenditure", "الإنفاق الحكومي"],

  // Savings
  "savings": ["Savings", "National savings", "المدخرات"],
  "national savings": ["Savings", "National savings", "المدخرات"],
  "المدخرات": ["Savings", "National savings", "المدخرات"],

  // Economic growth
  "economic growth": ["Economic growth", "GDP growth", "النمو الاقتصادي"],
  "gdp growth": ["Economic growth", "GDP growth", "النمو الاقتصادي"],
  "النمو الاقتصادي": ["Economic growth", "GDP growth", "النمو الاقتصادي"],

  // Productivity
  "productivity": ["Productivity", "Labor productivity", "الإنتاجية"],
  "labor productivity": ["Productivity", "Labor productivity", "الإنتاجية"],
  "الإنتاجية": ["Productivity", "Labor productivity", "الإنتاجية"],

  // ============================================================================
  // 2. PRICE INDICES (20 terms)
  // ============================================================================

  // CPI
  "cpi": ["CPI", "Consumer Price Index", "مؤشر أسعار المستهلك"],
  "consumer price index": ["CPI", "Consumer Price Index", "مؤشر أسعار المستهلك"],
  "مؤشر أسعار المستهلك": ["CPI", "Consumer Price Index", "مؤشر أسعار المستهلك"],

  // PPI
  "ppi": ["PPI", "Producer Price Index", "مؤشر أسعار المنتجين"],
  "producer price index": ["PPI", "Producer Price Index", "مؤشر أسعار المنتجين"],
  "مؤشر أسعار المنتجين": ["PPI", "Producer Price Index", "مؤشر أسعار المنتجين"],

  // WPI
  "wpi": ["WPI", "Wholesale Price Index", "مؤشر أسعار الجملة"],
  "wholesale price index": ["WPI", "Wholesale Price Index", "مؤشر أسعار الجملة"],
  "مؤشر أسعار الجملة": ["WPI", "Wholesale Price Index", "مؤشر أسعار الجملة"],

  // Inflation
  "inflation": ["Inflation", "Inflation rate", "التضخم"],
  "inflation rate": ["Inflation", "Inflation rate", "التضخم"],
  "التضخم": ["Inflation", "Inflation rate", "التضخم"],

  // Deflation
  "deflation": ["Deflation", "Deflation rate", "الانكماش"],
  "deflation rate": ["Deflation", "Deflation rate", "الانكماش"],
  "الانكماش": ["Deflation", "Deflation rate", "الانكماش"],

  // ============================================================================
  // 3. LABOR MARKET (25 terms)
  // ============================================================================

  // Unemployment
  "unemployment": ["Unemployment", "Unemployment rate", "Jobless", "البطالة"],
  "unemployment rate": ["Unemployment", "Unemployment rate", "Jobless", "البطالة"],
  "jobless": ["Unemployment", "Unemployment rate", "Jobless", "البطالة"],
  "البطالة": ["Unemployment", "Unemployment rate", "Jobless", "البطالة"],

  // Employment
  "employment": ["Employment", "Employment rate", "Jobs", "التوظيف"],
  "employment rate": ["Employment", "Employment rate", "Jobs", "التوظيف"],
  "jobs": ["Employment", "Employment rate", "Jobs", "التوظيف"],
  "التوظيف": ["Employment", "Employment rate", "Jobs", "التوظيف"],

  // Labor force
  "labor force": ["Labor force", "Workforce", "Labour force", "القوى العاملة"],
  "workforce": ["Labor force", "Workforce", "Labour force", "القوى العاملة"],
  "labour force": ["Labor force", "Workforce", "Labour force", "القوى العاملة"],
  "القوى العاملة": ["Labor force", "Workforce", "Labour force", "القوى العاملة"],

  // Wages
  "wages": ["Wages", "Salary", "Earnings", "الأجور"],
  "salary": ["Wages", "Salary", "Earnings", "الأجور"],
  "earnings": ["Wages", "Salary", "Earnings", "الأجور"],
  "الأجور": ["Wages", "Salary", "Earnings", "الأجور"],

  // Labor participation
  "labor participation": ["Labor participation", "Labour participation rate", "معدل المشاركة في القوى العاملة"],
  "labour participation rate": ["Labor participation", "Labour participation rate", "معدل المشاركة في القوى العاملة"],
  "معدل المشاركة في القوى العاملة": ["Labor participation", "Labour participation rate", "معدل المشاركة في القوى العاملة"],

  // ============================================================================
  // 4. TRADE & INVESTMENT (25 terms)
  // ============================================================================

  // FDI
  "fdi": ["FDI", "Foreign Direct Investment", "الاستثمار الأجنبي المباشر"],
  "foreign direct investment": ["FDI", "Foreign Direct Investment", "الاستثمار الأجنبي المباشر"],
  "الاستثمار الأجنبي المباشر": ["FDI", "Foreign Direct Investment", "الاستثمار الأجنبي المباشر"],

  // FII
  "fii": ["FII", "Foreign Institutional Investment", "الاستثمار المؤسسي الأجنبي"],
  "foreign institutional investment": ["FII", "Foreign Institutional Investment", "الاستثمار المؤسسي الأجنبي"],
  "الاستثمار المؤسسي الأجنبي": ["FII", "Foreign Institutional Investment", "الاستثمار المؤسسي الأجنبي"],

  // Exports
  "exports": ["Exports", "Export value", "الصادرات"],
  "export value": ["Exports", "Export value", "الصادرات"],
  "الصادرات": ["Exports", "Export value", "الصادرات"],

  // Imports
  "imports": ["Imports", "Import value", "الواردات"],
  "import value": ["Imports", "Import value", "الواردات"],
  "الواردات": ["Imports", "Import value", "الواردات"],

  // Trade balance
  "trade balance": ["Trade balance", "Balance of trade", "الميزان التجاري"],
  "balance of trade": ["Trade balance", "Balance of trade", "الميزان التجاري"],
  "الميزان التجاري": ["Trade balance", "Balance of trade", "الميزان التجاري"],

  // Current account
  "current account": ["Current account", "Current account balance", "الحساب الجاري"],
  "current account balance": ["Current account", "Current account balance", "الحساب الجاري"],
  "الحساب الجاري": ["Current account", "Current account balance", "الحساب الجاري"],

  // ============================================================================
  // 5. DEMOGRAPHICS (20 terms)
  // ============================================================================

  // Population
  "population": ["Population", "Total population", "السكان"],
  "total population": ["Population", "Total population", "السكان"],
  "السكان": ["Population", "Total population", "السكان"],

  // Birth rate
  "birth rate": ["Birth rate", "Natality", "معدل المواليد"],
  "natality": ["Birth rate", "Natality", "معدل المواليد"],
  "معدل المواليد": ["Birth rate", "Natality", "معدل المواليد"],

  // Death rate
  "death rate": ["Death rate", "Mortality", "معدل الوفيات"],
  "mortality": ["Death rate", "Mortality", "معدل الوفيات"],
  "معدل الوفيات": ["Death rate", "Mortality", "معدل الوفيات"],

  // Migration
  "migration": ["Migration", "Immigration", "Emigration", "الهجرة"],
  "immigration": ["Migration", "Immigration", "Emigration", "الهجرة"],
  "emigration": ["Migration", "Immigration", "Emigration", "الهجرة"],
  "الهجرة": ["Migration", "Immigration", "Emigration", "الهجرة"],

  // Population growth
  "population growth": ["Population growth", "Population growth rate", "معدل النمو السكاني"],
  "population growth rate": ["Population growth", "Population growth rate", "معدل النمو السكاني"],
  "معدل النمو السكاني": ["Population growth", "Population growth rate", "معدل النمو السكاني"],

  // Life expectancy
  "life expectancy": ["Life expectancy", "Average lifespan", "متوسط العمر المتوقع"],
  "average lifespan": ["Life expectancy", "Average lifespan", "متوسط العمر المتوقع"],
  "متوسط العمر المتوقع": ["Life expectancy", "Average lifespan", "متوسط العمر المتوقع"],

  // ============================================================================
  // 6. SOCIAL INDICATORS (20 terms)
  // ============================================================================

  // HDI
  "hdi": ["HDI", "Human Development Index", "مؤشر التنمية البشرية"],
  "human development index": ["HDI", "Human Development Index", "مؤشر التنمية البشرية"],
  "مؤشر التنمية البشرية": ["HDI", "Human Development Index", "مؤشر التنمية البشرية"],

  // Poverty
  "poverty": ["Poverty", "Poverty rate", "الفقر"],
  "poverty rate": ["Poverty", "Poverty rate", "الفقر"],
  "الفقر": ["Poverty", "Poverty rate", "الفقر"],

  // Inequality
  "inequality": ["Inequality", "Income inequality", "Gini coefficient", "عدم المساواة"],
  "income inequality": ["Inequality", "Income inequality", "Gini coefficient", "عدم المساواة"],
  "gini coefficient": ["Inequality", "Income inequality", "Gini coefficient", "عدم المساواة"],
  "عدم المساواة": ["Inequality", "Income inequality", "Gini coefficient", "عدم المساواة"],

  // Education
  "education": ["Education", "Schooling", "Literacy", "التعليم"],
  "schooling": ["Education", "Schooling", "Literacy", "التعليم"],
  "literacy": ["Education", "Schooling", "Literacy", "التعليم"],
  "التعليم": ["Education", "Schooling", "Literacy", "التعليم"],

  // Health
  "health": ["Health", "Healthcare", "Medical services", "الصحة"],
  "healthcare": ["Health", "Healthcare", "Medical services", "الصحة"],
  "medical services": ["Health", "Healthcare", "Medical services", "الصحة"],
  "الصحة": ["Health", "Healthcare", "Medical services", "الصحة"],

  // ============================================================================
  // 7. HOUSING (15 terms)
  // ============================================================================

  // Housing
  "housing": ["Housing", "Residential", "Dwelling", "الإسكان"],
  "residential": ["Housing", "Residential", "Dwelling", "الإسكان"],
  "dwelling": ["Housing", "Residential", "Dwelling", "الإسكان"],
  "الإسكان": ["Housing", "Residential", "Dwelling", "الإسكان"],

  // Rent
  "rent": ["Rent", "Rental", "Lease", "الإيجار"],
  "rental": ["Rent", "Rental", "Lease", "الإيجار"],
  "lease": ["Rent", "Rental", "Lease", "الإيجار"],
  "الإيجار": ["Rent", "Rental", "Lease", "الإيجار"],

  // Property
  "property": ["Property", "Real estate", "الممتلكات"],
  "real estate": ["Property", "Real estate", "الممتلكات"],
  "الممتلكات": ["Property", "Real estate", "الممتلكات"],

  // ============================================================================
  // 8. ENERGY (15 terms)
  // ============================================================================

  // Electricity
  "electricity": ["Electricity", "Electric power", "الكهرباء"],
  "electric power": ["Electricity", "Electric power", "الكهرباء"],
  "الكهرباء": ["Electricity", "Electric power", "الكهرباء"],

  // Oil
  "oil": ["Oil", "Petroleum", "Crude oil", "النفط"],
  "petroleum": ["Oil", "Petroleum", "Crude oil", "النفط"],
  "crude oil": ["Oil", "Petroleum", "Crude oil", "النفط"],
  "النفط": ["Oil", "Petroleum", "Crude oil", "النفط"],

  // Gas
  "gas": ["Gas", "Natural gas", "الغاز"],
  "natural gas": ["Gas", "Natural gas", "الغاز"],
  "الغاز": ["Gas", "Natural gas", "الغاز"],

  // Renewable energy
  "renewable energy": ["Renewable energy", "Clean energy", "الطاقة المتجددة"],
  "clean energy": ["Renewable energy", "Clean energy", "الطاقة المتجددة"],
  "الطاقة المتجددة": ["Renewable energy", "Clean energy", "الطاقة المتجددة"],

  // Energy consumption
  "energy consumption": ["Energy consumption", "Energy use", "استهلاك الطاقة"],
  "energy use": ["Energy consumption", "Energy use", "استهلاك الطاقة"],
  "استهلاك الطاقة": ["Energy consumption", "Energy use", "استهلاك الطاقة"],

  // ============================================================================
  // 9. TOURISM (15 terms)
  // ============================================================================

  // Tourism
  "tourism": ["Tourism", "Tourist industry", "السياحة"],
  "tourist industry": ["Tourism", "Tourist industry", "السياحة"],
  "السياحة": ["Tourism", "Tourist industry", "السياحة"],

  // Visitors
  "visitors": ["Visitors", "Tourists", "Arrivals", "الزوار"],
  "tourists": ["Visitors", "Tourists", "Arrivals", "الزوار"],
  "arrivals": ["Visitors", "Tourists", "Arrivals", "الزوار"],
  "الزوار": ["Visitors", "Tourists", "Arrivals", "الزوار"],

  // Tourism receipts
  "tourism receipts": ["Tourism receipts", "Tourism revenue", "Tourism income", "إيرادات السياحة"],
  "tourism revenue": ["Tourism receipts", "Tourism revenue", "Tourism income", "إيرادات السياحة"],
  "tourism income": ["Tourism receipts", "Tourism revenue", "Tourism income", "إيرادات السياحة"],
  "إيرادات السياحة": ["Tourism receipts", "Tourism revenue", "Tourism income", "إيرادات السياحة"],

  // Hotel occupancy
  "hotel occupancy": ["Hotel occupancy", "Occupancy rate", "معدل الإشغال"],
  "occupancy rate": ["Hotel occupancy", "Occupancy rate", "معدل الإشغال"],
  "معدل الإشغال": ["Hotel occupancy", "Occupancy rate", "معدل الإشغال"],

  // ============================================================================
  // 10. OTHER ECONOMIC INDICATORS (15 terms)
  // ============================================================================

  // Interest rate
  "interest rate": ["Interest rate", "Interest", "سعر الفائدة"],
  "interest": ["Interest rate", "Interest", "سعر الفائدة"],
  "سعر الفائدة": ["Interest rate", "Interest", "سعر الفائدة"],

  // Exchange rate
  "exchange rate": ["Exchange rate", "Currency rate", "Forex", "سعر الصرف"],
  "currency rate": ["Exchange rate", "Currency rate", "Forex", "سعر الصرف"],
  "forex": ["Exchange rate", "Currency rate", "Forex", "سعر الصرف"],
  "سعر الصرف": ["Exchange rate", "Currency rate", "Forex", "سعر الصرف"],

  // Debt
  "debt": ["Debt", "Public debt", "Government debt", "الدين"],
  "public debt": ["Debt", "Public debt", "Government debt", "الدين"],
  "government debt": ["Debt", "Public debt", "Government debt", "الدين"],
  "الدين": ["Debt", "Public debt", "Government debt", "الدين"],

  // Revenue
  "revenue": ["Revenue", "Government revenue", "Income", "الإيرادات"],
  "government revenue": ["Revenue", "Government revenue", "Income", "الإيرادات"],
  "income": ["Revenue", "Government revenue", "Income", "الإيرادات"],
  "الإيرادات": ["Revenue", "Government revenue", "Income", "الإيرادات"],

  // Budget
  "budget": ["Budget", "Fiscal budget", "Government budget", "الميزانية"],
  "fiscal budget": ["Budget", "Fiscal budget", "Government budget", "الميزانية"],
  "government budget": ["Budget", "Fiscal budget", "Government budget", "الميزانية"],
  "الميزانية": ["Budget", "Fiscal budget", "Government budget", "الميزانية"],
};

/**
 * Get all variations/synonyms for a given search term
 *
 * @param searchTerm - The term to expand (case-insensitive)
 * @returns Array of all variations including the original term, or [searchTerm] if no match found
 *
 * @example
 * getTermVariations("GDP")
 * // Returns: ["GDP", "Gross Domestic Product", "الناتج المحلي الإجمالي"]
 *
 * getTermVariations("الناتج المحلي الإجمالي")
 * // Returns: ["GDP", "Gross Domestic Product", "الناتج المحلي الإجمالي"]
 *
 * getTermVariations("unmapped term")
 * // Returns: ["unmapped term"]
 */
export function getTermVariations(searchTerm: string): string[] {
  const normalized = searchTerm.toLowerCase().trim();

  // Check if term exists in dictionary (case-insensitive)
  const variations = economicTermsMap[normalized];

  if (variations) {
    return variations;
  }

  // No match found - return original term
  return [searchTerm];
}

/**
 * Check if a term has synonym mappings
 *
 * @param searchTerm - The term to check
 * @returns true if the term has synonyms, false otherwise
 */
export function hasSynonyms(searchTerm: string): boolean {
  const normalized = searchTerm.toLowerCase().trim();
  return normalized in economicTermsMap;
}

/**
 * Get the total number of mapped terms in the dictionary
 *
 * @returns Number of unique terms with mappings
 */
export function getMappedTermsCount(): number {
  // Count unique term groups (divide by average variations per term)
  return Object.keys(economicTermsMap).length;
}
