import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";

import { version } from "package.json";
import logo from "@public/icon-128.png";
import { StorageDataType } from "@pages/background/index";
import "@pages/popup/index.css";

const Popup = () => {
  const [maxShots, setMaxShots] = useState<number>();
  const [shotDuration, setShotDuration] = useState<number>();
  const [trackedHostnames, setTrackedHostnames] = useState<string>();

  useEffect(() => {
    const fetchSettings = async () => {
      const {
        maxShots: maxShotsStorage,
        shotDuration: shotDurationStorage,
        trackedHostnames: trackedHostnamesStorage,
      } = (await browser.storage.local.get()) as unknown as StorageDataType;

      setMaxShots(maxShotsStorage);
      setShotDuration(shotDurationStorage);
      setTrackedHostnames(trackedHostnamesStorage);
    };

    fetchSettings();
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 w-full p-4 bg-gray-100 overflow-auto font-sans">
      <div className="flex flex-col gap-4 items-stretch justify-center text-gray-900 text-sm">
        <div className="w-full flex flex-row items-center justify-center gap-6 mb-2">
          <img
            src={browser.runtime.getURL(logo)}
            className="w-14 h-auto"
            alt="Dopamine dealer logo"
          />
          <div className="flex flex-col gap-2">
            <div className="text-xl/5 font-bold text-gray-300 uncial-antiqua">
              Dopamine
              <br />
              dealer
            </div>

            <div className="flex flex-row gap-2 items-center align-middle">
              <div className="font-mono text-sm font-medium text-gray-500">
                v{version}
              </div>
              <div className="rounded bg-indigo-400 font-mono text-xs text-white px-[3px] py-[2px]">
                beta
              </div>
            </div>
          </div>
        </div>

        <hr className="border border-gray-200"/>

        <div className="text-justify font-normal text-sm flex flex-col gap-2">
          <p>
            Dopamine dealer limits the number of times you can access
            time-consuming websites to improve your ability to focus
            throughout the day.
          </p>
          <p>
            Set the list of websites you want to track, the number of shots you
            can get everyday - note that one shot is only valid for a single
            website, not all of them! - and the shot duration.
          </p>
        </div>

        <div className="font-bold text-base text-left">Settings</div>

        <div>
          <div className="font-bold text-sm text-indigo-600">Hostnames</div>
          <textarea
            className="p-2 border-2 border-gray-300 rounded w-full h-20 text-sm focus:border-indigo-500 focus:outline focus:outline-transparent"
            placeholder={'e.g. "instagram.com, facebook.com, linkedin.com"'}
            onChange={async (e) => {
              const trackedHostnames = e.target.value;
              await browser.storage.local.set({ trackedHostnames });
              setTrackedHostnames(trackedHostnames);
            }}
            defaultValue={trackedHostnames}
          ></textarea>
          <div className="font-normal text-xs text-gray-700">
            Comma-separated list of urls
          </div>
        </div>

        <div>
          <div className="font-bold text-sm text-indigo-600">
            Number of shots per day
          </div>
          <input
            type="number"
            className="p-2 border-2 border-gray-300 rounded w-full h-10 text-sm focus:border-indigo-500 focus:outline focus:outline-transparent"
            placeholder="2 (default)"
            onChange={async (e) => {
              const maxShots = parseInt(e.target.value, 10);
              if (!isNaN(maxShots)) {
                await browser.storage.local.set({ maxShots });
                setMaxShots(maxShots);
              }
            }}
            value={maxShots}
          />
          <div className="font-normal text-xs text-gray-700">
            A shot unlocks only one website. Choose wisely!
          </div>
        </div>

        <div>
          <div className="font-bold text-sm text-indigo-600">
            Individual shot duration (in minutes)
          </div>
          <input
            type="number"
            className="p-2 border-2 border-gray-300 rounded w-full h-10 text-sm focus:border-indigo-500 focus:outline focus:outline-transparent"
            placeholder="10 (default)"
            onChange={async (e) => {
              const shotDuration = parseInt(e.target.value, 10);
              if (!isNaN(shotDuration)) {
                await browser.storage.local.set({
                  shotDuration: shotDuration * 60 * 1000,
                }); // Convert to milliseconds
                setShotDuration(shotDuration * 60 * 1000);
              }
            }}
            value={shotDuration ? shotDuration / 1000 / 60 : ""}
          />
        </div>

        <div className="mt-2 font-bold text-base text-left">Contribute</div>

        <div className="text-justify">
          This extension is free and open-source. It stores data on your device
          only. You can check the code and contribute to it:{" "}
          <a
            href="https://github.com/alexisthual/dopamine-dealer"
            className="text-indigo-400"
          >
            github.com/alexisthual/dopamine-dealer
          </a>
        </div>

        {/* <div
          className="mt-8 mb-2 bg-indigo-100/80 text-base text-indigo-950 font-medium px-4 py-2 rounded cursor-pointer border border-solid border-indigo-300 hover:bg-indigo-200/80 transition-colors"
          onClick={async () => {
            // Reset the shots in storage
            await browser.storage.local.set({
              shots: [],
            });
          }}
        >
          Reset shots
        </div> */}
      </div>
    </div>
  );
};

const init = () => {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(<Popup />);
};

init();
