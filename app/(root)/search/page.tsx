import React from 'react';
import type { Metadata } from 'next';
import StockSearch from '@/components/search/StockSearch';

export const metadata: Metadata = {
    title: 'Search Stocks — Big-Bull',
    description: 'Search any stock, ETF, or index. Get real-time charts, technical analysis, company profiles, financials, and AI-powered insights.',
};

const SearchPage = () => {
    return (
        <div className="min-h-[calc(100vh-70px)] py-6">
            <StockSearch />
        </div>
    );
};

export default SearchPage;
