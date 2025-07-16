

create table flaskreactor.chess_games (
    id text PRIMARY KEY,
    white_player text,
    black_player text,
    boardstate JSON,
    completed boolean,
    time_started timestamp,
    last_move timestamp,
    time_ended timestamp,
    player_turn text, -- username of active player
    winner text, 
    notation text,
    whitekingmoved boolean,
    blackkingmoved boolean,
    wqr_moved boolean,
    wkr_moved boolean,
    bqr_moved boolean,
    bkr_moved boolean,
    pawn_leapt boolean,
    pawn_leap_col int
);

create table flaskreactor.tictactoe_games (
    id text PRIMARY KEY,
    x_player text,
    o_player text,
    boardstate character[],
    completed boolean,
    time_started timestamp,
    last_move timestamp,
    time_ended timestamp,
    player_turn text,
    winner text
);