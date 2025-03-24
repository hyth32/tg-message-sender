import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN
const port = process.env.PORT

const bot = new TelegramBot(token, { polling: true })

const app = express()

app.use(express.json())

const chatIds = new Set()

app.post('/send-message', async (req, res) => {
    const { text } = req.body

    try {
        const errors = [];
        for (const chatId of chatIds) {
            try {
                await bot.sendMessage(chatId, text);
            } catch (error) {
                errors.push({ chatId, error: error.message });
            }
        }

        if (errors.length > 0) {
            return res.status(200).json({
                message: 'Сообщение отправлено, но возникли ошибки',
                errors,
            });
        }

        res.status(200).json({ message: 'Сообщение успешно отправлено всем пользователям' });
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error.message);
        res.status(500).json({ error: 'Ошибка при отправке сообщения' });
    }
})


bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id

    if (!chatIds.has(chatId)) {
        chatIds.add(chatId)
        console.log(`Новый пользователь: ${msg.chat.first_name}`);
    }

    bot.sendMessage(chatId, 'Модератор добавлен')
})

app.listen(port, () => console.log(`Сервер запущен на порту ${port}`))
