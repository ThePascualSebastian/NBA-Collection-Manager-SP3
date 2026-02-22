<?php
// ─── CORS & Headers ───────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');

// ─── DB Connection via Environment Variables ──────────────────────────────────
$host = getenv('DB_HOST') ?: 'sql200.infinityfree.com';
$db   = getenv('DB_NAME') ?: 'if0_41221037_db_nbaplayerstats';
$user = getenv('DB_USER') ?: 'if0_41221037';
$pass = getenv('DB_PASS') ?: '';  // Intentionally left blank for security purposes

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// ─── Create Table & Seed if Needed ────────────────────────────────────────────
function initDB(PDO $pdo): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS players (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        team        VARCHAR(100) NOT NULL,
        position    ENUM('PG','SG','SF','PF','C') NOT NULL DEFAULT 'PG',
        ppg         DECIMAL(4,1) NOT NULL DEFAULT 0.0,
        years       TINYINT UNSIGNED NOT NULL DEFAULT 0,
        image_url   VARCHAR(500) DEFAULT '',
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $count = $pdo->query("SELECT COUNT(*) FROM players")->fetchColumn();
    if ($count > 0) return;

    $seed = [
        ["LeBron James",           "Lakers",        "SF",  27.1, 23, "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png"],
        ["Stephen Curry",          "Warriors",      "PG",  24.5, 17, "https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png"],
        ["Kevin Durant",           "Suns",          "SF",  27.3, 18, "https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png"],
        ["Giannis Antetokounmpo",  "Bucks",         "PF",  29.8, 13, "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png"],
        ["Nikola Jokic",           "Nuggets",       "C",   26.4, 11, "https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png"],
        ["Luka Doncic",            "Mavericks",     "PG",  28.7,  8, "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png"],
        ["Joel Embiid",            "76ers",         "C",   30.1, 11, "https://cdn.nba.com/headshots/nba/latest/1040x760/203954.png"],
        ["Jayson Tatum",           "Celtics",       "SF",  26.9,  9, "https://cdn.nba.com/headshots/nba/latest/1040x760/1628369.png"],
        ["Damian Lillard",         "Bucks",         "PG",  25.1, 14, "https://cdn.nba.com/headshots/nba/latest/1040x760/203081.png"],
        ["Jimmy Butler",           "Heat",          "SF",  22.3, 15, "https://cdn.nba.com/headshots/nba/latest/1040x760/202710.png"],
        ["Kawhi Leonard",          "Clippers",      "SF",  24.8, 14, "https://cdn.nba.com/headshots/nba/latest/1040x760/202695.png"],
        ["Devin Booker",           "Suns",          "SG",  27.1, 10, "https://cdn.nba.com/headshots/nba/latest/1040x760/1626164.png"],
        ["Anthony Davis",          "Lakers",        "PF",  24.2, 13, "https://cdn.nba.com/headshots/nba/latest/1040x760/203076.png"],
        ["Ja Morant",              "Grizzlies",     "PG",  26.1,  7, "https://cdn.nba.com/headshots/nba/latest/1040x760/1629630.png"],
        ["Zion Williamson",        "Pelicans",      "PF",  25.0,  6, "https://cdn.nba.com/headshots/nba/latest/1040x760/1629627.png"],
        ["Trae Young",             "Hawks",         "PG",  25.5,  8, "https://cdn.nba.com/headshots/nba/latest/1040x760/1629027.png"],
        ["Paul George",            "76ers",         "SG",  23.8, 15, "https://cdn.nba.com/headshots/nba/latest/1040x760/202331.png"],
        ["Bradley Beal",           "Suns",          "SG",  22.5, 13, "https://cdn.nba.com/headshots/nba/latest/1040x760/203078.png"],
        ["Donovan Mitchell",       "Cavaliers",     "SG",  27.6,  9, "https://cdn.nba.com/headshots/nba/latest/1040x760/1628378.png"],
        ["Bam Adebayo",            "Heat",          "C",   20.4,  9, "https://cdn.nba.com/headshots/nba/latest/1040x760/1628389.png"],
        ["Jamal Murray",           "Nuggets",       "PG",  20.0,  9, "https://cdn.nba.com/headshots/nba/latest/1040x760/1627750.png"],
        ["Shai Gilgeous-Alexander","Thunder",       "SG",  30.1,  8, "https://cdn.nba.com/headshots/nba/latest/1040x760/1628983.png"],
        ["De'Aaron Fox",           "Kings",         "PG",  25.2,  9, "https://cdn.nba.com/headshots/nba/latest/1040x760/1628368.png"],
        ["Jaren Jackson Jr.",      "Grizzlies",     "PF",  22.4,  8, "https://cdn.nba.com/headshots/nba/latest/1040x760/1628991.png"],
        ["Jrue Holiday",           "Celtics",       "PG",  18.5, 15, "https://cdn.nba.com/headshots/nba/latest/1040x760/201950.png"],
        ["Karl-Anthony Towns",     "Knicks",        "C",   23.1, 11, "https://cdn.nba.com/headshots/nba/latest/1040x760/1626157.png"],
        ["Anthony Edwards",        "Timberwolves",  "SG",  26.0,  6, "https://cdn.nba.com/headshots/nba/latest/1040x760/1630162.png"],
        ["Pascal Siakam",          "Pacers",        "PF",  22.0, 10, "https://cdn.nba.com/headshots/nba/latest/1040x760/1627783.png"],
        ["Domantas Sabonis",       "Kings",         "C",   19.4, 11, "https://cdn.nba.com/headshots/nba/latest/1040x760/1627734.png"],
        ["Tyrese Haliburton",      "Pacers",        "PG",  20.1,  6, "https://cdn.nba.com/headshots/nba/latest/1040x760/1630169.png"],
    ];

    $stmt = $pdo->prepare("INSERT INTO players (name,team,position,ppg,years,image_url) VALUES (?,?,?,?,?,?)");
    foreach ($seed as $p) $stmt->execute($p);
}

