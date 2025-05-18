from flask import Flask, render_template, jsonify, request, Response
import requests
import json

# Initialize the Flask app
app = Flask(__name__)

# Load printer configuration from a JSON file
with open('config.json') as f:
    PRINTERS = json.load(f)

# Route: Dashboard
@app.route('/')
def dashboard():
    """
    Render the main dashboard page.
    Passes the list of printers from the configuration file to the template.
    """
    return render_template('dashboard.html', printers=PRINTERS)

# Route: Get printer status
@app.route('/api/status/<ip>')
def get_status(ip):
    """
    Fetch the status of a printer using its IP address.
    Queries the printer's API for details like filename, state, temperatures, and progress.
    """
    try:
        # Construct the API URL for querying printer status
        url = (
            f"http://{ip}/printer/objects/query"
            "?print_stats=filename,state,total_duration"
            "&heater_bed=temperature"
            "&extruder=temperature"
            "&display_status=progress"
        )
        # Send a GET request to the printer
        res = requests.get(url, timeout=3)
        res.raise_for_status()  # Raise an exception for HTTP errors
        # Return the printer's status as JSON
        return jsonify(res.json()['result']['status'])
    except Exception as e:
        # Handle errors and return an error message
        return jsonify({"error": str(e)})

# Route: Send a command to the printer
@app.route('/api/control/<ip>', methods=['POST'])
def send_command(ip):
    """
    Send a G-code command to the printer using its IP address.
    The command is provided in the request body as JSON.
    """
    # Parse the JSON payload from the request
    data = request.json
    script = data.get("script")
    if not script:
        # Return an error if no script is provided
        return jsonify({"error": "No script specified"}), 400
    try:
        # Construct the API URL for sending G-code commands
        url = f"http://{ip}/printer/gcode/script"
        # Send a POST request with the G-code script
        res = requests.post(url, json={"script": script}, timeout=3)
        res.raise_for_status()  # Raise an exception for HTTP errors
        # Return a success message if the command is sent successfully
        return jsonify({"success": True})
    except Exception as e:
        # Handle errors and return an error message
        return jsonify({"error": str(e)}), 500

# Route: Proxy snapshot
@app.route('/proxy/snapshot/<ip>')
def proxy_snapshot(ip):
    try:
        # Forward the request to the Crowsnest server
        snapshot_url = f"http://{ip}:8080/snapshot"
        res = requests.get(snapshot_url)

        # Return the response with CORS headers
        response = Response(res.content, status=res.status_code, content_type=res.headers['Content-Type'])
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/proxy/thumbnail/<ip>')
def proxy_thumbnail(ip):
    try:
        # Get the thumbnail path from the query parameters
        thumbnail_path = request.args.get('thumbnail_path')
        if not thumbnail_path:
            return {"error": "Thumbnail path is required"}, 400

        # Construct the full URL to the thumbnail
        thumbnail_url = f"http://{ip}/server/files/gcodes/{thumbnail_path}"
        res = requests.get(thumbnail_url)

        # Return the response with CORS headers
        response = Response(res.content, status=res.status_code, content_type=res.headers['Content-Type'])
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/proxy/thumbnails/<ip>')
def proxy_thumbnails(ip):
    filename = request.args.get('filename')
    if not filename:
        return {"error": "Filename is required"}, 400
    url = f"http://{ip}/server/files/thumbnails?filename={filename}"
    res = requests.get(url)
    response = Response(res.content, status=res.status_code, content_type=res.headers['Content-Type'])
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

# Entry point of the application
if __name__ == '__main__':
    # Print a startup banner
    print(r"""
 __     __ __           __               __    
|  |--.|  |__|.-----.--|  |.---.-.-----.|  |--.
|    < |  |  ||  _  |  _  ||  _  |__ --||     |
|__|__||__|__||   __|_____||___._|_____||__|__|
              |__|                                     
        ⚙️ Real-time Klipper Printer Dashboard
        🐾 Created by FireTail Fabrication · 2025
        💻 github.com/zebadrabbit/klipdash
    """)
    
    # Run the Flask app in debug mode, accessible on all network interfaces
    app.run(debug=True, host='0.0.0.0', port=5000)
