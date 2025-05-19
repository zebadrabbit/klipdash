// Track previous printer states for notifications
const previousStates = {};

// Request notification permission on page load
document.addEventListener('DOMContentLoaded', function() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            // Ask the user if they want to enable notifications
            const ask = confirm('Would you like to enable browser notifications for print status updates?');
            if (ask) {
                Notification.requestPermission();
            }
        }
    }
});

// Show browser notification for completed print
function notifyPrintComplete(printerName, file) {
    if ('Notification' in window && Notification.permission === 'granted') {
    const title = `Print Complete: ${printerName}`;
    const options = {
        body: file ? `File: ${file}` : '',
        icon: '/static/logo.png'
    };
    new Notification(title, options);
    }
}

// Show browser notification for paused print
function notifyPrintPaused(printerName, file) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const title = `Print Paused: ${printerName}`;
        const options = {
            body: file ? `File: ${file}` : '',
            icon: '/static/logo.png'
        };
        new Notification(title, options);
    }
}

// Show browser notification for error print
function notifyPrintError(printerName, file) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const title = `Print Error: ${printerName}`;
        const options = {
            body: file ? `File: ${file}` : '',
            icon: '/static/logo.png'
        };
        new Notification(title, options);
    }
}

// Toggles the visibility of the header
function toggleHeader() {
    const header = document.getElementById('header-bar');
    const showBtn = document.getElementById('show-header-btn');

    if (header.classList.contains('d-none')) {
    header.classList.remove('d-none');
    showBtn.classList.add('d-none');
    } else {
    header.classList.add('d-none');
    showBtn.classList.remove('d-none');
    }
}

// Formats time in HH:MM:SS
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// Fetches and updates printer status
async function fetchStatus(index, ip) {
    try {
    const res = await fetch(`/api/status/${ip}`);
    const data = await res.json();
    if (data.error) throw data.error;

    const file = data.print_stats.filename || 'N/A';
    const printerName = document.querySelector(`#panel-${index} .printer-name`).textContent;

    // Fetch the thumbnail list for this file
    let thumbnailPath = null;
    if (file && file !== 'N/A') {
        // Use the proxy to get the thumbnail list
        const thumbsRes = await fetch(`/proxy/thumbnails/${ip}?filename=${encodeURIComponent(file)}`);
        const thumbsData = await thumbsRes.json();
        if (thumbsData.result && thumbsData.result.length > 0) {
        // Pick the largest thumbnail (usually the last one)
        thumbnailPath = thumbsData.result[thumbsData.result.length - 1].thumbnail_path;
        }
    }

    const state = data.print_stats.state;
    // Notify if print just completed, paused, or errored
    if (previousStates[ip] !== 'complete' && state === 'complete') {
        notifyPrintComplete(printerName, file);
    }
    if (previousStates[ip] !== 'paused' && state === 'paused') {
        notifyPrintPaused(printerName, file);
    }
    if (previousStates[ip] !== 'error' && state === 'error') {
        notifyPrintError(printerName, file);
    }
    previousStates[ip] = state;

    const nozzle = data.extruder.temperature.toFixed(1);
    const bed = data.heater_bed.temperature.toFixed(1);
    const progress = data.display_status.progress || 0;
    const duration = data.print_stats.total_duration || 0;

    const fileEl = document.getElementById(`file-${index}`);
    fileEl.textContent = file;
    fileEl.title = file;

    document.getElementById(`nozzle-${index}`).textContent = nozzle;
    document.getElementById(`bed-${index}`).textContent = bed;
    document.getElementById(`duration-${index}`).textContent = formatTime(duration);

    const progressBar = document.getElementById(`progress-${index}`);
    const newPercent = (progress * 100).toFixed(0);
    progressBar.style.width = `${newPercent}%`;
    progressBar.textContent = `${newPercent}%`;

    progressBar.className = 'progress-bar fw-bold fs-5';
    if (state === 'complete') {
        progressBar.classList.add('bg-success');
    } else {
        progressBar.classList.add('bg-success', 'progress-bar-striped', 'progress-bar-animated');
    }

    const statusEl = document.getElementById(`status-${index}`);
    statusEl.className = 'badge rounded-pill mb-2 fs-5 fw-bold';
    let icon = '';
    let statusText = state.charAt(0).toUpperCase() + state.slice(1);
    switch (state) {
      case 'printing':
        statusEl.classList.add('status-printing');
        icon = '<i class="bi bi-play-fill"></i>';
        break;
      case 'paused':
        statusEl.classList.add('status-paused');
        icon = '<i class="bi bi-pause-fill"></i>';
        break;
      case 'standby':
        statusEl.classList.add('status-standby');
        icon = '<i class="bi bi-hourglass"></i>';
        break;
      case 'complete':
        statusEl.classList.add('status-complete');
        icon = '<i class="bi bi-check-circle-fill"></i>';
        break;
      case 'error':
        statusEl.classList.add('status-error');
        icon = '<i class="bi bi-x-circle-fill"></i>';
        statusText = 'Error';
        break;
      case 'cancelled':
        statusEl.classList.add('status-cancelled');
        icon = '<i class="bi bi-slash-circle-fill"></i>';
        statusText = 'E-Stop';
        break;
      default:
        statusEl.classList.add('status-offline');
        icon = '<i class="bi bi-slash-circle-fill"></i>';
        break;
    }
    statusEl.innerHTML = `${icon} ${statusText}`;
    
    const pauseBtn = document.getElementById(`pause-${index}`);
    const resumeBtn = document.getElementById(`resume-${index}`);
    const cancelBtn = document.getElementById(`cancel-${index}`);
    const emergencyBtn = document.getElementById(`emergency-${index}`);
    pauseBtn.disabled = resumeBtn.disabled = cancelBtn.disabled = true;
    emergencyBtn.disabled = false;

    // Button and status logic for all states
    switch (state) {
      case 'printing':
        pauseBtn.disabled = false;
        cancelBtn.disabled = false;
        statusEl.classList.add('status-printing');
        icon = '<i class="bi bi-play-fill"></i>';
        break;
      case 'paused':
        resumeBtn.disabled = false;
        cancelBtn.disabled = false;
        statusEl.classList.add('status-paused');
        icon = '<i class="bi bi-pause-fill"></i>';
        break;
      case 'standby':
        statusEl.classList.add('status-standby');
        icon = '<i class="bi bi-hourglass"></i>';
        break;
      case 'complete':
        statusEl.classList.add('status-complete');
        icon = '<i class="bi bi-check-circle-fill"></i>';
        break;
      case 'error':
        statusEl.classList.add('status-error');
        icon = '<i class="bi bi-x-circle-fill"></i>';
        statusText = 'Error';
        break;
      case 'cancelled':
        statusEl.classList.add('status-cancelled');
        icon = '<i class="bi bi-slash-circle-fill"></i>';
        statusText = 'E-Stop';
        break;
      default:
        statusEl.classList.add('status-offline');
        icon = '<i class="bi bi-slash-circle-fill"></i>';
        break;
    }
    statusEl.innerHTML = `${icon} ${statusText}`;

    // Only update the thumbnail if we have a path and it's time to update
    const lastUpdate = data.print_stats.last_update || 0;
    const currentTime = Math.floor(Date.now() / 1000);
    if (thumbnailPath && (currentTime - lastUpdate > 10)) {
        updateThumbnail(index, ip, thumbnailPath);
        console.log(`Updated thumbnail for printer ${index} (${ip})`);
    }

    } catch (err) {
    const statusEl = document.getElementById(`status-${index}`);
    statusEl.className = 'badge status mb-2 status-offline';
    statusEl.innerHTML = '<i class="bi bi-slash-circle-fill"></i> Offline';
    }
}

