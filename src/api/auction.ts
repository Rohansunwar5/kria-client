import API from './axios';
import { AuctionStatus, Player, Team } from '../types';

// All auction calls go through the shared API instance (uses `accessToken` from localStorage)
// This is consistent with how all other organizer-protected routes are called.

export const auctionApi = {
    // Public polling endpoints (no auth needed, but token added automatically if present)
    getStatus: async (tournamentId: string, categoryId: string) => {
        const res = await API.get(`/auction/${tournamentId}/${categoryId}/status`);
        return res.data?.data?.data as {
            auction: AuctionStatus;
            currentPlayer: Player | null;
            teams: Team[];
            category?: { _id: string; name: string } | null;
            tournament?: { _id: string; name: string } | null;
        };
    },

    getSoldLog: async (tournamentId: string, categoryId: string) => {
        const res = await API.get(`/auction/${tournamentId}/${categoryId}/sold-log`);
        return res.data?.data?.data;
    },

    // Protected organizer actions
    start: (tournamentId: string, categoryId: string) =>
        API.post('/auction/start', { tournamentId, categoryId }),

    sell: (tournamentId: string, categoryId: string, teamId: string, soldPrice: number) =>
        API.post('/auction/sell', { tournamentId, categoryId, teamId, soldPrice }),

    next: (tournamentId: string, categoryId: string) =>
        API.post('/auction/next', { tournamentId, categoryId }),

    skip: (tournamentId: string, categoryId: string) =>
        API.post('/auction/skip', { tournamentId, categoryId }),

    undo: (tournamentId: string, categoryId: string) =>
        API.post('/auction/undo', { tournamentId, categoryId }),

    pause: (tournamentId: string, categoryId: string) =>
        API.post('/auction/pause', { tournamentId, categoryId }),
};
