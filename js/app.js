/**
 * Poker Night Score Tracker - Main Application Logic
 * Handles state management and UI updates
 */

// Application State
const appState = {
    currentScreen: 'setup',
    buyInAmount: 200,
    startingStack: 400,
    players: [],
    // players structure: [{ name: '', buyIns: 0, totalBuyIn: 0, finalCash: 0, netPosition: 0 }]
};

// Setup Players (temporary array for setup screen only)
let setupPlayers = [];

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Try to load saved session
    const savedSession = loadSession();

    if (savedSession && savedSession.currentScreen && savedSession.players && savedSession.players.length > 0) {
        // Restore session
        appState.currentScreen = savedSession.currentScreen;
        appState.buyInAmount = savedSession.buyInAmount || 200;
        appState.startingStack = savedSession.startingStack || 400;
        appState.players = savedSession.players;

        // Show appropriate screen
        switch (savedSession.currentScreen) {
            case 'buyin':
                renderBuyInScreen();
                showScreen('buyin');
                showRestoredMessage();
                break;
            case 'standing':
                renderStandingScreen();
                showScreen('standing');
                showRestoredMessage();
                break;
            case 'settlement':
                renderSettlementScreen();
                showScreen('settlement');
                showRestoredMessage();
                break;
            default:
                renderSetupScreen();
                showScreen('setup');
        }
    } else {
        // Start fresh
        renderSetupScreen();
        showScreen('setup');
    }
}

function showRestoredMessage() {
    const timestamp = getSessionTimestamp();
    if (timestamp) {
        const date = new Date(timestamp);
        const timeStr = date.toLocaleString();

        // Create and show temporary notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<p>Session restored from ${timeStr}</p>`;
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ===== SCREEN MANAGEMENT =====
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show requested screen
    const screen = document.getElementById(`screen-${screenName}`);
    if (screen) {
        screen.classList.add('active');
        appState.currentScreen = screenName;
    }
}

// ===== CHECKPOINT 3: PLAYER SETUP SCREEN =====
function renderSetupScreen() {
    const container = document.getElementById('setup-content');

    container.innerHTML = `
        <h3 class="mb-md">Player Names</h3>
        <div id="player-names-container" class="mb-lg">
            <!-- Player name inputs will be generated here -->
        </div>

        <div class="add-player-section mb-lg">
            <button id="btn-add-player-setup" class="btn btn-secondary btn-block" type="button">
                + Add Player
            </button>
        </div>

        <div class="form-group">
            <label for="chips-per-buyin">Chips per Buy-in</label>
            <input
                type="number"
                id="chips-per-buyin"
                value="400"
                min="1"
                step="1"
                placeholder="Enter starting stack"
            >
            <p class="text-muted">Example: ₹200 buy-in = 400 chips (2:1 ratio)</p>
        </div>

        <button id="btn-start-game" class="btn btn-primary btn-block" disabled>
            Start Game
        </button>
    `;

    // Initialize setup players and generate inputs
    initializeSetupPlayers();
    generatePlayerInputs();

    // Add event listeners
    const startButton = document.getElementById('btn-start-game');
    startButton.addEventListener('click', handleStartGame);

    const btnAddPlayerSetup = document.getElementById('btn-add-player-setup');
    if (btnAddPlayerSetup) {
        btnAddPlayerSetup.addEventListener('click', handleAddPlayerSetup);
    }
}

function generatePlayerInputs() {
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';

    // Render existing player inputs from setupPlayers array
    setupPlayers.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'form-group player-input-group';
        playerDiv.innerHTML = `
            <label for="player-${index}">Player ${index + 1}</label>
            <div class="input-with-remove">
                <input
                    type="text"
                    id="player-${index}"
                    class="player-name-input"
                    placeholder="Enter player name"
                    value="${player.name}"
                    data-player-index="${index}"
                >
                <button class="btn btn-icon btn-remove" data-remove-index="${index}" type="button">×</button>
            </div>
            <div id="player-${index}-error" class="error-message hidden"></div>
        `;
        container.appendChild(playerDiv);
    });

    // Add event listeners
    document.querySelectorAll('.player-name-input').forEach(input => {
        input.addEventListener('input', handlePlayerNameInput);
    });

    document.querySelectorAll('[data-remove-index]').forEach(btn => {
        btn.addEventListener('click', handleRemovePlayer);
    });

    // Update "+ Add Player" button visibility
    const btnAddPlayerSetup = document.getElementById('btn-add-player-setup');
    if (btnAddPlayerSetup) {
        if (setupPlayers.length >= 9) {
            btnAddPlayerSetup.classList.add('hidden');
        } else {
            btnAddPlayerSetup.classList.remove('hidden');
        }
    }

    // Validate after rendering
    validateSetupPlayers();
}

