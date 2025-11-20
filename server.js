const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// === НАСТРОЙКИ ===
const VERIFY_TOKEN = "mgbeauty123";
const WHATSAPP_TOKEN = "EAApZBzVBSwZCgBPwmHtUbSE4ZBxvo2lyaI2BVu2vNyrF5sH0MZCCjGS9pqNOZC52MjnWzFJkHGRmJf0ziimQGCwOuiv4HiOIPZBnotmEOsgUpyju2XZARtgWnrBZCPHy4djR1Bw96ZAENQpDgs6a9tQDZB4m2E7LifRWjbX3FfZBdejPq5qEenpyB9PGZACZC8FlC7XbuHKCAS7SLstfEOCEbzM7GIvvRFM8tO9COEIt7DKk6k2iVO2iEQlhOZCqZCc5zIZAJ94ywoD8FpxWRknj0Oa063NH";
const PHONE_NUMBER_ID = "915987098257989";


// === Верификация Webhook ===
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});


// === Приём сообщений ===
app.post("/webhook", async (req, res) => {
  console.log("NEW MESSAGE:", JSON.stringify(req.body, null, 2));

  const message =
    req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message.text?.body?.toLowerCase() || "";
  const btn = message.button?.payload;

  // ==== Обработка кнопок ====
  if (btn) {
    if (btn === "PRICE") {
      await sendText(from,
        "💰 *Прайс MGBeautySalon*\n\n" +
        "Классика — 5000₸\n" +
        "2D — 6000₸\n" +
        "3D — 7000₸\n" +
        "4D — 8000₸\n" +
        "Мега Объём — 10000₸\n" +
        "Снятие — 1000₸"
      );
    }

    if (btn === "ADDRESS") {
      await sendText(from,
        "📍 *Адрес:* г. Хромтау, ул. Уалиханова 3\nРаботаем каждый день!"
      );
    }

    if (btn === "BOOK") {
      await sendText(from,
        "📝 *Запись*\n\nНапишите:\n— Ваше имя\n— Время\n— Объем (классика/2D/3D/4D/мега)"
      );
    }

    return res.sendStatus(200);
  }

  // ==== Если написали текст — отправляем приветствие ====
  if (
    text.includes("привет") ||
    text.includes("hello") ||
    text.includes("меню") ||
    text.includes("здравствуйте") ||
    text.includes("салон")
  ) {
    await sendText(from,
      "✨ *Здравствуйте! Это салон красоты MGBeautySalon.*\n" +
      "Я Гульнара, лэшмейкер с опытом и любовью к своей работе ❤️"
    );

    await sendMenu(from);
  }

  return res.sendStatus(200);
});


// === Функция отправки текста ===
async function sendText(to, message) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
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


// === Меню с кнопками (3 кнопки — максимум) ===
async function sendMenu(to) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "👇 Выберите действие:" },
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


// === START SERVER ===
app.listen(3000, () =>
  console.log("WhatsApp bot is running on Render...")
);



 

