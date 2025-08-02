import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import logo from "@assets/img/logo.png";
import { StorageDataType } from "@pages/background/index";

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
      <div className="flex flex-col gap-4 items-stretch justify-center text-gray-900">
        <div className="flex flex-row items-center justify-center gap-4 mb-4">
          <img
            src={browser.runtime.getURL(logo)}
            className="w-20 h-auto"
            alt="Dopamine Dealer Logo"
          />
          <div className="text-3xl/8 font-bold text-gray-300 uncial-antiqua">
            Dopamine
            <br />
            dealer
          </div>
        </div>

        <div className="text-justify font-normal text-sm ">
          This extension helps you (1) improve your ability to focus and (2)
          reduce your dependence to time-consumming websites by limiting the
          number of unique times you can access them per day.
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

        <div className="font-bold text-base text-left">Contribute</div>

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

export default Popup;
