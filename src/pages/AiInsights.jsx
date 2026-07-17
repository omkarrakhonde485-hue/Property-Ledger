import api from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { useState } from 'react';

function parseInlineStyles(text) {
  const parts = text.split(/\*\*([^*]+)\*\?/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-semibold text-slate-900">{part}</strong>;
    }
    return part;
  });
}

function formatMarkdown(text) {
  if (!text) return null;
  
  const lines = text.split('\n');
  
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-2" />;
    
    if (trimmed.startsWith('###')) {
      return (
        <h4 key={i} className="text-sm font-bold text-indigo-900 mt-5 mb-2 uppercase tracking-wide flex items-center gap-1.5">
          {trimmed.replace(/^###\s*/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('##')) {
      return (
        <h3 key={i} className="text-base font-bold text-slate-900 mt-6 mb-3 border-b pb-1">
          {trimmed.replace(/^##\s*/, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('#')) {
      return (
        <h2 key={i} className="text-lg font-bold text-slate-950 mt-6 mb-4">
          {trimmed.replace(/^#\s*/, '')}
        </h2>
      );
    }
    
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.replace(/^[-*]\s*/, '');
      return (
        <div key={i} className="flex items-start gap-2 pl-2 py-1">
          <span className="text-indigo-500 font-bold mt-0.5">•</span>
          <span className="text-sm text-slate-700">{parseInlineStyles(content)}</span>
        </div>
      );
    }
    
    return (
      <p key={i} className="text-sm text-slate-700 leading-relaxed py-1">
        {parseInlineStyles(trimmed)}
      </p>
    );
  });
}

export default function AiInsights() {
  const { t } = useI18n();
  const [refetching, setRefetching] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['marketAnalysis'],
    queryFn: () => api.get('/market-analysis'),
    staleTime: Infinity,
  });

  const handleRefresh = async () => {
    setRefetching(true);
    await refetch();
    setRefetching(false);
  };

  const reports = data?.reports || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-heading font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
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

      <Card className="bg-slate-50 border-slate-200/80 shrink-0">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            This module fetches the live location (city & address) of your properties, performs a target query using the **Tavily Web Search API** to fetch contemporary PG & co-living rents in that area, and prompts **Google Gemini AI** to cross-evaluate if your rents are competitive, overpriced, or underpriced.
          </p>
        </CardContent>
      </Card>

      {(isLoading || refetching) ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-slate-700 animate-pulse">Running AI Rent Valuer...</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Querying local averages via Tavily Search and cross-evaluating room default rents using Gemini 1.5 Flash...
            </p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-rose-800">Failed to load market analysis</h4>
              <p className="text-sm text-rose-700 mt-1">{error.message || error}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 flex-1 overflow-y-auto pb-6 scrollbar-hide">
          {reports.map((report, idx) => (
            <Card key={idx} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-100/60 border-b border-border py-4">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    {report.property_name}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground bg-white px-2.5 py-1 rounded-full border border-border">
                    📍 {report.city || "Local Area"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="font-sans space-y-2">
                  {formatMarkdown(report.analysis)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
