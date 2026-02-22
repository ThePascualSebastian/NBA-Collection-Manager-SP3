// ─── Config ───────────────────────────────────────────────────────────────────
const API_URL = '/api/index.php';
const COOKIE_PAGE_SIZE = 'nba_page_size';
const PLACEHOLDER_IMG  = 'https://via.placeholder.com/220x160/1e2433/7a8299?text=NBA';

// ─── State ────────────────────────────────────────────────────────────────────
let state = {
    page:      1,
    pageSize:  getCookie(COOKIE_PAGE_SIZE) ? parseInt(getCookie(COOKIE_PAGE_SIZE)) : 10,
    totalPages:1,
    total:     0,
    search:    '',
    position:  '',
    sortBy:    'name',
    sortDir:   'ASC',
    editingId: null,
    deleteId:  null,
};

// ─── Cookie Helpers ───────────────────────────────────────────────────────────
function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const views = { list: $('list-view'), form: $('form-view'), stats: $('stats-view') };

// ─── View Management ──────────────────────────────────────────────────────────
function showView(name) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    views[name].classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    $(`nav-${name === 'list' ? 'list' : name === 'form' ? 'add' : 'stats'}`).classList.add('active');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
    const t = $('toast');
    t.textContent = msg;
    t.className = `toast ${type}`;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}

