# WintrCat's Game Report

Generate classifications for your Chess moves, for free. Available @ [chess.wintrcat.uk](https://chess.wintrcat.uk/)
<br><br>
Enter a game by its PGN or pick a game from your Chess.com / Lichess.org account and have it analysed so that you can see where your mistakes and brilliancies are.

## Running locally
### Prerequisites
- Node.js 20.x runtime or later.
- TypeScript package installed globally.

### Starting application
- Download the source code using `git clone` or download as ZIP.
- Open the root directory of the project in a terminal.
- Run `npm i` to install all of the necessary dependencies.
- Create a file called `.env` in the root directory of the project.
- Choose a port for the webserver by adding `PORT=<some port>` to the file.
- If you would like to use Google ReCAPTCHA, add your client secret as `RECAPTCHA_SECRET=<secret>` or disable it with `DEV=true`.
- Run `npm start` to compile TypeScript and start the webserver.

### NPM Scripts
- `npm start` - Compiles TypeScript and starts the webserver.
- `npm run build` - Compiles TypeScript.

## Donate
I pay to keep my app running and free-to-use for everyone. Any donations are greatly appreciated ❤️
<br><br>
<a href="https://ko-fi.com/N4N7SORCC"><img height="36" style="border:0px;height:36px;" src="https://storage.ko-fi.com/cdn/kofi1.png?v=3"/></a>
