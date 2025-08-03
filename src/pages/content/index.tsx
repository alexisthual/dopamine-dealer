import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import styles from "./style.css?inline";
import { ShotLog, StorageDataType } from "@pages/background/index";
import mascot from "@assets/img/mascot.png";

const DopamineDealer = () => {
  const [maxShots, setMaxShots] = useState<number>();
  const [shotDuration, setShotDuration] = useState<number>();
  const [shots, setShots] = useState<ShotLog[]>([]);

  const [currentShot, setCurrentShot] = useState<ShotLog | null>(null);
  const [showShotDashboard, setShowShotDashboard] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    const updateState = async () => {
      const hostname = window.location.hostname;
      const {
        duration: durationStorage,
        maxShots: maxShotsStorage,
        shotDuration: shotDurationStorage,
        shots: shotsStorage,
        trackedHostnames: trackedHostnamesStorage,
      } = (await browser.storage.local.get()) as unknown as StorageDataType;

      const parsedTrackedHostnames = trackedHostnamesStorage
        ? trackedHostnamesStorage.split(",").map((h) => h.trim())
        : [];
      // Improved matching: check for exact match or subdomain match
      const matchingTrackedHostnames = parsedTrackedHostnames.filter(
        (tracked) => {
          // Normalize both hostnames to lowercase
          const current = hostname.toLowerCase();
          const target = tracked.toLowerCase();

          // Exact match
          if (current === target) return true;

          // Subdomain match (e.g., foo.example.com matches example.com)
          if (current.endsWith(`.${target}`)) return true;

          return false;
        }
      );
      const pageIsTracked =
        matchingTrackedHostnames && matchingTrackedHostnames.length > 0;

      // If current page is not tracked, hide the dashboard and timer
      if (!pageIsTracked) {
        setShowShotDashboard(false);
        setShowTimer(false);
      } else {
        // If current page is tracked, check if user has one ongoing shot for the current hostname
        const ongoingShots = shotsStorage?.filter(
          (shot: ShotLog) =>
            shot.timestamp > Date.now() - shotDurationStorage &&
            shot.hostname === hostname
        );
        const lastShot = ongoingShots?.[ongoingShots.length - 1] || null;

        // If there are no shots in the list for today, show the dashboard
        if (!lastShot) {
          setShowShotDashboard(true);
          setShowTimer(false);
        } else {
          // If there are shots in the list for today, check if the last shot is still active
          const timeSinceLastShotStarted = lastShot
            ? Date.now() - lastShot.timestamp
            : 0;

          // If the last shot is still active, show the timer
          // Otherwise, show the dashboard
          if (timeSinceLastShotStarted < (shotDurationStorage ?? 0)) {
            setCurrentShot(lastShot);
            setShowShotDashboard(false);
            setShowTimer(true);
          } else {
            setShowShotDashboard(true);
            setShowTimer(false);
          }
        }
      }

      setMaxShots(maxShotsStorage);
      setShotDuration(shotDurationStorage);
      setShots(shotsStorage);
    };

    updateState();

    // Update state every second
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, []);

  // Remaining time for the current shot
  const remainingTime = currentShot
    ? shotDuration - (Date.now() - currentShot.timestamp)
    : undefined;
  const formattedRemainingTime = remainingTime
    ? new Date(remainingTime).toISOString().substr(14, 5) // Format as MM:SS
    : undefined;

  return showShotDashboard ? (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-50 flex flex-col items-center justify-center">
      <div className="flex flex-row items-center justify-center gap-3 mb-16">
        <img
          alt="Dopamine dealer mascot"
          className="w-48 h-auto opacity-90"
          src={browser.runtime.getURL(mascot)}
        />
        <div className="text-4xl font-bold text-gray-300 uncial-antiqua">
          Dopamine
          <br />
          dealer
        </div>
      </div>

      <div className="text-base mb-12 text-center">
        You already took{" "}
        <span className="font-black text-lg text-indigo-500">
          {shots.length}
        </span>
        <span className="font-bold text-lg text-gray-700">/{maxShots}</span>
        <br />
        dopamine shot{maxShots !== 1 ? "s" : ""} today.
      </div>

      <div
        className={
          shots.length < maxShots
            ? "mb-2 bg-indigo-100/80 text-base text-indigo-950 font-medium px-4 py-2 rounded cursor-pointer border border-solid border-indigo-300 hover:bg-indigo-200/80 transition-colors"
            : "mb-2 bg-gray-200/80 text-base text-gray-400 font-medium px-4 py-2 rounded cursor-not-allowed border border-solid border-gray-200"
        }
        onClick={
          shots.length < maxShots
            ? async () => {
                const newShot = {
                  hostname: window.location.hostname,
                  timestamp: Date.now(),
                };

                await browser.storage.local.set({
                  shots: [...shots, newShot],
                });

                setCurrentShot(newShot);
                setShowShotDashboard(false);
                setShowTimer(true);
              }
            : undefined
        }
      >
        Take 1 shot now
      </div>
      <div className="text-xs text-indigo-950">
        ({shotDuration / 1000 / 60} minute
        {Math.round(shotDuration / 1000 / 60) > 1 ? "s" : ""})
      </div>
    </div>
  ) : showTimer ? (
    <div className="fixed top-2 left-2 bg-gray-100/80 text-sm text-gray-800 rounded-sm px-2 py-1 border border-solid border-gray-200/80">
      <span className="font-bold text-indigo-500">{shots.length}</span>
      <span className="font-medium text-gray-700">/{maxShots}</span>
      {" | "}
      <span className="font-medium text-indigo-500">
        {formattedRemainingTime}
      </span>
    </div>
  ) : null;
};

// Create a root element for the content script
const container = document.createElement("div");
container.id = "__root_dopamine_dealer";
container.style.position = "fixed";
container.style.top = "0";
container.style.left = "0";
container.style.zIndex = "10000";

// Create shadow root
const shadowRoot = container.attachShadow({ mode: "open" });

// Inject styles into shadow root
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
shadowRoot.appendChild(styleSheet);

// Create a container inside shadow root for React
const shadowContainer = document.createElement("div");
shadowContainer.id = "shadow-root-container";
shadowRoot.appendChild(shadowContainer);

// Append the main container to document body
document.body.appendChild(container);

// Find the shadow root container where the React app will be mounted
const rootContainer = shadowRoot.getElementById("shadow-root-container");
if (!rootContainer) throw new Error("Can't find Content shadow root element");

// Render the React component into the shadow root container
const root = createRoot(rootContainer);
root.render(<DopamineDealer />);
