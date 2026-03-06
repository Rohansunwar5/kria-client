import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
    const [tournamentId, setTournamentId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    const handleDisplay = () => {
        if (tournamentId && categoryId) {
            navigate(`/auction/${tournamentId}/${categoryId}`);
        }
    };

    const handleAdmin = () => {
        if (tournamentId && categoryId && token) {
            localStorage.setItem('organizer_token', token);
            navigate(`/admin/${tournamentId}/${categoryId}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Kria Auction Portal</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Tournament ID</label>
                        <input
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                            value={tournamentId}
                            onChange={(e) => setTournamentId(e.target.value)}
                            placeholder="Ex: 67b1c3..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Category ID</label>
                        <input
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            placeholder="Ex: 67b1c4..."
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            onClick={handleDisplay}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded font-bold transition"
                        >
                            📺 Launch Display
                        </button>
                    </div>

                    <div className="border-t border-gray-700 my-4 pt-4">
                        <h3 className="text-sm font-bold text-gray-400 mb-2">Organizer Access</h3>
                        <label className="block text-sm mb-1 text-gray-500">Access Token (JWT)</label>
                        <input
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white mb-2"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste token here..."
                            type="password"
                        />
                        <button
                            onClick={handleAdmin}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold transition"
                        >
                            🛠 Launch Admin Panel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
