# DEPLOYMENT.md — NBA Player Collection Manager
## Solo Project 3 · CPSC 3750 · Pascual Sebastian

---

## Live URL
**https://thepascualsebastian.com**

---

## Domain & Registrar
| Field | Value |
|---|---|
| Domain | thepascualsebastian.com |
| Registrar | Namecheap |
| Nameservers | ns1.infinityfree.com / ns2.infinityfree.com |

---

## Hosting Provider
**InfinityFree** (infinityfree.com) — Free tier  
Account domain: nbasp3manager.infinityfree.me  
Custom domain: thepascualsebastian.com (aliased to same htdocs directory)

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | PHP 8 |
| Database | MySQL (via PDO) |
| Fonts | Google Fonts (Barlow Condensed, Barlow) |

---

## Database
| Field | Value |
|---|---|
| Type | MySQL |
| Host | sql200.infinityfree.com |
| Database Name | if0_41221037_db_nbaplayerstats |
| Username | if0_41221037 |
| Hosted by | InfinityFree (same account) |

The database table (`players`) is created automatically on first request if it does not exist. Seed data (30 players) is also inserted automatically if the table is empty.

---

## File Structure
```
htdocs/
├── index.html          # Main SPA shell
├── css/
│   └── style.css       # All styles
├── js/
│   └── app.js          # Frontend logic (fetch, state, DOM)
├── images/
│   └── nbalogo.jpeg    # NBA logo
└── api/
    └── index.php       # PHP backend (all routes)
```

---

## How to Deploy / Update the App

### First Deployment
1. Log into InfinityFree control panel
2. Open **File Manager** or connect via **FTP** (FileZilla recommended)
   - FTP Host: provided in InfinityFree control panel
   - FTP User / Password: from control panel
3. Upload all files from `htdocs/` into the `/htdocs` directory on the server
4. Set the `DB_PASS` environment variable (see below) OR edit `api/index.php` directly during initial setup
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
Set `DB_PASS` as a server environment variable via InfinityFree's control panel or a `.env` file excluded from version control via `.gitignore`.

`.gitignore` includes:
```
.env
api/.env
```

---

## SSL / HTTPS
SSL is enabled via InfinityFree's free AutoSSL.  
The site is accessible at `https://thepascualsebastian.com`.

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
- ✅ HTTPS enabled
- ✅ Environment variables for secrets