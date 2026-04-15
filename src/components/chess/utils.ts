import { Chess } from 'chess.js';

export const fetchPuzzle = async (username: string, token: string) => {
    // 1. Fetch Activity to get the latest puzzle ID
    const res = await fetch(`https://lichess.org/api/puzzle/activity?max=1`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/x-ndjson'
        }
    });

    const reader = res.body?.getReader();
    if (!reader) throw new Error('Failed to get reader');
    const { value } = await reader.read();
    const text = new TextDecoder().decode(value);
    const activity = JSON.parse(text.split('\n')[0]);

    console.log(activity);

    // Normalize orientation: Lichess uses "white"/"black", we use "w"/"b"
    // Fallback: Use the turn indicator from the FEN if orientation is missing
    const fenTurn = activity.puzzle.fen.split(' ')[1]; // 'w' or 'b'
    let orientation = activity.puzzle.orientation === 'black' ? 'b' :
        activity.puzzle.orientation === 'white' ? 'w' :
            fenTurn; // Use FEN as fallback

    return {
        fen: activity.puzzle.fen,
        moves: activity.puzzle.solution,
        id: activity.puzzle.id,
        rating: activity.puzzle.rating,
        themes: activity.puzzle.themes,
        orientation: orientation as 'w' | 'b',
        date: activity.date, // timestamp
        win: activity.win, // boolean
        lastMove: activity.puzzle.lastMove // e.g. "e1e5"
    };
}

/*
ACTIVITY SAMPLE
{
    "date": 1773005321548,
    "win": true,
    "puzzle": {
        "id": "btHpZ",
        "rating": 1656,
        "plays": 9714,
        "solution": [
            "d5d4",
            "g1h1",
            "d4e5",
            "f6e5",
            "d6e5"
        ],
        "themes": [
            "crushing",
            "long",
            "hangingPiece",
            "master",
            "middlegame"
        ],
        "fen": "5r2/2k2p2/1ppp1Q2/3qRP1p/3N4/1P5P/r1P3P1/5RK1 b - - 0 1",
        "lastMove": "e1e5"
    }
}
*/