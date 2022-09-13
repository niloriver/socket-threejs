import express from "express";
import http from "http";
import { Server } from "socket.io";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import Gun from "gun";
import path from "path";

const app = express();
app.use(Gun.serve);

const server = http.createServer(app);

const allowedOrigins = [
  "http://192.168.5.185:1234",
  "http://192.168.5.185:8080",
  "http://192.168.5.185:7777",
  "https://pong.bolha.com.br",
  "https://pong-core.bolha.com.br",
  "http://localhost:8080",
  "http://localhost:1234",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // string[]
    methods: ["GET", "POST"],
    allowedHeaders: [],
    credentials: true,
  },
});

app.get("/test", (req, res, next) => {
  res.sendStatus(200);
});

app.use("/", express.static(path.join(path.resolve(), "/dist")));
app.get("/*", function (req, res) {
  const headers = req.query.headers;

  if (headers) {
    //use WebAssembly
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
  }

  var file = "index.html";
  res.sendFile(path.join(path.resolve(), "/dist", file));
});

// SOCKET / GAME FUNCTIONS

var gameStates = [
  { id: "iddle", active: true, duration: 120 },
  { id: "watching", active: false }, // APENAS MOBILE
  { id: "playing", active: false },
  { id: "scoring", active: false },
  { id: "gameover", active: false, duration: 60 },
  { id: "botwins", active: false },
  { id: "humanswins", active: false },
  { id: "merchan", active: false, duration: 30 },
  { id: "cooldown", active: false }, // COOLDOWN (MOBILE PRECISA DESSA TELA)
];

var humansTimeout;
var commandsPool = [];
var loggedPeers = {};
var decreaser;

var countInterval = null;
var countTotal = 120; // 120
var countElapsed = 0;
var randomID;
var roomStarting = false;

var masterID = null;
var masterCLIENT = null;

// GAME STATISTICS
var rootTotalPlayers = 10,
  rootTotalBotWins = 20,
  rootTotalHumansWins = 30;

// UTILS

const generateMatchID = () => {
  return uuidv4();
};

const getGameState = () => {
  const active = gameStates.find((item) => item.active);

  return active && active.id ? active.id : "cooldown";
};

const getGameStateParams = (id) => {
  const stateData = gameStates.find((item) => item.id === id);
  return stateData || {};
};

const updateGameState = (id, active, rest = {}) => {
  const newArr = _.map(gameStates, function (previous) {
    return previous.id === id
      ? { id: id, ...previous, active: active, ...rest }
      : { ...previous, active: false };
  });

  console.log("UPDATING_GAME_STATE", newArr);

  // gun.get("gamestate").put(newArr[id].id);

  gameStates = newArr;
};

const getAverage = () => {
  commandsPool = commandsPool.slice(
    commandsPool.length - 10,
    commandsPool.length
  );

  console.log("COMMANDS_POOL", commandsPool);

  const sum = commandsPool.reduce((a, b) => a + b, 0);
  const avg = sum / commandsPool.length || 0;

  return avg;
};

const countdown = async (nextRoomId, callback) => {
  countElapsed += 1;

  const toGo = countTotal - countElapsed;
  if (toGo > 0) {
    console.log("time-to-match", toGo);
    io.sockets.emit("time-to-match", toGo);
  }

  if (countElapsed >= countTotal) {
    countElapsed = 0;
    roomStarting = false;
    clearInterval(countInterval);
    callback();
  }
};

const newSession = (currentState) => {
  // JA TEM COUNTDOWN
  if (countElapsed > 0 && roomStarting) {
    if (countElapsed > 3) {
      // countElapsed -= 3;
      countTotal += 3;
    }
  } else {
    randomID = generateMatchID();
    roomStarting = true;

    if (currentState === "iddle") {
      console.log("A MAQUINA CRIOU UMA NOVA SESSAO");

      countInterval = setInterval(() => {
        countdown(randomID, () => {
          console.log("COUNTDOWN_DONE");

          updateGameState("playing", true);

          io.sockets.emit("gamestate", {
            gamestate: getGameState(),
            params: getGameStateParams(getGameState()),
          });
        });
      }, 1000);
    }
  }

  io.sockets.emit("new-match", {
    roomId: randomID,
  });
};