// ===== SETUP PLAYER MANAGEMENT FUNCTIONS =====
function initializeSetupPlayers() {
    setupPlayers = [{ name: '' }]; // Start with 1 empty player
}

function handlePlayerNameInput(event) {
    const index = parseInt(event.target.dataset.playerIndex);
    setupPlayers[index].name = event.target.value;
    validateSetupPlayers();
}

function handleAddPlayerSetup() {
    if (setupPlayers.length >= 9) {
        return; // Max players reached
    }
    setupPlayers.push({ name: '' });
    generatePlayerInputs();
}

function handleRemovePlayer(event) {
    const index = parseInt(event.target.dataset.removeIndex);
    if (setupPlayers.length <= 1) {
        return; // Must have at least 1 player
    }
    setupPlayers.splice(index, 1);
    generatePlayerInputs();
    validateSetupPlayers();
}

function validateSetupPlayers() {
    let isValid = true;
    const names = [];

    // Clear all error messages first
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.add('hidden');
        msg.textContent = '';
    });

    // Check each player
    setupPlayers.forEach((player, index) => {
        const name = player.name.trim();

        // Check empty name
        if (name === '') {
            const errorDiv = document.getElementById(`player-${index}-error`);
            if (errorDiv) {
                errorDiv.textContent = 'Name cannot be empty';
                errorDiv.classList.remove('hidden');
            }
            isValid = false;
        } else {
            names.push({ name, index });
        }
    });

    // Check for duplicates
    const nameSet = new Set();
    names.forEach(({ name, index }) => {
        if (nameSet.has(name.toLowerCase())) {
            const errorDiv = document.getElementById(`player-${index}-error`);
            if (errorDiv) {
                errorDiv.textContent = 'This name is already used';
                errorDiv.classList.remove('hidden');
            }
            isValid = false;
        }
        nameSet.add(name.toLowerCase());
    });

    // Enable/disable start button
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
        startBtn.disabled = !isValid;
    }

    return isValid;
}

function handleStartGame() {
    if (!validateSetupPlayers()) {
        return;
    }

    // Convert setupPlayers to appState.players
    appState.players = setupPlayers
        .filter(p => p.name.trim() !== '') // Filter out any empty names
        .map(p => ({
            name: p.name.trim(),
            buyIns: 0,
            totalBuyIn: 0,
            finalCash: 0,
            netPosition: 0
        }));

    // Capture starting stack value
    appState.startingStack = parseInt(document.getElementById('chips-per-buyin').value) || 400;

    // Save state
    saveSession(appState);

    // Move to buy-in screen
    renderBuyInScreen();
    showScreen('buyin');
}