// Sends a command to the printer
function sendCommand(ip, cmd) {
    fetch(`/api/control/${ip}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script: cmd })
    }).then(() => updateAll());
}

// Confirms and cancels a print
function confirmCancel(ip) {
    if (confirm("Are you sure you want to cancel the print?")) {
    sendCommand(ip, "CANCEL_PRINT");
    }
}

// Track the current image type for each printer
const thumbnailState = {};

async function updateThumbnail(index, ip, thumbnailPath) {
    try {
        const thumbnail = document.getElementById(`thumb-${index}`);

        if (!thumbnailState[index]) {
            thumbnailState[index] = 'snapshot';
        }

        let newSrc;
        if (thumbnailState[index] === 'snapshot') {
            const snapshotUrl = `/proxy/snapshot/${ip}`;
            const response = await fetch(snapshotUrl, { method: 'GET' });

            if (response.ok) {
                newSrc = snapshotUrl;
            } else {
                newSrc = `/proxy/thumbnail/${ip}?thumbnail_path=${encodeURIComponent(thumbnailPath)}`;
            }
            thumbnailState[index] = 'gcode';
        } else {
            newSrc = `/proxy/thumbnail/${ip}?thumbnail_path=${encodeURIComponent(thumbnailPath)}`;
            thumbnailState[index] = 'snapshot';
        }

        if (thumbnail.src !== newSrc) {
            // Fade out
            thumbnail.classList.add('fading');
            // Wait for fade-out to finish before changing src
            setTimeout(() => {
                thumbnail.src = newSrc;
            }, 350); // half the transition duration

            thumbnail.onload = () => {
                // Fade in
                thumbnail.classList.remove('fading');
            };
        }
    } catch (error) {
        console.error('Error updating thumbnail:', error);
    }
}

// Initial update and periodic refresh
updateAll();
setInterval(updateAll, 5000);
