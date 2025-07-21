// main.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const kv = await Deno.openKv(); // встроенный KV в Deno


const TOKEN = Deno.env.get("BOT_TOKEN");
const SECRET_PATH = "/TonDrive";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const GAME_URL = "";

serve(async (req: Request) => {
  const { pathname } = new URL(req.url);
  if (pathname !== SECRET_PATH) {
    return new Response("TonDriveBot is working.", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  
  const update = await req.json();
  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text;

  if (text?.startsWith("/start")) {
    const parts = text.split(" ");
    const startParam = parts.length > 1 ? parts[1] : "";

    if (startParam) {
      await kv.set(["ref", chatId], startParam);
    }

    const launchUrl = `https://t.me/TON_DRIVE_OFFICIAL_bot?startapp=${startParam}`;
    const caption = [
      "Join TON DRIVE and start drive!🚗",
      "",
      "Take part in races, compete with other players, and win the USDT!💸",
      "",
      "Climb to the top of the leaderboard and claim your winnings!🏎",
      "",
      "Show everyone who's number 1 here!💎",
      "",
      "Play now and win USDT!"
    ].join("\n");

    await fetch(`${TELEGRAM_API}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        video: "https://flapsterminer1-41.vercel.app/loadingmenuvideo.mp4",
        caption,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Start⛏️", url: launchUrl }],
            [{ text: "Join Community📢", url: "https://t.me/TonDriveOfficialRu" }],
            [{ text: "Join Chat RU 💬", url: "https://t.me/TonDriveChatRu" }],
            [{ text: "Join Chat EN 💬", url: "https://t.me/TonDriveChatEn" }]
          ]
        }
      })
    });

    const webAppUrl = `${GAME_URL}?ref=${startParam}`;
    await fetch(`${TELEGRAM_API}/setChatMenuButton`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        menu_button: {
          type: "web_app",
          text: "Open",
          web_app: { url: GAME_URL }
        }
      })
    });
  }

  return new Response("OK", { status: 200 });
});
