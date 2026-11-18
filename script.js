
const game = new Chess();

// Stockfish Web Worker
const engine = new Worker(
    "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js"
);

let board;

function updateStatus() {
    const status = document.getElementById("status");

    if (game.in_checkmate()) {
        status.innerText = "Checkmate!";
    } else if (game.in_draw()) {
        status.innerText = "Game Draw!";
    } else if (game.in_check()) {
        status.innerText = "Check!";
    } else {
        status.innerText = game.turn() === "w"
            ? "Your move!"
            : "Stockfish is thinking...";
    }
}

function onDrop(source, target) {
    const move = game.move({
        from: source,
        to: target,
        promotion: "q"
    });

    if (move === null) return "snapback";

    board.position(game.fen());
    updateStatus();

    if (!game.game_over()) {
        setTimeout(stockfishMove, 250);
    }
}

function stockfishMove() {
    const depth = Number(
        document.getElementById("level").value
    );

    engine.postMessage("position fen " + game.fen());
    engine.postMessage("go depth " + depth);

    engine.onmessage = function(event) {
        const message = event.data;

        if (message.startsWith("bestmove")) {
            const bestMove = message.split(" ")[1];

            if (!bestMove || bestMove === "(none)") return;

            game.move({
                from: bestMove.substring(0, 2),
                to: bestMove.substring(2, 4),
                promotion: bestMove[4] || "q"
            });

            board.position(game.fen());
            updateStatus();
        }
    };
}

function newGame() {
    game.reset();
    board.start();
    updateStatus();
}

function undoMove() {
    game.undo();
    game.undo();
    board.position(game.fen());
    updateStatus();
}

board = Chessboard("board", {
    draggable: true,
    position: "start",
    onDrop: onDrop,
    pieceTheme:
        "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png"
});

updateStatus();
