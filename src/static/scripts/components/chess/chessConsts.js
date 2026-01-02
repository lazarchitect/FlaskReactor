const KNIGHT_OFFSET_DIFFS = [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]];
const BISHOP_OFFSET_DIFFS = [[1,1],[1,-1],[-1,1],[-1,-1]];
const ROOK_OFFSET_DIFFS = [[0,1],[0,-1],[1,0],[-1,0]];

const offsetMap = (diff) => ({row: diff[0], col: diff[1]});

export const KNIGHT_OFFSETS = KNIGHT_OFFSET_DIFFS.map(offsetMap);
export const BISHOP_OFFSETS = BISHOP_OFFSET_DIFFS.map(offsetMap);
export const ROOK_OFFSETS = ROOK_OFFSET_DIFFS.map(offsetMap);
export const ROYAL_OFFSETS = BISHOP_OFFSETS.concat(ROOK_OFFSETS);

export const WHITE = 'White';
export const BLACK = 'Black';

export const PAWN = 'Pawn';
export const BISHOP = 'Bishop';
export const QUEEN = 'Queen';
export const KING = 'King';
export const ROOK = 'Rook';
export const KNIGHT = 'Knight';