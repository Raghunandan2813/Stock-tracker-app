import React from 'react';
import type { Metadata } from 'next';
import { getWatchlist, getAlerts } from '@/lib/actions/watchlistActions';
import WatchlistClient from '@/components/watchlist/WatchlistClient';

export const metadata: Metadata = {
    title: 'My Watchlist — Big-Bull',
    description: 'Track your saved stocks, set price alerts, and stay on top of the market.',
};

export default async function WatchlistPage() {
    const [watchlistResult, alertsResult] = await Promise.all([
        getWatchlist(),
        getAlerts(),
    ]);

    return (
        <WatchlistClient
            initialWatchlist={watchlistResult.data ?? []}
            initialAlerts={alertsResult.data ?? []}
        />
    );
}
