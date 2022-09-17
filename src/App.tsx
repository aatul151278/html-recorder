import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { useReactMediaRecorder } from "react-media-recorder";
import $ from "jquery";
import ScreenRecording from "./screen_recorder";
import { useLocation } from "react-router-dom";

function App() {
  const REPLAY_SCALE = 0.631;
  const SPEED = 1;

  // init elements
  const $body = $("body");

  // Data type for storing a recording
  const recording: any = { events: [], startTime: -1, htmlCopy: "" };

  // Record each type of event
  const handlers = [
    {
      eventName: "mousemove",
      handler: function handleMouseMove(e: any) {
        recording.events.push({
          type: "mousemove",
          x: e.pageX,
          y: e.pageY,
          time: Date.now(),
        });
      },
    },
    {
      eventName: "click",
      handler: function handleClick(e: any) {
        console.log(e);
        recording.events.push({
          type: "click",
          target: e.target,
          path: manageDOMPath(e.composedPath(), e.target),
          x: e.pageX,
          y: e.pageY,
          time: Date.now(),
        });
      },
    },
    {
      eventName: "keypress",
      handler: function handleKeyPress(e: any) {
        console.log(e);

        recording.events.push({
          type: "keypress",
          target: e.target,
          path: manageDOMPath(e.composedPath(), e.target),
          value: e.target.value,
          keyCode: e.keyCode,
          time: Date.now(),
        });
      },
    },
  ];

  const manageDOMPath = (composedPath: any, targetName: any) => {
    // console.log(targetName)
    var path = "";
    for (let index = composedPath.length - 1; index >= 0; index--) {
      const element = composedPath[index];
      if (element.tagName) {
        if (element.tagName.toLowerCase() != "html") {
          if (path.length == 0) {
            path = element.tagName.toLowerCase();
          } else {
            path += ">" + element.tagName.toLowerCase();
          }
        }
      }
    }
    return path.toString();
  };

  const startRecording = (e: any) => {
    recording.startTime = Date.now();
    recording.events = [];
    recording.htmlCopy = $(document.documentElement).html();
    recording.height = $(window).height();
    recording.width = $(window).width();
    handlers.map((x) => listen(x.eventName, x.handler));
  };

  const stopRecording = () => {
    // stop recording

    handlers.map((x) => removeListener(x.eventName, x.handler));
  };

  const listen = (eventName: any, handler: any) => {
    // listens even if stopPropagation
    return document.documentElement.addEventListener(eventName, handler, true);
  };

  const removeListener = (eventName: any, handler: any) => {
    // removes listen even if stopPropagation
    return document.documentElement.removeEventListener(
      eventName,
      handler,
      true
    );
  };

  const drawEvent = (event: any, $fakeCursor: any, $iframeDoc: any) => {
    if (event.type === "click" || event.type === "mousemove") {
      $fakeCursor.css({
        top: event.y,
        left: event.x,
      });
    }

    if (event.type === "click") {
      flashClass($fakeCursor, "click");
      const path = event.path;
      const $element = $iframeDoc.find(path);
      flashClass($element, "clicked");
    }

    if (event.type === "keypress") {
      const path = event.path;
      const $element = $iframeDoc.find(path);
      $element.trigger({ type: "keypress", keyCode: event.keyCode });
      $element.val(event.value);
    }
  };

  const flashClass = ($el: any, className: any) => {
    $el
      .addClass(className)
      .delay(200)
      .queue(() => $el.removeClass(className).dequeue());
  };

  const Play = () => {
    const $iframe: any = $("<iframe>");
    $iframe.height(recording.height * REPLAY_SCALE);
    $iframe.width(recording.width * REPLAY_SCALE);
    $iframe.css({
      "-ms-zoom": `${REPLAY_SCALE}`,
      "-moz-transform": `scale(${REPLAY_SCALE})`,
      "-moz-transform-origin": `0 0`,
      "-o-transform": `scale(${REPLAY_SCALE})`,
      "-o-transform-origin": `0 0`,
      "-webkit-transform": `scale(${REPLAY_SCALE})`,
      "-webkit-transform-origin": `0 0`,
    });
    $body.append($iframe);

    console.log("recording.htmlCopy",recording.htmlCopy)
    // Load HTML
    $iframe[0].contentDocument.documentElement.innerHTML = recording.htmlCopy;
    const $iframeDoc: any = $($iframe[0].contentDocument.documentElement);

    // Insert fake cursor
    const $fakeCursor = $('<div class="cursor"></div>');
    $iframeDoc.find("body").append($fakeCursor);

    let i = 0;
    const startPlay = Date.now();

    const draw = () => {
      let event = recording.events[i];
      if (!event) {
        return;
      }
      let offsetRecording = event.time - recording.startTime;
      let offsetPlay = (Date.now() - startPlay) * SPEED;
      if (offsetPlay >= offsetRecording) {
        drawEvent(event, $fakeCursor, $iframeDoc);
        i++;
      }

      if (i < recording.events.length) {
        requestAnimationFrame(draw);
      } else {
        $iframe.remove();
      }
    };
    draw();
  };

  return (
    <>
      <ScreenRecording
        screen={true}
        audio={false}
        video={false}
        downloadRecordingPath="Screen_Recording_Demo"
        downloadRecordingType="mp4"
        emailToSupport="support@xyz.com"
      ></ScreenRecording>

      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
    <input type="text"></input>
          <button onClick={(e) => startRecording(e)}>START</button>
          <button onClick={(e) => stopRecording()}>STOP</button>
          <button onClick={(e) => Play()}>PLAY</button>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </>
  );
}

export default App;
