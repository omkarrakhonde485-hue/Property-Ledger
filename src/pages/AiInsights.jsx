import api from '@/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, Info, Building2, MapPin, Lightbulb, BarChart3, Scale } from 'lucide-react';
import { useState } from 'react';

function parseInlineStyles(text) {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-foreground">{part}</strong>;
    }
    return part;
  });
}

function PricingGauge({ rentStr, marketStr, status }) {
  const rent = rentStr ? parseInt(rentStr.replace(/[^\d]/g, ''), 10) : null;
  
  const marketNumbers = marketStr.match(/\d+[\d,.]*/g);
  let minMarket = null;
  let maxMarket = null;
  
  if (marketNumbers) {
    const nums = marketNumbers.map(n => parseInt(n.replace(/[^\d]/g, ''), 10));
    if (nums.length === 1) {
      minMarket = nums[0] * 0.9;
      maxMarket = nums[0] * 1.1;
    } else if (nums.length >= 2) {
      minMarket = nums[0];
      maxMarket = nums[1];
    }
  }
  
  if (!rent || !minMarket || !maxMarket) {
    const isUnder = status.toLowerCase().includes('under');
    const isOver = status.toLowerCase().includes('over');
    return (
      <div className="space-y-1 mt-2">
        <div className="h-1.5 w-full rounded-full bg-muted flex overflow-hidden">
          <div className={`h-full ${isUnder ? 'w-1/3 bg-amber-500' : isOver ? 'w-full bg-rose-500' : 'w-2/3 bg-emerald-500'}`} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground/80 font-medium">
          <span>Underpriced</span>
          <span>Competitive</span>
          <span>Overpriced</span>
        </div>
      </div>
    );
  }
  
  const minRange = minMarket * 0.8;
  const maxRange = maxMarket * 1.2;
  const percent = Math.min(Math.max(((rent - minRange) / (maxRange - minRange)) * 100, 5), 95);
  
  return (
    <div className="space-y-1.5 mt-2">
      <div className="relative h-2 w-full rounded-full bg-muted dark:bg-muted/50 overflow-visible">
        {/* Underpriced zone */}
        <div className="absolute left-0 top-0 h-full w-[35%] rounded-l-full bg-amber-500/20 dark:bg-amber-500/10 border-r border-background" />
        {/* Fair/Competitive zone */}
        <div className="absolute left-[35%] top-0 h-full w-[30%] bg-emerald-500/20 dark:bg-emerald-500/10 border-r border-background" />
        {/* Overpriced zone */}
        <div className="absolute left-[65%] top-0 h-full w-[35%] rounded-r-full bg-rose-500/20 dark:bg-rose-500/10" />
        
        {/* Dot pointer representing our rent */}
        <div 
          className="absolute -top-1 w-4 h-4 rounded-full bg-indigo-600 dark:bg-indigo-400 border-2 border-background shadow-md flex items-center justify-center -translate-x-2 transition-all duration-300 hover:scale-125 cursor-pointer"
          style={{ left: `${percent}%` }}
          title={`Our Rent: ₹${rent.toLocaleString('en-IN')}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground/80 font-medium px-0.5">
        <span className="text-amber-600 dark:text-amber-400/90">Underpriced</span>
        <span className="text-emerald-600 dark:text-emerald-400/90">Fair Rate</span>
        <span className="text-rose-600 dark:text-rose-400/90">Overpriced</span>
      </div>
    </div>
  );
}

function parseAnalysisReport(text) {
  const result = {
    overview: [],
    comparison: [],
    suggestions: [],
    conclusion: "",
    raw: text,
    isStructured: false
  };
  
  if (!text) return result;
  
  const lines = text.split('\n');
  let currentSection = null;
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const lower = trimmed.toLowerCase();
    if (lower.includes('market overview') || lower.includes('overview') || (trimmed.startsWith('#') && lower.includes('overview'))) {
      currentSection = 'overview';
      result.isStructured = true;
      continue;
    } else if (lower.includes('valuation comparison') || lower.includes('pricing position') || (trimmed.startsWith('#') && lower.includes('comparison'))) {
      currentSection = 'comparison';
      result.isStructured = true;
      continue;
    } else if (lower.includes('actionable suggestions') || lower.includes('suggestions') || (trimmed.startsWith('#') && lower.includes('suggestions'))) {
      currentSection = 'suggestions';
      result.isStructured = true;
      continue;
    } else if (lower.includes('conclusion') || (trimmed.startsWith('#') && lower.includes('conclusion'))) {
      currentSection = 'conclusion';
      continue;
    }
    
    if (currentSection === 'overview') {
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        result.overview.push({ type: 'bullet', text: trimmed.replace(/^[-*]\s*/, '') });
      } else if (!trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        result.overview.push({ type: 'para', text: trimmed });
      }
    } else if (currentSection === 'comparison') {
      if (trimmed.startsWith('|') && !trimmed.includes('---') && !trimmed.toLowerCase().includes('room type') && !trimmed.toLowerCase().includes('assessment')) {
        const cols = trimmed.split('|').map(c => c.replace(/\*\*/g, '').trim()).filter(Boolean);
        if (cols.length >= 3) {
          result.comparison.push({
            room: cols[0],
            rent: cols[1],
            market: cols[2] || "N/A",
            status: cols[3] || "Analyzed"
          });
        }
      } 
      else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const clean = trimmed.replace(/^[-*]\s*/, '');
        const cleanNoBold = clean.replace(/\*\*/g, '');
        const splitIndex = cleanNoBold.indexOf(':');
        
        if (splitIndex !== -1) {
          const roomPart = cleanNoBold.substring(0, splitIndex).trim();
          const descPart = cleanNoBold.substring(splitIndex + 1).trim();
          
          let status = "Fairly Priced";
          if (descPart.toLowerCase().includes("underpriced") || descPart.toLowerCase().includes("opportunity")) {
            status = "Underpriced ⬇️";
          } else if (descPart.toLowerCase().includes("overpriced")) {
            status = "Overpriced ⬆️";
          }
          
          result.comparison.push({
            room: roomPart,
            rent: "",
            market: descPart,
            status: status
          });
        }
      }
    } else if (currentSection === 'suggestions') {
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
        result.suggestions.push(trimmed.replace(/^[-*\d.\s]+/, ''));
      }
    } else if (currentSection === 'conclusion') {
      if (!trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        result.conclusion += " " + trimmed;
      }
    }
  }
  
  return result;
}

function formatMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-2" />;
    
    if (trimmed.startsWith('###')) {
      return (
        <h4 key={i} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-5 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          {trimmed.replace(/^###\s*/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('##')) {
      return (
        <h3 key={i} className="text-sm font-bold text-foreground mt-5 mb-3 border-b border-border/80 pb-1">
          {trimmed.replace(/^##\s*/, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('#')) {
      return (
        <h2 key={i} className="text-base font-bold text-foreground mt-5 mb-3">
          {trimmed.replace(/^#\s*/, '')}
        </h2>
      );
    }
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      return (
        <div key={i} className="flex items-start gap-2 pl-2 py-1">
          <span className="text-indigo-500 dark:text-indigo-400 font-bold mt-0.5">•</span>
          <span className="text-sm text-foreground/85 leading-relaxed">{parseInlineStyles(trimmed.replace(/^[-*]\s*/, ''))}</span>
        </div>
      );
    }
    return (
      <p key={i} className="text-sm text-foreground/85 leading-relaxed py-1">
        {parseInlineStyles(trimmed)}
      </p>
    );
  });
}

export default function AiInsights() {
  const [refetching, setRefetching] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['marketAnalysis'],
    queryFn: () => api.get('/market-analysis'),
    staleTime: Infinity,
  });

  const handleRefresh = async () => {
    setRefetching(true);
    try {
      const freshData = await api.get('/market-analysis?refresh=true');
      queryClient.setQueryData(['marketAnalysis'], freshData);
    } catch (err) {
      console.error("Failed to refresh market analysis:", err);
    } finally {
      setRefetching(false);
    }
  };

  const reports = data?.reports || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-heading font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            AI Market Insights
          </h2>
          <p className="text-sm text-muted-foreground">
            Live local rent valuation comparison powered by Tavily Search & Google Gemini AI
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isLoading || refetching}
          className="shrink-0"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${(isLoading || refetching) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20 shrink-0">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
            This module fetches the live location (city & address) of your properties, performs a target query using the **Tavily Web Search API** to fetch contemporary PG & co-living rents in that area, and prompts **Google Gemini AI** to cross-evaluate if your rents are competitive, overpriced, or underpriced.
          </p>
        </CardContent>
      </Card>

      {/* Main Reports Display */}
      {(isLoading || refetching) ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-foreground animate-pulse">Running AI Rent Valuer...</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Querying local averages via Tavily Search and cross-evaluating room default rents using Gemini 2.0 Flash...
            </p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-rose-200 bg-rose-50/50 dark:bg-rose-950/20">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-rose-800 dark:text-rose-300">Failed to load market analysis</h4>
              <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">{error.message || error}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 flex-1 overflow-y-auto pb-6 scrollbar-hide">
          {reports.map((report, idx) => {
            const parsed = parseAnalysisReport(report.analysis);
            
            return (
              <Card key={idx} className="overflow-hidden border border-border/80 shadow-md hover:shadow-lg transition-all duration-300 bg-card/60 backdrop-blur-md">
                <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-b border-border/70 py-5 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2.5">
                    <Building2 className="w-[18px] h-[18px] text-indigo-500 dark:text-indigo-400" />
                    {report.property_name}
                  </CardTitle>
                  <span className="text-xs font-semibold text-muted-foreground bg-background/80 px-3 py-1 rounded-full border border-border flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    {report.city || "Local Area"}
                  </span>
                </CardHeader>
                
                <CardContent className="p-6 space-y-8">
                  {parsed.isStructured ? (
                    <>
                      {/* 1. Market Overview */}
                      {parsed.overview.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4" />
                            Market Overview
                          </h4>
                          <div className="border-l-4 border-indigo-500 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.01] p-5 rounded-r-xl space-y-2">
                            {parsed.overview.map((item, oIdx) => {
                              if (item.type === 'bullet') {
                                return (
                                  <div key={oIdx} className="flex items-start gap-2.5 pl-1">
                                    <span className="text-indigo-500 dark:text-indigo-400 font-bold mt-0.5">•</span>
                                    <span className="text-xs text-foreground/80 leading-relaxed">
                                      {parseInlineStyles(item.text)}
                                    </span>
                                  </div>
                                );
                              }
                              return (
                                <p key={oIdx} className="text-xs text-foreground/85 leading-relaxed">
                                  {parseInlineStyles(item.text)}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 2. Valuation Cards Grid */}
                      {parsed.comparison.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Scale className="w-4 h-4" />
                            Rent Valuation Analysis
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {parsed.comparison.map((comp, cIdx) => {
                              const isUnder = comp.status.toLowerCase().includes('underpriced') || comp.status.toLowerCase().includes('⬇️');
                              const isOver = comp.status.toLowerCase().includes('overpriced') || comp.status.toLowerCase().includes('⬆️');
                              
                              let borderClass = 'border-border/80';
                              let badgeClass = 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
                              let badgeLabel = 'Competitive';
                              
                              if (isUnder) {
                                borderClass = 'border-amber-500/30 bg-amber-500/[0.02] dark:bg-amber-500/[0.01]';
                                badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                                badgeLabel = 'Underpriced';
                              } else if (isOver) {
                                borderClass = 'border-rose-500/30 bg-rose-500/[0.02] dark:bg-rose-500/[0.01]';
                                badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                                badgeLabel = 'Overpriced';
                              }

                              // Extract exact numbers for side-by-side layout
                              let ourRent = comp.rent;
                              if (!ourRent) {
                                const rentMatch = comp.room.match(/rent\s*₹?\s*(\d+)/i);
                                if (rentMatch) ourRent = `₹${rentMatch[1]}`;
                              }
                              
                              let marketRateLabel = comp.market;
                              let marketDesc = "";
                              
                              if (comp.market && comp.market.length > 25) {
                                marketDesc = comp.market;
                                const rangeMatch = comp.market.match(/₹\s*(\d+[\d,.]*)\s*(?:to|–|-)\s*₹\s*(\d+[\d,.]*)/i);
                                if (rangeMatch) {
                                  marketRateLabel = `₹${rangeMatch[1]} – ₹${rangeMatch[2]}`;
                                } else {
                                  const singleMatch = comp.market.match(/₹\s*(\d+[\d,.]*)/);
                                  marketRateLabel = singleMatch ? singleMatch[0] : "Check suggestions";
                                }
                              }
                              
                              const roomName = comp.room.split('(')[0].replace(/default rent.*/i, '').trim();
                              
                              return (
                                <div key={cIdx} className={`p-5 rounded-2xl border ${borderClass} flex flex-col justify-between space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-indigo-950/[0.02] cursor-pointer bg-card/45`}>
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                      <span className="text-sm font-bold text-foreground tracking-tight">{roomName}</span>
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                                        {badgeLabel}
                                      </span>
                                    </div>
                                    {marketDesc && (
                                      <p className="text-[11px] text-muted-foreground leading-relaxed">{parseInlineStyles(marketDesc)}</p>
                                    )}
                                  </div>
                                  
                                  {/* Pricing Gauge Slider */}
                                  <PricingGauge rentStr={ourRent} marketStr={marketRateLabel} status={comp.status} />

                                  {/* Highlighted Side-by-Side Rents */}
                                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40 text-xs">
                                    {ourRent && (
                                      <div className="space-y-0.5 flex flex-col justify-center pl-2">
                                        <span className="text-[10px] text-muted-foreground block font-medium">Our Rent</span>
                                        <span className="text-base font-extrabold text-foreground">{ourRent}</span>
                                      </div>
                                    )}
                                    <div className="space-y-0.5 bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 px-3.5 py-2.5 rounded-xl border border-indigo-400/20 dark:border-indigo-500/20 text-white shadow-sm shadow-indigo-500/10 dark:shadow-none">
                                      <span className="text-[9px] text-indigo-100 dark:text-indigo-200 block font-bold uppercase tracking-wider">Market Avg</span>
                                      <span className="text-sm font-extrabold">{marketRateLabel}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 3. Actionable Suggestions */}
                      {parsed.suggestions.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4" />
                            Actionable Suggestions
                          </h4>
                          <div className="grid gap-3">
                            {parsed.suggestions.map((sugg, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-4.5 p-4.5 rounded-2xl bg-card border border-border/60 hover:border-indigo-500/20 transition-all duration-300 shadow-sm hover:shadow-indigo-950/[0.02]">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                                  <Lightbulb className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs text-foreground/80 leading-relaxed">
                                  {parseInlineStyles(sugg)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. Conclusion */}
                      {parsed.conclusion && (
                        <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground leading-relaxed italic text-center">
                          {parseInlineStyles(parsed.conclusion)}
                        </div>
                      )}
                    </>
                  ) : (
                    // Fallback to normal markdown output if structure doesn't parse
                    <div className="font-sans space-y-2">
                      {formatMarkdown(report.analysis)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
