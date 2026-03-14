# DEPLOYMENT.md — NBA Player Collection Manager
## Solo Project 3 · CPSC 3750 · Pascual Sebastian

---

## Live URL
**https://nba.thepascualsebastian.com**

---

## Domain & Registrar
| Field | Value |
|---|---|
| Domain | thepascualsebastian.com |
| Registrar | Namecheap |
| Nameservers | InfinityFree (managed via cPanel) |

---

## Hosting Provider
**InfinityFree** (infinityfree.com) — Free tier  
Account: if0_41221037  
Main domain: thepascualsebastian.com (portfolio site)  
NBA app subdomain: nba.thepascualsebastian.com

---

## HTTPS Provider
**Let's Encrypt** via InfinityFree — Free SSL certificate  
Installed directly on the subdomain `nba.thepascualsebastian.com` through the InfinityFree dashboard.

### How It Works
```
Visitor → InfinityFree (HTTPS via Let's Encrypt)
```

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | PHP 8 |
| Database | MySQL (via PDO) |
| Fonts | Google Fonts (Barlow Condensed, Barlow) |
| HTTPS | Let's Encrypt (via InfinityFree) |

---

## Database
| Field | Value |
|---|---|
| Type | MySQL |
| Host | sql200.infinityfree.com |
| Database Name | if0_41221037_db_nbaplayerstats |
| Username | if0_41221037 |
| Hosted by | InfinityFree (same account) |

The database table (`players`) is created automatically on first request if it
does not exist. Seed data (30 players) is also inserted automatically if the
table is empty.

---

## File Structure
```
htdocs/
├── index.html          # Main SPA shell
├── .htaccess           # HTTP → HTTPS redirect rules
├── css/
│   └── style.css       # All styles
├── js/
│   └── app.js          # Frontend logic (fetch, state, DOM)
├── images/
│   └── nbalogo.jpeg    # NBA logo
└── api/
    └── index.php       # PHP backend (all routes + DB connection)
```

---

## How to Deploy / Update the App

### First Deployment
1. Log into InfinityFree control panel
2. Open **File Manager** or connect via **FTP** (FileZilla recommended)
   - FTP Host: provided in InfinityFree control panel
   - FTP User / Password: from control panel
3. Upload all files from `htdocs/` into the `/nba.thepascualsebastian.com/htdocs` directory on the server
4. Edit `api/index.php` and fill in your real DB password in the fallback value
5. Visit your domain — the database table and seed data are created automatically

### Updating Files
- Re-upload changed files via FTP or File Manager
- No build step required — PHP and vanilla JS need no compilation

---

## Configuration & Secrets Management

Database credentials are handled in `api/index.php` using `getenv()`:

```php
$host = getenv('DB_HOST') ?: 'sql200.infinityfree.com';
$db   = getenv('DB_NAME') ?: 'if0_41221037_db_nbaplayerstats';
$user = getenv('DB_USER') ?: 'if0_41221037';
$pass = getenv('DB_PASS') ?: '';  // Must be set as environment variable
```

**The database password is never committed to Git.**  
The live server file contains the real password as a fallback value, but that
file is excluded from version control via `.gitignore`.

`.gitignore` includes:
```
.env
api/.env
```

---

## SSL / HTTPS Architecture

HTTPS is provided by **Let's Encrypt** via InfinityFree's built-in SSL dashboard.

- SSL certificate issued and installed directly through the InfinityFree control panel
- Certificate auto-renews through InfinityFree
- No third-party CDN or proxy layer required

---

## Features Implemented
- ✅ Full CRUD backed by MySQL via PDO
- ✅ 30+ seeded records on first load
- ✅ Image URL per player with placeholder fallback
- ✅ Search by name or team
- ✅ Filter by position
- ✅ Sort by name, team, position, PPG, or years (asc/desc)
- ✅ Configurable page size (5, 10, 20, 50)
- ✅ Page size saved in cookie and restored on reload
- ✅ Pagination works with all filters and sorting
- ✅ Delete confirmation modal
- ✅ Stats view: total records, page size, avg PPG, avg years, top scorer, position counts
- ✅ Responsive design (mobile + desktop)
- ✅ Graceful empty states and error messages
- ✅ HTTPS enabled via Let's Encrypt
- ✅ Environment variables for secrets
