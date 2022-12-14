import Stories from "react-insta-stories";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import ReactNipple from "sb-react-nipple";
import ReactPlayer from "react-player/youtube";

// optional: include the stylesheet somewhere in your app
import "react-nipple/lib/styles.css";

import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/avatars-identicon-sprites";

import logobolha from "./bolha.png";
import footerMobiles from "./footer_mobiles.svg";

import btcontinuar from "./btcontinuar.svg";
import anuncio from "./anuncio.png";
import btsaibamais from "./btsaibamais.svg";
import arrowLeft from "./arrow-left.svg";
import arrowRight from "./arrow-right.svg";
import btOff from "./bt-off.png";
import btOn from "./bt-on.png";

import StoryZero from "./stories/image-0.png";
import StoryOne from "./stories/image-1.png";
import StoryTwo from "./stories/image-2.png";
import StoryThree from "./stories/image-3.png";
import StoryFour from "./stories/image-4.png";
import StoryFive from "./stories/image-5.png";
import StorySix from "./stories/image-6.png";
import StorySeven from "./stories/image-7.png";
// import VideoTransform from "./stories"
import LogoVale from "./stories/vale-logo.jpeg";

window.hasDebug = false;

window.socket = null;
window.socketStarted = false;
window.commandsPool = [];
window.playerHuman = null;
window.modoRaquete = false;
window.gameState = "starting";
window.human = false;

window.oncontextmenu = function (event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
};

function iOS() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

function absorbEvent_(event) {
  var e = event || window.event;
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
  e.cancelBubble = true;
  e.returnValue = false;
  return false;
}

function preventLongPressMenu(node) {
  node.ontouchstart = absorbEvent_;
  node.ontouchmove = absorbEvent_;
  node.ontouchend = absorbEvent_;
  node.ontouchcancel = absorbEvent_;
}

window.md = new MobileDetect(window.navigator.userAgent);

var iosAccept = false;

const localHostName = "http://localhost:7777";

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

const getAverage = () => {
  window.commandsPool = window.commandsPool.slice(
    window.commandsPool.length - 10,
    window.commandsPool.length
  );

  console.log("COMMANDS_POOL", window.commandsPool);

  // window.socket.emit("debug-safari", {
  //   pool: window.commandsPool,
  // });

  const sum = window.commandsPool.reduce((a, b) => a + b, 0);
  const avg = sum / window.commandsPool.length || 0;

  return avg;
};

const isMobile = () => {
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  )
    return true;

  return false;
};

const isIOS = () => {
  return window.md.is("iPhone");
};

