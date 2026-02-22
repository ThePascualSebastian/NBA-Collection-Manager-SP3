// API URL - update this to your actual InfinityFree URL
const API_URL = 'https://nba-collection-manager.infinityfreeapp.com/api/index.php';

let currentPage = 1;
const PAGE_SIZE = 10;
let totalPages = 1;
let editingId = null;

const tableBody = document.getElementById("player-table");
const formView = document.getElementById("form-view");
const listView = document.getElementById("list-view");
const statsView = document.getElementById("stats-view");

const navList = document.getElementById("nav-list");
const navAdd = document.getElementById("nav-add");
const navStats = document.getElementById("nav-stats");

const form = document.getElementById("player-form");
const formTitle = document.getElementById("form-title");
const formError = document.getElementById("form-error");

const paginationContainer = document.getElementById("pagination");
const prevButton = document.getElementById("prev-page");
const nextButton = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

// Fetch players from API with pagination
async function fetchPlayers(page = 1) {
  try {
    const response = await fetch(`${API_URL}?action=list&page=${page}&page_size=${PAGE_SIZE}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    currentPage = data.page;
    totalPages = data.total_pages;
    
    renderTable(data.players);
    updatePagination();
  } catch (error) {
    console.error('Error fetching players:', error);
    showConnectionError(error.message);
  }
}

// Show connection error message
function showConnectionError(message) {
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" style="padding: 20px; color: #dc3545;">
        <strong>Unable to connect to backend API</strong><br><br>
        Error: ${message}<br><br>
        Please check:<br>
        1. API URL is correct in app.js<br>
        2. Backend server is running<br>
        3. CORS is properly configured<br>
        4. Current API URL: ${API_URL}
      </td>
    </tr>
  `;
}

// Render table with player data
function renderTable(players) {
  tableBody.innerHTML = "";
  
  if (players.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No players found</td></tr>';
    return;
  }
  
  players.forEach(player => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${player.name}</td>
      <td>${player.team}</td>
      <td>${player.position}</td>
      <td>${player.ppg}</td>
      <td>${player.years}</td>
      <td>
        <button class="edit-btn" onclick="editPlayer(${player.id})">Edit</button>
        <button class="delete-btn" onclick="deletePlayer(${player.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Update pagination controls
function updatePagination() {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

// Pagination handlers
prevButton.onclick = () => {
  if (currentPage > 1) {
    fetchPlayers(currentPage - 1);
  }
};

nextButton.onclick = () => {
  if (currentPage < totalPages) {
    fetchPlayers(currentPage + 1);
  }
};

// Shows one view at a time
function showView(view) {
  listView.classList.add("hidden");
  formView.classList.add("hidden");
  statsView.classList.add("hidden");
  view.classList.remove("hidden");
}

// Navigation handlers
navList.onclick = () => {
  fetchPlayers(currentPage);
  showView(listView);
};

navAdd.onclick = () => {
  form.reset();
  editingId = null;
  formTitle.textContent = "Add Player";
  formError.textContent = "";
  showView(formView);
};

navStats.onclick = async () => {
  await renderStats();
  showView(statsView);
};

// Form submit handler
form.onsubmit = async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const team = document.getElementById("team").value.trim();
  const position = document.getElementById("position").value;
  const ppg = parseFloat(document.getElementById("ppg").value);
  const years = parseInt(document.getElementById("years").value);

  // Client-side validation
  if (!name || !team || isNaN(ppg) || isNaN(years)) {
    formError.textContent = "All fields are required.";
    return;
  }

  if (ppg < 0 || ppg > 50 || years < 0 || years > 25) {
    formError.textContent = "PPG must be 0–50 and Years must be 0–25.";
    return;
  }

  const playerData = {
    name,
    team,
    position,
    ppg,
    years
  };

  try {
    let response;
    
    if (editingId) {
      // Update existing player
      response = await fetch(`${API_URL}?action=update&id=${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(playerData)
      });
    } else {
      // Create new player
      response = await fetch(`${API_URL}?action=create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(playerData)
      });
    }

    if (!response.ok) {
      const error = await response.json();
      formError.textContent = error.error || 'Failed to save player';
      return;
    }

    // Success - return to list view
    await fetchPlayers(editingId ? currentPage : 1);
    showView(listView);
    form.reset();
    editingId = null;
    
  } catch (error) {
    console.error('Error saving player:', error);
    formError.textContent = 'Failed to save player. Please check your connection.';
  }
};

// Edit player - load data into form
async function editPlayer(id) {
  try {
    const response = await fetch(`${API_URL}?action=get&id=${id}`);
    
    if (!response.ok) {
      alert('Failed to load player data');
      return;
    }
    
    const player = await response.json();
    
    document.getElementById("name").value = player.name;
    document.getElementById("team").value = player.team;
    document.getElementById("position").value = player.position;
    document.getElementById("ppg").value = player.ppg;
    document.getElementById("years").value = player.years;
    
    editingId = id;
    formTitle.textContent = "Edit Player";
    formError.textContent = "";
    showView(formView);
    
  } catch (error) {
    console.error('Error editing player:', error);
    alert('Failed to load player data. Please try again.');
  }
}

// Delete player with confirmation
async function deletePlayer(id) {
  if (!confirm("Are you sure you want to delete this player?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}?action=delete&id=${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      alert('Failed to delete player');
      return;
    }

    // Refresh the current page
    await fetchPlayers(currentPage);
    
  } catch (error) {
    console.error('Error deleting player:', error);
    alert('Failed to delete player. Please try again.');
  }
}

// Render statistics
async function renderStats() {
  try {
    const response = await fetch(`${API_URL}?action=stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    const stats = await response.json();

    document.getElementById("total-players").textContent =
      "Total Players: " + stats.total_players;

    document.getElementById("avg-ppg").textContent =
      "Average PPG: " + stats.avg_ppg;

    document.getElementById("position-counts").innerHTML =
      "Players by Position:<br>" +
      `PG: ${stats.position_counts.PG}<br>` +
      `SG: ${stats.position_counts.SG}<br>` +
      `SF: ${stats.position_counts.SF}<br>` +
      `PF: ${stats.position_counts.PF}<br>` +
      `C: ${stats.position_counts.C}`;

    document.getElementById("avg-years").textContent = 
      "Average Years: " + stats.avg_years;
      
  } catch (error) {
    console.error('Error fetching stats:', error);
    document.getElementById("total-players").textContent = 
      "Unable to load statistics. Please check your connection.";
  }
}

// Initial app load
fetchPlayers(1);