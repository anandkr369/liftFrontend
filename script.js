let previousFloor = null;

async function fetchElevatorStatus() {
  try {
    const response = await fetch('https://smartlift.onrender.com/api/elevator-status');
    const json = await response.json();

    if (json.status === 'success' && json.data && json.data.value) {
      const value = json.data.value;
      const lowerValue = value.toLowerCase();

      // Extract floor number
      const floorMatch = value.match(/floor\s*(\d+)/i);
      const currentFloor = floorMatch ? parseInt(floorMatch[1]) : null;

      // Update floor number and status
      document.getElementById('floor1').textContent = currentFloor !== null ? currentFloor : '--';
      document.getElementById('status1').textContent = value;

      // Door status logic
      const doorStatus = lowerValue.includes("door open") ? "Open" : "Closed";
      document.getElementById('door1').textContent = doorStatus;

      // Determine direction by comparing floors
      const directionIcon = document.getElementById('direction1');
      if (previousFloor !== null && currentFloor !== null) {
        if (currentFloor > previousFloor) {
          directionIcon.classList.remove('fa-arrow-down');
          directionIcon.classList.add('fa-arrow-up');
        } else if (currentFloor < previousFloor) {
          directionIcon.classList.remove('fa-arrow-up');
          directionIcon.classList.add('fa-arrow-down');
        }
      }

      // Update previous floor for next comparison
      if (currentFloor !== null) {
        previousFloor = currentFloor;
      }

      // Update timestamp
      const timestamp = new Date(json.data.timestamp).toLocaleTimeString();
      document.getElementById('lastUpdate').textContent = timestamp;
    } else {
      console.error("Invalid API data");
    }
  } catch (error) {
    console.error('Failed to fetch elevator status:', error);
  }
}

// Initial fetch and interval
fetchElevatorStatus();
setInterval(fetchElevatorStatus, 500);

// Report issue prompt

document.getElementById('reportIssue').addEventListener('click', () => {
    const issues = [
      "Lift stuck",
      "Unusual noise",
      "Door malfunction",
      "Display not working",
      "Other"
    ];
  
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
    let description = "";
  
    if (selectedIssue === "Other") {
      description = prompt("Please describe the issue:");
    } else {
      description = prompt(`Describe the issue (${selectedIssue}):`);
    }
  
    if (description) {
      console.log("Issue reported:", selectedIssue);
      console.log("Description:", description);
      alert("Thank you! Your issue has been recorded.");
    } else {
      alert("Issue description is required.");
    }
  });
  
