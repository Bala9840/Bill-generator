document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadHeader();
    loadFooter();
    
    // Initialize the application
    initApp();
    
    // Set current date and time
    setCurrentDateTime();
    
    // Generate a random trip ID
    generateTripId();
    
    // Load saved trips
    loadTrips();
    
    // Event listeners
    document.getElementById('tripForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('downloadBtn').addEventListener('click', downloadWaybill);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllTrips);
    document.getElementById('fromCurrentLocation').addEventListener('click', () => getCurrentLocation('fromLocation'));
    document.getElementById('toCurrentLocation').addEventListener('click', () => getCurrentLocation('toLocation'));
    document.getElementById('saveProfileBtn').addEventListener('click', saveDriverProfile);
    
    // Edit buttons for driver info
    document.getElementById('editDriverBtn').addEventListener('click', () => enableEditing('driverName'));
    document.getElementById('editLicenseBtn').addEventListener('click', () => enableEditing('licensePlate'));
    document.getElementById('editCapacityBtn').addEventListener('click', () => enableEditing('passengerCapacity'));
    
    // Input change listeners for live preview
    document.getElementById('passengerName').addEventListener('input', updatePreview);
    document.getElementById('viaService').addEventListener('change', updatePreview);
    document.getElementById('fromLocation').addEventListener('input', updatePreview);
    document.getElementById('toLocation').addEventListener('input', updatePreview);
    document.getElementById('tripAmount').addEventListener('input', updatePreview);
    document.getElementById('tripDate').addEventListener('change', updatePreview);
    document.getElementById('tripTime').addEventListener('change', updatePreview);
    document.getElementById('timeFormat').addEventListener('change', updatePreview);
    document.getElementById('driverName').addEventListener('input', updatePreview);
    document.getElementById('licensePlate').addEventListener('input', updatePreview);
    document.getElementById('passengerCapacity').addEventListener('input', updatePreview);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

function loadHeader() {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading header:', error);
            document.getElementById('header-placeholder').innerHTML = `
                <header>
                    <div class="header-content">
                        <div class="logo">
                            <h1>Trip Waybill</h1>
                        </div>
                    </div>
                </header>
            `;
        });
}

function loadFooter() {
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            document.getElementById('footer-placeholder').innerHTML = `
                <footer>
                    <div class="footer-bottom">
                        <p>&copy; 2025 Waybill Generator. All rights reserved.</p>
                    </div>
                </footer>
            `;
        });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function initApp() {
    // Check if driver settings are saved in localStorage
    const savedDriverName = localStorage.getItem('driverName');
    const savedLicensePlate = localStorage.getItem('licensePlate');
    const savedPassengerCapacity = localStorage.getItem('passengerCapacity');
    
    if (savedDriverName) {
        document.getElementById('driverName').value = savedDriverName;
        document.getElementById('profileDriverName').value = savedDriverName;
    }
    
    if (savedLicensePlate) {
        document.getElementById('licensePlate').value = savedLicensePlate;
        document.getElementById('profileLicensePlate').value = savedLicensePlate;
    }
    
    if (savedPassengerCapacity) {
        document.getElementById('passengerCapacity').value = savedPassengerCapacity;
        document.getElementById('profilePassengerCapacity').value = savedPassengerCapacity;
    }
}

function setCurrentDateTime() {
    const now = new Date();
    
    // Format date as YYYY-MM-DD for input[type="date"]
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    document.getElementById('tripDate').value = `${year}-${month}-${day}`;
    
    // Format time as HH:MM for input[type="time"]
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // Set AM/PM accordingly
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = String(hours).padStart(2, '0');
    
    document.getElementById('tripTime').value = `${hours}:${minutes}`;
    document.getElementById('timeFormat').value = ampm;
}

function generateTripId() {
    // Generate a random UUID for the trip
    const tripId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    
    document.getElementById('previewTripId').textContent = tripId;
    return tripId;
}

