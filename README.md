<img src="https://github.com/user-attachments/assets/af8caf3b-b8fb-428d-98ff-e4fc79660847" width="208" height="100"/>

**KlipDash** is a lightweight, real-time dashboard for monitoring multiple 3D printers running [Klipper](https://www.klipper3d.org/) via [Moonraker](https://moonraker.readthedocs.io/). Built by [FireTail Fabrication](https://firetailfab.com), KlipDash helps you stay on top of multiple machines from one simple interface.

---

## ✨ Features

- 🖥️ Real-time status overview per printer (filename, progress, temperatures, material)
- 🐍 Built with Python & Flask
- 🎨 Custom theming (Bootstrap-based, dark mode friendly)
- 📡 HTTP polling (with optional WebSocket integration)
- 🧩 Modular and scalable to support many printers
- 👩‍💻 Fully dynamic layout using Bootstrap + vanilla JavaScript

---

## 🚀 Getting Started

### Requirements

- Python 3.9+
- Flask
- Moonraker running on each printer
- All printers must be accessible on the network

### Clone & Setup

```bash
git clone https://github.com/zebadrabbit/klipdash.git
cd klipdash
pip install flask
```

### Run the Server

```bash
python app.py
```

Then visit: [http://localhost:5000](http://localhost:5000)

---

## 🛠 Configuration

Edit the list of printers in `app.py`:

```python
PRINTERS = [
    {"name": "Printer A", "ip": "192.168.1.101"},
    {"name": "Printer B", "ip": "192.168.1.102"}
]
```

Each printer should:
- Have Moonraker running and accessible via `http://<printer-ip>:7125`
- Be on the same network as KlipDash

---

## 📸 Screenshots

![image](https://github.com/user-attachments/assets/b04a0e5b-09b9-4808-b1d0-1788b7452ea9)

---

## 🐾 About FireTail Fabrication

**FireTail Fabrication** is a one-woman 3D printing business based in Arkansas, specializing in pet safety products like the **Pet Defender** — a 3D-printed wheel cover to protect pets from rolling office chairs.

KlipDash was developed to help manage an expanding printer fleet and is now shared freely with the maker community. 🧡

---

## 📜 License

This project is licensed under the MIT License — fork it, improve it, and share it!

---

## 🔗 Links

- 🔧 [Moonraker Documentation](https://moonraker.readthedocs.io/)
- 🐾 [FireTail Fabrication Website](https://firetailfab.com)
- 💻 [KlipDash on GitHub](https://github.com/zebadrabbit/klipdash)
