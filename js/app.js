/**
 * Poker Night Score Tracker - Main Application Logic
 * Handles state management and UI updates
 */

// Application State
const appState = {
    currentScreen: 'setup',
    buyInAmount: 200,
    players: [],
    // players structure: [{ name: '', buyIns: 0, totalBuyIn: 0, finalCash: 0, netPosition: 0 }]
};

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
        <div class="form-group">
            <label for="num-players">Number of Players (1-9)</label>
            <input
                type="number"
                id="num-players"
                min="1"
                max="9"
                value="4"
                placeholder="Enter number of players"
            >
            <div id="num-players-error" class="error-message hidden"></div>
        </div>

        <div id="player-names-container" class="mb-lg">
            <!-- Player name inputs will be generated here -->
        </div>

        <button id="btn-start-game" class="btn btn-primary btn-block" disabled>
            Start Game
        </button>
    `;

    // Add event listeners
    const numPlayersInput = document.getElementById('num-players');
    numPlayersInput.addEventListener('input', handleNumPlayersChange);

    const startButton = document.getElementById('btn-start-game');
    startButton.addEventListener('click', handleStartGame);

    // Generate initial player inputs
    generatePlayerInputs(4);
}

function handleNumPlayersChange(event) {
    const num = parseInt(event.target.value);
    const errorDiv = document.getElementById('num-players-error');

    if (isNaN(num) || num < 1 || num > 9) {
        errorDiv.textContent = 'Please enter a number between 1 and 9';
        errorDiv.classList.remove('hidden');
        document.getElementById('player-names-container').innerHTML = '';
        document.getElementById('btn-start-game').disabled = true;
        return;
    }

    errorDiv.classList.add('hidden');
    generatePlayerInputs(num);
}

function generatePlayerInputs(count) {
    const container = document.getElementById('player-names-container');
    container.innerHTML = '<h3 class="mb-md">Player Names</h3>';

    for (let i = 0; i < count; i++) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'form-group';
        playerDiv.innerHTML = `
            <label for="player-${i}">Player ${i + 1}</label>
            <input
                type="text"
                id="player-${i}"
                class="player-name-input"
                placeholder="Enter player name"
                data-player-index="${i}"
            >
            <div id="player-${i}-error" class="error-message hidden"></div>
        `;
        container.appendChild(playerDiv);
    }

    // Add event listeners to all player inputs
    document.querySelectorAll('.player-name-input').forEach(input => {
        input.addEventListener('input', validatePlayerNames);
    });
}

function validatePlayerNames() {
    const inputs = document.querySelectorAll('.player-name-input');
    const names = [];
    let isValid = true;

    // Clear all error messages first
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.add('hidden');
        msg.textContent = '';
    });

    // Collect names and check for empty values
    inputs.forEach((input, index) => {
        const name = input.value.trim();

        if (name === '') {
            const errorDiv = document.getElementById(`player-${index}-error`);
            errorDiv.textContent = 'Name cannot be empty';
            errorDiv.classList.remove('hidden');
            isValid = false;
        } else {
            names.push({ name, index });
        }
    });

    // Check for duplicate names
    const nameSet = new Set();
    names.forEach(({ name, index }) => {
        if (nameSet.has(name.toLowerCase())) {
            const errorDiv = document.getElementById(`player-${index}-error`);
            errorDiv.textContent = 'This name is already used';
            errorDiv.classList.remove('hidden');
            isValid = false;
        }
        nameSet.add(name.toLowerCase());
    });

    // Enable/disable start button
    document.getElementById('btn-start-game').disabled = !isValid;

    return isValid;
}

function handleStartGame() {
    if (!validatePlayerNames()) {
        return;
    }

    // Collect player names
    const inputs = document.querySelectorAll('.player-name-input');
    appState.players = Array.from(inputs).map(input => ({
        name: input.value.trim(),
        buyIns: 0,
        totalBuyIn: 0,
        finalCash: 0,
        netPosition: 0
    }));

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
        </div>

        <div class="player-list mb-lg">
    `;

    appState.players.forEach((player, index) => {
        html += `
            <div class="player-card">
                <div class="player-info">
                    <h4 class="player-name">${player.name}</h4>
                    <p class="player-buyin">Buy-ins: <span id="buyin-count-${index}">${player.buyIns}</span></p>
                    <p class="player-total">Total: <span id="buyin-total-${index}">₹${player.totalBuyIn}</span></p>
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

    appState.players.forEach((player, index) => {
        player.totalBuyIn = player.buyIns * appState.buyInAmount;
        totalPot += player.totalBuyIn;

        // Update UI
        document.getElementById(`buyin-count-${index}`).textContent = player.buyIns;
        document.getElementById(`buyin-total-${index}`).textContent = `₹${player.totalBuyIn}`;
    });

    document.getElementById('total-pot').textContent = `₹${totalPot}`;

    // Save state
    saveSession(appState);
}

// ===== CHECKPOINT 5: FINAL STANDING SCREEN =====
function renderStandingScreen() {
    const container = document.getElementById('standing-content');
    const totalPot = appState.players.reduce((sum, p) => sum + p.totalBuyIn, 0);

    let html = `
        <div class="info-box mb-lg">
            <p><strong>Total Pot:</strong> ₹${totalPot}</p>
            <p class="text-muted">Enter final cash value for each player</p>
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
                <p class="text-muted">Buy-in: ₹${player.totalBuyIn}</p>
                <div class="form-group">
                    <label for="final-cash-${index}">Final Cash</label>
                    <input
                        type="number"
                        id="final-cash-${index}"
                        class="final-cash-input"
                        data-player="${index}"
                        value="${player.finalCash}"
                        min="0"
                        step="0.01"
                        placeholder="Enter final cash"
                    >
                </div>
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
    document.querySelectorAll('.final-cash-input').forEach(input => {
        input.addEventListener('input', validateFinalStanding);
    });
    document.getElementById('btn-calculate-settlement').addEventListener('click', handleCalculateSettlement);

    validateFinalStanding();
}

function validateFinalStanding() {
    const totalPot = appState.players.reduce((sum, p) => sum + p.totalBuyIn, 0);
    let totalFinalCash = 0;

    // Update player final cash values and calculate net positions
    appState.players.forEach((player, index) => {
        const input = document.getElementById(`final-cash-${index}`);
        player.finalCash = parseFloat(input.value) || 0;
        player.netPosition = player.finalCash - player.totalBuyIn;
        totalFinalCash += player.finalCash;

        // Update net position display
        const netSpan = document.querySelector(`#net-position-${index} span`);
        const netValue = player.netPosition;
        netSpan.textContent = `₹${netValue.toFixed(2)}`;
        netSpan.className = netValue > 0 ? 'text-success' : netValue < 0 ? 'text-error' : '';
    });

    // Validate totals
    const difference = Math.abs(totalFinalCash - totalPot);
    const isValid = difference < 0.01;

    const statusDiv = document.getElementById('validation-status');
    if (difference < 0.01) {
        statusDiv.innerHTML = '<p class="text-success">✓ Totals match! Ready to calculate settlement.</p>';
        statusDiv.className = 'validation-status success mb-lg';
    } else {
        const diff = totalFinalCash - totalPot;
        statusDiv.innerHTML = `
            <p class="text-error">✗ Totals do not match</p>
            <p class="text-muted">Total Final Cash: ₹${totalFinalCash.toFixed(2)}</p>
            <p class="text-muted">Total Pot: ₹${totalPot.toFixed(2)}</p>
            <p class="text-muted">Difference: ₹${Math.abs(diff).toFixed(2)} ${diff > 0 ? '(too much)' : '(too little)'}</p>
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

    if (transactions.length === 0) {
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
        <button id="btn-new-session" class="btn btn-secondary btn-block mt-lg">
            New Session
        </button>
    `;

    container.innerHTML = html;

    // Add event listener
    document.getElementById('btn-new-session').addEventListener('click', handleNewSession);
}

function handleNewSession() {
    // Clear saved session
    clearSession();

    // Reset state
    appState.currentScreen = 'setup';
    appState.buyInAmount = 200;
    appState.players = [];

    // Return to setup screen
    renderSetupScreen();
    showScreen('setup');
}
