# Otium Docs 📄🔍

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-emerald.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-blue.svg)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-2024-orange.svg)](https://www.rust-lang.org)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-green.svg)](#)
[![Windows](https://img.shields.io/badge/Platform-Windows%20%7C%20Android-black.svg)](#)

> **Otium Docs** is the unified, high-performance, local-first document suite for **Windows** and **Android**. It seamlessly merges an ultra-fast PDF reading engine with an on-device intelligent camera scanner — zero cloud, zero telemetry, 100% free software.

---

## ⚡ Core Capabilities

### 1. High-Performance PDF Reading Engine
- **0.02s Cold-Start:** Near-instant launch times even with massive 1,000+ page technical textbooks.
- **Dual-Page Spread & Continuous Scroll:** Perfect for academic papers, side-by-side reading, and e-ink displays.
- **Full-Text Instant Search:** Fast in-memory text search with exact coordinate bounding boxes.
- **Local Annotations & Bookmarks:** Highlight, underline, add sticky notes, and bookmark pages stored securely in local IndexedDB.
- **Dark, Sepia & AMOLED Themes:** Designed for zero eye strain during prolonged reading sessions.

### 2. Integrated Intelligent Document Scanner
- **On-Device Edge Detection:** Real-time contour discovery with automatic corner snapping.
- **Perspective Warping (Homography):** Corrects slanted and skewed camera angles into flat, rectangular pages.
- **Contrast & Text Enhancement:** Magic Color, B&W, and High-Contrast thresholding for razor-sharp text readability.
- **Direct-to-Reader Flow:** Scanned pages are compiled into ISO-standard PDFs and immediately open in the reader for annotations and search.
- **Signature & Watermark Support:** Sign contracts and add custom watermarks directly on your device.

---

## 🔒 The Local-First Guarantee

- **Zero Cloud Infrastructure:** No remote accounts, no cloud servers, and no third-party APIs.
- **Zero Telemetry:** No tracking, no analytics, no diagnostics sent over the wire.
- **GNU GPL-3.0 Freedom:** Fully auditable open-source code for permanent user ownership.

---

## 🚀 Quick Installation

### Windows Package Manager (`winget`):
```bash
winget install XRTM8.OtiumDocs
```

### Android (F-Droid & Direct APK):
- Download the standalone APK directly from [GitHub Releases](https://github.com/XRTM8/Otium-Docs/releases/latest).
- Available on F-Droid under package identifier `com.otium.docs`.

---

## 🛠️ Building from Source

### Prerequisites:
- **Node.js** (v18+) & **npm**
- **Rust** (stable toolchain)
- **Tauri CLI v2**

### Build Commands:
```bash
# 1. Clone repository
git clone https://github.com/XRTM8/Otium-Docs.git
cd Otium-Docs

# 2. Install dependencies
npm install

# 3. Run frontend development server
npm run dev

# 4. Build desktop release binary for Windows
npm run tauri:build

# 5. Build Android APK
npm run tauri:android
```

---

## 📜 License

Otium Docs is free software licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See [LICENSE](LICENSE) for full details.
