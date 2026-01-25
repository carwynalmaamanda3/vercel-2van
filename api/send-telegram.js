import config from './config.js';

export default async (req, res) => {
    const { method } = req;

    console.log(`${method} send-telegram`);

    if (method !== 'POST') {
        return res.status(405).json({
            error: 'chỉ support POST method'
        });
    }

    try {
        const { message, chatId, parseMode = 'HTML' } = req.body;

        if (!message) {
            return res.status(400).json({
                error: 'thiếu message'
            });
        }

        const targetChatId = chatId === 'noti' ? config.noti_chat_id : chatId || config.chat_id;

        const telegramResponse = await sendMessage({
            token: config.token,
            chatId: targetChatId,
            message,
            parseMode
        });

        console.log('telegram response:', telegramResponse);

        return res.status(200).json({
            success: true,
            message: 'gửi telegram thành công',
            messageId: telegramResponse.result?.message_id
        });
    } catch (err) {
        console.error('lỗi gửi telegram:', err);
        return res.status(500).json({
            error: 'lỗi gửi telegram',
            details: err.message
        });
    }
};

const sendMessage = async ({ token, chatId, message, parseMode }) => {
    const sendMessageUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode
    };

    const response = await fetch(sendMessageUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`telegram api error: ${response.status} - ${errorText}`);
    }

    return await response.json();
};
