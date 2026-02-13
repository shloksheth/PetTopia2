# PetTopia

A Phaser 3 virtual pet game. Choose a starter pet, care for it, and explore activities like shopping, bathing, sleeping, and playing.

## Features
- Starter pet flow and persistent save data
- Multiple screens: home, shop, wardrobe, vet, sleep, bathing, stats, play
- Inventory and purchase history
- Time-based systems via a dedicated time manager

## Getting Started
This project runs in the browser. Choose one of the options below.

### Requirements
- Visual Studio Code (Option 1)
- Git (Option 2)
- A modern web browser

### Run Locally
Option 1: VS Code + Live Server
1. Open VS Code.
2. Open the project folder.
3. Install the Live Server extension.
4. Open index.html and click "Go Live" to start a local server.
5. The game opens in your browser at a local host URL.

Option 2: Clone + Phaser
1. Clone the repository to your computer.
2. Download Phaser.
3. Open the project in Phaser.
4. Run the project from Phaser to launch it in a browser.

## Project Structure
- index.html: Entry point that loads Phaser and game scripts
- src/: Game scenes and logic
- assets/: Art, backgrounds, icons, and sprites
- lib/: Local libraries (if used)

## Notes
- Save data is stored in localStorage.
- Screen order and initialization are configured in src/main.js.

## Troubleshooting
- If the page is blank, confirm the server is running and the URL is correct.
- If assets do not load, ensure the server root is the project folder.

## License
Add a license if you plan to share or distribute this project.
