/**
 * Main Application Logic
 * Handles UI interactions and connects the simulators
 */

// Initialize simulators
let arm64Simulator = new ARM64Simulator();
let x86Simulator = new X86Simulator();
let currentSimulator = arm64Simulator;
let currentArch = 'arm64';

// Example programs for ARM64
const arm64Examples = {
    basic: `// Einfaches Beispiel: Addition
MOV X0, #42
MOV X1, #8
ADD X2, X0, X1
// X2 sollte jetzt 50 enthalten`,

    helloworld: `// Hello World ASCII Codes
// H=72, e=101, l=108, o=111
MOV X0, #72    // 'H'
MOV X1, #101   // 'e'
MOV X2, #108   // 'l'
MOV X3, #108   // 'l'
MOV X4, #111   // 'o'
MOV X5, #32    // ' '
MOV X6, #87    // 'W'
MOV X7, #111   // 'o'
MOV X8, #114   // 'r'
MOV X9, #108   // 'l'
MOV X10, #100  // 'd'`,

    forloop: `// For-Schleife: Zähle von 0 bis 10
MOV X0, #0     // Zähler = 0
MOV X1, #10    // Max = 10

// Schleife simuliert (manuelle Iterationen)
ADD X0, X0, #1 // Iteration 1
ADD X0, X0, #1 // Iteration 2
ADD X0, X0, #1 // Iteration 3
ADD X0, X0, #1 // Iteration 4
ADD X0, X0, #1 // Iteration 5
ADD X0, X0, #1 // Iteration 6
ADD X0, X0, #1 // Iteration 7
ADD X0, X0, #1 // Iteration 8
ADD X0, X0, #1 // Iteration 9
ADD X0, X0, #1 // Iteration 10
// X0 sollte jetzt 10 sein`,

    fibonacci: `// Fibonacci Sequenz (erste 10 Zahlen)
MOV X0, #0        // Fib(0) = 0
MOV X1, #1        // Fib(1) = 1
MOV X2, #0        // Ergebnis

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

// Example programs for x86-64
const x86Examples = {
    basic: `; Einfaches Beispiel: Addition
MOV RAX, 42
MOV RBX, 8
ADD RAX, RBX
; RAX sollte jetzt 50 enthalten`,

    helloworld: `; Hello World ASCII Codes
; H=72, e=101, l=108, o=111
MOV RAX, 72    ; 'H'
MOV RBX, 101   ; 'e'
MOV RCX, 108   ; 'l'
MOV RDX, 108   ; 'l'
MOV RSI, 111   ; 'o'
MOV RDI, 32    ; ' '
MOV R8, 87     ; 'W'
MOV R9, 111    ; 'o'
MOV R10, 114   ; 'r'
MOV R11, 108   ; 'l'
MOV R12, 100   ; 'd'`,

    forloop: `; For-Schleife: Zähle von 0 bis 10
MOV RAX, 0     ; Zähler = 0
MOV RBX, 10    ; Max = 10

; Schleife simuliert (manuelle Iterationen)
INC RAX        ; Iteration 1
INC RAX        ; Iteration 2
INC RAX        ; Iteration 3
INC RAX        ; Iteration 4
INC RAX        ; Iteration 5
INC RAX        ; Iteration 6
INC RAX        ; Iteration 7
INC RAX        ; Iteration 8
INC RAX        ; Iteration 9
INC RAX        ; Iteration 10
; RAX sollte jetzt 10 sein`,

    fibonacci: `; Fibonacci Sequenz
MOV RAX, 0        ; Fib(0) = 0
MOV RBX, 1        ; Fib(1) = 1
MOV RCX, 0        ; Ergebnis

; Berechne F(2) bis F(5)
ADD RCX, RAX
ADD RCX, RBX     ; F(2)
MOV RAX, RBX
MOV RBX, RCX

MOV RCX, 0
ADD RCX, RAX
ADD RCX, RBX     ; F(3)
MOV RAX, RBX
MOV RBX, RCX`,

    bitwise: `; Bitweise Operationen
MOV RAX, 0xFF
MOV RBX, 0x0F
AND RAX, RBX     ; RAX = 0x0F
MOV RAX, 0xFF
OR RAX, RBX      ; RAX = 0xFF
MOV RAX, 0xFF
XOR RAX, RBX     ; RAX = 0xF0`,

    comparison: `; Vergleichsoperationen
MOV RAX, 100
MOV RBX, 50
CMP RAX, RBX     ; 100 vs 50
SUB RAX, RBX     ; RAX = 50

MOV RCX, 25
MOV RDX, 25
CMP RCX, RDX     ; 25 vs 25 (gleich)`,

    multiply: `; Multiplikation
MOV RAX, 7
MOV RBX, 6
IMUL RAX, RBX    ; RAX = 42

MOV RCX, 3
IMUL RAX, RCX    ; RAX = 126`
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
const archSelect = document.getElementById('archSelect');
const subtitleText = document.getElementById('subtitleText');

// Event Listeners
runBtn.addEventListener('click', runCode);
clearBtn.addEventListener('click', clearEditor);
exampleBtn.addEventListener('click', loadExample);
clearOutputBtn.addEventListener('click', clearOutput);
archSelect.addEventListener('change', switchArchitecture);

// Keyboard shortcut: Ctrl/Cmd + Enter to run
codeEditor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
});

// Load initial example
window.addEventListener('load', () => {
    codeEditor.value = arm64Examples.basic;
    updateRegistersDisplay();
    updateFlagsDisplay();
});

/**
 * Switch between architectures
 */
function switchArchitecture() {
    currentArch = archSelect.value;
    
    if (currentArch === 'arm64') {
        currentSimulator = arm64Simulator;
        subtitleText.textContent = 'ARM64 (Apple Silicon) Assembler im Browser';
        codeEditor.placeholder = `// Schreiben Sie hier Ihren ARM64 Assembly Code...
// Beispiel:
MOV X0, #42
MOV X1, #8
ADD X2, X0, X1`;
    } else {
        currentSimulator = x86Simulator;
        subtitleText.textContent = 'x86-64 (Intel/AMD) Assembler im Browser';
        codeEditor.placeholder = `; Schreiben Sie hier Ihren x86-64 Assembly Code...
; Beispiel:
MOV RAX, 42
MOV RBX, 8
ADD RAX, RBX`;
    }
    
    // Clear editor and load appropriate example
    codeEditor.value = currentArch === 'arm64' ? arm64Examples.basic : x86Examples.basic;
    
    // Reset simulator and displays
    currentSimulator.reset();
    updateRegistersDisplay();
    updateFlagsDisplay();
    clearOutput();
}

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
        const result = currentSimulator.execute(code);
        
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
    const examples = currentArch === 'arm64' ? arm64Examples : x86Examples;
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
            currentSimulator.reset();
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
    const state = currentSimulator.getRegisterState();
    registersDisplay.innerHTML = '';
    
    let displayRegs;
    if (currentArch === 'arm64') {
        displayRegs = ['X0', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 
                      'X8', 'X9', 'X10', 'X11', 'X12', 'X13', 'X14', 'X15',
                      'SP', 'LR'];
    } else {
        displayRegs = ['RAX', 'RBX', 'RCX', 'RDX', 'RSI', 'RDI', 'RBP', 'RSP',
                      'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15'];
    }
    
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
    const flags = currentSimulator.getFlagsState();
    flagsDisplay.innerHTML = '';
    
    let flagDescriptions;
    if (currentArch === 'arm64') {
        flagDescriptions = {
            N: 'Negative',
            Z: 'Zero',
            C: 'Carry',
            V: 'Overflow'
        };
    } else {
        flagDescriptions = {
            CF: 'Carry',
            PF: 'Parity',
            ZF: 'Zero',
            SF: 'Sign',
            OF: 'Overflow'
        };
    }
    
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

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { arm64Simulator, x86Simulator, runCode, updateRegistersDisplay, updateFlagsDisplay };
}
