const apiUrl = 'http://localhost:3000/api';
let previousFloor = null;

// Toggle floor dropdown
function showFloorRequest(elevatorId) {
  const dropdown = document.getElementById(`dropdown-${elevatorId}`);
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Submit a floor request
async function submitFloorRequest(elevatorId) {
  const select = document.getElementById(`floorSelect-${elevatorId}`);
  const floor = select.value;
  if (!floor) {
    alert("Please select a floor.");
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/floor-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elevatorId, floor })
    });

    const result = await res.json();
    if (result.success) {
      const key = `${elevatorId}-floor-${floor}-timestamp`;
      localStorage.setItem(key, Date.now().toString());

      updateRequestCountDisplay(elevatorId, floor, result.count);

      // Auto-reset after 5 minutes
      setTimeout(() => {
        resetFloorRequestClientSide(elevatorId, floor);
      }, 5 * 60 * 1000);
    }
  } catch (error) {
    console.error('Error submitting request:', error);
  }
}

// Update request count in UI
function updateRequestCountDisplay(elevatorId, floor, count) {
  const display = document.getElementById(`requestCount-${elevatorId}`);
  if (display) {
    display.textContent = `Floor ${floor}: ${count}`;
  }
}

// Reset floor request (client-side only)
function resetFloorRequestClientSide(elevatorId, floor) {
  const key = `${elevatorId}-floor-${floor}-timestamp`;
  localStorage.removeItem(key);

  const display = document.getElementById(`requestCount-${elevatorId}`);
  if (display) {
    display.textContent = `Floor ${floor}: 0`;
  }
}

// Handle dropdown floor selection
function setupFloorDropdown(elevatorId) {
  const select = document.getElementById(`floorSelect-${elevatorId}`);
  if (!select) return;

  select.addEventListener('change', () => {
    const floor = select.value;
    const key = `${elevatorId}-floor-${floor}-timestamp`;
    const timestamp = localStorage.getItem(key);

    if (timestamp) {
      const elapsed = Date.now() - parseInt(timestamp);
      if (elapsed < 5 * 60 * 1000) {
        fetchAndUpdateFloorRequest(elevatorId, floor);
      } else {
        resetFloorRequestClientSide(elevatorId, floor);
      }
    } else {
      resetFloorRequestClientSide(elevatorId, floor);
    }
  });
}

// Fetch floor request count from backend
async function fetchAndUpdateFloorRequest(elevatorId, floor) {
  try {
    const res = await fetch(`${apiUrl}/floor-request`);
    const data = await res.json();
    const key = `${elevatorId}-floor-${floor}`;
    const count = data[key] || 0;
    updateRequestCountDisplay(elevatorId, floor, count);
  } catch (error) {
    console.error('Error fetching floor requests:', error);
  }
}

// Theme toggle
document.getElementById('themeSwitcher')?.addEventListener('change', function () {
  document.body.classList.toggle('dark-theme', this.checked);
});

// Hamburger menu toggle
document.querySelector('.hamburger-menu')?.addEventListener('click', () => {
  document.querySelector('.menu-items').classList.toggle('active');
});

// Report issue handler
document.getElementById('reportIssue')?.addEventListener('click', () => {
  const issues = ["Lift stuck", "Unusual noise", "Door malfunction", "Display not working", "Other"];
  let options = "Select the issue:\n";
  issues.forEach((issue, index) => {
    options += `${index + 1}. ${issue}\n`;
  });

  const selectedOption = prompt(options);
  const selectedIndex = parseInt(selectedOption);
  if (!selectedIndex || selectedIndex < 1 || selectedIndex > issues.length) {
    alert("Invalid selection. Please try again.");
    return;
  }

  const selectedIssue = issues[selectedIndex - 1];
  let description = selectedIssue === "Other"
    ? prompt("Please describe the issue:")
    : prompt(`Describe the issue (${selectedIssue}):`);

  if (description) {
    console.log("Issue reported:", selectedIssue);
    console.log("Description:", description);
    alert("Thank you! Your issue has been recorded.");
  } else {
    alert("Issue description is required.");
  }
});

// Fetch elevator status from Render API
async function fetchElevatorStatus() {
  try {
    const response = await fetch('https://smartlift.onrender.com/api/elevator-status');
    const json = await response.json();

    if (json.status === 'success' && json.data?.value) {
      const value = json.data.value;
      const lowerValue = value.toLowerCase();

      const floorMatch = value.match(/floor\s*(\d+)/i);
      const currentFloor = floorMatch ? parseInt(floorMatch[1]) : null;

      document.getElementById('floor1').textContent = currentFloor !== null ? currentFloor : '--';
      document.getElementById('status1').textContent = value;

      const doorStatus = lowerValue.includes("door open") ? "Open" : "Closed";
      document.getElementById('door1').textContent = doorStatus;

      const directionIcon = document.getElementById('direction1');
      if (previousFloor !== null && currentFloor !== null) {
        directionIcon.classList.toggle('fa-arrow-up', currentFloor > previousFloor);
        directionIcon.classList.toggle('fa-arrow-down', currentFloor < previousFloor);
      }

      if (currentFloor !== null) {
        previousFloor = currentFloor;
      }

      const timestamp = new Date(json.data.timestamp).toLocaleTimeString();
      document.getElementById('lastUpdate').textContent = timestamp;
    } else {
      console.error("Invalid API data");
    }
  } catch (error) {
    console.error('Failed to fetch elevator status:', error);
  }
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const elevators = ['elevator1', 'elevator2', 'elevator3'];
  elevators.forEach(setupFloorDropdown);

  // Theme toggle persistence
  const themeToggle = document.getElementById("themeSwitcher");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.checked = true;
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggle.checked = false;
  }

  themeToggle.addEventListener("change", function () {
    const theme = this.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });

  fetchElevatorStatus();
  setInterval(fetchElevatorStatus, 500);
});
