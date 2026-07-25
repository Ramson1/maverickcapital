import Moralis from "moralis";

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY || "";

// Initialize Moralis (client-side)
export async function initMoralis() {
  if (MORALIS_API_KEY) {
    try {
      await Moralis.start({ apiKey: MORALIS_API_KEY });
    } catch (err) {
      // Already initialized or other error
      console.debug("Moralis init:", err);
    }
  }
}

export { Moralis, MORALIS_API_KEY };