// ===== CHECKPOINT 4: BUY-IN TRACKING SCREEN =====
function renderBuyInScreen() {
    const container = document.getElementById('buyin-content');

    let html = `
        <div class="form-group">
            <label for="buyin-amount">Buy-in Amount (INR)</label>
            <input
                type="number"
                id="buyin-amount"
                value="${appState.buyInAmount}"
                min="1"
                step="1"
            >
        </div>

        <div class="total-pot mb-lg">
            <h3>Total Pot: <span id="total-pot">₹0</span></h3>
            <p>Total Chips: <span id="total-chips">0</span></p>
        </div>

        <div class="player-list mb-lg">
    `;

    appState.players.forEach((player, index) => {
        html += `
            <div class="player-card">
                <div class="player-info">
                    <h4 class="player-name">${player.name}</h4>
                    <p class="player-buyin">Buy-ins: <span id="buyin-count-${index}">${player.buyIns}</span></p>
                    <p class="player-total">
                        Total: <span id="buyin-total-${index}">₹${player.totalBuyIn}</span>
                        <span class="chip-info">(<span id="chip-total-${index}">0</span> chips)</span>
                    </p>
                </div>
                <div class="player-actions">
                    <button class="btn btn-icon btn-secondary" data-player="${index}" data-action="decrement">-</button>
                    <button class="btn btn-icon btn-primary" data-player="${index}" data-action="increment">+</button>
                </div>
            </div>
        `;
    });

    html += `
        </div>
    `;

    // Add Player section (only show if under 9 players)
    if (appState.players.length < 9) {
        html += `
            <div class="add-player-section mb-lg" id="add-player-section">
                <button id="btn-add-player" class="btn btn-secondary btn-block">
                    + Add Player
                </button>
                <div id="add-player-form" class="add-player-form hidden">
                    <div class="form-group">
                        <input
                            type="text"
                            id="new-player-name"
                            class="new-player-input"
                            placeholder="Enter player name"
                            maxlength="30"
                        >
                        <div id="add-player-error" class="error-message hidden"></div>
                    </div>
                    <div class="button-group">
                        <button id="btn-confirm-add" class="btn btn-success">✓ Add</button>
                        <button id="btn-cancel-add" class="btn btn-secondary">✗ Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    html += `
        <button id="btn-to-standing" class="btn btn-success btn-block">
            Proceed to Final Standing
        </button>
    `;

    container.innerHTML = html;

    // Add event listeners
    document.getElementById('buyin-amount').addEventListener('input', handleBuyInAmountChange);
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handleBuyInAction);
    });
    document.getElementById('btn-to-standing').addEventListener('click', () => {
        appState.currentScreen = 'standing';
        saveSession(appState);
        renderStandingScreen();
        showScreen('standing');
    });

    // Add Player functionality
    const btnAddPlayer = document.getElementById('btn-add-player');
    const btnConfirmAdd = document.getElementById('btn-confirm-add');
    const btnCancelAdd = document.getElementById('btn-cancel-add');
    const newPlayerInput = document.getElementById('new-player-name');

    if (btnAddPlayer) {
        btnAddPlayer.addEventListener('click', showAddPlayerForm);
    }

    if (btnConfirmAdd) {
        btnConfirmAdd.addEventListener('click', handleAddPlayer);
    }

    if (btnCancelAdd) {
        btnCancelAdd.addEventListener('click', hideAddPlayerForm);
    }

    if (newPlayerInput) {
        // Allow Enter key to submit
        newPlayerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAddPlayer();
            }
        });
        // Allow Escape key to cancel
        newPlayerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideAddPlayerForm();
            }
        });
    }

    updateBuyInTotals();
}

function handleBuyInAmountChange(event) {
    const amount = parseInt(event.target.value);
    if (!isNaN(amount) && amount > 0) {
        appState.buyInAmount = amount;
        updateBuyInTotals();
    }
}

function handleBuyInAction(event) {
    const playerIndex = parseInt(event.target.dataset.player);
    const action = event.target.dataset.action;

    if (action === 'increment') {
        appState.players[playerIndex].buyIns++;
    } else if (action === 'decrement' && appState.players[playerIndex].buyIns > 0) {
        appState.players[playerIndex].buyIns--;
    }

    updateBuyInTotals();
}

function updateBuyInTotals() {
    let totalPot = 0;
    let totalChips = 0;

    appState.players.forEach((player, index) => {
        player.totalBuyIn = player.buyIns * appState.buyInAmount;
        const playerChips = player.buyIns * appState.startingStack;
        totalPot += player.totalBuyIn;
        totalChips += playerChips;

        // Update UI
        document.getElementById(`buyin-count-${index}`).textContent = player.buyIns;
        document.getElementById(`buyin-total-${index}`).textContent = `₹${player.totalBuyIn}`;
        document.getElementById(`chip-total-${index}`).textContent = playerChips;
    });

    document.getElementById('total-pot').textContent = `₹${totalPot}`;
    document.getElementById('total-chips').textContent = totalChips;

    // Save state
    saveSession(appState);
}

// ===== CHECKPOINT 5: FINAL STANDING SCREEN =====
function renderStandingScreen() {
    const container = document.getElementById('standing-content');
    const totalPot = appState.players.reduce((sum, p) => sum + p.totalBuyIn, 0);
    const totalChips = appState.players.reduce((sum, p) => sum + (p.buyIns * appState.startingStack), 0);
    const chipValue = totalPot / totalChips; // INR per chip

    let html = `
        <div class="info-box mb-lg">
            <p><strong>Total Pot:</strong> ₹${totalPot}</p>
            <p><strong>Total Chips:</strong> ${totalChips}</p>
            <p><strong>Chip Value:</strong> ₹${chipValue.toFixed(4)} per chip</p>
            <p class="text-muted">Enter final chip count for each player</p>
        </div>

        <div class="validation-status mb-lg" id="validation-status">
            <!-- Validation message will appear here -->
        </div>

        <div class="player-list mb-lg">
    `;

    appState.players.forEach((player, index) => {
        html += `
            <div class="standing-card">
                <h4 class="player-name">${player.name}</h4>
                <p class="text-muted">Started with: ${player.buyIns * appState.startingStack} chips (₹${player.totalBuyIn})</p>
                <div class="form-group">
                    <label for="final-chips-${index}">Final Chip Count</label>
                    <input
                        type="number"
                        id="final-chips-${index}"
                        class="final-chips-input"
                        data-player="${index}"
                        value="0"
                        min="0"
                        step="1"
                        placeholder="Enter final chips"
                    >
                </div>
                <p class="final-inr" id="final-inr-${index}">
                    Final Value: <span>₹0.00</span>
                </p>
                <p class="net-position" id="net-position-${index}">
                    Net: <span>₹0</span>
                </p>
            </div>
        `;
    });

    html += `
        </div>
        <button id="btn-calculate-settlement" class="btn btn-success btn-block" disabled>
            Calculate Settlement
        </button>
    `;

    container.innerHTML = html;

    // Add event listeners
    document.querySelectorAll('.final-chips-input').forEach(input => {
        input.addEventListener('input', validateFinalStanding);
    });
    document.getElementById('btn-calculate-settlement').addEventListener('click', handleCalculateSettlement);

    validateFinalStanding();
}

function validateFinalStanding() {
    const totalPot = appState.players.reduce((sum, p) => sum + p.totalBuyIn, 0);
    const totalChips = appState.players.reduce((sum, p) => sum + (p.buyIns * appState.startingStack), 0);
    const chipValue = totalPot / totalChips;

    let totalFinalChips = 0;

    // Update player chip counts and convert to INR
    appState.players.forEach((player, index) => {
        const input = document.getElementById(`final-chips-${index}`);
        const finalChips = parseInt(input.value) || 0;

        // Convert chips to INR
        player.finalCash = finalChips * chipValue;
        player.netPosition = player.finalCash - player.totalBuyIn;
        totalFinalChips += finalChips;

        // Update final INR display
        const finalInrSpan = document.querySelector(`#final-inr-${index} span`);
        finalInrSpan.textContent = `₹${player.finalCash.toFixed(2)}`;

        // Update net position display
        const netSpan = document.querySelector(`#net-position-${index} span`);
        const netValue = player.netPosition;
        netSpan.textContent = `₹${netValue.toFixed(2)}`;
        netSpan.className = netValue > 0 ? 'text-success' : netValue < 0 ? 'text-error' : '';
    });

    // Validate chip totals
    const difference = Math.abs(totalFinalChips - totalChips);
    const isValid = difference === 0; // Chips must match exactly (no decimal)

    const statusDiv = document.getElementById('validation-status');
    if (isValid) {
        statusDiv.innerHTML = '<p class="text-success">✓ Chip count matches! Ready to calculate settlement.</p>';
        statusDiv.className = 'validation-status success mb-lg';
    } else {
        const diff = totalFinalChips - totalChips;
        statusDiv.innerHTML = `
            <p class="text-error">✗ Chip count does not match</p>
            <p class="text-muted">Total Final Chips: ${totalFinalChips}</p>
            <p class="text-muted">Total Chips in Play: ${totalChips}</p>
            <p class="text-muted">Difference: ${Math.abs(diff)} chips ${diff > 0 ? '(too many)' : '(too few)'}</p>
        `;
        statusDiv.className = 'validation-status error mb-lg';
    }

    document.getElementById('btn-calculate-settlement').disabled = !isValid;

    // Save state
    saveSession(appState);
}

