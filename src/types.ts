import React from 'react';

export interface Player {
    _id: string;
    profile: {
        firstName: string;
        lastName: string;
        age: number;
        gender: string;
        skillLevel: string;
        photo?: string;
    };
    auctionData: {
        basePrice: number;
    };
}

export interface Team {
    _id: string;
    name: string;
    budget: number;
    initialBudget: number;
    playersCount: number;
    totalSpent: number;
    primaryColor?: string;
    secondaryColor?: string;
}

export interface AuctionStatus {
    _id: string;
    status: 'not_started' | 'in_progress' | 'paused' | 'sold' | 'completed';
    currentPlayerIndex: number;
    totalPlayers: number;
    logsCount: number;
    lastSoldResult?: {
        playerName: string;
        teamName: string;
        teamColor: string;
        soldPrice: number;
        timestamp: string;
    };
}

export interface AuctionSoldLog {
    _id: string;
    registrationId: string;
    playerName: string;
    teamId: string;
    teamName: string;
    finalPrice: number;
    auctionType: string;
    recordedBy: string;
    timestamp: string;
}