function updatePreview() {
    // Update passenger info
    document.getElementById('previewPassenger').textContent = document.getElementById('passengerName').value || 'Gunavathy B';
    
    // Update via service
    document.getElementById('previewVia').textContent = document.getElementById('viaService').value;
    
    // Update locations
    document.getElementById('previewFrom').textContent = document.getElementById('fromLocation').value || 'Saidapet, Chennai TN 600015, IN';
    document.getElementById('previewTo').textContent = document.getElementById('toLocation').value || 'Nehru Nagar, Perungudi, Chennai TN 600041, IN';
    
    // Update amount
    const amount = document.getElementById('tripAmount').value;
    document.getElementById('previewAmount').textContent = amount ? `₹ ${parseFloat(amount).toFixed(2)}` : '₹ 0.00';
    
    // Update date and time
    const date = document.getElementById('tripDate').value;
    const time = document.getElementById('tripTime').value;
    const ampm = document.getElementById('timeFormat').value;
    
    if (date && time) {
        // Format date as MM/DD/YY
        const dateParts = date.split('-');
        const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0].substring(2)}`;
        
        // Format time with AM/PM
        const timeParts = time.split(':');
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        hours = String(hours).padStart(2, '0');
        const formattedTime = `${formattedDate} ${hours}:${minutes}:00 IST`;
        
        document.getElementById('previewTime').textContent = formattedTime;
    }
    
    // Update driver info
    document.getElementById('previewDriver').textContent = document.getElementById('driverName').value;
    document.getElementById('previewLicense').textContent = document.getElementById('licensePlate').value;
    document.getElementById('previewCapacity').textContent = document.getElementById('passengerCapacity').value;
    
    // Enable download button if form is valid
    const form = document.getElementById('tripForm');
    document.getElementById('downloadBtn').disabled = !form.checkValidity();
}

function enableEditing(fieldId) {
    const field = document.getElementById(fieldId);
    field.removeAttribute('readonly');
    field.focus();
    
    // Show save button temporarily
    const editBtn = document.querySelector(`#edit${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}Btn`);
    const originalText = editBtn.textContent;
    editBtn.textContent = 'Save';
    editBtn.classList.add('saving');
    
    const saveHandler = function() {
        field.setAttribute('readonly', true);
        editBtn.textContent = originalText;
        editBtn.classList.remove('saving');
        
        // Update profile form as well
        if (fieldId === 'driverName') {
            document.getElementById('profileDriverName').value = field.value;
        } else if (fieldId === 'licensePlate') {
            document.getElementById('profileLicensePlate').value = field.value;
        } else if (fieldId === 'passengerCapacity') {
            document.getElementById('profilePassengerCapacity').value = field.value;
        }
        
        // Save to localStorage
        localStorage.setItem('driverName', document.getElementById('driverName').value);
        localStorage.setItem('licensePlate', document.getElementById('licensePlate').value);
        localStorage.setItem('passengerCapacity', document.getElementById('passengerCapacity').value);
        
        editBtn.removeEventListener('click', saveHandler);
        editBtn.addEventListener('click', () => enableEditing(fieldId));
    };
    
    editBtn.removeEventListener('click', saveHandler);
    editBtn.addEventListener('click', saveHandler);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Save driver settings to localStorage
    localStorage.setItem('driverName', document.getElementById('driverName').value);
    localStorage.setItem('licensePlate', document.getElementById('licensePlate').value);
    localStorage.setItem('passengerCapacity', document.getElementById('passengerCapacity').value);
    
    // Create trip object
    const trip = {
        id: document.getElementById('previewTripId').textContent,
        date: document.getElementById('tripDate').value,
        time: document.getElementById('tripTime').value,
        timeFormat: document.getElementById('timeFormat').value,
        passengerName: document.getElementById('passengerName').value,
        viaService: document.getElementById('viaService').value,
        fromLocation: document.getElementById('fromLocation').value,
        toLocation: document.getElementById('toLocation').value,
        amount: document.getElementById('tripAmount').value,
        driverName: document.getElementById('driverName').value,
        licensePlate: document.getElementById('licensePlate').value,
        passengerCapacity: document.getElementById('passengerCapacity').value,
        timestamp: new Date().toISOString()
    };
    
    // Save trip to localStorage
    saveTrip(trip);
    
    // Generate new trip ID for next trip
    generateTripId();
    
    // Reset form (keep driver info)
    document.getElementById('passengerName').value = '';
    document.getElementById('fromLocation').value = '';
    document.getElementById('toLocation').value = '';
    document.getElementById('tripAmount').value = '';
    setCurrentDateTime();
    
    // Scroll to trips section
    scrollToSection('trips');
    
    // Show success message
    alert('Waybill generated successfully!');
}

