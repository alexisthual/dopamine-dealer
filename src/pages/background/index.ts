import browser from "webextension-polyfill";

export interface StorageDataType {
  duration: number;
  maxShots: number;
  shotDuration: number;
  shots: Array<ShotLog>;
  trackedHostnames: string;
}

export interface ShotLog {
  hostname: string;
  timestamp: number;
}

// Default storage values for the extension
const defaultStorage = {
  duration: 24 * 60 * 60 * 1000, // Duration of the time period for shots
  maxShots: 3, // Number of allowed visits in the time period
  shotDuration: 6 * 60 * 1000, // in milliseconds
  shots: [],
  trackedHostnames: "",
};

// On loading the extension, verify that browser storage values are ok
const initLocalStorage = async () => {
  // Get the current values from storage
  let currentValues = await browser.storage.local.get(null);

  // Check each default value and set it if it doesn't exist
  for (const key in defaultStorage) {
    const typedKey = key as keyof typeof defaultStorage;
    if (!(typedKey in currentValues)) {
      // Set the default value for the key
      await browser.storage.local.set({ [typedKey]: defaultStorage[typedKey] });
    }
  }

  console.log(await browser.storage.local.get());
};

// Listen for tab updates
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const hostname = new URL(tab.url).hostname;

    // Get existing visits from storage
    const storageData = await browser.storage.local.get("shots");
    const shots: ShotLog[] = Array.isArray(storageData.shots)
      ? storageData.shots
      : [];
    const now = Date.now();

    console.log(await browser.storage.local.get());

    // Remove shots older than the duration
    const filteredShots = shots.filter(
      (s) => s.timestamp > now - defaultStorage.duration
    );

    // Save updated visits
    await browser.storage.local.set({
      // Set shots
      shots: filteredShots,
    });
  }
});

console.log("background script loaded");
initLocalStorage();
