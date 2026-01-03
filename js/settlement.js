/**
 * Poker Night Score Tracker - Settlement Algorithm
 * Calculates optimal payment settlements to minimize transactions
 */

/**
 * Calculate settlement transactions to minimize the number of payments
 * Uses a greedy algorithm to match creditors with debtors
 *
 * @param {Array} players - Array of player objects with name and netPosition
 * @returns {Array} Array of transaction objects {from, to, amount}
 */
function calculateSettlement(players) {
    // Calculate net positions (should already be done, but recalculate to be safe)
    const positions = players.map(player => ({
        name: player.name,
        net: player.netPosition || (player.finalCash - player.totalBuyIn)
    }));

    // Separate creditors (net positive) and debtors (net negative)
    // Sort creditors in descending order (largest credit first)
    // Sort debtors in ascending order (largest debt first)
    const creditors = positions
        .filter(p => p.net > 0.01) // Use 0.01 threshold to handle floating point precision
        .sort((a, b) => b.net - a.net)
        .map(p => ({ ...p })); // Clone to avoid modifying original

    const debtors = positions
        .filter(p => p.net < -0.01) // Use 0.01 threshold to handle floating point precision
        .sort((a, b) => a.net - b.net)
        .map(p => ({ ...p })); // Clone to avoid modifying original

    const transactions = [];
    let i = 0; // Creditor index
    let j = 0; // Debtor index

    // Greedy algorithm: match largest creditor with largest debtor
    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        // Calculate payment amount (minimum of what creditor is owed and debtor owes)
        const amount = Math.min(creditor.net, -debtor.net);

        // Create transaction
        transactions.push({
            from: debtor.name,
            to: creditor.name,
            amount: amount.toFixed(2)
        });

        // Update net positions
        creditor.net -= amount;
        debtor.net += amount;

        // Move to next creditor or debtor if fully settled
        if (Math.abs(creditor.net) < 0.01) {
            i++;
        }
        if (Math.abs(debtor.net) < 0.01) {
            j++;
        }
    }

    return transactions;
}

/**
 * Validate that the sum of final cash equals the sum of buy-ins
 *
 * @param {Array} players - Array of player objects
 * @param {number} totalPot - Total pot amount
 * @returns {boolean} True if totals match (within floating point tolerance)
 */
function validateFinalStandings(players, totalPot) {
    const totalFinalCash = players.reduce((sum, p) => sum + p.finalCash, 0);
    const difference = Math.abs(totalFinalCash - totalPot);

    // Allow for small floating point errors (< 0.01)
    return difference < 0.01;
}
