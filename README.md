# 🖥️ Assembler Live Console

**Assembler Live Console mit Webview zum Ausführen von ARM64/Apple Silicon Assembly Code im Browser**

## 📋 Übersicht

Die Assembler Live Console ist eine webbasierte Anwendung, die es ermöglicht, ARM64 Assembly Code (Apple Silicon) direkt im Browser zu schreiben, zu simulieren und auszuführen. Perfekt zum Lernen, Experimentieren und Verstehen von Assembly-Programmierung ohne native Entwicklungsumgebung.

## ✨ Features

- 🎯 **Interaktiver Code-Editor** - Schreiben Sie ARM64 Assembly Code mit Syntax-Unterstützung
- ⚡ **Live-Ausführung** - Sofortige Simulation und Ausführung im Browser
- 📊 **Register-Anzeige** - Echtzeit-Visualisierung aller ARM64 Register (X0-X30, SP, LR)
- 🚩 **Flags-Monitor** - Überwachung der Condition Flags (N, Z, C, V)
- 📝 **Konsolenausgabe** - Detaillierte Logs der Instruktionsausführung
- 💡 **Beispiele** - Vorgefertigte Programme zum Lernen
- 🎨 **Moderne UI** - Apple-inspiriertes Design mit dunklem Code-Editor
- 📱 **Responsive** - Funktioniert auf Desktop, Tablet und Mobile

## 🚀 Schnellstart

1. Klonen Sie das Repository:
   ```bash
   git clone https://github.com/ronnycsharp/asm_console.git
   cd asm_console
   ```

2. Öffnen Sie `index.html` in Ihrem Browser:
   ```bash
   # Mit Python 3
   python3 -m http.server 8000
   
   # Oder mit Node.js
   npx http-server
   
   # Oder direkt öffnen
   open index.html
   ```

3. Navigieren Sie zu `http://localhost:8000` (oder öffnen Sie die Datei direkt)

## 💻 Unterstützte ARM64 Instruktionen

### Datenverarbeitung
- `MOV Xd, #imm` - Lade Immediate-Wert in Register
- `MOV Xd, Xn` - Kopiere Register
- `ADD Xd, Xn, Xm/#imm` - Addition
- `SUB Xd, Xn, Xm/#imm` - Subtraktion
- `MUL Xd, Xn, Xm` - Multiplikation

### Logische Operationen
- `AND Xd, Xn, Xm/#imm` - Bitweises UND
- `ORR Xd, Xn, Xm/#imm` - Bitweises ODER
- `EOR Xd, Xn, Xm/#imm` - Bitweises XOR (Exclusive OR)
- `LSL Xd, Xn, #shift` - Logischer Shift Links
- `LSR Xd, Xn, #shift` - Logischer Shift Rechts

### Vergleich & Status
- `CMP Xn, Xm/#imm` - Vergleiche zwei Werte (setzt Flags)

### Kontrollfluss
- `NOP` - Keine Operation
- `RET` - Return (beendet Programm)

## 📚 Verwendungsbeispiele

### Beispiel 1: Einfache Addition
```assembly
// Addiere zwei Zahlen
MOV X0, #42
MOV X1, #8
ADD X2, X0, X1
// X2 enthält jetzt 50
```

### Beispiel 2: Fibonacci-Sequenz
```assembly
// Berechne Fibonacci-Zahlen
MOV X0, #0        // F(0) = 0
MOV X1, #1        // F(1) = 1
ADD X2, X0, X1    // F(2) = 1
MOV X0, X1
MOV X1, X2
ADD X2, X0, X1    // F(3) = 2
MOV X0, X1
MOV X1, X2
```

### Beispiel 3: Bitweise Operationen
```assembly
// Bitmanipulation
MOV X0, #0xFF
MOV X1, #0x0F
AND X2, X0, X1    // X2 = 0x0F
ORR X3, X0, X1    // X3 = 0xFF
EOR X4, X0, X1    // X4 = 0xF0
LSL X5, X1, #4    // X5 = 0xF0
```

### Beispiel 4: Vergleich
```assembly
// Vergleichsoperationen
MOV X0, #100
MOV X1, #50
CMP X0, X1        // Vergleiche: 100 > 50
SUB X2, X0, X1    // X2 = 50
```

## 🎮 Bedienung

### Tastenkombinationen
- `Ctrl/Cmd + Enter` - Code ausführen
- Standard-Texteditor-Shortcuts funktionieren

### Buttons
- **▶ Ausführen** - Führt den Code aus
- **🗑️ Löschen** - Löscht den Editor-Inhalt (mit Bestätigung)
- **📋 Beispiel laden** - Lädt vorgefertigte Beispiele
- **Ausgabe löschen** - Löscht die Konsolen-Ausgabe

## 🏗️ Architektur

### Komponenten

1. **index.html** - Hauptseite mit UI-Struktur
2. **styles.css** - Apple-inspiriertes Styling
3. **assembler.js** - ARM64 Simulator Engine
4. **app.js** - Anwendungslogik und UI-Controller

### ARM64Simulator Klasse

Die Simulator-Engine implementiert:
- 31 General Purpose Register (X0-X30)
- Spezialregister (SP, LR, XZR)
- Condition Flags (N, Z, C, V)
- Instruktions-Parser und -Executor
- Speicherverwaltung (vereinfacht)

## 🔧 Technische Details

### Register
- **X0-X30** - 64-bit General Purpose Register
- **SP** - Stack Pointer
- **LR** - Link Register (für Rücksprungadressen)
- **XZR** - Zero Register (immer 0)

### Flags
- **N** - Negative (Ergebnis ist negativ)
- **Z** - Zero (Ergebnis ist null)
- **C** - Carry (Übertrag bei Addition)
- **V** - Overflow (Überlauf bei signed Addition)

### Immediate-Werte
- Dezimal: `#42`
- Hexadezimal: `#0x2A`

## 🎨 Anpassung

Das Design kann über CSS-Variablen in `styles.css` angepasst werden:

```css
:root {
    --primary-color: #007AFF;
    --secondary-color: #5856D6;
    --success-color: #34C759;
    /* ... weitere Farben */
}
```

## 🤝 Beitragen

Contributions sind willkommen! Bitte:

1. Forken Sie das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushen Sie zum Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie einen Pull Request

## 📝 Lizenz

Dieses Projekt ist Open Source und frei verfügbar.

## 🙏 Danksagungen

- Inspiriert von ARM64/Apple Silicon Architektur
- Design angelehnt an Apple Human Interface Guidelines

## 📧 Kontakt

Für Fragen oder Feedback öffnen Sie bitte ein Issue im GitHub Repository.

---

**Viel Spaß beim Assembly-Programmieren! 🚀**