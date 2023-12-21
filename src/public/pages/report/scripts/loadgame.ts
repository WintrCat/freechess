const gamesPeriod = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
};

function padMonth(month: number) {

    let monthString = month.toString();
    return monthString.length > 1 ? monthString : "0" + monthString;

}

function generateGameListing(game: Game): HTMLDivElement {

    let listingContainer = document.createElement("div");
    listingContainer.style.display = "flex";
    listingContainer.style.justifyContent = "space-evenly";
    listingContainer.style.alignItems = "center";
    listingContainer.style.gap = "20px";
    listingContainer.setAttribute("data-pgn", game.pgn);

    let timeClass = document.createElement("b");
    timeClass.innerHTML = game.timeClass.replace(/^./, game.timeClass.charAt(0).toUpperCase());

    let players = document.createElement("span");
    players.innerHTML = `${game.white.username} (${game.white.rating}) vs. ${game.black.username} (${game.black.rating})`;

    listingContainer.appendChild(timeClass);
    listingContainer.appendChild(players);

    return listingContainer;

}

async function fetchChessComGames(username: string) {

    $("#games-list").html("");

    try {
        let gamesResponse = await fetch(
            `https://api.chess.com/pub/player/${username}/games/${gamesPeriod.year}/${padMonth(gamesPeriod.month)}`, 
            { method: "GET" }
        );

        let games: any[] = (await gamesResponse.json()).games;

        for (let game of games) {
            let gameListing = generateGameListing({
                white: {
                    username: game.white.username,
                    rating: game.white.rating.toString()
                },
                black: {
                    username: game.black.username,
                    rating: game.black.rating.toString()
                },
                timeClass: game["time_class"],
                pgn: game.pgn
            });

            $("#games-list").append(gameListing);
        }
    } catch (err) {
        $("#game-fetch-error-message").css("display", "inline");
        $("#game-fetch-error-message").html("Failed to fetch games.");
    }

}

$("#load-type-dropdown").on("input", () => {
    
    let selectedLoadType = $("#load-type-dropdown").val();

    let isPGN = selectedLoadType == "pgn";
    $("#pgn").css("display", isPGN ? "block" : "none");
    $("#chess-site-username").css("display", isPGN ? "none" : "block");
    $("#fetch-account-games-button").css("display", isPGN ? "none" : "block");

});

$("#fetch-account-games-button").on("click", () => {

    $("#game-select-menu-container").css("display", "flex");

    let selectedLoadType = $("#load-type-dropdown").val();
    let username = $("#chess-site-username").val()!.toString();

    if (selectedLoadType == "chesscom") {
        fetchChessComGames(username);
    }

});

$("#game-select-menu-container").load("/static/pages/report/gameselect.html");