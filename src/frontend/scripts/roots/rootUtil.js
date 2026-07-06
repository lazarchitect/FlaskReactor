/**
 * Based on a game's players, displays the player vs. player text in the page title (tab text)
 * @returns {string} the same text for use later in the page
 */
export function configureTitleAddition(playerNames) {
    const isPlayer = playerNames.includes(payload.username);
    const opponentName = isPlayer ? playerNames.filter(playerName => playerName !== payload.username).pop() : null;

    const titleAddition = " " + (isPlayer ? "Vs. " + opponentName : playerNames[0] + " Vs. " + playerNames[1]);
    document.querySelector("title").innerText += titleAddition;
    return titleAddition;
}