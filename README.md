
<img src="https://github.com/user-attachments/assets/af8caf3b-b8fb-428d-98ff-e4fc79660847" width="208" height="100" alt="KlipDash Logo"/>

**KlipDash** is a lightweight, real-time dashboard for monitoring multiple 3D printers running [Klipper](https://www.klipper3d.org/) via [Moonraker](https://moonraker.readthedocs.io/). Built by [FireTail Fabrication](https://firetailfab.com), KlipDash helps you stay on top of multiple machines from one simple interface.

---

## ✨ Features

- 🖥️ Real-time status overview per printer (filename, progress, temperatures, material)
- 🐍 Built with Python & Flask
- 🎨 Custom theming (Bootstrap-based, dark mode friendly)
- 📡 HTTP polling (WebSocket support planned)
- 🧩 Reads printer configuration from a simple `config.json`
- 👩‍💻 Fully dynamic layout using Bootstrap + vanilla JavaScript

---

## 🚀 Getting Started

### Requirements

- Python 3.9+
- Flask
- Moonraker running on each printer
- All printers must be accessible on the network

---

### Clone & Setup

```bash
git clone https://github.com/zebadrabbit/klipdash.git
cd klipdash
pip install flask
```

---

### Run the Server

```bash
python app.py
```

Then visit [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🛠 Configuration

KlipDash loads your printer list from `config.json` in the project root.

### Example `config.json`:

```json
[
  { "name": "Printer A", "ip": "192.168.1.101" },
  { "name": "Printer B", "ip": "192.168.1.102" }
]
```

Each printer should:
- Be running Moonraker
- Be reachable from the KlipDash host (e.g. `http://192.168.x.x:7125`)


---

## 📸 Screenshots

![KlipDash Screenshot](https://github.com/user-attachments/assets/b04a0e5b-09b9-4808-b1d0-1788b7452ea9)

---

## 🐾 About FireTail Fabrication

**FireTail Fabrication** is a one-woman 3D printing business based in Arkansas, specializing in pet safety products like the **Pet Defender** — a 3D-printed wheel cover designed to protect pets from rolling office chairs.

KlipDash was originally built to manage FireTail’s expanding printer fleet — and is now shared freely with the maker community. 🧡

---

## 📜 License

This project is licensed under the **MIT License** — fork it, improve it, and share it!

---

## 🔗 Links

- 🔧 [Moonraker Documentation](https://moonraker.readthedocs.io/)
- 🐾 [FireTail Fabrication](https://firetailfab.com)
- 💻 [KlipDash GitHub Repo](https://github.com/zebadrabbit/klipdash)