function handleCalculateSettlement() {
    appState.currentScreen = 'settlement';
    saveSession(appState);
    renderSettlementScreen();
    showScreen('settlement');
}

// ===== CHECKPOINT 6: SETTLEMENT SCREEN =====
function renderSettlementScreen() {
    const container = document.getElementById('settlement-content');

    // Calculate settlement using the algorithm from settlement.js
    const transactions = calculateSettlement(appState.players);

    let html = '<div class="settlement-results">';

    // Calculate chip values for display
    const totalChips = appState.players.reduce((sum, p) => sum + (p.buyIns * appState.startingStack), 0);
    const totalPotCalc = appState.players.reduce((sum, p) => sum + p.totalBuyIn, 0);
    const chipValue = totalPotCalc / totalChips;

    // Player Summary Section
    html += '<h3 class="mb-md">Player Summary</h3>';
    html += '<div class="player-summary-table mb-xl">';
    html += `
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Player</th>
                    <th>Chips</th>
                    <th>INR Value</th>
                    <th>Net</th>
                </tr>
            </thead>
            <tbody>
    `;

    appState.players.forEach(player => {
        const startChips = player.buyIns * appState.startingStack;
        const finalChips = Math.round(player.finalCash / chipValue);
        const netClass = player.netPosition > 0 ? 'text-success' : player.netPosition < 0 ? 'text-error' : '';
        const netSymbol = player.netPosition > 0 ? '+' : '';
        html += `
            <tr>
                <td class="player-name-cell">${player.name}</td>
                <td>${startChips} → ${finalChips}</td>
                <td>₹${player.totalBuyIn} → ₹${player.finalCash.toFixed(2)}</td>
                <td class="${netClass}">${netSymbol}₹${player.netPosition.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    </div>`;

    // Payment Instructions Section
    if (transactions.length === 0) {
        html += '<h3 class="mb-md">Settlement</h3>';
        html += '<p class="text-center text-success">Everyone is even! No payments needed.</p>';
    } else {
        html += '<h3 class="mb-md">Payment Instructions</h3>';
        html += '<div class="transaction-list">';

        transactions.forEach((transaction, index) => {
            html += `
                <div class="transaction-card">
                    <span class="transaction-number">${index + 1}.</span>
                    <p class="transaction-detail">
                        <strong>${transaction.from}</strong> pays
                        <strong>${transaction.to}</strong>
                        <span class="transaction-amount">₹${transaction.amount}</span>
                    </p>
                </div>
            `;
        });

        html += '</div>';
    }

    html += `
        </div>
        <div class="button-group mt-lg">
            <button id="btn-share-results" class="btn btn-primary">
                Share Results
            </button>
            <button id="btn-new-session" class="btn btn-secondary">
                New Session
            </button>
        </div>
    `;

    container.innerHTML = html;

    // Add event listeners
    document.getElementById('btn-new-session').addEventListener('click', handleNewSession);
    document.getElementById('btn-share-results').addEventListener('click', () => handleShareResults(transactions));
}

// ===== SHARE FUNCTIONALITY =====
function handleShareResults(transactions) {
    const shareText = generateShareText(transactions);

    // Try Web Share API first (mobile)
    if (navigator.share) {
        navigator.share({
            title: 'Poker Night Settlement',
            text: shareText
        })
        .then(() => {
            showNotification('Results shared successfully!');
        })
        .catch((error) => {
            // User cancelled or error occurred
            if (error.name !== 'AbortError') {
                // Fallback to clipboard
                copyToClipboard(shareText);
            }
        });
    } else {
        // Fallback to clipboard for desktop
        copyToClipboard(shareText);
    }
}

function generateShareText(transactions) {
    const totalPot = appState.players.reduce((sum, p) => sum + p.totalBuyIn, 0);
    const totalChips = appState.players.reduce((sum, p) => sum + (p.buyIns * appState.startingStack), 0);
    const chipValue = totalPot / totalChips;
    const date = new Date().toLocaleDateString();

    let text = `Poker Night Settlement - ${date}\n`;
    text += `Buy-in: Rs.${appState.buyInAmount} = ${appState.startingStack} chips | Chip Value: Rs.${chipValue.toFixed(4)}/chip\n\n`;

    // Payment Instructions (moved to top)
    if (transactions.length === 0) {
        text += 'Everyone is even! No payments needed.\n\n\n';
    } else {
        text += 'Payment Instructions:\n';
        transactions.forEach((transaction, index) => {
            text += `${index + 1}. ${transaction.from} pays ${transaction.to} Rs.${transaction.amount}\n`;
        });
        text += '\n\n';
    }

    // Player Summary
    text += 'Player Summary:\n';
    appState.players.forEach(player => {
        const startChips = player.buyIns * appState.startingStack;
        const finalChips = Math.round(player.finalCash / chipValue);

        // Format numbers: remove .00 if present
        const formatMoney = (num) => {
            const rounded = Math.round(num * 100) / 100;
            return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
        };

        const buyInStr = formatMoney(player.totalBuyIn);
        const finalStr = formatMoney(player.finalCash);
        const netStr = formatMoney(Math.abs(player.netPosition));
        const netSign = player.netPosition > 0 ? '+' : player.netPosition < 0 ? '-' : '';

        text += `${player.name}: Chips → Final | Buy-in → Final | Net\n`;
        text += `${startChips} → ${finalChips} | Rs.${buyInStr} → Rs.${finalStr} | ${netSign}Rs.${netStr}\n\n`;
    });

    text += `Total Pot: Rs.${totalPot} (${totalChips} chips)\n`;

    return text;
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showNotification('Results copied to clipboard!');
            })
            .catch(() => {
                // Fallback for older browsers
                fallbackCopyToClipboard(text);
            });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showNotification('Results copied to clipboard!');
    } catch (err) {
        showNotification('Failed to copy. Please try again.');
    }

    document.body.removeChild(textArea);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function handleNewSession() {
    // Clear saved session
    clearSession();

    // Reset state
    appState.currentScreen = 'setup';
    appState.buyInAmount = 200;
    appState.startingStack = 400;
    appState.players = [];

    // Return to setup screen
    renderSetupScreen();
    showScreen('setup');
}