function saveTrip(trip) {
    // Get existing trips from localStorage
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    
    // Add new trip
    trips.push(trip);
    
    // Save back to localStorage
    localStorage.setItem('trips', JSON.stringify(trips));
    
    // Refresh trips list
    loadTrips();
}

function loadTrips() {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const tripsList = document.getElementById('tripsList');
    
    // Clear current list
    tripsList.innerHTML = '';
    
    if (trips.length === 0) {
        tripsList.innerHTML = '<p>No trips saved yet.</p>';
        return;
    }
    
    // Add each trip to the list
    trips.forEach((trip, index) => {
        const tripElement = document.createElement('div');
        tripElement.className = 'trip-item';
        
        // Format date for display
        const date = new Date(trip.timestamp);
        const formattedDate = date.toLocaleString();
        
        tripElement.innerHTML = `
            <div class="trip-info">
                <strong>${trip.passengerName}</strong> - ${formattedDate}<br>
                <small>From: ${trip.fromLocation}</small><br>
                <small>To: ${trip.toLocation}</small><br>
                <small>Via: ${trip.viaService}</small>
                ${trip.amount ? `<br><small>Amount: ₹ ${parseFloat(trip.amount).toFixed(2)}</small>` : ''}
            </div>
            <div class="trip-actions">
                <button class="download-btn" data-index="${index}">Download</button>
                <button class="edit-trip-btn" data-index="${index}">Edit</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
        `;
        
        tripsList.appendChild(tripElement);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            downloadTrip(trips[index]);
        });
    });
    
    document.querySelectorAll('.edit-trip-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            editTrip(trips[index], index);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteTrip(index);
        });
    });
}