export function App() {
  const [human, setHuman] = useState(null);
  const [gameRoom, setGameRoom] = useState(null);
  const [gameState, setGameStateInteral] = useState("waiting");
  const [timeToMatch, setTimeToMatch] = useState(0);

  const setGameState = (newState) => {
    setGameStateInteral(newState);
    window.gameState = newState;
  };

  const [matchResults, setMatchResults] = useState({
    bot: 0,
    humans: 0,
    winner: "humans",
  });

  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);

  const [humanForceLeft, setHumanForceLeft] = useState(0);
  const [humanForceRight, setHumanForceRight] = useState(0);

  const [modoRaquete, setRaquete] = useState(false);
  const [optOut, setOutOut] = useState(false);

  const optOutMotion = () => {
    setOutOut(true);
  };

  const requestPermissionIOS = () => {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      // (optional) Do something before API request prompt.
      DeviceMotionEvent.requestPermission()
        .then((response) => {
          // (optional) Do something after API prompt dismissed.
          if (response == "granted") {
            iosAccept = true;
            addMotionSensor();
            const next = !modoRaquete;
            setRaquete(next);
            window.modoRaquete = next;
          } else {
            setRaquete(false);
            optOutMotion();
          }
        })
        .catch(console.error);
    } else {
      // alert( "DeviceMotionEvent is not defined" );
      setRaquete(false);
      optOutMotion();
    }
  };

  useEffect(() => {
    if (iOS()) {
      requestPermissionIOS();
    }
    connectSocket();
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      // LEFT
      if (humanForceLeft > 0) {
        // setRightPressed(false);
        setLeftPressed(true);
      } else {
        setLeftPressed(false);
      }
      // RIGHT
      if (humanForceRight > 0) {
        // setLeftPressed(false);
        setRightPressed(true);
      } else {
        setRightPressed(false);
      }
    }
  }, [humanForceLeft, humanForceRight]);

  const connectSocket = () => {
    const noSleep = new NoSleep();
    noSleep.disable();
    window.noSleep = noSleep;

    const full = location.protocol + "//" + location.host;
    if (params.local) {
      window.socket = io(localHostName);
    } else {
      window.socket = io(full);
    }

    // window.socket = io("http://localhost:7777");

    // AUTH PROCESS
    window.socket.on("welcome", (payload) => {
      window.socketStarted = true;
      console.log("PLAYERJOINED", payload);

      createHuman(payload.user);

      if (payload.gamestate === "playing") {
        setGameState("playing");

        setTimeout(() => {
          preventLongPressMenu(document.getElementById("arrowLeftID"));

          preventLongPressMenu(document.getElementById("arrowRightID"));
        }, 1000);
      }
      if (payload.gamestate === "scoring") {
        if (window.human) {
          setGameState("playing");
        }
      }

      if (payload.gamestate === "iddle") {
        setGameState("waiting");
      }
    });

    window.socket.on("gameover", (payload) => {
      window.socket.emit("debug-safari", {
        type: "gameover-mobile",
        payload,
      });
      window.socketStarted = false;
      if (window.human) {
        setGameState("gameover-mobile");
        setMatchResults(payload.params);
      }
    });

    // NEW GAME STATE
    window.socket.on("gamestate", (payload) => {
      console.log("NEW_GAME_STATE", payload);

      if (payload.gamestate === "playing") {
        setGameState("playing");
      }
      if (payload.gamestate === "scoring") {
        if (window.human) {
          setGameState("playing");
        }
      }

      if (payload.gamestate === "gameover-mobile") {
        if (window.human) {
          setGameState("gameover-mobile");
          setMatchResults(payload.params);
        }
      }

      if (gameState !== "merchan") {
        if (payload.gamestate === "iddle") {
          setGameState("waiting");
        }
      }
    });

    // NEW MATCH INFO
    window.socket.on("new-match", (payload) => {
      console.log("NEW_MATCH_ROOM_AVAILABLE", payload);
      setGameRoom(payload.roomId);
    });

    // TIME TO MATCH INFO
    window.socket.on("time-to-match", (payload) => {
      console.log("TIME_TO_MATCH_RECEIVED", payload);
      setTimeToMatch(payload);
    });

    if (isMobile()) {
      window.addEventListener("resize", (e) => {
        var myElement = document.getElementById("data-player-name");
        if (myElement === document.activeElement) {
          //myElement Has Focus
          console.log("KEYBOARD_OPEN");

          myElement.addEventListener("keyup", function (event) {
            console.log("KEY_EVENT", event);

            if (event.key === "Enter") {
              event.preventDefault();
              document.getElementById("data-player-submit").click();
            }
          });
        } else {
          console.log("KEYBOARD_CLOSE");
        }
      });

      addMotionSensor();

      // handleOrientation()
    }
  };

  const addMotionSensor = () => {
    if (iosAccept) {
      window.addEventListener("devicemotion", handleOrientation, true);
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
  };

  const createHuman = (humanData) => {
    const playerName = humanData.playerName;
    const svg = createAvatar(style, {
      seed: playerName,
      // ... and other options
    });

    const image = svg;
    const buff = new Buffer(image);
    const base64data = buff.toString("base64");

    const h = {
      playerName,
      avatarImg: base64data,
    };
    setHuman(h);
    window.human = true;

    console.log("SETTING_HUMAN", playerName);
  };

  const joinCrowd = (playerName) => {
    // AUTH
    const userData = { playerName: playerName, userId: window.socket.id };
    window.socket.emit("player-hello", userData);

    console.log("CLICK_START");

    // TESTES

    // window.socket.emit("start-test");
    window.socket.on("start-controller", () => {
      window.socketStarted = true;
      console.log("CONTROLLER_STARTERD");
    });
    window.noSleep.enable();
  };

  const toggleRaquete = () => {
    if (isIOS()) {
      if (iosAccept) {
        const next = !modoRaquete;
        setRaquete(next);
        window.modoRaquete = next;
      } else {
        requestPermissionIOS();
      }
    } else {
      const next = !modoRaquete;
      setRaquete(next);
      window.modoRaquete = next;
    }

    setHumanForceLeft(0);
    setHumanForceRight(0);
  };

  const decreaseForces = () => {
    clearTimeout(window.decreasetTimeout);
    window.decreasetTimeout = setTimeout(() => {
      setHumanForceLeft(0);
      setHumanForceRight(0);

      console.log("DECREASING_FORCE");
    }, 100);
    // const reduceLeft = humanForceLeft - humanForceLeft / 3;
    // if (humanForceLeft > 0) {
    //   setHumanForceLeft(reduceLeft);
    // }
    // const reduceRight = humanForceRight - humanForceRight / 3;
    // if (humanForceRight > 0) {
    //   setHumanForceRight(reduceRight);
    // }
    // // ZERO
    // if (reduceLeft < 0) {
    //   setHumanForceRight(0);
    // }
    // if (reduceRight < 0) {
    //   setHumanForceLeft(0);
    // }
    // if (reduceLeft > 0 || reduceRight > 0) {
    //   console.log("DECREASING_SPEED_LEFT[" + humanForceLeft + "]");
    //   console.log("DECREASING_SPEED_RIGHT[" + humanForceRight + "]");
    //   setTimeout(() => {
    //     decreaseForces();
    //   }, 300);
    // }
  };

  const sendTouchForce = (val) => {
    clearTimeout(window.playerHuman);
    window.playerHuman = setTimeout(() => {
      console.log("LITERAL_SENT", val);

      window.socket.emit("player-touch-force", val);

      // if (window.hasDebug && document.getElementById("footer-debug")) {
      //   document.getElementById(
      //     "footer-debug"
      //   ).innerHTML = `forceLeft = ${humanForceLeft} <br> forceRight = ${humanForceRight}`;
      // }
    }, 10);
  };

  const sendAverage = (isTouch) => {
    clearTimeout(window.playerHuman);
    window.playerHuman = setTimeout(() => {
      const avg = getAverage();

      console.log("AVERAGE_SENT", avg);

      if (window.gameState === "playing") {
        window.socket.emit("player-orientation", avg);
      }

      // if (window.hasDebug && document.getElementById("footer-debug")) {
      //   document.getElementById(
      //     "footer-debug"
      //   ).innerHTML = `forceLeft = ${humanForceLeft} <br> forceRight = ${humanForceRight}`;
      // }
    }, 10);
  };

  const handleOrientation = (e) => {
    console.log("ORIENTATION_EVENT", e);

    // if (isIOS() && window.hasDebug) {
    //   window.socket.emit("debug-safari", e);
    // }

    // if (window.hasDebug && document.getElementById("footer-debug")) {
    // document.getElementById("footer-debug").innerHTML = `E= ${JSON.stringify(
    //   window.commandsPool
    // )} left = ${humanForceLeft} <br>l0 = ${
    //   humanForceLeft[0] || "Z"
    // }<br> l1 = ${humanForceLeft[1] || "X"}`;
    // }

    if (window.modoRaquete && window.socketStarted) {
      // socket.emit("orientation", e.gamma);
      var val = e.gamma;

      if (val) {
        window.commandsPool.push(val);
      }

      if (val > 0) {
        setHumanForceRight(val);
        setHumanForceLeft(0);
      } else {
        setHumanForceLeft(Math.abs(val));
        setHumanForceRight(0);
      }

      // if (isIOS()) {
      //   document.getElementById("footer-debug").innerHTML = `${val}`;
      // }

      // const direcionalRight = document.getElementById("direcional-right");
      // const direcionalLeft = document.getElementById("direcional-left");
      // if (direcionalRight) {
      //   if (humanForceRight > 0) {
      //     direcionalLeft.style.opacity = 0.3;
      //   } else {
      //     let leftCalc = Math.abs(humanForceLeft / 100);
      //     direcionalLeft.style.opacity = leftCalc > 0.3 ? leftCalc : 0.3;
      //   }

      //   if (humanForceLeft > 0) {
      //     direcionalRight.style.opacity = 0.3;
      //   } else {
      //     let rightCalc = Math.abs(humanForceRight / 100);
      //     direcionalRight.style.opacity = rightCalc > 0.3 ? rightCalc : 0.3;
      //   }
      // }

      sendAverage();

      console.log("GAMA_MOBILE", e.gamma);
    } else {
      // console.log("NOT_SENDING_COMMANDO", e);
    }
  };

  const handleTouchEnd = (e) => {
    setHumanForceRight(0);
    setHumanForceLeft(0);
  };

  const handleTouchDrag = (direction, distance) => {
    let touchSent = null;

    if (direction === "center") {
      setHumanForceRight(0);
      setHumanForceLeft(0);
    }

    if (direction === "right") {
      setHumanForceRight(distance);
      setHumanForceLeft(0);
      touchSent = distance;
    }
    if (direction === "left") {
      setHumanForceLeft(distance);
      setHumanForceRight(0);
      touchSent = 0 - distance;
    }

    if (touchSent) {
      sendTouchForce(touchSent);
      // decreaseForces();
    } else {
      setHumanForceLeft(0);
      setHumanForceRight(0);
      sendTouchForce(0);
    }
  };

  const RenderVolume = () => {
    let opacity_l1 = 0;
    let opacity_l2 = 0;
    let opacity_l3 = 0;

    let opacity_center = 0;

    let opacity_r1 = 0;
    let opacity_r2 = 0;
    let opacity_r3 = 0;

    if (!humanForceRight > 0 && !humanForceLeft) {
      opacity_center = 1;
    }

    if (humanForceRight > 0) {
      opacity_r1 = humanForceRight;

      if (humanForceRight > 23) {
        opacity_r2 = humanForceRight;
      }

      if (humanForceRight > 46) {
        opacity_r3 = humanForceRight;
      }
    }

    if (humanForceLeft > 0) {
      opacity_l1 = humanForceLeft;

      if (humanForceLeft > 23) {
        opacity_l2 = humanForceLeft;
      }

      if (humanForceLeft > 46) {
        opacity_l3 = humanForceLeft;
      }
    }

    return (
      <div
        className={
          "w-full flex flex-wrap justify-between px-8 bar-container my-10"
        }
      >
        <div
          id={"volume-l3"}
          className={"w-8 h-8 box-volume p-1 flex items-center justify-center"}
        >
          <div
            style={{ opacity: opacity_l3 }}
            className="w-full h-full bg-gray-400"
          ></div>
        </div>
        <div
          id={"volume-l2"}
          className={"w-8 h-8 box-volume p-1 flex items-center justify-center"}
        >
          <div
            style={{ opacity: opacity_l2 }}
            className="w-full h-full bg-gray-400"
          ></div>
        </div>
        <div
          id={"volume-l1"}
          className={"w-8 h-8 box-volume p-1 flex items-center justify-center"}
        >
          <div
            style={{ opacity: opacity_l1 }}
            className="w-full h-full bg-gray-400"
          ></div>
        </div>
        <div
          id={"volume-center"}
          className={"w-8 h-8 box-volume p-1 flex items-center justify-center"}
        >
          <div
            style={{ opacity: opacity_center }}
            className="w-full h-full bg-gray-200"
          ></div>
        </div>
        <div
          id={"volume-r1"}
          className={"w-8 h-8 box-volume p-1 flex items-center justify-center"}
        >
          <div
            style={{ opacity: opacity_r1 }}
            className="w-full h-full bg-gray-400"
          ></div>
        </div>
        <div
          id={"volume-r2"}
          className={"w-8 h-8 box-volume p-1 flex items-center justify-center"}
        >
          <div
            style={{ opacity: opacity_r2 }}
            className="w-full h-full bg-gray-400"
          ></div>
        </div>
        <div
          id={"volume-r3"}
          className={"w-8 h-8 box-volume p-1 flex items-center justify-center"}
        >
          <div
            style={{ opacity: opacity_r3 }}
            className="w-full h-full bg-gray-400"
          ></div>
        </div>
      </div>
    );
  };

  const stories = [
    StoryZero,
    StoryOne,
    StoryTwo,
    StoryThree,
    StoryFour,
    StoryFive,
    StorySix,
    StorySeven,
    {
      content: (props) => (
        <div style={{ background: "black" }}>
          <ReactPlayer
            playing
            width={window.innerWidth}
            height={window.innerHeight}
            url="https://www.youtube.com/watch?v=IEflR5QD-0I"
          />
        </div>
      ),
    },
  ];

  // const stories = [
  //   {
  //     url: anuncio,
  //     header: {
  //       heading: "Vale",
  //       profileImage: LogoVale,
  //     },
  //   },
  //   {
  //     url: StoryZero,
  //     // seeMore: <div className="px-8 h-10">Saiba mais</div>,
  //     header: {
  //       heading: "Vale",
  //       // subheading: "Teste 2",
  //       profileImage: LogoVale,
  //     },
  //   },
  //   {
  //     url: StoryTwo,
  //     // seeMore: <div className="px-8 h-10">Saiba mais</div>,
  //     header: {
  //       heading: "Vale",
  //       // subheading: "Teste 2",
  //       profileImage: LogoVale,
  //     },
  //   },
  //   {
  //     url: StoryThree,
  //     // seeMore: <div className="px-8 h-10">Saiba mais</div>,
  //     header: {
  //       heading: "Vale",
  //       // subheading: "Teste 2",
  //       profileImage: LogoVale,
  //     },
  //   },
  //   {
  //     url: StoryFour,
  //     // seeMore: <div className="px-8 h-10">Saiba mais</div>,
  //     header: {
  //       heading: "Vale",
  //       // subheading: "Teste 2",
  //       profileImage: LogoVale,
  //     },
  //   },
  //   {
  //     url: StoryFive,
  //     // seeMore: <div className="px-8 h-10">Saiba mais</div>,
  //     header: {
  //       heading: "Vale",
  //       // subheading: "Teste 2",
  //       profileImage: LogoVale,
  //     },
  //   },
  //   {
  //     url: StorySix,
  //     // seeMore: <div className="px-8 h-10">Saiba mais</div>,
  //     header: {
  //       heading: "Vale",
  //       // subheading: "Teste 2",
  //       profileImage: LogoVale,
  //     },
  //   },
  //   {
  //     url: StorySeven,
  //     // seeMore: <div className="px-8 h-10">Saiba mais</div>,
  //     header: {
  //       heading: "Vale",
  //       // subheading: "Teste 2",
  //       profileImage: LogoVale,
  //     },
  //   },

  //   {
  //     url: "https://pong-core.bolha.com.br/transform.mp4",
  //     type: "video",
  //     // seeMore: <div className="px-8 h-10">Saiba mais</div>,
  //   },
  // ];

  return (
    <div className="bg-stage w-full h-full fixed flex items-center justify-center">
      {/* {JSON.stringify(gameState)} */}
      {/*{JSON.stringify(human)} */}

      {gameState === "waiting" && !human && (
        <div
          id={"screen-waiting"}
          className={
            "bg-screen-waiting w-full h-full flex flex-col justify-start"
          }
        >
          <h1
            className={
              "title text-black w-full text-center pt-20 animate__animated animate__bounce"
            }
          >
            PONG AGAINST <br />
            THE MACHINE
          </h1>

          <div className={"w-full px-10 mb-48"}>
            <p
              id={"data-form-message"}
              className={"basic-messages w-full text-center mb-2"}
            >
              Qual seu player name?
            </p>

            <div className={"w-full flex items-center justify-center"}>
              <div
                className={"input-box px-4 flex items-center justify-center"}
              >
                <input
                  id={"data-player-name"}
                  type={"name"}
                  name={"nickname"}
                  autoFocus
                  className={"w-full input-outline"}
                />
              </div>
            </div>

            <div
              id={"bt-cta-basic"}
              onClick={() => {
                joinCrowd(document.getElementById("data-player-name").value);
              }}
              className={"w-full flex items-center justify-center mt-16"}
            >
              <img
                className={
                  "w-full md:w-auto max-w-full h-auto scale-down px-12"
                }
                id="data-player-submit"
                src={btcontinuar}
              />
            </div>
          </div>

          <div
            className={
              "w-full h-auto bg-white flex items-center justify-center absolute bottom-0"
            }
          >
            <img className={"w-auto h-auto"} src={footerMobiles} />
          </div>
        </div>
      )}
      {/* USER SETTINGS */}

      {(gameState === "waiting" || gameState === "iddle") &&
        timeToMatch > 0 &&
        human && (
          <div
            id={"screen-waiting"}
            className={
              "bg-screen-waiting w-full h-full flex flex-col justify-between"
            }
          >
            <div className="mb-24 w-full pt-16">
              <div className="w-full mb-6">
                <div className="w-full flex justify-center">
                  <div className="bg-black w-24 h-24 mb-6">
                    <img
                      className="border-white border-4"
                      src={`data:image/svg+xml;base64,${human.avatarImg}`}
                    />
                  </div>
                </div>

                <div className={"w-full px-10 pb-10"}>
                  <p
                    id={"data-form-message"}
                    className={
                      "basic-messages w-full text-center mb-2 typewriter"
                    }
                  >
                    {human.playerName}, <br />
                    se liga que o jogo j?? vai come??ar...
                  </p>
                </div>
              </div>

              <div className="w-full px-10 flex flex-col">
                <div className="w-full text-center text-countdown">
                  {timeToMatch}
                </div>

                <p className="text-center text-countdown-base">segundos</p>
              </div>
            </div>
            <div
              className={
                "w-full h-auto bg-white flex items-center justify-center absolute bottom-0"
              }
            >
              <img className={"w-auto h-auto"} src={footerMobiles} />
            </div>
          </div>
        )}

      {(gameState === "waiting" || gameState === "iddle") &&
        timeToMatch === 0 &&
        human && (
          <div
            id={"screen-waiting"}
            className={
              "bg-screen-waiting w-full h-full flex flex-col justify-between"
            }
          >
            <div className="mb-24 w-full pt-16">
              <div className="w-full mb-6">
                <div className="w-full flex justify-center">
                  <div className="bg-black w-24 h-24 mb-6">
                    <img
                      className="border-white border-4"
                      src={`data:image/svg+xml;base64,${human.avatarImg}`}
                    />
                  </div>
                </div>

                <div className={"w-full px-10 pb-10"}>
                  <p
                    id={"data-form-message"}
                    className={
                      "basic-messages w-full text-center mb-2 typewriter"
                    }
                  >
                    {human.playerName}, <br />
                    t?? tudo certo!
                  </p>
                  <p
                    id={"data-form-message"}
                    className={
                      "basic-messages w-full text-center mt-8 mb-2 typewriter"
                    }
                  >
                    Estamos calibrando o PONG para a pr??xima partida. Espera s??
                    um pouco mais, ?? coisa r??pida.
                  </p>
                </div>
              </div>
            </div>
            <div
              className={
                "w-full flex items-center justify-center pb-12 absolute bottom-0"
              }
            >
              <img className={"w-12 h-12"} src={logobolha} />
            </div>
          </div>
        )}

      {gameState === "gameover-mobile" && (
        <div
          id={"screen-waiting"}
          className={`${
            matchResults.winner === "bot"
              ? "bg-screen-botwins"
              : "bg-screen-humanswins"
          }  w-full h-full flex flex-col justify-start`}
        >
          <div className="w-full pt-16">
            <div className="w-full">
              <div className="w-full flex justify-center items-center flex-col mb-24">
                <div className="w-full mt-12 basic-messages w-full text-center mb-2">
                  <p className="basic-messages">Fim de jogo</p>
                </div>
                <div className="w-full">
                  <p className="text-center text-countdown-base text-2xl">
                    BOT {matchResults.bot || "0"}
                  </p>
                  <p className="text-center text-countdown-base text-2xl">
                    NOS {matchResults.humans || "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={"w-full px-10 pb-24 flex flex-col"}>
            <p
              id={"data-form-message"}
              className={
                "basic-messages w-full text-center mt-8 mb-6 typewriter"
              }
            >
              A Vale tem um <br /> recado especial <br />
              para voc??
            </p>

            <div
              onClick={() => {
                // alert("merchan");
                setGameState("merchan");
              }}
              className={`controller-button w-auto flex items-center justify-center relative`}
            >
              <img
                className={
                  "w-full md:w-auto max-w-full h-auto scale-down px-12 absolute z-30"
                }
                src={btsaibamais}
              />
            </div>
          </div>
          <div
            className={
              "w-full flex items-center justify-center pb-12 absolute bottom-0"
            }
          >
            <img className={"w-12 h-12"} src={logobolha} />
          </div>
        </div>
      )}
      {gameState === "merchan" && (
        <div className="w-full h-full">
          {/* <img
            onClick={() => {
              window.open(
                "https://www.vale.com/brasil/pt/Paginas/default.aspx"
              );
            }}
            src={anuncio}
            className="w-full h-full object-contain"
          /> */}
          {/* 
          <Stories
            stories={stories}
            defaultInterval={1500}
            width={window.innerWidth}
            height={window.innerHeight}
          /> */}

          <Stories
            stories={stories}
            defaultInterval={1500}
            width={432}
            height={768}
          />
        </div>
      )}
      {/* GAME PLAYING */}
      {(gameState === "playing" || gameState === "scoring") &&
        human &&
        human.avatarImg && (
          <div
            className={
              "w-full select-none h-full screen-playing flex flex-col items-center justify-between select-none"
            }
          >
            {window.hasDebug && (
              <div
                id="footer-debug"
                className="w-full h-auto opacity-100 absolute top-0"
              >
                -
              </div>
            )}
            <div className="hidden w-full h-8 ">
              <video
                playsInline
                muted
                autoPlay
                loop
                src="https://rawgit.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4"
              ></video>
            </div>
            <div className="mb-24 w-full pt-16">
              <div className="w-full mb-6">
                <div className="w-full flex justify-center">
                  <div className="border-white border-4 bg-black w-24 h-24 mb-6">
                    <img src={`data:image/svg+xml;base64,${human.avatarImg}`} />
                  </div>
                </div>

                <div className={"w-full px-10 pb-10"}>
                  <p
                    id={"data-form-message"}
                    className={
                      "basic-messages w-full text-center mb-2 typewriter"
                    }
                  >
                    E t?? valendo!
                    {/* ({gameRoom || "no-room"}) */}
                  </p>
                </div>
              </div>

              {!modoRaquete && (
                <div
                  className={
                    "w-full select-none h-auto flex flex-wrap flex-row justify-between arrows-container px-8"
                  }
                >
                  <div
                    className={`${
                      leftPressed
                        ? "controller-button-pressed"
                        : "controller-button"
                    }  ${
                      modoRaquete ? "opacity-0" : ""
                    } flex items-center justify-center select-none`}
                  >
                    <img id="arrowLeftID" src={arrowLeft} />
                  </div>

                  <div
                    className={`${
                      rightPressed
                        ? "controller-button-pressed"
                        : "controller-button"
                    } ${
                      modoRaquete ? "opacity-0" : ""
                    } select-none flex items-center justify-center select-none`}
                  >
                    <img id="arrowRightID" src={arrowRight} />
                  </div>
                </div>
              )}
              {modoRaquete && (
                <div className="w-full flex flex-col">
                  <RenderVolume />
                  <div className="w-full">
                    <p
                      id={"data-form-message"}
                      className={
                        "basic-messages w-full text-center mb-2 typewriter"
                      }
                    >
                      Movimente o seu telefone para controlar o jogo
                      {/* ({gameRoom || "no-room"}) */}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!optOut && (
              <div
                onClick={() => {
                  toggleRaquete();
                }}
                className="w-full bottom-32 h-auto absolute flex flex-wrap px-8 toggler z-30 justify-center"
              >
                <div className="w-auto flex flex-wrap">
                  <div className="w-12 h-auto flex items-center mr-2">
                    {/* {modoRaquete && <img className="w-full h-auto" src={btOn} />} */}
                    <img
                      className="w-full h-auto"
                      src={!modoRaquete ? btOff : btOn}
                    />
                  </div>
                  <div className="flex-1 h-auto flex items-center">
                    {modoRaquete ? "motion" : "touch"}
                  </div>
                </div>
              </div>
            )}

            <div className="w-full h-full absolute opacity-0 z-10 top-24">
              <ReactNipple
                // supports all nipplejs options
                // see https://github.com/yoannmoinet/nipplejs#options
                options={{
                  lockX: true,
                  mode: "static",
                  position: { top: "50%", left: "50%" },
                  threshold: 0.005,
                  size: window.innerWidth,
                }}
                // any unknown props will be passed to the container element, e.g. 'title', 'style' etc
                style={{
                  color: "blue",
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                }}
                // all events supported by nipplejs are available as callbacks
                // see https://github.com/yoannmoinet/nipplejs#start
                onMove={(evt, data) => {
                  const direction = data.direction?.angle || "center";
                  const distance = data.distance;

                  const percent = ((distance * 2) / window.innerWidth) * 1 * 70;

                  // CONVERT TO PERCENT

                  console.log("JOY_DIRECTION", direction);
                  console.log("JOY_DISTANCE", distance);
                  console.log("JOY_DISTANCE_PERCENT", percent);

                  if (!modoRaquete && window.socketStarted) {
                    handleTouchDrag(direction, percent);
                    clearInterval(window.joyStickThrotle);
                    window.joyStickThrotle = setInterval(() => {
                      console.log("JOY_INTERVAL_DISTANCE", percent);

                      handleTouchDrag(direction, percent);
                    }, 200);
                  }
                }}
                onDir={(evt, data) => {
                  console.log("JOY_DIR_EVT", evt);
                  console.log("JOY_DIR_DATA", data.direction);
                }}
                onEnd={(evt, data) => {
                  console.log("JOY_END_EVT", evt);
                  console.log("JOY_END_DATA", data);

                  clearInterval(window.joyStickThrotle);

                  handleTouchEnd(data);
                }}
              />
            </div>

            <div
              className={
                "w-full flex items-center justify-center pb-12 absolute bottom-0 hidden"
              }
            >
              <img className={"w-12 h-12"} src={logobolha} />
            </div>
          </div>
        )}
      <section className={"desktop-message"}>
        {/* MOBILE_CONTROLLER_NOT_DESK */}
      </section>
    </div>
  );
}
