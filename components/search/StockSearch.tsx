'use client';

import React, { useState, useCallback, useTransition } from 'react';
import { Search, Sparkles, TrendingUp, X, ChevronRight, Loader2, BarChart2, BookOpen, DollarSign, Newspaper, Activity } from 'lucide-react';
import TradingViewWidget from '@/components/TradingViewWidget';
import {
    SYMBOL_INFO_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG,
    POPULAR_STOCK_SYMBOLS,
} from '@/lib/constants';
import { getStockAIInsight } from '@/lib/actions/stockActions';

/* ─── Types ─────────────────────────────────────────────── */
type Tab = 'chart' | 'technical' | 'profile' | 'financials' | 'news';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'chart',      label: 'Chart',       icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'technical',  label: 'Technical',   icon: <Activity className="w-4 h-4" /> },
    { id: 'profile',    label: 'Profile',     icon: <BookOpen className="w-4 h-4" /> },
    { id: 'financials', label: 'Financials',  icon: <DollarSign className="w-4 h-4" /> },
    { id: 'news',       label: 'News',        icon: <Newspaper className="w-4 h-4" /> },
];

const QUICK_PICKS = POPULAR_STOCK_SYMBOLS.slice(0, 10);

const SCRIPT_BASE = 'https://s3.tradingview.com/external-embedding/embed-widget-';

/* ─── News widget config for a specific symbol ──────────── */
const symbolNewsConfig = (sym: string) => ({
    ...TOP_STORIES_WIDGET_CONFIG,
    feedMode: 'symbol',
    symbol: sym,
});

/* ─────────────────────────────────────────────────────────── */

