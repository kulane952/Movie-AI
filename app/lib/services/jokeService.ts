const JOKE_API = "https://icanhazdadjoke.com/";

export async function getRandomJoke() {
  try {
    const response = await fetch(JOKE_API, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Joke API failed: ${response.status}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      joke: data.joke,
      id: data.id,
    };
  } catch (error) {
    console.error("Joke API error:", error);

    return {
      success: false,
      error: "Unable to fetch a joke right now.",
    };
  }
}