// ===== ADD PLAYER MID-GAME FUNCTIONS =====
function showAddPlayerForm() {
    const btnAddPlayer = document.getElementById('btn-add-player');
    const addPlayerForm = document.getElementById('add-player-form');
    const newPlayerInput = document.getElementById('new-player-name');

    btnAddPlayer.classList.add('hidden');
    addPlayerForm.classList.remove('hidden');
    newPlayerInput.focus();
}

function hideAddPlayerForm() {
    const btnAddPlayer = document.getElementById('btn-add-player');
    const addPlayerForm = document.getElementById('add-player-form');
    const newPlayerInput = document.getElementById('new-player-name');
    const errorDiv = document.getElementById('add-player-error');

    addPlayerForm.classList.add('hidden');
    btnAddPlayer.classList.remove('hidden');
    newPlayerInput.value = '';
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
}

function validateNewPlayerName(name) {
    const trimmedName = name.trim();

    // Check empty
    if (trimmedName === '') {
        return { valid: false, error: 'Name cannot be empty' };
    }

    // Check max players
    if (appState.players.length >= 9) {
        return { valid: false, error: 'Maximum 9 players allowed' };
    }

    // Check duplicate (case-insensitive)
    const existingNames = appState.players.map(p => p.name.toLowerCase());
    if (existingNames.includes(trimmedName.toLowerCase())) {
        return { valid: false, error: 'This name is already in use' };
    }

    return { valid: true };
}

function handleAddPlayer() {
    const newPlayerInput = document.getElementById('new-player-name');
    const errorDiv = document.getElementById('add-player-error');
    const name = newPlayerInput.value;

    // Validate
    const validation = validateNewPlayerName(name);
    if (!validation.valid) {
        errorDiv.textContent = validation.error;
        errorDiv.classList.remove('hidden');
        newPlayerInput.focus();
        return;
    }

    // Add player to state
    appState.players.push({
        name: name.trim(),
        buyIns: 0,
        totalBuyIn: 0,
        finalCash: 0,
        netPosition: 0
    });

    // Save state
    saveSession(appState);

    // Re-render screen to show new player
    renderBuyInScreen();

    // Show success notification
    showNotification(`${name.trim()} added to game`);
}