const firstPlayerToJoin = (userId, currentState) => {
  // JA TEM COUNTDOWN
  if (countElapsed > 0 && roomStarting) {
    if (countElapsed > 3) {
      // countElapsed -= 3;
      countTotal += 3;
    }
  } else {
    randomID = generateMatchID();
    roomStarting = true;

    if (currentState === "iddle") {
      console.log("O GAME ESTAVA EM IDDLE");
      console.log("PRIMEIRO PLAYER INICIOU TIMER GERAL");

      countInterval = setInterval(() => {
        countdown(randomID, () => {
          console.log("COUNTDOWN_DONE");

          updateGameState("playing", true);

          io.sockets.emit("gamestate", {
            gamestate: getGameState(),
            params: getGameStateParams(getGameState()),
          });
        });
      }, 1000);
    } else {
      console.log("O GAME JA ESTA ROLANDO");
      console.log("PLAYER AGUARDA PLAYING PARA ENTRAR");

      io.to(userId).emit("gamestate", {
        gamestate: getGameState(),
        params: getGameStateParams(getGameState()),
      });
    }
  }

  io.sockets.emit("new-match", {
    roomId: randomID,
  });
};

const setMasterID = (newMaster, socket) => {
  masterID = newMaster;
  masterCLIENT = socket;
};

