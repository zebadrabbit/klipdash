from flask import Flask, render_template, jsonify, request
import requests
import json

app = Flask(__name__)

# Load printer config
with open('config.json') as f:
    PRINTERS = json.load(f)

@app.route('/')
def dashboard():
    return render_template('dashboard.html', printers=PRINTERS)

@app.route('/api/status/<ip>')
def get_status(ip):
    try:
        url = (
            f"http://{ip}/printer/objects/query"
            "?print_stats=filename,state,total_duration"
            "&heater_bed=temperature"
            "&extruder=temperature"
            "&display_status=progress"
        )
        res = requests.get(url, timeout=3)
        res.raise_for_status()
        return jsonify(res.json()['result']['status'])
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/api/control/<ip>', methods=['POST'])
def send_command(ip):
    data = request.json
    script = data.get("script")
    if not script:
        return jsonify({"error": "No script specified"}), 400
    try:
        url = f"http://{ip}/printer/gcode/script"
        res = requests.post(url, json={"script": script}, timeout=3)
        res.raise_for_status()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
