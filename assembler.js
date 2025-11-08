/**
 * ARM64 Assembler Simulator
 * Simulates basic ARM64/Apple Silicon assembly instructions
 */

class ARM64Simulator {
    constructor() {
        this.reset();
    }

    reset() {
        // Initialize 31 general purpose registers (X0-X30)
        this.registers = {};
        for (let i = 0; i < 31; i++) {
            this.registers[`X${i}`] = 0n;
        }
        
        // Program Counter
        this.pc = 0;
        
        // Stack Pointer
        this.sp = 0x7FFFFFF0n;
        this.registers['SP'] = this.sp;
        
        // Link Register
        this.registers['LR'] = 0n;
        
        // Zero Register (always 0)
        this.registers['XZR'] = 0n;
        
        // Condition flags
        this.flags = {
            N: false, // Negative
            Z: false, // Zero
            C: false, // Carry
            V: false  // Overflow
        };
        
        // Memory (simple implementation)
        this.memory = new Map();
        
        // Output buffer
        this.output = [];
        
        // Modified registers tracking
        this.modifiedRegisters = new Set();
    }

    // Parse immediate value (e.g., #42, #0x2A)
    parseImmediate(value) {
        if (typeof value === 'string') {
            value = value.trim().replace('#', '');
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
        if (reg === 'XZR' || reg === 'WZR') {
            return 0n;
        }
        if (this.registers.hasOwnProperty(reg)) {
            return this.registers[reg];
        }
        throw new Error(`Unbekanntes Register: ${reg}`);
    }

    // Set register value
    setRegister(reg, value) {
        reg = reg.trim().toUpperCase();
        if (reg === 'XZR' || reg === 'WZR') {
            return; // Zero register is always 0
        }
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
        this.flags.Z = result === 0n;
        this.flags.N = result < 0n;
        
        // Simplified carry and overflow detection
        if (operand1 !== null && operand2 !== null) {
            operand1 = BigInt(operand1);
            operand2 = BigInt(operand2);
            
            // Carry flag for addition
            const mask64 = (1n << 64n) - 1n;
            this.flags.C = (operand1 + operand2) > mask64;
            
            // Overflow flag (simplified)
            const sign1 = operand1 < 0n;
            const sign2 = operand2 < 0n;
            const signR = result < 0n;
            this.flags.V = (sign1 === sign2) && (sign1 !== signR);
        }
    }

    // Execute single instruction
    executeInstruction(instruction) {
        instruction = instruction.trim();
        
        // Skip empty lines and comments
        if (!instruction || instruction.startsWith('//') || instruction.startsWith(';')) {
            return;
        }

        // Remove inline comments
        instruction = instruction.split('//')[0].split(';')[0].trim();

        // Parse instruction
        const parts = instruction.split(/[\s,]+/).filter(p => p);
        if (parts.length === 0) return;

        const op = parts[0].toUpperCase();
        
        try {
            switch (op) {
                case 'MOV':
                case 'MOVZ':
                    this.executeMOV(parts);
                    break;
                    
                case 'ADD':
                    this.executeADD(parts);
                    break;
                    
                case 'SUB':
                    this.executeSUB(parts);
                    break;
                    
                case 'MUL':
                    this.executeMUL(parts);
                    break;
                    
                case 'AND':
                    this.executeAND(parts);
                    break;
                    
                case 'ORR':
                    this.executeORR(parts);
                    break;
                    
                case 'EOR':
                    this.executeEOR(parts);
                    break;
                    
                case 'LSL':
                    this.executeLSL(parts);
                    break;
                    
                case 'LSR':
                    this.executeLSR(parts);
                    break;
                    
                case 'CMP':
                    this.executeCMP(parts);
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
        if (src.startsWith('#')) {
            value = this.parseImmediate(src);
        } else {
            value = this.getRegister(src);
        }
        
        this.setRegister(dest, value);
        this.output.push(`MOV ${dest} ← ${value} (0x${value.toString(16)})`);
    }

    executeADD(parts) {
        if (parts.length < 4) {
            throw new Error('ADD benötigt Ziel, Operand1 und Operand2');
        }
        const dest = parts[1];
        const src1 = parts[2];
        const src2 = parts[3];
        
        const val1 = this.getRegister(src1);
        const val2 = src2.startsWith('#') ? this.parseImmediate(src2) : this.getRegister(src2);
        
        const result = val1 + val2;
        this.setRegister(dest, result);
        this.output.push(`ADD ${dest} ← ${val1} + ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeSUB(parts) {
        if (parts.length < 4) {
            throw new Error('SUB benötigt Ziel, Operand1 und Operand2');
        }
        const dest = parts[1];
        const src1 = parts[2];
        const src2 = parts[3];
        
        const val1 = this.getRegister(src1);
        const val2 = src2.startsWith('#') ? this.parseImmediate(src2) : this.getRegister(src2);
        
        const result = val1 - val2;
        this.setRegister(dest, result);
        this.updateFlags(result, val1, -val2);
        this.output.push(`SUB ${dest} ← ${val1} - ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeMUL(parts) {
        if (parts.length < 4) {
            throw new Error('MUL benötigt Ziel, Operand1 und Operand2');
        }
        const dest = parts[1];
        const src1 = parts[2];
        const src2 = parts[3];
        
        const val1 = this.getRegister(src1);
        const val2 = src2.startsWith('#') ? this.parseImmediate(src2) : this.getRegister(src2);
        
        const result = val1 * val2;
        this.setRegister(dest, result);
        this.output.push(`MUL ${dest} ← ${val1} × ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeAND(parts) {
        if (parts.length < 4) {
            throw new Error('AND benötigt Ziel, Operand1 und Operand2');
        }
        const dest = parts[1];
        const src1 = parts[2];
        const src2 = parts[3];
        
        const val1 = this.getRegister(src1);
        const val2 = src2.startsWith('#') ? this.parseImmediate(src2) : this.getRegister(src2);
        
        const result = val1 & val2;
        this.setRegister(dest, result);
        this.updateFlags(result);
        this.output.push(`AND ${dest} ← ${val1} & ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeORR(parts) {
        if (parts.length < 4) {
            throw new Error('ORR benötigt Ziel, Operand1 und Operand2');
        }
        const dest = parts[1];
        const src1 = parts[2];
        const src2 = parts[3];
        
        const val1 = this.getRegister(src1);
        const val2 = src2.startsWith('#') ? this.parseImmediate(src2) : this.getRegister(src2);
        
        const result = val1 | val2;
        this.setRegister(dest, result);
        this.updateFlags(result);
        this.output.push(`ORR ${dest} ← ${val1} | ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeEOR(parts) {
        if (parts.length < 4) {
            throw new Error('EOR benötigt Ziel, Operand1 und Operand2');
        }
        const dest = parts[1];
        const src1 = parts[2];
        const src2 = parts[3];
        
        const val1 = this.getRegister(src1);
        const val2 = src2.startsWith('#') ? this.parseImmediate(src2) : this.getRegister(src2);
        
        const result = val1 ^ val2;
        this.setRegister(dest, result);
        this.updateFlags(result);
        this.output.push(`EOR ${dest} ← ${val1} ⊕ ${val2} = ${result} (0x${result.toString(16)})`);
    }

    executeLSL(parts) {
        if (parts.length < 4) {
            throw new Error('LSL benötigt Ziel, Operand1 und Shift-Wert');
        }
        const dest = parts[1];
        const src1 = parts[2];
        const src2 = parts[3];
        
        const val1 = this.getRegister(src1);
        const shift = src2.startsWith('#') ? Number(this.parseImmediate(src2)) : Number(this.getRegister(src2));
        
        const result = val1 << BigInt(shift);
        this.setRegister(dest, result);
        this.output.push(`LSL ${dest} ← ${val1} << ${shift} = ${result} (0x${result.toString(16)})`);
    }

    executeLSR(parts) {
        if (parts.length < 4) {
            throw new Error('LSR benötigt Ziel, Operand1 und Shift-Wert');
        }
        const dest = parts[1];
        const src1 = parts[2];
        const src2 = parts[3];
        
        const val1 = this.getRegister(src1);
        const shift = src2.startsWith('#') ? Number(this.parseImmediate(src2)) : Number(this.getRegister(src2));
        
        const result = val1 >> BigInt(shift);
        this.setRegister(dest, result);
        this.output.push(`LSR ${dest} ← ${val1} >> ${shift} = ${result} (0x${result.toString(16)})`);
    }

    executeCMP(parts) {
        if (parts.length < 3) {
            throw new Error('CMP benötigt zwei Operanden');
        }
        const src1 = parts[1];
        const src2 = parts[2];
        
        const val1 = this.getRegister(src1);
        const val2 = src2.startsWith('#') ? this.parseImmediate(src2) : this.getRegister(src2);
        
        const result = val1 - val2;
        this.updateFlags(result, val1, -val2);
        
        let comparison = '';
        if (result === 0n) comparison = 'gleich (==)';
        else if (result > 0n) comparison = 'größer (>)';
        else comparison = 'kleiner (<)';
        
        this.output.push(`CMP ${src1}(${val1}) vs ${src2}(${val2}): ${comparison}`);
    }

    // Execute program
    execute(code) {
        this.reset();
        
        const lines = code.split('\n');
        
        this.output.push('=== Programm Start ===\n');
        
        try {
            for (let i = 0; i < lines.length; i++) {
                this.pc = i;
                const result = this.executeInstruction(lines[i]);
                if (result === 'halt') {
                    break;
                }
            }
            this.output.push('\n=== Programm erfolgreich beendet ===');
            return { success: true, output: this.output.join('\n') };
        } catch (error) {
            this.output.push(`\n❌ FEHLER in Zeile ${this.pc + 1}: ${error.message}`);
            return { success: false, output: this.output.join('\n'), error: error.message };
        }
    }

    // Get register state
    getRegisterState() {
        const state = {};
        for (const [reg, value] of Object.entries(this.registers)) {
            if (reg !== 'XZR') {
                state[reg] = {
                    value: value.toString(),
                    hex: '0x' + value.toString(16).padStart(16, '0').toUpperCase(),
                    modified: this.modifiedRegisters.has(reg)
                };
            }
        }
        return state;
    }

    // Get flags state
    getFlagsState() {
        return { ...this.flags };
    }
}
