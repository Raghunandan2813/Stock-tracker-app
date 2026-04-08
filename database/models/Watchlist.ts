import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IWatchlistItem extends Document {
    userId: string;
    symbol: string;
    company: string;
    addedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlistItem>({
    userId:  { type: String, required: true, index: true },
    symbol:  { type: String, required: true },
    company: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
});

WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const WatchlistModel =
    models.Watchlist || model<IWatchlistItem>('Watchlist', WatchlistSchema);
