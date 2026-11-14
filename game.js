import { loadModel, LLAMA_3_2_1B_INST_Q4_0, completion, unloadModel } from '@qvac/sdk';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Keep context well within the 1024-token offline ceiling
function getTrimmedHistory(history, maxRecentMessages = 6) {
  const systemMessage = history[0];
  const recentMessages = history.slice(1).slice(-maxRecentMessages);
  return [systemMessage, ...recentMessages];
}

async function startGame() {
  console.log("🎮 Initializing QVAC offline engine...");
  
  let modelId;
  try {
    modelId = await loadModel({
      modelSrc: LLAMA_3_2_1B_INST_Q4_0,
      onProgress: (p) => {
        process.stdout.write(`\r▸ Loading Model: ${p.percentage.toFixed(0)}%`);
      }
    });
    console.log("\n✅ Model loaded successfully!\n");
  } catch (error) {
    console.error("❌ Failed to load model:", error);
    process.exit(1);
  }

  // Genre selection menu
  console.log("==========================================");
  console.log("          CHOOSE YOUR GENRE               ");
  console.log("==========================================");
  console.log("1. Dark Fantasy (Ancient crypts, magic, and monsters)");
  console.log("2. Sci-Fi (Derelict space stations, aliens, and void)");
  console.log("3. Cyberpunk (Neon streets, hackers, and mega-corps)");
  console.log("------------------------------------------");

  let genre = "Dark Fantasy"; // default fallback
  let validGenre = false;

  while (!validGenre) {
    const genreChoice = await askQuestion("👉 Select genre (1, 2, or 3): ");
    switch (genreChoice.trim()) {
      case '1':
        genre = "Dark Fantasy";
        validGenre = true;
        break;
      case '2':
        genre = "Sci-Fi";
        validGenre = true;
        break;
      case '3':
        genre = "Cyberpunk";
        validGenre = true;
        break;
      default:
        console.log("⚠️ Invalid selection. Please enter 1, 2, or 3.");
    }
  }

  console.log(`\n🌌 Setting setting to: ${genre.toUpperCase()}...\n`);

  // System prompt tailored to the chosen genre
  const systemPrompt = {
    role: 'system',
    content: `You are a Dungeon Master for a ${genre} text adventure. Keep output between 30-70 tokens.
Write ONE suspenseful paragraph (1-2 sentences) describing the immediate situation fitting the ${genre} setting, then stop and list exactly 3 brief choices:
1. [Choice 1]
2. [Choice 2]
3. [Choice 3]
Never resolve the adventure or pick a choice yourself. Always wait for the player.`
  };

  const history = [
    systemPrompt,
    { role: 'user', content: `Begin the ${genre} adventure in a high-tension opening scenario. Present the scene and 3 choices.` }
  ];

  const MAX_TURNS = 6;
  let turn = 1;
  let playing = true;

  try {
    while (playing) {
      console.log(`\n--- Turn ${turn} of ${MAX_TURNS} (${genre}) --------------------------------------`);
      
      const activeHistory = getTrimmedHistory(history);

      const result = completion({ 
        modelId, 
        history: activeHistory, 
        stream: true,
        max_tokens: 75 
      });

      let assistantResponse = "";
      for await (const token of result.tokenStream) {
        process.stdout.write(token);
        assistantResponse += token;
      }
      console.log("\n");

      history.push({ role: 'assistant', content: assistantResponse });

      // If we just finished the final climax turn, end the game cleanly
      if (turn >= MAX_TURNS) {
        console.log("🏆 Adventure concluded!");
        break;
      }

      const choice = await askQuestion("👉 Choose (1, 2, or 3, or 'exit'): ");
      
      if (choice.trim().toLowerCase() === 'exit') {
        playing = false;
        break;
      }

      if (!['1', '2', '3'].includes(choice.trim())) {
        console.log("⚠️ Invalid input. Enter 1, 2, or 3.");
        history.pop(); 
        continue;
      }

      turn++;

      // Only trigger the ending on the final turn via the user prompt
      if (turn === MAX_TURNS) {
        history.push({ 
          role: 'user', 
          content: `I choose option ${choice}. Write ONE final paragraph concluding the ${genre} adventure based on this choice. Do not list any more choices.` 
        });
      } else {
        history.push({ 
          role: 'user', 
          content: `I choose option ${choice}. Continue with 1 suspenseful paragraph and 3 new choices.` 
        });
      }
    }
  } finally {
    console.log("\n🧹 Unloading model...");
    await unloadModel({ modelId });
    rl.close();
    console.log("👋 Thanks for playing!");
  }
}

startGame();