initDB($pdo);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function respond(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

function validatePlayer(array $data): ?string {
    if (empty(trim($data['name'] ?? '')))  return 'Name is required';
    if (empty(trim($data['team'] ?? '')))  return 'Team is required';
    $validPositions = ['PG','SG','SF','PF','C'];
    if (!in_array($data['position'] ?? '', $validPositions)) return 'Invalid position';
    $ppg = floatval($data['ppg'] ?? -1);
    if ($ppg < 0 || $ppg > 50)  return 'PPG must be between 0 and 50';
    $years = intval($data['years'] ?? -1);
    if ($years < 0 || $years > 25) return 'Years must be between 0 and 25';
    return null;
}

// ─── Router ───────────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($action) {

    // ── LIST (with search, filter, sort, pagination) ──────────────────────────
    case 'list': {
        $page     = max(1, intval($_GET['page']      ?? 1));
        $pageSize = intval($_GET['page_size'] ?? 10);
        $pageSize = in_array($pageSize, [5,10,20,50]) ? $pageSize : 10;
        $search   = trim($_GET['search']   ?? '');
        $position = trim($_GET['position'] ?? '');
        $sortBy   = $_GET['sort_by']  ?? 'name';
        $sortDir  = strtoupper($_GET['sort_dir'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';

        $allowedSorts = ['name','team','position','ppg','years'];
        if (!in_array($sortBy, $allowedSorts)) $sortBy = 'name';

        $where  = [];
        $params = [];

        if ($search !== '') {
            $where[]  = "(name LIKE ? OR team LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if ($position !== '' && in_array($position, ['PG','SG','SF','PF','C'])) {
            $where[]  = "position = ?";
            $params[] = $position;
        }

        $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $total = $pdo->prepare("SELECT COUNT(*) FROM players $whereSQL");
        $total->execute($params);
        $totalRecords = (int)$total->fetchColumn();
        $totalPages   = max(1, (int)ceil($totalRecords / $pageSize));
        $page         = min($page, $totalPages);
        $offset       = ($page - 1) * $pageSize;

        $stmt = $pdo->prepare("SELECT * FROM players $whereSQL ORDER BY $sortBy $sortDir LIMIT ? OFFSET ?");
        foreach ($params as $i => $v) $stmt->bindValue($i + 1, $v);
        $stmt->bindValue(count($params) + 1, $pageSize, PDO::PARAM_INT);
        $stmt->bindValue(count($params) + 2, $offset,   PDO::PARAM_INT);
        $stmt->execute();
        $players = $stmt->fetchAll();

        respond([
            'players'      => $players,
            'total'        => $totalRecords,
            'page'         => $page,
            'page_size'    => $pageSize,
            'total_pages'  => $totalPages,
        ]);
    }

    // ── GET single player ─────────────────────────────────────────────────────
    case 'get': {
        if (!$id) respond(['error' => 'ID required'], 400);
        $stmt = $pdo->prepare("SELECT * FROM players WHERE id = ?");
        $stmt->execute([$id]);
        $player = $stmt->fetch();
        if (!$player) respond(['error' => 'Player not found'], 404);
        respond($player);
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    case 'create': {
        if ($method !== 'POST') respond(['error' => 'Method not allowed'], 405);
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $err  = validatePlayer($data);
        if ($err) respond(['error' => $err], 400);

        $stmt = $pdo->prepare("INSERT INTO players (name,team,position,ppg,years,image_url) VALUES (?,?,?,?,?,?)");
        $stmt->execute([
            trim($data['name']),
            trim($data['team']),
            $data['position'],
            floatval($data['ppg']),
            intval($data['years']),
            trim($data['image_url'] ?? ''),
        ]);
        $newId = $pdo->lastInsertId();
        $stmt2 = $pdo->prepare("SELECT * FROM players WHERE id = ?");
        $stmt2->execute([$newId]);
        respond($stmt2->fetch(), 201);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    case 'update': {
        if ($method !== 'PUT') respond(['error' => 'Method not allowed'], 405);
        if (!$id) respond(['error' => 'ID required'], 400);
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $err  = validatePlayer($data);
        if ($err) respond(['error' => $err], 400);

        $stmt = $pdo->prepare("UPDATE players SET name=?,team=?,position=?,ppg=?,years=?,image_url=? WHERE id=?");
        $affected = $stmt->execute([
            trim($data['name']),
            trim($data['team']),
            $data['position'],
            floatval($data['ppg']),
            intval($data['years']),
            trim($data['image_url'] ?? ''),
            $id,
        ]);
        if ($stmt->rowCount() === 0 && !$pdo->query("SELECT id FROM players WHERE id=$id")->fetch()) {
            respond(['error' => 'Player not found'], 404);
        }
        $stmt2 = $pdo->prepare("SELECT * FROM players WHERE id = ?");
        $stmt2->execute([$id]);
        respond($stmt2->fetch());
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    case 'delete': {
        if ($method !== 'DELETE') respond(['error' => 'Method not allowed'], 405);
        if (!$id) respond(['error' => 'ID required'], 400);
        $stmt = $pdo->prepare("DELETE FROM players WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) respond(['error' => 'Player not found'], 404);
        respond(['message' => 'Player deleted successfully']);
    }

    // ── STATS ─────────────────────────────────────────────────────────────────
    case 'stats': {
        $total = (int)$pdo->query("SELECT COUNT(*) FROM players")->fetchColumn();
        $avgPpg = round((float)$pdo->query("SELECT AVG(ppg) FROM players")->fetchColumn(), 2);
        $avgYears = round((float)$pdo->query("SELECT AVG(years) FROM players")->fetchColumn(), 1);
        $topScorer = $pdo->query("SELECT name, ppg FROM players ORDER BY ppg DESC LIMIT 1")->fetch();

        $posCounts = [];
        foreach (['PG','SG','SF','PF','C'] as $pos) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM players WHERE position = ?");
            $stmt->execute([$pos]);
            $posCounts[$pos] = (int)$stmt->fetchColumn();
        }

        respond([
            'total_players'  => $total,
            'avg_ppg'        => $avgPpg,
            'avg_years'      => $avgYears,
            'top_scorer'     => $topScorer,
            'position_counts'=> $posCounts,
        ]);
    }

    default:
        respond(['error' => 'Unknown action'], 400);
}