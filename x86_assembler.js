/**
 * x86-64 Assembler Simulator
 * Simulates basic x86-64 assembly instructions
 */

class X86Simulator {
    constructor() {
        this.reset();
    }

    reset() {
        // Initialize general purpose registers
        this.registers = {
            'RAX': 0n,
            'RBX': 0n,
            'RCX': 0n,
            'RDX': 0n,
            'RSI': 0n,
            'RDI': 0n,
            'RBP': 0n,
            'RSP': 0x7FFFFFF0n,
            'R8': 0n,
            'R9': 0n,
            'R10': 0n,
            'R11': 0n,
            'R12': 0n,
            'R13': 0n,
            'R14': 0n,
            'R15': 0n
        };
        
        // Program Counter
        this.rip = 0;
        
        // EFLAGS register bits
        this.flags = {
            CF: false, // Carry
            PF: false, // Parity
            ZF: false, // Zero
            SF: false, // Sign
            OF: false  // Overflow
        };
        
        // Memory (simple implementation)
        this.memory = new Map();
        
        // Output buffer
        this.output = [];
        
        // Modified registers tracking
        this.modifiedRegisters = new Set();
    }

    // Parse immediate value (e.g., 42, 0x2A)
    parseImmediate(value) {
        if (typeof value === 'string') {
            value = value.trim();
            if (value.startsWith('0x') || value.startsWith('0X')) {
                return BigInt(parseInt(value, 16));
            }
            return BigInt(parseInt(value, 10));
        }
        return BigInt(value);
    }

    // Get register value
    getRegister(reg) {
        reg = reg.trim().toUpperCase();
        if (this.registers.hasOwnProperty(reg)) {
            return this.registers[reg];
        }
        throw new Error(`Unbekanntes Register: ${reg}`);
    }

    // Set register value
    setRegister(reg, value) {
        reg = reg.trim().toUpperCase();
        if (this.registers.hasOwnProperty(reg)) {
            this.registers[reg] = BigInt(value);
            this.modifiedRegisters.add(reg);
        } else {
            throw new Error(`Unbekanntes Register: ${reg}`);
        }
    }

    // Update flags based on result
    updateFlags(result, operand1 = null, operand2 = null) {
        result = BigInt(result);
        this.flags.ZF = result === 0n;
        this.flags.SF = result < 0n;
        
        // Parity flag (count of 1s in lower 8 bits is even)
        let lower8 = Number(result & 0xFFn);
        let ones = 0;
        for (let i = 0; i < 8; i++) {
            if (lower8 & (1 << i)) ones++;
        }
        this.flags.PF = (ones % 2) === 0;
        
        // Carry and overflow for operations
        if (operand1 !== null && operand2 !== null) {
            operand1 = BigInt(operand1);
            operand2 = BigInt(operand2);
            const mask64 = (1n << 64n) - 1n;
            this.flags.CF = (operand1 + operand2) > mask64;
            
            const sign1 = operand1 < 0n;
            const sign2 = operand2 < 0n;
            const signR = result < 0n;
            this.flags.OF = (sign1 === sign2) && (sign1 !== signR);
        }
    }

    // Execute single instruction
    executeInstruction(instruction) {
        instruction = instruction.trim();
        
        // Skip empty lines and comments
        if (!instruction || instruction.startsWith(';') || instruction.startsWith('//')) {
            return;
        }

        // Remove inline comments
        instruction = instruction.split(';')[0].split('//')[0].trim();

        // Parse instruction
        const parts = instruction.split(/[\s,]+/).filter(p => p);
        if (parts.length === 0) return;

        const op = parts[0].toUpperCase();
        
        try {
            switch (op) {
                case 'MOV':
                    this.executeMOV(parts);
                    break;
                    
                case 'ADD':
                    this.executeADD(parts);
                    break;
                    
                case 'SUB':
                    this.executeSUB(parts);
                    break;
                    
                case 'IMUL':
                case 'MUL':
                    this.executeMUL(parts);
                    break;
                    
                case 'AND':
                    this.executeAND(parts);
                    break;
                    
                case 'OR':
                    this.executeOR(parts);
                    break;
                    
                case 'XOR':
                    this.executeXOR(parts);
                    break;
                    
                case 'SHL':
                    this.executeSHL(parts);
                    break;
                    
                case 'SHR':
                    this.executeSHR(parts);
                    break;
                    
                case 'CMP':
                    this.executeCMP(parts);
                    break;
                    
                case 'INC':
                    this.executeINC(parts);
                    break;
                    
                case 'DEC':
                    this.executeDEC(parts);
                    break;
                    
                case 'NOP':
                    // No operation
                    break;
                    
                case 'RET':
                    this.output.push('Programm beendet (RET)');
                    return 'halt';
                    
                default:
                    throw new Error(`Unbekannte Instruktion: ${op}`);
            }
        } catch (error) {
            throw new Error(`Fehler bei '${instruction}': ${error.message}`);
        }
    }

