'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/database/mongoose';
import mongoose from 'mongoose';

// ─── Lazy model getters (after DB connect) ──────────────────────────────────
function getWatchlistModel() {
    const schema = new mongoose.Schema({
        userId:  { type: String, required: true },
        symbol:  { type: String, required: true },
        company: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
    });
    schema.index({ userId: 1, symbol: 1 }, { unique: true });
    return mongoose.models['Watchlist'] ?? mongoose.model('Watchlist', schema);
}

function getAlertModel() {
    const schema = new mongoose.Schema({
        userId:    { type: String, required: true },
        symbol:    { type: String, required: true },
        company:   { type: String, required: true },
        alertName: { type: String, required: true },
        alertType: { type: String, enum: ['upper', 'lower'], required: true },
        threshold: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
    });
    return mongoose.models['Alert'] ?? mongoose.model('Alert', schema);
}

// ─── hard-coded userId (matching the mocked user in UserDropdown) ───────────
const DEMO_USER_ID = 'demo-user-raghu';

/* ═══════════════════════════════════════════════════════
   WATCHLIST  CRUD
═══════════════════════════════════════════════════════ */

export async function getWatchlist() {
    try {
        await connectToDatabase();
        const WatchlistModel = getWatchlistModel();
        const items = await WatchlistModel.find({ userId: DEMO_USER_ID })
            .sort({ addedAt: -1 })
            .lean();
        return { success: true, data: JSON.parse(JSON.stringify(items)) };
    } catch (e) {
        console.error('getWatchlist error', e);
        return { success: false, data: [] };
    }
}

export async function addToWatchlist(symbol: string, company: string) {
    try {
        await connectToDatabase();
        const WatchlistModel = getWatchlistModel();
        await WatchlistModel.findOneAndUpdate(
            { userId: DEMO_USER_ID, symbol: symbol.toUpperCase() },
            { userId: DEMO_USER_ID, symbol: symbol.toUpperCase(), company, addedAt: new Date() },
            { upsert: true, new: true }
        );
        revalidatePath('/watchlist');
        return { success: true };
    } catch (e) {
        console.error('addToWatchlist error', e);
        return { success: false, error: 'Could not add stock to watchlist.' };
    }
}

export async function removeFromWatchlist(symbol: string) {
    try {
        await connectToDatabase();
        const WatchlistModel = getWatchlistModel();
        await WatchlistModel.deleteOne({ userId: DEMO_USER_ID, symbol: symbol.toUpperCase() });
        revalidatePath('/watchlist');
        return { success: true };
    } catch (e) {
        console.error('removeFromWatchlist error', e);
        return { success: false, error: 'Could not remove stock.' };
    }
}

export async function isInWatchlist(symbol: string): Promise<boolean> {
    try {
        await connectToDatabase();
        const WatchlistModel = getWatchlistModel();
        const item = await WatchlistModel.findOne({
            userId: DEMO_USER_ID,
            symbol: symbol.toUpperCase(),
        }).lean();
        return !!item;
    } catch {
        return false;
    }
}

/* ═══════════════════════════════════════════════════════
   ALERTS  CRUD
═══════════════════════════════════════════════════════ */

export async function getAlerts() {
    try {
        await connectToDatabase();
        const AlertModel = getAlertModel();
        const alerts = await AlertModel.find({ userId: DEMO_USER_ID })
            .sort({ createdAt: -1 })
            .lean();
        return { success: true, data: JSON.parse(JSON.stringify(alerts)) };
    } catch (e) {
        console.error('getAlerts error', e);
        return { success: false, data: [] };
    }
}

export async function createAlert(data: {
    symbol: string;
    company: string;
    alertName: string;
    alertType: 'upper' | 'lower';
    threshold: number;
}) {
    try {
        await connectToDatabase();
        const AlertModel = getAlertModel();
        await AlertModel.create({ ...data, userId: DEMO_USER_ID });
        revalidatePath('/watchlist');
        return { success: true };
    } catch (e) {
        console.error('createAlert error', e);
        return { success: false, error: 'Could not create alert.' };
    }
}

export async function deleteAlert(alertId: string) {
    try {
        await connectToDatabase();
        const AlertModel = getAlertModel();
        await AlertModel.deleteOne({ _id: alertId, userId: DEMO_USER_ID });
        revalidatePath('/watchlist');
        return { success: true };
    } catch (e) {
        console.error('deleteAlert error', e);
        return { success: false, error: 'Could not delete alert.' };
    }
}

export async function updateAlert(
    alertId: string,
    data: { alertName?: string; alertType?: 'upper' | 'lower'; threshold?: number }
) {
    try {
        await connectToDatabase();
        const AlertModel = getAlertModel();
        await AlertModel.findOneAndUpdate({ _id: alertId, userId: DEMO_USER_ID }, data);
        revalidatePath('/watchlist');
        return { success: true };
    } catch (e) {
        console.error('updateAlert error', e);
        return { success: false, error: 'Could not update alert.' };
    }
}
