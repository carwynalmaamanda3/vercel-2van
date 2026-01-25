import config from './config.js';

export default async (req, res) => {
    const { method } = req;

    console.log(`${method} delete-telegram`);

    if (method !== 'POST') {
        return res.status(405).json({
            error: 'chỉ support POST method'
        });
    }

    try {
        const { messageId, chatId } = req.body;

        if (!messageId) {
            return res.status(400).json({
                error: 'thiếu messageId'
            });
        }

        const targetChatId = chatId || config.chat_id;

        const telegramResponse = await deleteMessage({
            token: config.token,
            chatId: targetChatId,
            messageId
        });

        console.log('delete response:', telegramResponse);

        return res.status(200).json({
            success: true,
            message: 'xóa message thành công'
        });
    } catch (err) {
        console.error('lỗi xóa message:', err);
        return res.status(500).json({
            error: 'lỗi xóa message',
            details: err.message
        });
    }
};

const deleteMessage = async ({ token, chatId, messageId }) => {
    const deleteMessageUrl = `https://api.telegram.org/bot${token}/deleteMessage`;

    const payload = {
        chat_id: chatId,
        message_id: messageId
    };

    const response = await fetch(deleteMessageUrl, {
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
