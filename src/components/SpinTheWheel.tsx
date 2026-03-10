import React, { useState, useRef, useEffect } from 'react';

// ============================================================================
// SPIN THE WHEEL — SVG-based with proper segments & labels
// ============================================================================

interface SpinTeam {
    id: string;
    name: string;
    color: string;
}

interface SpinTheWheelProps {
    tiedTeams: SpinTeam[];
    hardLimit: number;
    /** If true, show "Confirm & Sell" after spin result. If false, read-only (public). */
    interactive?: boolean;
    onConfirm?: (winnerTeamId: string) => void;
    onSpin?: () => Promise<string | null>;
    externalWinnerId?: string | null;
    externalSpinStartedAt?: string | null;
    actionLoading?: string | null;
}

const WHEEL_SIZE = 280;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 8;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

const SpinTheWheel: React.FC<SpinTheWheelProps> = ({
    tiedTeams,
    hardLimit,
    interactive = false,
    onConfirm,
    onSpin,
    externalWinnerId,
    externalSpinStartedAt,
    actionLoading,
}) => {
    const [spinning, setSpinning] = useState(false);
    const [currentAngle, setCurrentAngle] = useState(0);
    const [winnerTeamId, setWinnerTeamId] = useState<string | null>(null);
    const [isSpinningReq, setIsSpinningReq] = useState(false);
    const wheelRef = useRef<SVGGElement>(null);

    const segmentAngle = 360 / tiedTeams.length;
    const winnerTeam = winnerTeamId ? tiedTeams.find(t => t.id === winnerTeamId) : null;

    // React to external spin state (Public display)
    useEffect(() => {
        if (externalWinnerId && externalSpinStartedAt && !interactive) {
            // If we are already spinning or have result, ignore
            if (spinning || winnerTeamId === externalWinnerId) return;

            const spinStartMs = new Date(externalSpinStartedAt).getTime();
            const elapsed = Date.now() - spinStartMs;

            if (elapsed < 6000) {
                // Spin recently started, let's animate to it!
                const winnerIdx = tiedTeams.findIndex(t => t.id === externalWinnerId);
                if (winnerIdx === -1) return;

                setSpinning(true);
                const segCenter = winnerIdx * segmentAngle + segmentAngle / 2;
                const fullSpins = 5 + Math.floor(Math.random() * 4);
                const targetAngle = fullSpins * 360 + (360 - segCenter);

                setCurrentAngle(prev => prev + targetAngle);

                setTimeout(() => {
                    setSpinning(false);
                    setWinnerTeamId(externalWinnerId);
                }, 4500);
            } else {
                // Spin finished long ago, show result instantly
                setWinnerTeamId(externalWinnerId);
            }
        } else if (!externalWinnerId && !spinning) {
            // Reset if tie breaker restarts
            setWinnerTeamId(null);
            setCurrentAngle(0);
        }
    }, [externalWinnerId, externalSpinStartedAt, interactive, tiedTeams, segmentAngle, spinning, winnerTeamId]);

    const handleSpin = async () => {
        if (spinning || isSpinningReq || tiedTeams.length < 2) return;
        setIsSpinningReq(true);
        setWinnerTeamId(null);

        let activeWinnerId: string | null = null;
        if (onSpin) {
            try {
                activeWinnerId = await onSpin();
            } catch (err) {
                setIsSpinningReq(false);
                return; // Backend failed
            }
        } else {
            // Pick random locally if no backend
            const wIdx = Math.floor(Math.random() * tiedTeams.length);
            activeWinnerId = tiedTeams[wIdx].id;
        }

        if (!activeWinnerId) {
            setIsSpinningReq(false);
            return;
        }

        setIsSpinningReq(false);
        setSpinning(true);

        const winnerIdx = tiedTeams.findIndex(t => t.id === activeWinnerId);

        // Calculate target angle: pointer is at top (0°), segment 0 starts at 0°
        // To land on winner segment center: we want the wheel to rotate so that
        // the center of winnerIdx's segment aligns with the top pointer.
        const segCenter = winnerIdx * segmentAngle + segmentAngle / 2;
        const fullSpins = 5 + Math.floor(Math.random() * 4); // 5-8 full rotations
        const targetAngle = fullSpins * 360 + (360 - segCenter);

        setCurrentAngle(prev => prev + targetAngle);

        setTimeout(() => {
            setSpinning(false);
            setWinnerTeamId(tiedTeams[winnerIdx].id);
        }, 4500);
    };

    const handleConfirm = () => {
        if (winnerTeamId && onConfirm) {
            onConfirm(winnerTeamId);
        }
    };

    return (
        <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/10 border border-amber-500/30 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">⚡</span>
                <h4 className="text-xl font-oswald font-bold text-amber-400">Tie-Breaker!</h4>
            </div>
            <p className="text-sm text-gray-400 mb-6">{tiedTeams.length} teams matched at ₹{hardLimit.toLocaleString()}</p>

            {/* Wheel Container */}
            <div className="relative mx-auto" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE + 20 }}>
                {/* Pointer Triangle */}
                <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ top: -2 }}>
                    <svg width="28" height="24" viewBox="0 0 28 24">
                        <polygon points="14,24 0,0 28,0" fill="#f59e0b" stroke="#111" strokeWidth="1.5" />
                    </svg>
                </div>

                {/* SVG Wheel */}
                <svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                    style={{ marginTop: 16 }}>

                    {/* Outer ring */}
                    <circle cx={CENTER} cy={CENTER} r={RADIUS + 4} fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.4" />

                    {/* Spinning group */}
                    <g ref={wheelRef}
                        style={{
                            transform: `rotate(${currentAngle}deg)`,
                            transformOrigin: `${CENTER}px ${CENTER}px`,
                            transition: spinning ? 'transform 4.5s cubic-bezier(0.15, 0.6, 0.15, 1)' : 'none',
                        }}>

                        {/* Segments */}
                        {tiedTeams.map((team, i) => {
                            const startAngle = i * segmentAngle;
                            const endAngle = (i + 1) * segmentAngle;
                            const path = describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle);

                            // Label position: midpoint of the arc, at 60% radius
                            const midAngle = startAngle + segmentAngle / 2;
                            const labelR = RADIUS * 0.62;
                            const labelPos = polarToCartesian(CENTER, CENTER, labelR, midAngle);

                            return (
                                <g key={team.id}>
                                    <path d={path} fill={team.color} stroke="#111" strokeWidth="2" />
                                    <text
                                        x={labelPos.x}
                                        y={labelPos.y}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fill="white"
                                        fontWeight="800"
                                        fontSize={tiedTeams.length <= 4 ? '13' : '10'}
                                        fontFamily="Oswald, sans-serif"
                                        style={{
                                            textTransform: 'uppercase',
                                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                                        }}
                                        transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                                    >
                                        {team.name.length > 10 ? team.name.slice(0, 9) + '…' : team.name}
                                    </text>
                                </g>
                            );
                        })}
                    </g>

                    {/* Center circle */}
                    <circle cx={CENTER} cy={CENTER} r="22" fill="#111" stroke="#f59e0b" strokeWidth="3" />
                    <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="central" fill="#f59e0b" fontWeight="900" fontSize="16">⚡</text>
                </svg>
            </div>

            {/* Result or buttons */}
            {winnerTeam ? (
                <div className="mt-4 space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-in fade-in zoom-in-95 duration-500">
                        <p className="text-sm text-gray-400">🏆 Winner</p>
                        <p className="text-3xl font-oswald font-black text-green-400">{winnerTeam.name}</p>
                        <p className="text-xs text-gray-500 mt-1">at ₹{hardLimit.toLocaleString()}</p>
                    </div>
                    {interactive && onConfirm && (
                        <button onClick={handleConfirm} disabled={actionLoading === 'resolve'}
                            className="flex items-center justify-center gap-2 mx-auto px-8 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-50 shadow-lg shadow-green-600/20 transition-all">
                            {actionLoading === 'resolve' ? (
                                <span className="inline-block w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            ) : '✅'}
                            Confirm & Sell
                        </button>
                    )}
                </div>
            ) : (
                <div className="mt-4">
                    {interactive ? (
                        <button onClick={handleSpin} disabled={spinning || isSpinningReq}
                            className="flex items-center justify-center gap-2 mx-auto px-10 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg disabled:opacity-50 shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105 active:scale-95">
                            {spinning || isSpinningReq ? (
                                <><span className="inline-block w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Spinning...</>
                            ) : (
                                <><span className="text-xl">🎰</span> SPIN THE WHEEL!</>
                            )}
                        </button>
                    ) : (
                        <div className="text-gray-500 text-sm animate-pulse">
                            {spinning ? '🎰 Wheel is spinning...' : 'Waiting for organizer to spin...'}
                        </div>
                    )}
                </div>
            )}

            {/* Team chips at bottom */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {tiedTeams.map(team => (
                    <div key={team.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${winnerTeam?.id === team.id
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-white/5 border-white/10 text-gray-400'}`}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                        {team.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpinTheWheel;