function downloadWaybill() {
    // Use html2canvas to convert the waybill preview to an image
    html2canvas(document.getElementById('waybillPreview'), {
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true
    }).then(canvas => {
        // Create a download link
        const link = document.createElement('a');
        link.download = `waybill-${document.getElementById('previewTripId').textContent}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    });
}

function downloadTrip(trip) {
    // Create a temporary waybill element with the trip data
    const tempWaybill = document.getElementById('waybillPreview').cloneNode(true);
    
    // Update with trip data
    tempWaybill.querySelector('#previewTripId').textContent = trip.id;
    
    // Format date and time
    const dateParts = trip.date.split('-');
    const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0].substring(2)}`;
    
    const timeParts = trip.time.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    
    if (trip.timeFormat === 'PM' && hours < 12) hours += 12;
    if (trip.timeFormat === 'AM' && hours === 12) hours = 0;
    
    hours = String(hours).padStart(2, '0');
    const formattedTime = `${formattedDate} ${hours}:${minutes}:00 IST`;
    
    tempWaybill.querySelector('#previewTime').textContent = formattedTime;
    tempWaybill.querySelector('#previewPassenger').textContent = trip.passengerName;
    tempWaybill.querySelector('#previewVia').textContent = trip.viaService;
    tempWaybill.querySelector('#previewFrom').textContent = trip.fromLocation;
    tempWaybill.querySelector('#previewTo').textContent = trip.toLocation;
    tempWaybill.querySelector('#previewAmount').textContent = trip.amount ? `₹ ${parseFloat(trip.amount).toFixed(2)}` : '₹ 0.00';
    tempWaybill.querySelector('#previewDriver').textContent = trip.driverName;
    tempWaybill.querySelector('#previewLicense').textContent = trip.licensePlate;
    tempWaybill.querySelector('#previewCapacity').textContent = trip.passengerCapacity;
    
    // Append temporarily to document
    tempWaybill.style.position = 'absolute';
    tempWaybill.style.left = '-9999px';
    document.body.appendChild(tempWaybill);
    
    // Convert to image and download
    html2canvas(tempWaybill, {
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `waybill-${trip.id}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
        // Remove temporary element
        document.body.removeChild(tempWaybill);
    });
}

function editTrip(trip, index) {
    // Fill the form with trip data
    document.getElementById('passengerName').value = trip.passengerName;
    document.getElementById('viaService').value = trip.viaService;
    document.getElementById('fromLocation').value = trip.fromLocation;
    document.getElementById('toLocation').value = trip.toLocation;
    document.getElementById('tripAmount').value = trip.amount || '';
    document.getElementById('tripDate').value = trip.date;
    document.getElementById('tripTime').value = trip.time;
    document.getElementById('timeFormat').value = trip.timeFormat;
    
    // Update preview
    updatePreview();
    
    // Set the trip ID to the original
    document.getElementById('previewTripId').textContent = trip.id;
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Change generate button text
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.textContent = 'Update Waybill';
    
    // Store the index for updating
    generateBtn.setAttribute('data-edit-index', index);
    
    // Change the submit handler to update instead of create
    const form = document.getElementById('tripForm');
    form.removeEventListener('submit', handleFormSubmit);
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Update the trip
        const trips = JSON.parse(localStorage.getItem('trips') || '[]');
        trips[index] = {
            id: trip.id, // Keep the original ID
            date: document.getElementById('tripDate').value,
            time: document.getElementById('tripTime').value,
            timeFormat: document.getElementById('timeFormat').value,
            passengerName: document.getElementById('passengerName').value,
            viaService: document.getElementById('viaService').value,
            fromLocation: document.getElementById('fromLocation').value,
            toLocation: document.getElementById('toLocation').value,
            amount: document.getElementById('tripAmount').value,
            driverName: document.getElementById('driverName').value,
            licensePlate: document.getElementById('licensePlate').value,
            passengerCapacity: document.getElementById('passengerCapacity').value,
            timestamp: trip.timestamp // Keep the original timestamp
        };
        
        // Save back to localStorage
        localStorage.setItem('trips', JSON.stringify(trips));
        
        // Reset form and button
        generateBtn.textContent = 'Generate Waybill';
        generateBtn.removeAttribute('data-edit-index');
        form.reset();
        setCurrentDateTime();
        generateTripId();
        
        // Reload trips
        loadTrips();
        
        // Restore original submit handler
        form.removeEventListener('submit', arguments.callee);
        form.addEventListener('submit', handleFormSubmit);
        
        alert('Waybill updated successfully!');
    });
}

function deleteTrip(index) {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    trips.splice(index, 1);
    localStorage.setItem('trips', JSON.stringify(trips));
    loadTrips();
}

function clearAllTrips() {
    if (!confirm('Are you sure you want to delete all trips?')) return;
    
    localStorage.removeItem('trips');
    loadTrips();
}

function saveDriverProfile() {
    const driverName = document.getElementById('profileDriverName').value;
    const licensePlate = document.getElementById('profileLicensePlate').value;
    const passengerCapacity = document.getElementById('profilePassengerCapacity').value;
    
    // Update main form
    document.getElementById('driverName').value = driverName;
    document.getElementById('licensePlate').value = licensePlate;
    document.getElementById('passengerCapacity').value = passengerCapacity;
    
    // Save to localStorage
    localStorage.setItem('driverName', driverName);
    localStorage.setItem('licensePlate', licensePlate);
    localStorage.setItem('passengerCapacity', passengerCapacity);
    
    // Update preview
    updatePreview();
    
    alert('Driver profile saved successfully!');
}

function getCurrentLocation(fieldId) {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    // Show loading state
    const button = document.querySelector(`#${fieldId === 'fromLocation' ? 'fromCurrentLocation' : 'toCurrentLocation'}`);
    const originalText = button.textContent;
    button.textContent = 'Locating...';
    button.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            // Use OpenStreetMap Nominatim API for reverse geocoding (free)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    const address = data.display_name;
                    document.getElementById(fieldId).value = address;
                    updatePreview();
                    
                    // Restore button
                    button.textContent = originalText;
                    button.disabled = false;
                })
                .catch(error => {
                    console.error('Error getting location:', error);
                    alert('Could not retrieve address information');
                    
                    // Restore button
                    button.textContent = originalText;
                    button.disabled = false;
                });
        },
        error => {
            console.error('Error getting location:', error);
            alert('Could not retrieve your location. Please make sure location services are enabled.');
            
            // Restore button
            button.textContent = originalText;
            button.disabled = false;
        }
    );
}