    executeMOV(parts) {
        if (parts.length < 3) {
            throw new Error('MOV benötigt Ziel und Quelle');
        }
        const dest = parts[1];
        const src = parts[2];
        
        let value;
        try {
            value = this.getRegister(src);
        } catch {
            value = this.parseImmediate(src);
        }
        
        this.setRegister(dest, value);
        this.output.push(`MOV ${dest} ← ${value} (0x${value.toString(16)})`);
    }

    executeADD(parts) {
        if (parts.length < 3) {
            throw new Error('ADD benötigt mindestens Ziel und Quelle');
        }
        const dest = parts[1];
        const src = parts.length > 3 ? parts[3] : parts[2];
        
        const val1 = this.getRegister(dest);
        let val2;
        try {
            val2 = this.getRegister(src);
        } catch {
            val2 = this.parseImmediate(src);
        }
        
        const result = val1 + val2;
        this.setRegister(dest, result);
        this.updateFlags(result, val1, val2);
        this.output.push(`ADD ${dest} ← ${val1} + ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeSUB(parts) {
        if (parts.length < 3) {
            throw new Error('SUB benötigt mindestens Ziel und Quelle');
        }
        const dest = parts[1];
        const src = parts.length > 3 ? parts[3] : parts[2];
        
        const val1 = this.getRegister(dest);
        let val2;
        try {
            val2 = this.getRegister(src);
        } catch {
            val2 = this.parseImmediate(src);
        }
        
        const result = val1 - val2;
        this.setRegister(dest, result);
        this.updateFlags(result, val1, -val2);
        this.output.push(`SUB ${dest} ← ${val1} - ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeMUL(parts) {
        if (parts.length < 3) {
            throw new Error('MUL benötigt mindestens Ziel und Quelle');
        }
        const dest = parts[1];
        const src = parts.length > 3 ? parts[3] : parts[2];
        
        const val1 = this.getRegister(dest);
        let val2;
        try {
            val2 = this.getRegister(src);
        } catch {
            val2 = this.parseImmediate(src);
        }
        
        const result = val1 * val2;
        this.setRegister(dest, result);
        this.output.push(`MUL ${dest} ← ${val1} × ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeAND(parts) {
        if (parts.length < 3) {
            throw new Error('AND benötigt mindestens Ziel und Quelle');
        }
        const dest = parts[1];
        const src = parts.length > 3 ? parts[3] : parts[2];
        
        const val1 = this.getRegister(dest);
        let val2;
        try {
            val2 = this.getRegister(src);
        } catch {
            val2 = this.parseImmediate(src);
        }
        
        const result = val1 & val2;
        this.setRegister(dest, result);
        this.updateFlags(result);
        this.output.push(`AND ${dest} ← ${val1} & ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeOR(parts) {
        if (parts.length < 3) {
            throw new Error('OR benötigt mindestens Ziel und Quelle');
        }
        const dest = parts[1];
        const src = parts.length > 3 ? parts[3] : parts[2];
        
        const val1 = this.getRegister(dest);
        let val2;
        try {
            val2 = this.getRegister(src);
        } catch {
            val2 = this.parseImmediate(src);
        }
        
        const result = val1 | val2;
        this.setRegister(dest, result);
        this.updateFlags(result);
        this.output.push(`OR ${dest} ← ${val1} | ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeXOR(parts) {
        if (parts.length < 3) {
            throw new Error('XOR benötigt mindestens Ziel und Quelle');
        }
        const dest = parts[1];
        const src = parts.length > 3 ? parts[3] : parts[2];
        
        const val1 = this.getRegister(dest);
        let val2;
        try {
            val2 = this.getRegister(src);
        } catch {
            val2 = this.parseImmediate(src);
        }
        
        const result = val1 ^ val2;
        this.setRegister(dest, result);
        this.updateFlags(result);
        this.output.push(`XOR ${dest} ← ${val1} ⊕ ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeSHL(parts) {
        if (parts.length < 3) {
            throw new Error('SHL benötigt Ziel und Shift-Wert');
        }
        const dest = parts[1];
        const src = parts.length > 3 ? parts[3] : parts[2];
        
        const val1 = this.getRegister(dest);
        let shift;
        try {
            shift = Number(this.getRegister(src));
        } catch {
            shift = Number(this.parseImmediate(src));
        }
        
        const result = val1 << BigInt(shift);
        this.setRegister(dest, result);
        this.output.push(`SHL ${dest} ← ${val1} << ${shift} = ${result} (0x${result.toString(16)})`);
    }

    executeSHR(parts) {
        if (parts.length < 3) {
            throw new Error('SHR benötigt Ziel und Shift-Wert');
        }
        const dest = parts[1];
        const src = parts.length > 3 ? parts[3] : parts[2];
        
        const val1 = this.getRegister(dest);
        let shift;
        try {
            shift = Number(this.getRegister(src));
        } catch {
            shift = Number(this.parseImmediate(src));
        }
        
        const result = val1 >> BigInt(shift);
        this.setRegister(dest, result);
        this.output.push(`SHR ${dest} ← ${val1} >> ${shift} = ${result} (0x${result.toString(16)})`);
    }

    executeCMP(parts) {
        if (parts.length < 3) {
            throw new Error('CMP benötigt zwei Operanden');
        }
        const src1 = parts[1];
        const src2 = parts[2];
        
        const val1 = this.getRegister(src1);
        let val2;
        try {
            val2 = this.getRegister(src2);
        } catch {
            val2 = this.parseImmediate(src2);
        }
        
        const result = val1 - val2;
        this.updateFlags(result, val1, -val2);
        
        let comparison = '';
        if (result === 0n) comparison = 'gleich (==)';
        else if (result > 0n) comparison = 'größer (>)';
        else comparison = 'kleiner (<)';
        
        this.output.push(`CMP ${src1}(${val1}) vs ${src2}(${val2}): ${comparison}`);
    }

    executeINC(parts) {
        if (parts.length < 2) {
            throw new Error('INC benötigt ein Register');
        }
        const dest = parts[1];
        const val = this.getRegister(dest);
        const result = val + 1n;
        this.setRegister(dest, result);
        this.updateFlags(result);
        this.output.push(`INC ${dest} ← ${val} + 1 = ${result} (0x${result.toString(16)})`);
    }

    executeDEC(parts) {
        if (parts.length < 2) {
            throw new Error('DEC benötigt ein Register');
        }
        const dest = parts[1];
        const val = this.getRegister(dest);
        const result = val - 1n;
        this.setRegister(dest, result);
        this.updateFlags(result);
        this.output.push(`DEC ${dest} ← ${val} - 1 = ${result} (0x${result.toString(16)})`);
    }

    // Execute program
    execute(code) {
        this.reset();
        
        const lines = code.split('\n');
        
        this.output.push('=== Programm Start ===\n');
        
        try {
            for (let i = 0; i < lines.length; i++) {
                this.rip = i;
                const result = this.executeInstruction(lines[i]);
                if (result === 'halt') {
                    break;
                }
            }
            this.output.push('\n=== Programm erfolgreich beendet ===');
            return { success: true, output: this.output.join('\n') };
        } catch (error) {
            this.output.push(`\n❌ FEHLER in Zeile ${this.rip + 1}: ${error.message}`);
            return { success: false, output: this.output.join('\n'), error: error.message };
        }
    }

    // Get register state
    getRegisterState() {
        const state = {};
        for (const [reg, value] of Object.entries(this.registers)) {
            state[reg] = {
                value: value.toString(),
                hex: '0x' + value.toString(16).padStart(16, '0').toUpperCase(),
                modified: this.modifiedRegisters.has(reg)
            };
        }
        return state;
    }

    // Get flags state
    getFlagsState() {
        return { ...this.flags };
    }
}
