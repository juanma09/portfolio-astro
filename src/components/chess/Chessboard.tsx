import React, { useState, useEffect } from 'react';
import { Chess, type Square } from 'chess.js';
import { Rook } from './pieces/Rook';
import { Queen } from './pieces/Queen';
import { Pawn } from './pieces/Pawn';
import { Knight } from './pieces/Knight';
import { King } from './pieces/King';
import { Bishop } from './pieces/Bishop';
import { fetchPuzzle } from './utils';
import { motion, AnimatePresence } from 'framer-motion';

const defaultRanks = [8, 7, 6, 5, 4, 3, 2, 1];
const defaultFiles = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function Chessboard() {
    const [game, setGame] = useState(new Chess());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [validMoves, setValidMoves] = useState<Square[]>([]);
    const [board, setBoard] = useState(game.board());

    // Puzzle & Metadata State
    const [puzzleStatus, setPuzzleStatus] = useState<'loading' | 'playing' | 'solved' | 'failed'>('loading');
    const [puzzleData, setPuzzleData] = useState<any>(null); // Stores rating, themes, etc.
    const [solutionMoves, setSolutionMoves] = useState<string[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [orientation, setOrientation] = useState<'w' | 'b'>('w');
    const [initialFen, setInitialFen] = useState('');
    const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
    const [pieceIds, setPieceIds] = useState<Record<string, string>>({});

    const initializePieceIds = (currentGame: Chess) => {
        const board = currentGame.board();
        const map: Record<string, string> = {};
        board.forEach((row, r) => {
            row.forEach((p, f) => {
                if (p) {
                    const square = `${defaultFiles[f]}${defaultRanks[r]}`;
                    map[square] = `${p.color}${p.type}-${square}-${Math.random().toString(36).substr(2, 4)}`;
                }
            });
        });
        setPieceIds(map);
    };

    useEffect(() => {
        const loadLichessPuzzle = async () => {
            const username = import.meta.env.PUBLIC_LICHESS_USERNAME;
            const token = import.meta.env.PUBLIC_LICHESS_API_KEY;

            try {
                const data = await fetchPuzzle(username, token);
                const newGame = new Chess(data.fen);

                setPuzzleData(data);
                setSolutionMoves(data.moves);
                setOrientation(data.orientation as 'w' | 'b');
                setInitialFen(data.fen);

                // Set initial last move from the puzzle
                if (data.lastMove) {
                    setLastMove({
                        from: data.lastMove.substring(0, 2) as Square,
                        to: data.lastMove.substring(2, 4) as Square
                    });
                }

                setGame(newGame);
                initializePieceIds(newGame);
                setPuzzleStatus('playing');
            } catch (err) {
                console.error("Failed to load Lichess puzzle:", err);
            }
        };
        loadLichessPuzzle();
    }, []);


    const resetPuzzle = () => {
        if (!initialFen) return;
        const newGame = new Chess(initialFen);

        // Restore initial last move
        if (puzzleData?.lastMove) {
            setLastMove({
                from: puzzleData.lastMove.substring(0, 2) as Square,
                to: puzzleData.lastMove.substring(2, 4) as Square
            });
        } else {
            setLastMove(null);
        }

        setGame(newGame);
        initializePieceIds(newGame);
        setSelectedSquare(null);
        setValidMoves([]);
        setCurrentMoveIndex(0);
        setPuzzleStatus('playing');
    };

    const attemptOpponentMove = (currentGame: Chess, newIndex: number) => {
        if (newIndex >= solutionMoves.length) {
            setPuzzleStatus('solved');
            return;
        }

        const opponentLan = solutionMoves[newIndex];
        // Parse LAN (e.g. "e2e4" -> from: "e2", to: "e4")
        const from = opponentLan.substring(0, 2) as Square;
        const to = opponentLan.substring(2, 4) as Square;
        const promotion = opponentLan.length > 4 ? opponentLan[4] : undefined;

        setTimeout(() => {
            currentGame.move({ from, to, promotion });
            setLastMove({ from, to });

            // Update piece ID map for the move to allow gliding animation
            setPieceIds(prev => {
                const next = { ...prev };
                const id = next[from];
                delete next[from];
                next[to] = id;
                return next;
            });

            setGame(new Chess(currentGame.fen()));

            if (newIndex + 1 >= solutionMoves.length) {
                setPuzzleStatus('solved');
            } else {
                setCurrentMoveIndex(newIndex + 1);
            }
        }, 800);
    };

    const handleSquareClick = (square: Square) => {
        if (puzzleStatus !== 'playing') return;

        if (selectedSquare === null) {
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                setSelectedSquare(square);
                const moves = game.moves({ square, verbose: true });
                setValidMoves(moves.map(m => m.to as Square));
            }
        } else {
            try {
                const clone = new Chess(game.fen());
                const move = clone.move({
                    from: selectedSquare,
                    to: square,
                    promotion: 'q',
                });

                if (move) {
                    // Compare user's LAN move with solution LAN move
                    const expectedLan = solutionMoves[currentMoveIndex];
                    const userLan = selectedSquare + square + (move.promotion || '');

                    // Note: Basic LAN comparison. Lichess sometimes includes promotion char.
                    if (userLan.startsWith(expectedLan) || expectedLan.startsWith(userLan)) {
                        game.move(move);
                        setLastMove({ from: selectedSquare, to: square });

                        // Update piece ID map for the move to allow gliding animation
                        setPieceIds(prev => {
                            const next = { ...prev };
                            const id = next[selectedSquare!];
                            delete next[selectedSquare!];
                            next[square] = id;
                            return next;
                        });

                        setGame(new Chess(game.fen()));

                        const nextIndex = currentMoveIndex + 1;
                        if (nextIndex >= solutionMoves.length) {
                            setPuzzleStatus('solved');
                        } else {
                            setCurrentMoveIndex(nextIndex);
                            attemptOpponentMove(game, nextIndex);
                        }
                    } else {
                        // WRONG MOVE: show it and then undo it
                        const from = selectedSquare!;
                        const to = square;
                        const prevLastMove = lastMove;
                        const prevPieceIds = { ...pieceIds };

                        game.move(move); // Temporarily apply the wrong move
                        setLastMove({ from, to });
                        setPieceIds(prev => {
                            const next = { ...prev };
                            const id = next[from];
                            if (id) {
                                delete next[from];
                                next[to] = id;
                            }
                            return next;
                        });
                        setGame(new Chess(game.fen()));
                        setPuzzleStatus('failed');

                        setTimeout(() => {
                            game.undo(); // Pull it back
                            setLastMove(prevLastMove);
                            setPieceIds(prevPieceIds); // Restore previous piece IDs to glide back
                            setGame(new Chess(game.fen()));
                            setPuzzleStatus('playing');
                        }, 1000);
                    }
                }
            } catch (e) {
                const piece = game.get(square);
                if (piece && piece.color === game.turn()) {
                    setSelectedSquare(square);
                    const moves = game.moves({ square, verbose: true });
                    setValidMoves(moves.map(m => m.to as Square));
                    return;
                }
            }
            setSelectedSquare(null);
            setValidMoves([]);
        }
    };

    const renderRanks = orientation === 'w' ? defaultRanks : [...defaultRanks].reverse();
    const renderFiles = orientation === 'w' ? defaultFiles : [...defaultFiles].reverse();

    return (
        <div className="flex flex-col items-center max-w-md w-full mx-auto">
            {/* 1. TOP HEADER: Technical Stats & Turn Indicator */}
            <div className="w-full mb-6 flex justify-between items-center border-b border-zinc-800 pb-4">
                {/* Left: Puzzle Info */}
                <div className="space-y-1">
                    <h3 className="text-emerald-400 font-mono text-xs tracking-tighter uppercase font-bold">
                        Last Attempted Puzzle
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-mono leading-none">
                        {puzzleData?.date
                            ? `${new Date(puzzleData.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — RATING: ${puzzleData.rating}`
                            : "INITIALIZING..."}
                    </p>
                </div>

                {/* Right: Solved/Failed Badge */}
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors duration-300 ${puzzleStatus === 'solved' ? 'bg-green-500/10 border-green-500/50 text-green-500' :
                    puzzleStatus === 'failed' ? 'bg-red-500/10 border-red-500/50 text-red-500' :
                        'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}>
                    {puzzleStatus === 'playing' ? "ACTIVE" : puzzleStatus.toUpperCase()}
                </div>
            </div>
            {/* 2. THE BOARD */}
            <div className="relative group block">
                <div className={`absolute inset-0 blur-[60px] rounded-full transition-all duration-1000 ${puzzleStatus === 'solved' ? 'bg-green-500/30' :
                    puzzleStatus === 'failed' ? 'bg-red-500/30' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
                    }`}></div>

                <div className={`relative p-3 rounded-xl bg-white/[0.03] border border-white/5 shadow-2xl backdrop-blur-md transition-all duration-500 ${puzzleStatus === 'failed' ? 'border-red-500/40 shadow-red-500/10' : ''
                    }`}>
                    {puzzleStatus === 'loading' ? (
                        <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center bg-zinc-900/50">
                            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="relative w-64 h-64 md:w-80 md:h-80 border border-zinc-800 bg-zinc-900 overflow-hidden">
                            {/* Squares Layer */}
                            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                                {renderRanks.map((rank, rIdx) =>
                                    renderFiles.map((file, fIdx) => {
                                        const squareId = `${file}${rank}` as Square;
                                        const isDarkSquare = (rIdx + fIdx) % 2 !== 0;
                                        const isSelected = selectedSquare === squareId;
                                        const isPossibleMove = validMoves.includes(squareId);
                                        const isLastMoveHighlight = lastMove && (lastMove.from === squareId || lastMove.to === squareId);

                                        return (
                                            <div
                                                key={squareId}
                                                onClick={() => handleSquareClick(squareId)}
                                                className={`flex items-center justify-center relative
                                                    ${isDarkSquare ? "bg-zinc-800/40" : "bg-zinc-900/20"}
                                                    ${isSelected ? "bg-emerald-500/30" : ""}
                                                    ${isLastMoveHighlight ? "bg-yellow-500/20" : ""}
                                                    transition-colors duration-200 hover:bg-emerald-500/10 cursor-pointer`}
                                            >
                                                {fIdx === 0 && <span className="absolute top-0.5 left-1 text-[7px] font-mono text-zinc-600">{rank}</span>}
                                                {rIdx === 7 && <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-zinc-600">{file}</span>}

                                                {isPossibleMove && (
                                                    <div className={`absolute z-20 rounded-full ${game.get(squareId) ? 'w-full h-full border-4 border-emerald-500/20' : 'w-3 h-3 bg-emerald-500/40'}`}></div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Pieces Layer */}
                            <AnimatePresence>
                                {game.board().map((row, r) =>
                                    row.map((piece, f) => {
                                        if (!piece) return null;
                                        const squareName = `${defaultFiles[f]}${defaultRanks[r]}`;

                                        // Position logic
                                        const visualRankIdx = orientation === 'w' ? r : 7 - r;
                                        const visualFileIdx = orientation === 'w' ? f : 7 - f;

                                        return (
                                            <motion.div
                                                key={pieceIds[squareName] || `${piece.color}${piece.type}-${squareName}`}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                    x: visualFileIdx * 100 + '%',
                                                    y: visualRankIdx * 100 + '%'
                                                }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 250,
                                                    damping: 25,
                                                    mass: 0.8
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '12.5%',
                                                    height: '12.5%',
                                                    pointerEvents: 'none',
                                                    zIndex: 10
                                                }}
                                                className="flex items-center justify-center p-1"
                                            >
                                                <div className="z-10 w-[75%] h-[75%] drop-shadow-2xl transition-transform hover:scale-110 flex items-center justify-center">
                                                    {piece.type === 'p' && <Pawn color={piece.color === 'b' ? "#10b981" : "#e4e4e7"} />}
                                                    {piece.type === 'r' && <Rook color={piece.color === 'b' ? "#10b981" : "#e4e4e7"} />}
                                                    {piece.type === 'n' && <Knight color={piece.color === 'b' ? "#10b981" : "#e4e4e7"} />}
                                                    {piece.type === 'b' && <Bishop color={piece.color === 'b' ? "#10b981" : "#e4e4e7"} />}
                                                    {piece.type === 'q' && <Queen color={piece.color === 'b' ? "#10b981" : "#e4e4e7"} />}
                                                    {piece.type === 'k' && <King color={piece.color === 'b' ? "#10b981" : "#e4e4e7"} />}
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Glued Turn Indicator Below the Board (Right Aligned) */}
                    <div className="absolute top-full right-3 z-40">
                        <motion.div
                            key={game.turn()}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`flex items-center gap-2 px-3 py-1 rounded-b-md border-x border-b bg-zinc-950 transition-all duration-500 ${game.turn() === 'w' ? 'border-white/10' : 'border-emerald-500/20'
                                }`}>
                            <span className={`text-[9px] font-black font-mono uppercase tracking-[0.4em] whitespace-nowrap ${game.turn() === 'w' ? 'text-zinc-100' : 'text-emerald-400'
                                }`}>
                                {game.turn() === 'w' ? "White to move" : "Black to move"}
                            </span>
                        </motion.div>
                    </div>
                </div>
            </div>            {/* 3. BOTTOM FOOTER: Theme Tags */}
            <div className="mt-8 w-full">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Tactical Themes</p>
                <div className="flex flex-wrap gap-2">
                    {puzzleData?.themes.slice(0, 5).map((theme: string) => (
                        <span key={theme} className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-default capitalize">
                            {theme.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                    ))}
                    {puzzleData?.themes.length > 5 && (
                        <span className="text-[9px] font-mono text-zinc-600 self-center">
                            +{puzzleData.themes.length - 5} more
                        </span>
                    )}
                </div>
                <div className="mt-6 flex justify-center">
                    <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest opacity-70">
                        Data provided by <a href="https://lichess.org" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors font-bold text-zinc-300">Lichess</a>
                    </span>
                </div>
            </div>
        </div>
    );
}