export default function StockSearch() {
    const [query, setQuery] = useState('');
    const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('chart');
    const [aiInsight, setAiInsight] = useState<string>('');
    const [aiLoading, setAiLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    /* ── Handlers ── */
    const handleSearch = useCallback(
        (sym: string) => {
            const clean = sym.trim().toUpperCase();
            if (!clean) return;
            setActiveSymbol(clean);
            setActiveTab('chart');
            setAiInsight('');
        },
        []
    );

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleAIInsight = async () => {
        if (!activeSymbol) return;
        setAiLoading(true);
        const result = await getStockAIInsight(activeSymbol);
        setAiInsight(result.insight || result.error || 'No insight available.');
        setAiLoading(false);
    };

    const clearSearch = () => {
        setQuery('');
        setActiveSymbol(null);
        setAiInsight('');
    };

    /* ── Render ── */
    return (
        <div className="space-y-8">

            {/* ── Hero Header ── */}
            <div className="text-center space-y-3 px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-400/30 bg-teal-400/5 text-teal-400 text-xs font-medium mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Real-Time Market Data
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-100 leading-tight">
                    Search <span className="bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">Any Stock</span>
                </h1>
                <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">
                    Enter a ticker symbol or company name to explore charts, technicals, financials, and AI-powered insights.
                </p>
            </div>

            {/* ── Search Bar ── */}
            <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto px-4">
                <div className="relative group">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400/20 to-yellow-400/10 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center bg-gray-800 border border-gray-600 group-focus-within:border-teal-400/60 rounded-2xl overflow-hidden transition-colors duration-200 shadow-xl">
                        <Search className="absolute left-5 w-5 h-5 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
                        <input
                            id="stock-search-input"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by ticker (e.g. AAPL, TSLA, MSFT)..."
                            aria-label="Stock search input"
                            className="flex-1 bg-transparent text-gray-100 placeholder:text-gray-500 pl-14 pr-4 py-5 text-base focus:outline-none"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                aria-label="Clear search"
                                className="p-2 mr-1 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            type="submit"
                            id="stock-search-submit"
                            aria-label="Search stock"
                            className="m-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-gray-900 font-semibold rounded-xl text-sm transition-all duration-200 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                        >
                            <Search className="w-4 h-4" />
                            Search
                        </button>
                    </div>
                </div>
            </form>

            {/* ── Quick Picks ── */}
            {!activeSymbol && (
                <div className="max-w-4xl mx-auto px-4 space-y-4">
                    <p className="text-sm text-gray-500 font-medium text-center uppercase tracking-wider">Popular Stocks</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {QUICK_PICKS.map((sym) => (
                            <button
                                key={sym}
                                id={`quick-pick-${sym}`}
                                onClick={() => {
                                    setQuery(sym);
                                    handleSearch(sym);
                                }}
                                className="px-4 py-2 text-sm font-mono font-semibold text-teal-400 border border-teal-400/25 bg-teal-400/5 hover:bg-teal-400/15 hover:border-teal-400/50 rounded-lg transition-all duration-150 active:scale-95"
                            >
                                {sym}
                            </button>
                        ))}
                    </div>

                    {/* ─ Empty State ─ */}
                    <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <Search className="w-9 h-9 text-gray-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-400 font-medium">No stock selected</p>
                            <p className="text-gray-600 text-sm">Type a symbol above or click a quick pick to get started.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Stock Details ── */}
            {activeSymbol && (
                <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">

                    {/* Symbol Info Bar */}
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                        <TradingViewWidget
                            scriptUrl={`${SCRIPT_BASE}symbol-info.js`}
                            config={SYMBOL_INFO_WIDGET_CONFIG(activeSymbol)}
                            height={170}
                        />
                    </div>

                    {/* AI Insight Panel */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-800/70 border border-gray-700 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-teal-500/20 border border-purple-500/30 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-gray-100 font-semibold text-sm">AI Stock Insight</p>
                                    <p className="text-gray-500 text-xs">Powered by Gemini</p>
                                </div>
                            </div>
                            {!aiInsight && (
                                <button
                                    id="ai-insight-btn"
                                    onClick={handleAIInsight}
                                    disabled={aiLoading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {aiLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4" /> Get Insight</>
                                    )}
                                </button>
                            )}
                        </div>
                        {aiInsight && (
                            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
                                <p className="text-gray-300 text-sm leading-relaxed">{aiInsight}</p>
                                <button
                                    onClick={() => setAiInsight('')}
                                    className="mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> Dismiss
                                </button>
                            </div>
                        )}
                        {!aiInsight && !aiLoading && (
                            <p className="text-gray-600 text-sm">Click "Get Insight" for an AI-generated summary of <span className="text-teal-400 font-mono">{activeSymbol}</span>.</p>
                        )}
                    </div>

                    {/* Tab Bar */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
                        <div className="flex overflow-x-auto border-b border-gray-700 scrollbar-hide">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    id={`tab-${tab.id}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-150 border-b-2 -mb-px ${
                                        activeTab === tab.id
                                            ? 'text-teal-400 border-teal-400 bg-teal-400/5'
                                            : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-700/40'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-4">
                            {activeTab === 'chart' && (
                                <TradingViewWidget
                                    scriptUrl={`${SCRIPT_BASE}advanced-chart.js`}
                                    config={CANDLE_CHART_WIDGET_CONFIG(activeSymbol)}
                                    height={600}
                                />
                            )}
                            {activeTab === 'technical' && (
                                <TradingViewWidget
                                    scriptUrl={`${SCRIPT_BASE}technical-analysis.js`}
                                    config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(activeSymbol)}
                                    height={450}
                                />
                            )}
                            {activeTab === 'profile' && (
                                <TradingViewWidget
                                    scriptUrl={`${SCRIPT_BASE}symbol-profile.js`}
                                    config={COMPANY_PROFILE_WIDGET_CONFIG(activeSymbol)}
                                    height={480}
                                />
                            )}
                            {activeTab === 'financials' && (
                                <TradingViewWidget
                                    scriptUrl={`${SCRIPT_BASE}financials.js`}
                                    config={COMPANY_FINANCIALS_WIDGET_CONFIG(activeSymbol)}
                                    height={480}
                                />
                            )}
                            {activeTab === 'news' && (
                                <TradingViewWidget
                                    scriptUrl={`${SCRIPT_BASE}timeline.js`}
                                    config={symbolNewsConfig(activeSymbol)}
                                    height={500}
                                />
                            )}
                        </div>
                    </div>

                    {/* Related Quick Picks */}
                    <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-5 space-y-3">
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-teal-400" />
                            Search another stock
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_PICKS.filter((s) => s !== activeSymbol).slice(0, 8).map((sym) => (
                                <button
                                    key={sym}
                                    onClick={() => {
                                        setQuery(sym);
                                        handleSearch(sym);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="px-3 py-1.5 text-xs font-mono font-semibold text-gray-400 border border-gray-600 hover:border-teal-400/50 hover:text-teal-400 rounded-lg transition-all duration-150"
                                >
                                    {sym}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
