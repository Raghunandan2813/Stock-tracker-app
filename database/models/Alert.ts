import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IAlert extends Document {
    userId: string;
    symbol: string;
    company: string;
    alertName: string;
    alertType: 'upper' | 'lower';
    threshold: number;
    createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({
    userId:    { type: String, required: true, index: true },
    symbol:    { type: String, required: true },
    company:   { type: String, required: true },
    alertName: { type: String, required: true },
    alertType: { type: String, enum: ['upper', 'lower'], required: true },
    threshold: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const AlertModel =
    models.Alert || model<IAlert>('Alert', AlertSchema);
