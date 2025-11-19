const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "mgbeauty123";


const WHATSAPP_TOKEN = "EAApZBzVBSwZCgBP8zVhaWRDI7JvRZBfZAgfnE9eZChmSmp5d2VU42fGEsdJtIdKfNazxndZAEAnbItsXizzKaqNip6BuckZBhRbHZCOIjZCfbhbOwnRzXCtkH4ZAPwhXz9ZCDt1NN6D8ret3WHVjg1APwOnNSVIMeZBsxKUvOoPJrmRRRopM7RMNJzSaUvEaTDr57cXJztSzqaTVrMCPprhZCZBYKGcf2pY7803L5Nxk7GsiSjI5wUhSsZBJSzAyfrUFJ4cFOxvMHhtZA940JKa51sledCKZB7s8ZD' `"
const PHONE_NUMBER_ID = "915987098257989";


// ======= Верификация вебхука =======
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});


// ======= Получение сообщений =======
app.post("/webhook", async (req, res) => {
  console.log("NEW MESSAGE:", JSON.stringify(req.body, null, 2));

  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message.text?.body?.toLowerCase() || "";
  const clickedButton = message.button?.payload;


  // === Если нажата кнопка ===
  if (clickedButton) {
    if (clickedButton === "PRICE") {
      await sendMessage(from,
        "💰 *Прайс MGBeautySalon*\n\n" +
        "Классика — 5000₸\n" +
        "2D — 6000₸\n" +
        "3D — 7000₸\n" +
        "4D — 8000₸\n" +
        "Мега Объём — 10000₸\n" +
        "Снятие — 1000₸"
      );
    }

    if (clickedButton === "ADDRESS") {
      await sendMessage(from,
        "📍 *Адрес:* г. Хромтау, ул. Уалиханова 3\n" +
        "Мы работаем ежедневно!"
      );
    }

    if (clickedButton === "BOOK") {
      await sendMessage(from,
        "📝 *Запись*\n\n" +
        "Напишите:\n" +
        "— Ваше имя\n" +
        "— Удобное время\n" +
        "— Объём (Классика / 2D / 3D / 4D / Мега)"
      );
    }

    if (clickedButton === "TIME") {
      await sendMessage(from,
        "🕐 *График работы:*\nЕжедневно — 08:00 до 20:00"
      );
    }

    return res.sendStatus(200);
  }


  // === Если написали текст — отправляем приветствие + кнопки ===
  if (
    text.includes("привет") ||
    text.includes("hello") ||
    text.includes("меню") ||
    text.includes("hi") ||
    text.includes("салон") ||
    text.includes("здравствуйте")
  ) {
    await sendMessage(from,
      "✨ *Здравствуйте! Это салон красоты MGBeautySalon.*\n" +
      "Я *Гульнара*, лэшмейкер с большим опытом и любовью к своей работе ❤️\n\n" +
      "⬇️ Выберите действие:"
    );

    await sendButtonsMenu(from);
  }

  return res.sendStatus(200);
});


// ======= Функция отправки текста =======
async function sendMessage(to, message) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: to,
      text: { body: message }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}


// ======= Функция отправки кнопок =======
async function sendButtonsMenu(to) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "Выберите действие:"
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: { id: "PRICE", title: "💰 Прайс" }
            },
            {
              type: "reply",
              reply: { id: "ADDRESS", title: "📍 Адрес" }
            },
            {
              type: "reply",
              reply: { id: "BOOK", title: "📝 Запись" }
            },
            {
              type: "reply",
              reply: { id: "TIME", title: "🕐 Время работы" }
            }
          ]
        }
      }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}


// ======= СТАРТ =======
app.listen(3000, () => console.log("MGBeautySalon Bot with greeting is running..."));