io.sockets.on("connection", (socket) => {
  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on("disconnect", function () {
    // socket.disconnect(true); <- that seems useless
    console.info("disconnected user (id=" + socket.id + ").");

    loggedPeers[socket.id] = undefined;
    delete loggedPeers[socket.id];

    console.log("CURRENT_LIST", loggedPeers);

    socket.broadcast.emit("playerout", {
      loggedPeers: loggedPeers,
    });
  });

  console.log("SOCKET_CONNECTED", socket.id);
  console.log(
    "USERS_CONNECTED___" + socket.client.conn.server.clientsCount + " \n"
  );

  socket.join("all-peers");

  // AUTH (joinCrowd)

  socket.on("debug-safari", (data) => {
    console.log("DEBUG_SAFARI", data);
  });

  socket.on("player-hello", (data) => {
    const userId = data.userId;
    const playerName = data.playerName;
    loggedPeers[userId] = {
      userId,
      playerName,
    };

    // RETORNA COM GAMESTATE ATUAL
    console.log("AUTHING_USER", loggedPeers[userId]);

    const currentState = getGameState();

    // SE ESTIVER EM IDDLE
    // SE NAO TIVER UMA PARTIDA ROLANDO e NAO TIVER UM COUNTDOWN ROLANDO.
    // INICIA COUNTDOWN E COLOCA EM WAITING
    if (currentState === "iddle") {
      firstPlayerToJoin(userId, currentState);
    }

    // UPDATE WAITING LIST
    let waitingList = [];

    for (let [id, socket] of io.of("/").sockets) {
      if (loggedPeers[id] && loggedPeers[id].playerName) {
        console.log("PLAYER_JOINS", loggedPeers[id].playerName);
        waitingList.push(loggedPeers[id].playerName);
      }
    }
    console.log("WAITING_LIST", waitingList);

    gun.get("waitinglist").put({ waiters: JSON.stringify(waitingList) });

    io.to(userId).emit("welcome", {
      gamestate: currentState, // o primeiro é sempre waiting
      user: loggedPeers[userId],
      params: getGameStateParams(currentState),
    });

    socket.broadcast.emit("newplayer", {
      player: {
        userId,
        playerName,
      },
      loggedPeers: loggedPeers,
    });
  });

  socket.on("start-test", () => {
    io.emit("start-controller");
  });

  // STARTING MACHINE

  socket.on("pong-starting", () => {
    setMasterID(socket.id, socket);

    const timestamp = new Date().getTime();

    gun.get("stats").put({ masterID: socket.id, pongStarted: timestamp });

    console.log("PONG_STARTING", timestamp);
    console.log("MASTER_ID_INSTANCE", socket.id);

    gun
      .get("stats")
      .map()
      .on((rs, name) => {
        // console.log("ALL_GAME_STATES[" + name + "]", rs);
      });

    io.to(socket.id).emit("deliver-state", {
      gamestate: getGameState(),
      params: getGameStateParams(getGameState()),
      totalplayers: rootTotalPlayers,
      totalbotwins: rootTotalBotWins,
      totalhumanwins: rootTotalHumansWins,
      loggedPeers: loggedPeers,
    });
  });

  // RESET FUNCTIONS

  socket.on("pong-reset-all", () => {
    console.log("RESETING ALL VARS");
    countElapsed = 0;
  });

  socket.on("pong-set-cooldown", (val) => {
    countTotal = val;
    countElapsed = 0;
  });

  socket.on("pong-change-state", (payload) => {
    // setMasterID(socket.id, socket);

    console.log("PONG-SENDING-STATE", new Date().getTime());
    console.log("MASTER_ID_INSTANCE", payload);

    if (payload && payload.gameState) {
      updateGameState(payload.gameState, true);
    }

    // SE O STATE FOR IGUAL IDDLE
    // E TIVER PELO MENOS UM USUARIO ESPERANDO
    // E NAO TIVER NENHUM TIMER ROLANDO, INICIA

    const currentGameState = getGameState();

    if (currentGameState === "iddle") {
      newSession(currentGameState);
    }

    // DEVOLVE GAME STATE PARA O MASTER
    io.to(socket.id).emit("gamestate", {
      gamestate: currentGameState,
      params: getGameStateParams(currentGameState),
    });

    // BROADCAST PARA OS PLAYERS
    if (
      currentGameState === "iddle" ||
      currentGameState === "scoring" ||
      currentGameState === "playing"
    ) {
      socket.broadcast.emit("gamestate", {
        gamestate: currentGameState,
        params: getGameStateParams(currentGameState),
      });
    }
  });

  // TODO MUNDO QUE ESPEROU O TIMER,
  // PODE ENTRAR NA NOVA SALA

  // JOIN PLAYING ROOM
  // socket.on("pong-new-match-with-room", async (payload) => {
  //   if (!roomStarting) {
  //     const randomID = payload.matchId;
  //     // RANDOM SESSION ID (ROOM)
  //     // BOT É O PRIMEIRO A ENTRAR NA SALA
  //     socket.join(randomID);

  //     roomStarting = true;

  //     updateGameState("waiting", true, {
  //       roomId: randomID,
  //     });

  //     // ADD QUEM TAVA ESPERANDO NA SALA
  //     let waitingList = [];

  //     for (let [id, socket] of io.of("/").sockets) {
  //       if (loggedPeers[id] && loggedPeers[id].playerName) {
  //         console.log("PLAYER_JOINS", loggedPeers[id].playerName);
  //         waitingList.push(loggedPeers[id].playerName);
  //       }
  //       socket.join(randomID);
  //     }

  //     console.log("WAITING-ROOMES-NOW", waitingList);

  //     // INFORMA NOVA PARTIDA PARA TODOS
  //     socket.broadcast.emit("new-match", {
  //       roomId: randomID,
  //     });

  //     countInterval = setInterval(() => {
  //       countdown(socket, randomID, (skt) => {
  //         const roomId = randomID;

  //         console.log("COUNTDOWN_DONE");
  //         console.log("COUNTDOWN_DONE_NEXTROOM", roomId);

  //         updateGameState("playing", true, {
  //           roomId: randomID,
  //         });

  //         io.to(roomId).emit("gamestate", {
  //           gamestate: getGameState(),
  //           params: getGameStateParams(getGameState()),
  //         });
  //       });
  //     }, 1000);
  //   } else {
  //     console.log("ALREADY_STARTING");
  //   }
  // });

  socket.on("pong-gameover", (results) => {
    // TIRA TODO MUNDO DA SALA
    // io.of("/")
    //   .in(roomId)
    //   .clients((error, socketIds) => {
    //     if (error) throw error;
    //     socketIds.forEach((socketId) =>
    //       io.sockets.sockets[socketId].leave(roomId)
    //     );
    //   });

    console.log("PONG+GAME+OVER");
    // MUDA GAME STATE PARA GAMEOVER
    updateGameState("gameover", true, results);
    // BROADCAST GAME STATE
    io.sockets.emit("gameover", {
      gamestate: "gameover-mobile",
      params: getGameStateParams(getGameState()),
    });
  });

  // RECEBEU ROTACAO

  socket.on("player-orientation", function (e) {
    commandsPool.push(e);
    console.log("ORIENTATION", e);
    clearTimeout(humansTimeout);
    humansTimeout = setTimeout(() => {
      console.log("ORIENTATION_SENT", e);

      const avg = getAverage();

      console.log("AVERAGE", avg);

      io.emit("racket-humans-command", avg);
    }, 10);
  });

  // RECEBEU TOQUE

  socket.on("player-touch-force", function (e) {
    commandsPool.push(e);
    console.log("TOUCH", e);
    clearTimeout(humansTimeout);
    humansTimeout = setTimeout(() => {
      console.log("TOUCH_SENT", e);

      const avg = getAverage();

      console.log("AVERAGE", avg);

      var countZeros = 5;
      var zeroSents = 0;

      const fakeZeros = () => {
        clearTimeout(decreaser);

        zeroSents += 1;
        commandsPool.push(0);

        const zeroAvg = getAverage();

        console.log("ZERO_AVG", zeroAvg);
        io.emit("touch-humans-command", zeroAvg);

        if (zeroSents < countZeros) {
          decreaser = setTimeout(fakeZeros, 50);
        }
      };

      decreaser = setTimeout(fakeZeros, 50);

      io.emit("touch-humans-command", avg);
    }, 10);
  });
});

server.listen(7777);

var gun = Gun({ web: server });

gun.get("bounces").on((node) => {
  // Is called whenever text is updated
  console.log("Receiving Bounce", node);
  // console.log();
});

gun
  .get("bounces")
  .map()
  .on((rs) => {
    console.log("ALL_BOUNCES", rs);
  });
