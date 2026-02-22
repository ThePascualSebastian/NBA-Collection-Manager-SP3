# NBA Player Collection Manager — Solo Project 2

Course: CPSC 3750
Frontend (Netlify): https://tranquil-mochi-3fe0c3.netlify.app/

Backend (PHP / JSON): https://nba-collection-manager.infinityfreeapp.com/

Backend Language: PHP
Data Persistence: Server-side JSON files

## Project Overview

This project is a cloud-hosted NBA Player Collection Manager that demonstrates client/server interaction using a backend API and persistent server-side storage.

The application extends Solo Project 1 by moving all data ownership to the backend. The browser no longer stores application data. All create, read, update, and delete operations are performed through HTTP requests to the server.

## Hosting & Architecture

The frontend is hosted on Netlify and built with HTML, CSS, and vanilla JavaScript.

The backend is written in PHP and hosted on InfinityFree.

All application data is persisted in JSON files on the server.

The frontend communicates with the backend using HTTP requests (fetch).

This architecture ensures that data persists across page refreshes, sessions, and devices.

JSON Persistence Explanation

All NBA player data is stored in a server-side JSON file (players.json) on the backend.

## How Persistence Works

The JSON file contains an array of player objects.

The backend loads the file for each request that requires data access.

After create, update, or delete operations, the file is written back to disk.

The application initializes with a minimum of 30 player records.

Because the data lives on the server, it is not tied to a specific browser or user session.

# Core Features
CRUD Operations

* Create: Add new NBA players through a validated form

* Read: View players in a paginated list

* Update: Edit existing player records

* Delete: Remove players with a confirmation prompt

* All CRUD operations are handled exclusively through backend API routes.

## Paging

Fixed page size of 10 records per page

Next and Previous navigation controls

Current page indicator

Paging remains correct after add, edit, and delete operations

## Validation

Client-side validation provides immediate feedback

Server-side validation is enforced in PHP

Required fields are checked on the server

Numeric fields are validated for valid ranges

## Statistics View

The application includes a statistics view showing:

Total number of players in the dataset

Average points per game

Average years played in the NBA

Player count by position

All statistics are calculated from the full server-side dataset.

API Design

The frontend communicates with the backend using REST-style HTTP requests with JSON data.

Example API routes:

* GET     /api/index.php?action=players&page=1
* POST    /api/index.php?action=players
* PUT     /api/index.php?action=players&id={id}
* DELETE  /api/index.php?action=players&id={id}
* GET     /api/index.php?action=stats

## Known Deployment Limitation
Netlify to InfinityFree CORS Restriction

When the frontend is hosted on Netlify and the backend is hosted on InfinityFree, cross-origin requests may be blocked due to restrictions imposed by InfinityFree’s free hosting environment.

Observed behavior:

Backend functions correctly when accessed directly

Backend functions correctly when frontend and backend share the same InfinityFree domain

Netlify frontend may display:

Unable to connect to backend API
Error: Failed to fetch


## Current API URL:

https://nba-collection-manager.infinityfreeapp.com/api/index.php](https://nba-collection-manager.infinityfreeapp.com/


The backend implementation, JSON persistence, and full CRUD functionality are demonstrated in the screen recording below.

Screen Recording


## Technologies Used

Frontend: HTML5, CSS3, Vanilla JavaScript

Backend: PHP

Data Storage: JSON files

Hosting:

Netlify (frontend)

InfinityFree (backend)

## Submission Links

Live Frontend (Netlify)
https://tranquil-mochi-3fe0c3.netlify.app/

Backend (InfinityFree)
https://nba-collection-manager.infinityfreeapp.com/

Loom Video
https://www.loom.com/share/77856f3ad683421e830b898f72b9ceef

## Author

Pascual Sebastian
CPSC 3750 — Solo Project 2
