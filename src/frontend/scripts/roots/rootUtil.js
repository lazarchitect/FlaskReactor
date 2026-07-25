
/** Based on a game's players, displays the player vs. player text in the page title (tab text)
 * @returns {string} the same text for use later in the page */
export function configureTitlePrefix(players, gameType) {
    const isPlayer = players.includes(payload.username);
    const opponentName = isPlayer ? players.filter(playerName => playerName !== payload.username).pop() : null;

    const prefix = gameType + " " + (isPlayer ? "Vs. " + opponentName : players[0] + " Vs. " + players[1]);
    document.querySelector("title").innerText = prefix + document.querySelector("title").innerText;
    return prefix;
}