// ─── Fetch Players ────────────────────────────────────────────────────────────
async function fetchPlayers() {
    const params = new URLSearchParams({
        action:    'list',
        page:      state.page,
        page_size: state.pageSize,
        search:    state.search,
        position:  state.position,
        sort_by:   state.sortBy,
        sort_dir:  state.sortDir,
    });

    try {
        const res  = await fetch(`${API_URL}?${params}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to load players');

        state.page       = data.page;
        state.totalPages = data.total_pages;
        state.total      = data.total;

        renderCards(data.players);
        updatePagination();
    } catch (err) {
        console.error(err);
        $('player-grid').innerHTML = '';
        $('empty-state').classList.remove('hidden');
        $('empty-state').querySelector('p').textContent = 'Error loading players: ' + err.message;
    }
}

// ─── Render Cards ─────────────────────────────────────────────────────────────
function renderCards(players) {
    const grid = $('player-grid');
    const empty = $('empty-state');

    if (!players || players.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        empty.querySelector('p').textContent = 'No players found. Try adjusting your search or filters.';
        return;
    }

    empty.classList.add('hidden');
    grid.innerHTML = players.map(p => {
        const img = p.image_url && p.image_url.trim()
            ? `<img src="${escHtml(p.image_url)}" alt="${escHtml(p.name)}"
                    onerror="this.parentElement.innerHTML='<div class=\\'card-placeholder\\'>🏀</div>'">`
            : `<div class="card-placeholder">🏀</div>`;

        return `
        <div class="player-card">
            <div class="card-img-wrap">
                ${img}
                <span class="card-pos-badge">${escHtml(p.position)}</span>
            </div>
            <div class="card-body">
                <div class="card-name">${escHtml(p.name)}</div>
                <div class="card-team">${escHtml(p.team)}</div>
                <div class="card-stats">
                    <div class="card-stat">
                        <span class="card-stat-val">${p.ppg}</span>
                        <span class="card-stat-lbl">PPG</span>
                    </div>
                    <div class="card-stat">
                        <span class="card-stat-val">${p.years}</span>
                        <span class="card-stat-lbl">YRS</span>
                    </div>
                </div>
            </div>
            <div class="card-actions">
                <button class="edit-btn" onclick="startEdit(${p.id})">Edit</button>
                <button class="delete-btn" onclick="openDeleteModal(${p.id}, '${escHtml(p.name)}')">Delete</button>
            </div>
        </div>`;
    }).join('');
}

function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function updatePagination() {
    $('page-info').textContent  = `Page ${state.page} of ${state.totalPages}`;
    $('prev-page').disabled     = state.page <= 1;
    $('next-page').disabled     = state.page >= state.totalPages;
}

$('prev-page').onclick = () => { if (state.page > 1) { state.page--; fetchPlayers(); } };
$('next-page').onclick = () => { if (state.page < state.totalPages) { state.page++; fetchPlayers(); } };

// ─── Toolbar Controls ─────────────────────────────────────────────────────────
// Restore page size from cookie
const pageSizeEl = $('page-size-select');
pageSizeEl.value = String(state.pageSize);
pageSizeEl.onchange = () => {
    state.pageSize = parseInt(pageSizeEl.value);
    state.page = 1;
    setCookie(COOKIE_PAGE_SIZE, state.pageSize);
    fetchPlayers();
};

let searchTimer;
$('search-input').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        state.search = e.target.value.trim();
        state.page = 1;
        fetchPlayers();
    }, 350);
});

$('filter-position').onchange = e => {
    state.position = e.target.value;
    state.page = 1;
    fetchPlayers();
};

$('sort-by').onchange  = e => { state.sortBy  = e.target.value; state.page = 1; fetchPlayers(); };
$('sort-dir').onchange = e => { state.sortDir = e.target.value; state.page = 1; fetchPlayers(); };

// ─── Navigation ───────────────────────────────────────────────────────────────
$('nav-list').onclick = () => {
    showView('list');
    fetchPlayers();
};

$('nav-add').onclick = () => {
    state.editingId = null;
    $('player-form').reset();
    $('form-title').textContent = 'Add Player';
    $('form-error').classList.add('hidden');
    $('form-success').classList.add('hidden');
    $('image-preview').classList.add('hidden');
    clearFieldErrors();
    showView('form');
};

$('nav-stats').onclick = async () => {
    showView('stats');
    await fetchStats();
};

$('cancel-btn').onclick = () => {
    showView('list');
    fetchPlayers();
};

// ─── Image Preview ────────────────────────────────────────────────────────────
$('image_url').addEventListener('input', e => {
    const url = e.target.value.trim();
    const preview = $('image-preview');
    if (url) {
        preview.src = url;
        preview.classList.remove('hidden');
    } else {
        preview.classList.add('hidden');
    }
});

// ─── Form Validation ──────────────────────────────────────────────────────────
function clearFieldErrors() {
    ['name','team','ppg','years','image'].forEach(f => {
        const el = $(`err-${f}`);
        if (el) el.textContent = '';
    });
    ['name','team','ppg','years','image_url'].forEach(f => {
        const el = $(f);
        if (el) el.classList.remove('invalid');
    });
}

function fieldError(field, msg) {
    const el = $(`err-${field}`);
    const input = $(field === 'image' ? 'image_url' : field);
    if (el) el.textContent = msg;
    if (input) input.classList.add('invalid');
}

function validateForm(data) {
    let valid = true;
    clearFieldErrors();
    if (!data.name.trim()) { fieldError('name', 'Player name is required'); valid = false; }
    if (!data.team.trim()) { fieldError('team', 'Team is required'); valid = false; }
    if (isNaN(data.ppg) || data.ppg < 0 || data.ppg > 50) { fieldError('ppg', 'PPG must be 0–50'); valid = false; }
    if (isNaN(data.years) || data.years < 0 || data.years > 25) { fieldError('years', 'Years must be 0–25'); valid = false; }
    return valid;
}

// ─── Form Submit ──────────────────────────────────────────────────────────────
$('player-form').onsubmit = async e => {
    e.preventDefault();

    const data = {
        name:      $('name').value,
        team:      $('team').value,
        position:  $('position').value,
        ppg:       parseFloat($('ppg').value),
        years:     parseInt($('years').value),
        image_url: $('image_url').value.trim(),
    };

    if (!validateForm(data)) return;

    const errBox = $('form-error');
    const okBox  = $('form-success');
    errBox.classList.add('hidden');
    okBox.classList.add('hidden');

    const isEdit = !!state.editingId;
    const url    = isEdit ? `${API_URL}?action=update&id=${state.editingId}` : `${API_URL}?action=create`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const res    = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
        const result = await res.json();

        if (!res.ok) {
            errBox.textContent = result.error || 'Failed to save player';
            errBox.classList.remove('hidden');
            return;
        }

        okBox.textContent = isEdit ? `${result.name} updated successfully!` : `${result.name} added to the roster!`;
        okBox.classList.remove('hidden');

        setTimeout(() => {
            showView('list');
            fetchPlayers();
            showToast(isEdit ? 'Player updated!' : 'Player added!', 'success');
        }, 800);

    } catch (err) {
        errBox.textContent = 'Network error. Please check your connection.';
        errBox.classList.remove('hidden');
    }
};

// ─── Edit Player ──────────────────────────────────────────────────────────────
async function startEdit(id) {
    try {
        const res    = await fetch(`${API_URL}?action=get&id=${id}`);
        const player = await res.json();
        if (!res.ok) { showToast('Failed to load player', 'error'); return; }

        $('name').value      = player.name;
        $('team').value      = player.team;
        $('position').value  = player.position;
        $('ppg').value       = player.ppg;
        $('years').value     = player.years;
        $('image_url').value = player.image_url || '';

        const preview = $('image-preview');
        if (player.image_url) {
            preview.src = player.image_url;
            preview.classList.remove('hidden');
        } else {
            preview.classList.add('hidden');
        }

        state.editingId = id;
        $('form-title').textContent = 'Edit Player';
        $('form-error').classList.add('hidden');
        $('form-success').classList.add('hidden');
        clearFieldErrors();
        showView('form');
        $('nav-add').classList.add('active');

    } catch (err) {
        showToast('Failed to load player data', 'error');
    }
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function openDeleteModal(id, name) {
    state.deleteId = id;
    $('modal-player-name').textContent = `Delete "${name}" from the roster?`;
    $('delete-modal').classList.remove('hidden');
}

$('cancel-delete').onclick = () => {
    $('delete-modal').classList.add('hidden');
    state.deleteId = null;
};

$('delete-modal').onclick = e => {
    if (e.target === $('delete-modal')) {
        $('delete-modal').classList.add('hidden');
        state.deleteId = null;
    }
};

$('confirm-delete').onclick = async () => {
    if (!state.deleteId) return;
    try {
        const res = await fetch(`${API_URL}?action=delete&id=${state.deleteId}`, { method: 'DELETE' });
        if (!res.ok) { showToast('Failed to delete player', 'error'); return; }

        $('delete-modal').classList.add('hidden');
        state.deleteId = null;

        // Go back a page if current page is now empty
        if (state.page > 1 && state.total - 1 <= (state.page - 1) * state.pageSize) {
            state.page--;
        }
        await fetchPlayers();
        showToast('Player deleted from roster', 'success');
    } catch (err) {
        showToast('Network error during delete', 'error');
    }
};

// ─── Stats ────────────────────────────────────────────────────────────────────
async function fetchStats() {
    try {
        const res   = await fetch(`${API_URL}?action=stats`);
        const stats = await res.json();
        if (!res.ok) throw new Error(stats.error);

        $('stat-total').textContent    = stats.total_players;
        $('stat-pagesize').textContent = `${state.pageSize} / page`;
        $('stat-avgppg').textContent   = stats.avg_ppg;
        $('stat-avgyears').textContent = stats.avg_years;
        $('stat-top').textContent      = stats.top_scorer
            ? `${stats.top_scorer.name} (${stats.top_scorer.ppg} PPG)`
            : '—';

        const posGrid = $('pos-grid');
        posGrid.innerHTML = Object.entries(stats.position_counts).map(([pos, cnt]) => `
            <div class="pos-bar">
                <div class="pos-bar-label">${pos}</div>
                <div class="pos-bar-count">${cnt} player${cnt !== 1 ? 's' : ''}</div>
            </div>
        `).join('');

    } catch (err) {
        $('stat-total').textContent = 'Error loading stats';
    }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
fetchPlayers();