'use client';

import React, { useState, useTransition } from 'react';
import {
    Star, StarOff, Plus, Trash2, Bell, BellOff, TrendingUp, Search,
    ChevronRight, AlertTriangle, Loader2, X, Edit2, Check, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    removeFromWatchlist,
    addToWatchlist,
    createAlert,
    deleteAlert,
    updateAlert,
} from '@/lib/actions/watchlistActions';
import TradingViewWidget from '@/components/TradingViewWidget';
import {
    TOP_STORIES_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    WATCHLIST_TABLE_HEADER,
} from '@/lib/constants';

/* ─── Types ─────────────────────────────────────────────── */
interface WatchlistItem {
    _id: string;
    symbol: string;
    company: string;
    addedAt: string;
}

interface AlertItem {
    _id: string;
    symbol: string;
    company: string;
    alertName: string;
    alertType: 'upper' | 'lower';
    threshold: number;
}

interface Props {
    initialWatchlist: WatchlistItem[];
    initialAlerts: AlertItem[];
}

const SCRIPT_BASE = 'https://s3.tradingview.com/external-embedding/embed-widget-';

/* ─── Alert Form Modal ──────────────────────────────────── */
function AlertModal({
    open,
    onClose,
    prefillSymbol = '',
    prefillCompany = '',
    editAlert,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    prefillSymbol?: string;
    prefillCompany?: string;
    editAlert?: AlertItem;
    onSaved: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
        symbol: editAlert?.symbol ?? prefillSymbol,
        company: editAlert?.company ?? prefillCompany,
        alertName: editAlert?.alertName ?? '',
        alertType: editAlert?.alertType ?? ('upper' as 'upper' | 'lower'),
        threshold: editAlert ? String(editAlert.threshold) : '',
    });

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.symbol || !form.alertName || !form.threshold) {
            toast.error('Please fill all fields.');
            return;
        }
        startTransition(async () => {
            const payload = {
                symbol: form.symbol.toUpperCase(),
                company: form.company || form.symbol.toUpperCase(),
                alertName: form.alertName,
                alertType: form.alertType,
                threshold: parseFloat(form.threshold),
            };
            const res = editAlert
                ? await updateAlert(editAlert._id, payload)
                : await createAlert(payload);

            if (res.success) {
                toast.success(editAlert ? 'Alert updated!' : 'Alert created!');
                onSaved();
                onClose();
            } else {
                toast.error('Failed to save alert.');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-gray-800 border border-gray-600 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        {editAlert ? 'Edit Alert' : 'New Price Alert'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="form-label block mb-1.5">Symbol</label>
                            <input
                                value={form.symbol}
                                onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                                placeholder="AAPL"
                                className="form-input w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500"
                            />
                        </div>
                        <div>
                            <label className="form-label block mb-1.5">Alert Name</label>
                            <input
                                value={form.alertName}
                                onChange={e => setForm(f => ({ ...f, alertName: e.target.value }))}
                                placeholder="e.g. Breakout level"
                                className="form-input w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label block mb-1.5">Alert Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['upper', 'lower'] as const).map(t => (
                                <button
                                    type="button"
                                    key={t}
                                    onClick={() => setForm(f => ({ ...f, alertType: t }))}
                                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                                        form.alertType === t
                                            ? t === 'upper'
                                                ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                                                : 'bg-red-500/20 border-red-500 text-red-400'
                                            : 'border-gray-600 text-gray-500 hover:border-gray-500'
                                    }`}
                                >
                                    {t === 'upper' ? '↑ Price Above' : '↓ Price Below'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="form-label block mb-1.5">Threshold Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.threshold}
                            onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
                            placeholder="e.g. 200.00"
                            className="form-input w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-400 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 text-sm font-semibold hover:from-yellow-400 hover:to-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editAlert ? 'Update' : 'Create Alert'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Add Stock Modal ─────────────────────────────────── */
function AddStockModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [sym, setSym] = useState('');
    const [company, setCompany] = useState('');

    if (!open) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sym.trim()) { toast.error('Enter a symbol.'); return; }
        startTransition(async () => {
            const res = await addToWatchlist(sym.trim().toUpperCase(), company.trim() || sym.trim().toUpperCase());
            if (res.success) {
                toast.success(`${sym.toUpperCase()} added to watchlist!`);
                setSym(''); setCompany('');
                onAdded();
                onClose();
            } else {
                toast.error(res.error ?? 'Failed to add stock.');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-gray-800 border border-gray-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-teal-400" />
                        Add to Watchlist
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="form-label block mb-1.5">Ticker Symbol *</label>
                        <input
                            value={sym}
                            onChange={e => setSym(e.target.value)}
                            placeholder="e.g. AAPL"
                            className="form-input w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                        />
                    </div>
                    <div>
                        <label className="form-label block mb-1.5">Company Name (optional)</label>
                        <input
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="e.g. Apple Inc."
                            className="form-input w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                        />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-400 text-sm hover:bg-gray-700 transition-colors">Cancel</button>
                        <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-400 text-gray-900 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add Stock
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   MAIN CLIENT COMPONENT
═══════════════════════════════════════════════════════ */
export default function WatchlistClient({ initialWatchlist, initialAlerts }: Props) {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>(initialWatchlist);
    const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(
        initialWatchlist[0]?.symbol ?? null
    );
    const [isPending, startTransition] = useTransition();
    const [alertModal, setAlertModal] = useState<{ open: boolean; symbol?: string; company?: string; edit?: AlertItem }>({ open: false });
    const [addModal, setAddModal] = useState(false);
    const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);

    /* ── helpers ── */
    const refreshData = () => {
        // Re-fetch is handled by server revalidatePath; for client we optimistically update
    };

    const handleRemove = (symbol: string) => {
        setRemovingSymbol(symbol);
        startTransition(async () => {
            const res = await removeFromWatchlist(symbol);
            if (res.success) {
                setWatchlist(w => w.filter(s => s.symbol !== symbol));
                if (selectedSymbol === symbol) setSelectedSymbol(watchlist.find(w => w.symbol !== symbol)?.symbol ?? null);
                toast.success(`${symbol} removed from watchlist.`);
            } else {
                toast.error('Failed to remove.');
            }
            setRemovingSymbol(null);
        });
    };

    const handleDeleteAlert = (alertId: string) => {
        startTransition(async () => {
            const res = await deleteAlert(alertId);
            if (res.success) {
                setAlerts(a => a.filter(x => x._id !== alertId));
                toast.success('Alert deleted.');
            } else {
                toast.error('Failed to delete alert.');
            }
        });
    };

    const handleDataRefreshed = () => {
        // After add/update, refetch on next navigation via revalidatePath
        window.location.reload();
    };

    /* ─── Empty State ─────────────────────────── */
    if (watchlist.length === 0) {
        return (
            <>
                <AddStockModal open={addModal} onClose={() => setAddModal(false)} onAdded={handleDataRefreshed} />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
                    <div className="w-24 h-24 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                        <Star className="w-12 h-12 text-gray-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-100">Your watchlist is empty</h2>
                        <p className="text-gray-500 max-w-md">Add stocks, ETFs, or indices to track them in real-time. Get price alerts and personalized news.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            id="add-stock-empty-btn"
                            onClick={() => setAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-400 text-gray-900 font-semibold rounded-xl hover:from-teal-400 hover:to-teal-300 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Add Your First Stock
                        </button>
                        <Link href="/search" className="flex items-center gap-2 px-6 py-3 border border-gray-600 text-gray-400 font-medium rounded-xl hover:border-gray-500 hover:text-gray-300 transition-colors">
                            <Search className="w-5 h-5" /> Browse Stocks
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const selectedItem = watchlist.find(w => w.symbol === selectedSymbol);

    /* ─── Alert mini card ─── */
    const AlertCard = ({ alert }: { alert: AlertItem }) => (
        <div className="alert-item">
            <p className="alert-name">{alert.alertName}</p>
            <div className="alert-details">
                <div>
                    <p className="alert-company">{alert.company}</p>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">{alert.symbol}</p>
                </div>
                <div className={`flex flex-col items-end gap-1 ${alert.alertType === 'upper' ? 'text-teal-400' : 'text-red-400'}`}>
                    <span className="text-xs font-medium uppercase tracking-wide">{alert.alertType}</span>
                    <p className="alert-price">${alert.threshold.toFixed(2)}</p>
                </div>
            </div>
            <div className="alert-actions">
                <button
                    onClick={() => setAlertModal({ open: true, edit: alert })}
                    className="alert-update-btn p-1.5 rounded-lg transition-colors"
                    title="Edit alert"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => handleDeleteAlert(alert._id)}
                    className="alert-delete-btn p-1.5 rounded-lg transition-colors"
                    title="Delete alert"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Modals */}
            <AlertModal
                open={alertModal.open}
                onClose={() => setAlertModal({ open: false })}
                prefillSymbol={alertModal.symbol ?? ''}
                prefillCompany={alertModal.company ?? ''}
                editAlert={alertModal.edit}
                onSaved={handleDataRefreshed}
            />
            <AddStockModal
                open={addModal}
                onClose={() => setAddModal(false)}
                onAdded={handleDataRefreshed}
            />

            <div className="space-y-6">
                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">My Watchlist</h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-400/15 border border-teal-400/30 text-teal-400 text-xs font-semibold">
                                {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">Track your saved stocks, set price alerts, and stay on top of market moves.</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            id="add-alert-header-btn"
                            onClick={() => setAlertModal({ open: true })}
                            className="flex items-center gap-2 px-4 py-2 border border-yellow-500/40 text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl text-sm font-medium transition-all"
                        >
                            <Bell className="w-4 h-4" /> New Alert
                        </button>
                        <button
                            id="add-stock-header-btn"
                            onClick={() => setAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-400 text-gray-900 rounded-xl text-sm font-semibold hover:from-teal-400 hover:to-teal-300 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Stock
                        </button>
                    </div>
                </div>

                {/* ── Main Layout: Left panel + Right panel ── */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                    {/* ─ LEFT: Stock list + TradingView mini charts ─ */}
                    <div className="xl:col-span-1 space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium px-1 mb-3">Tracked Stocks</p>
                        {watchlist.map(item => (
                            <div
                                key={item.symbol}
                                id={`watchlist-item-${item.symbol}`}
                                onClick={() => setSelectedSymbol(item.symbol)}
                                className={`group relative flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                                    selectedSymbol === item.symbol
                                        ? 'bg-teal-400/10 border-teal-400/40 shadow-teal-400/10 shadow-md'
                                        : 'bg-gray-800/60 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                        selectedSymbol === item.symbol ? 'bg-teal-400/20 text-teal-400' : 'bg-gray-700 text-gray-400'
                                    }`}>
                                        {item.symbol.slice(0, 2)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`font-bold text-sm font-mono ${selectedSymbol === item.symbol ? 'text-teal-400' : 'text-gray-200'}`}>
                                            {item.symbol}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate max-w-[120px]">{item.company}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        id={`alert-${item.symbol}-btn`}
                                        onClick={e => { e.stopPropagation(); setAlertModal({ open: true, symbol: item.symbol, company: item.company }); }}
                                        title="Add alert"
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-500 hover:text-yellow-400 transition-all"
                                    >
                                        <Bell className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        id={`remove-${item.symbol}-btn`}
                                        onClick={e => { e.stopPropagation(); handleRemove(item.symbol); }}
                                        title="Remove"
                                        disabled={removingSymbol === item.symbol}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-500 hover:text-red-400 transition-all disabled:opacity-50"
                                    >
                                        {removingSymbol === item.symbol
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <X className="w-3.5 h-3.5" />
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setAddModal(true)}
                            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-600 text-gray-500 hover:border-teal-400/50 hover:text-teal-400 rounded-xl text-sm transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add more stocks
                        </button>
                    </div>

                    {/* ─ RIGHT: Detail Area ─ */}
                    <div className="xl:col-span-3 space-y-5">
                        {selectedSymbol ? (
                            <>
                                {/* Symbol Header */}
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-teal-400/15 border border-teal-400/30 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-teal-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-100 font-mono">{selectedSymbol}</h2>
                                            <p className="text-sm text-gray-500">{selectedItem?.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setAlertModal({ open: true, symbol: selectedSymbol, company: selectedItem?.company ?? '' })}
                                            className="flex items-center gap-1.5 px-3 py-2 border border-yellow-500/40 text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg text-xs font-medium transition-all"
                                        >
                                            <Bell className="w-3.5 h-3.5" /> Set Alert
                                        </button>
                                        <Link
                                            href={`/search?q=${selectedSymbol}`}
                                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 rounded-lg text-xs font-medium transition-all"
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5" /> Full Analysis
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(selectedSymbol)}
                                            className="flex items-center gap-1.5 px-3 py-2 border border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                </div>

                                {/* Symbol Info Widget */}
                                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden">
                                    <TradingViewWidget
                                        scriptUrl={`${SCRIPT_BASE}symbol-info.js`}
                                        config={{
                                            symbol: selectedSymbol,
                                            colorTheme: 'dark',
                                            isTransparent: true,
                                            locale: 'en',
                                            width: '100%',
                                            height: 170,
                                        }}
                                        height={170}
                                    />
                                </div>

                                {/* Chart + Technical Analysis Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-2 bg-gray-800/40 border border-gray-700 rounded-2xl overflow-hidden">
                                        <div className="px-4 pt-4 pb-2">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Price Chart</p>
                                        </div>
                                        <TradingViewWidget
                                            scriptUrl={`${SCRIPT_BASE}advanced-chart.js`}
                                            config={{
                                                symbol: selectedSymbol,
                                                theme: 'dark',
                                                backgroundColor: '#141414',
                                                gridColor: '#141414',
                                                locale: 'en',
                                                interval: 'D',
                                                style: 1,
                                                hide_side_toolbar: true,
                                                allow_symbol_change: false,
                                                save_image: false,
                                                width: '100%',
                                                height: 380,
                                            }}
                                            height={380}
                                        />
                                    </div>
                                    <div className="bg-gray-800/40 border border-gray-700 rounded-2xl overflow-hidden">
                                        <div className="px-4 pt-4 pb-2">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Technical Analysis</p>
                                        </div>
                                        <TradingViewWidget
                                            scriptUrl={`${SCRIPT_BASE}technical-analysis.js`}
                                            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(selectedSymbol)}
                                            height={380}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-64 bg-gray-800/40 border border-gray-700 rounded-2xl">
                                <p className="text-gray-600">Select a stock from the list</p>
                            </div>
                        )}

                        {/* ── Alerts Section ── */}
                        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-yellow-400" />
                                    Price Alerts
                                    {alerts.length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-xs font-semibold">
                                            {alerts.length}
                                        </span>
                                    )}
                                </h3>
                                <button
                                    id="new-alert-section-btn"
                                    onClick={() => setAlertModal({ open: true, symbol: selectedSymbol ?? '', company: selectedItem?.company ?? '' })}
                                    className="text-xs flex items-center gap-1 text-yellow-500 hover:text-yellow-400 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Alert
                                </button>
                            </div>

                            {alerts.length === 0 ? (
                                <div className="text-center py-8 space-y-2">
                                    <BellOff className="w-8 h-8 text-gray-600 mx-auto" />
                                    <p className="text-gray-500 text-sm">No alerts set. Add one to get notified when a stock hits your price target.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {alerts.map(alert => (
                                        <AlertCard key={alert._id} alert={alert} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Market News ── */}
                        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl overflow-hidden">
                            <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-teal-400" />
                                <h3 className="font-semibold text-gray-100">Market News</h3>
                            </div>
                            <TradingViewWidget
                                scriptUrl={`${SCRIPT_BASE}timeline.js`}
                                config={selectedSymbol
                                    ? { ...TOP_STORIES_WIDGET_CONFIG, feedMode: 'symbol', symbol: selectedSymbol }
                                    : TOP_STORIES_WIDGET_CONFIG
                                }
                                height={500}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
