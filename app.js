/**
 * Main Application Logic
 * Handles UI interactions and connects the ARM64 simulator
 */

// Initialize the simulator
const simulator = new ARM64Simulator();

// Example programs
const examples = {
    basic: `// Einfaches Beispiel: Addition
MOV X0, #42
MOV X1, #8
ADD X2, X0, X1
// X2 sollte jetzt 50 enthalten`,

    fibonacci: `// Fibonacci Sequenz (erste 10 Zahlen)
MOV X0, #0        // Fib(0) = 0
MOV X1, #1        // Fib(1) = 1
MOV X2, #0        // Ergebnis
MOV X3, #10       // Zähler

// Berechne F(2) bis F(9)
ADD X2, X0, X1    // F(2) = F(0) + F(1)
MOV X0, X1        // Verschiebe Werte
MOV X1, X2

ADD X2, X0, X1    // F(3)
MOV X0, X1
MOV X1, X2

ADD X2, X0, X1    // F(4)
MOV X0, X1
MOV X1, X2

ADD X2, X0, X1    // F(5)
MOV X0, X1
MOV X1, X2`,

    bitwise: `// Bitweise Operationen
MOV X0, #0xFF
MOV X1, #0x0F
AND X2, X0, X1    // X2 = 0x0F
ORR X3, X0, X1    // X3 = 0xFF
EOR X4, X0, X1    // X4 = 0xF0
LSL X5, X1, #4    // X5 = 0xF0`,

    comparison: `// Vergleichsoperationen
MOV X0, #100
MOV X1, #50
CMP X0, X1        // 100 vs 50
SUB X2, X0, X1    // X2 = 50

MOV X3, #25
MOV X4, #25
CMP X3, X4        // 25 vs 25 (gleich)`,

    multiply: `// Multiplikation und komplexe Berechnungen
MOV X0, #7
MOV X1, #6
MUL X2, X0, X1    // X2 = 42

MOV X3, #3
MUL X4, X2, X3    // X4 = 126

MOV X5, #2
LSL X6, X5, #4    // X6 = 32`
};

// DOM Elements
const codeEditor = document.getElementById('codeEditor');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const exampleBtn = document.getElementById('exampleBtn');
const clearOutputBtn = document.getElementById('clearOutputBtn');
const output = document.getElementById('output');
const registersDisplay = document.getElementById('registersDisplay');
const flagsDisplay = document.getElementById('flagsDisplay');

// Event Listeners
runBtn.addEventListener('click', runCode);
clearBtn.addEventListener('click', clearEditor);
exampleBtn.addEventListener('click', loadExample);
clearOutputBtn.addEventListener('click', clearOutput);

// Keyboard shortcut: Ctrl/Cmd + Enter to run
codeEditor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
});

// Load initial example
window.addEventListener('load', () => {
    codeEditor.value = examples.basic;
    updateRegistersDisplay();
    updateFlagsDisplay();
});

/**
 * Run the code in the editor
 */
function runCode() {
    const code = codeEditor.value.trim();
    
    if (!code) {
        output.innerHTML = '<span class="error-message">⚠️ Bitte geben Sie Code ein!</span>';
        return;
    }
    
    // Disable run button during execution
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Ausführen...';
    
    // Clear previous output
    output.innerHTML = '';
    
    // Execute after a short delay for UI feedback
    setTimeout(() => {
        const result = simulator.execute(code);
        
        if (result.success) {
            output.innerHTML = `<div class="success-message">✅ Ausführung erfolgreich</div>\n${escapeHtml(result.output)}`;
        } else {
            output.innerHTML = `<div class="error-message">❌ Fehler bei der Ausführung:\n${escapeHtml(result.error)}</div>\n${escapeHtml(result.output)}`;
        }
        
        // Update displays
        updateRegistersDisplay();
        updateFlagsDisplay();
        
        // Re-enable run button
        runBtn.disabled = false;
        runBtn.textContent = '▶ Ausführen';
        
        // Scroll output to bottom
        output.scrollTop = output.scrollHeight;
    }, 50);
}

/**
 * Clear the code editor
 */
function clearEditor() {
    if (codeEditor.value.trim() && !confirm('Möchten Sie den Code wirklich löschen?')) {
        return;
    }
    codeEditor.value = '';
    codeEditor.focus();
}

/**
 * Clear output display
 */
function clearOutput() {
    output.innerHTML = '';
}

/**
 * Load an example program
 */
function loadExample() {
    const exampleNames = Object.keys(examples);
    let message = 'Wählen Sie ein Beispiel:\n\n';
    exampleNames.forEach((name, index) => {
        message += `${index + 1}. ${name}\n`;
    });
    
    const choice = prompt(message + '\nGeben Sie die Nummer ein (1-' + exampleNames.length + '):');
    
    if (choice) {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < exampleNames.length) {
            const exampleName = exampleNames[index];
            codeEditor.value = examples[exampleName];
            output.innerHTML = `<div class="success-message">📋 Beispiel "${exampleName}" geladen</div>`;
            
            // Reset simulator and displays
            simulator.reset();
            updateRegistersDisplay();
            updateFlagsDisplay();
        } else {
            alert('Ungültige Auswahl!');
        }
    }
}

/**
 * Update registers display
 */
function updateRegistersDisplay() {
    const state = simulator.getRegisterState();
    registersDisplay.innerHTML = '';
    
    // Display first 16 registers and special registers
    const displayRegs = ['X0', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 
                         'X8', 'X9', 'X10', 'X11', 'X12', 'X13', 'X14', 'X15',
                         'SP', 'LR'];
    
    displayRegs.forEach(reg => {
        if (state[reg]) {
            const div = document.createElement('div');
            div.className = 'register-item';
            if (state[reg].modified) {
                div.classList.add('modified');
            }
            
            div.innerHTML = `
                <div class="register-name">${reg}</div>
                <div class="register-value">${state[reg].value}</div>
                <div class="register-value" style="font-size: 0.75rem;">${state[reg].hex}</div>
            `;
            
            registersDisplay.appendChild(div);
        }
    });
}

/**
 * Update flags display
 */
function updateFlagsDisplay() {
    const flags = simulator.getFlagsState();
    flagsDisplay.innerHTML = '';
    
    const flagDescriptions = {
        N: 'Negative',
        Z: 'Zero',
        C: 'Carry',
        V: 'Overflow'
    };
    
    Object.entries(flags).forEach(([flag, value]) => {
        const div = document.createElement('div');
        div.className = 'flag-item';
        if (value) {
            div.classList.add('active');
        }
        div.textContent = `${flag} (${flagDescriptions[flag]}): ${value ? '1' : '0'}`;
        flagsDisplay.appendChild(div);
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Add syntax highlighting hint
 */
codeEditor.addEventListener('input', () => {
    // Could add real-time syntax highlighting here
    // For now, just basic functionality
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { simulator, runCode, updateRegistersDisplay, updateFlagsDisplay };
}
