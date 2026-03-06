import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auctionApi } from '../api/auction';
import { AuctionStatus, Player, Team } from '../types';

const AdminPanel: React.FC = () => {
    const { tournamentId, categoryId } = useParams<{ tournamentId: string; categoryId: string }>();
    const [status, setStatus] = useState<AuctionStatus | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [soldPrice, setSoldPrice] = useState<number | ''>('');
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshData = async () => {
        if (!tournamentId || !categoryId) return;
        try {
            const data = await auctionApi.getStatus(tournamentId, categoryId);
            setStatus(data.auction);
            setCurrentPlayer(data.currentPlayer);
            setTeams(data.teams);

            // Only clear strict errors, keep warning if needed? 
            // Better to clear error if success
            if (error === 'AUCTION_NOT_STARTED' || error === 'Failed to load auction data') {
                setError(null);
            }

            // Auto-fill base price if new player loaded
            if (data.currentPlayer && (!currentPlayer || data.currentPlayer._id !== currentPlayer._id)) {
                setSoldPrice(data.currentPlayer.auctionData?.basePrice || 0);
                setSelectedTeamId('');
            }
        } catch (err: any) {
            console.error(err);
            // If 404, it means auction hasn't started
            if (err.response && err.response.status === 404) {
                setError('AUCTION_NOT_STARTED');
                setStatus(null); // Ensure status is null so we show the start view
            } else {
                // Don't overwrite existing status on transient network error if we already have data
                if (!status) setError('Failed to load auction data');
            }
        }
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 5000); // Slower poll for admin
        return () => clearInterval(interval);
    }, [tournamentId, categoryId]);

    const handleAction = async (action: () => Promise<any>) => {
        setProcessing(true);
        setError(null);
        try {
            await action();
            await refreshData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Action failed');
        } finally {
            setProcessing(false);
        }
    };

    // Special view for uninitialized auction
    if (!status) {
        if (error === 'AUCTION_NOT_STARTED') {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8 text-gray-900">
                    <h1 className="text-3xl font-bold mb-4">Auction Not Started</h1>
                    <p className="mb-8 text-gray-600 text-lg">The auction for this category has not been initialized yet.</p>
                    <button
                        onClick={() => handleAction(() => auctionApi.start(tournamentId!, categoryId!))}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl shadow-lg transition flex items-center gap-3"
                    >
                        {processing ? 'Starting...' : '🚀 START AUCTION'}
                    </button>
                    {processing && <p className="mt-4 text-gray-500 animate-pulse">Initializing player queue...</p>}
                </div>
            );
        }
        return <div className="p-10 text-center text-gray-600">Loading Admin Panel...</div>;
    }

    const currentTeam = teams.find(t => t._id === selectedTeamId);
    const budgetOk = currentTeam && typeof soldPrice === 'number' ? currentTeam.budget >= soldPrice : false;

    return (
        <div className="min-h-screen bg-gray-100 p-8 text-gray-900">
            <header className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
                <h1 className="text-xl font-bold">🛠 Admin Control Panel</h1>
                <div className="flex gap-4">
                    <span className={`px-3 py-1 rounded text-white ${status.status === 'in_progress' ? 'bg-green-500' : 'bg-gray-500'}`}>
                        {status.status.toUpperCase()}
                    </span>
                    <button
                        onClick={() => handleAction(() => auctionApi.pause(tournamentId!, categoryId!))}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    >
                        {status.status === 'paused' ? 'RESUME' : 'PAUSE'}
                    </button>
                    <button
                        onClick={() => handleAction(() => auctionApi.undo(tournamentId!, categoryId!))}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        disabled={processing}
                    >
                        ↩ UNDO LAST
                    </button>
                </div>
            </header>

            {error && error !== 'AUCTION_NOT_STARTED' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    Error: {error}
                </div>
            )}

            <div className="grid grid-cols-12 gap-8">
                {/* MIDDLE: CURRENT PLAYER ACTIONS */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Current Player</h2>
                        {currentPlayer ? (
                            <div className="flex gap-8">
                                <div className="w-1/3">
                                    <div className="text-4xl mb-4">👤</div>
                                    <div className="text-2xl font-bold">{currentPlayer.profile.firstName} {currentPlayer.profile.lastName}</div>
                                    <div className="text-gray-500">{currentPlayer.profile.age} • {currentPlayer.profile.gender}</div>
                                    <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                        {currentPlayer.profile.skillLevel}
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-sm text-gray-500">Base Price</div>
                                        <div className="text-2xl font-bold text-green-600">₹ {currentPlayer.auctionData?.basePrice}</div>
                                    </div>
                                </div>

                                <div className="w-2/3 bg-gray-50 p-6 rounded border">
                                    <h3 className="font-bold mb-4">Sell Player</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Select Team</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={selectedTeamId}
                                            onChange={(e) => setSelectedTeamId(e.target.value)}
                                        >
                                            <option value="">-- Choose Team --</option>
                                            {teams.map(t => (
                                                <option key={t._id} value={t._id}>
                                                    {t.name} (Budget: ₹{t.budget})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-1">Sold Price</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded"
                                            value={soldPrice}
                                            onChange={(e) => setSoldPrice(Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleAction(() => auctionApi.sell(tournamentId!, categoryId!, selectedTeamId, Number(soldPrice)))}
                                            disabled={!selectedTeamId || !soldPrice || !budgetOk || processing}
                                            className={`flex-1 py-3 rounded font-bold text-white transition
                                                ${!selectedTeamId || !soldPrice || !budgetOk
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700'}`}
                                        >
                                            💰 SELL PLAYER
                                        </button>
                                        <button
                                            onClick={() => handleAction(() => auctionApi.skip(tournamentId!, categoryId!))}
                                            disabled={processing}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded font-bold"
                                        >
                                            ⏭ SKIP
                                        </button>
                                    </div>
                                    {!budgetOk && selectedTeamId && (
                                        <div className="text-red-500 text-sm mt-2">Team does not have enough budget!</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                {status.status === 'completed' ? 'Auction Completed!' : 'No player loaded'}
                                {status.status === 'completed' || (
                                    <button
                                        onClick={() => handleAction(() => auctionApi.next(tournamentId!, categoryId!))}
                                        className="block mx-auto mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        Start Next Player
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Teams Overview</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="p-2 text-left">Team Name</th>
                                        <th className="p-2 text-right">Budget Left</th>
                                        <th className="p-2 text-right">Spent</th>
                                        <th className="p-2 text-center">Players</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map(team => (
                                        <tr key={team._id} className="border-t">
                                            <td className="p-2 font-medium">{team.name}</td>
                                            <td className="p-2 text-right font-bold text-green-600">₹ {team.budget.toLocaleString()}</td>
                                            <td className="p-2 text-right text-gray-500">₹ {team.totalSpent.toLocaleString()}</td>
                                            <td className="p-2 text-center">{team.playersCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT: LOGS */}
                <div className="col-span-12 lg:col-span-4">
                    {/* Placeholder for future logs component if needed */}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
