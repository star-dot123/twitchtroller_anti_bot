require('dotenv').config();
const { ApiClient } = require('twitch-js');

const clientId = process.env.TWITCH_CLIENT_ID;
const accessToken = process.env.TWITCH_ACCESS_TOKEN;
const channelName = process.env.TWITCH_CHANNEL_NAME;

const client = new ApiClient({ clientId, accessToken });

// 同じフレーズが連続しているか確認する関数
function hasExcessiveRepetition(text) {
    const phrases = text.split(/[\s。、.!?]+/).filter(word => word);
    let repeatedCount = 1;

    for (let i = 1; i < phrases.length; i++) {
        if (phrases[i] === phrases[i - 1]) {
            repeatedCount++;
            if (repeatedCount >= 3) {
                return true; // 同じフレーズが3回以上連続している
            }
        } else {
            repeatedCount = 1;
        }
    }

    return false;
}

async function handleMessage(message) {
    const text = message.text;
    const user = message.user.name;

    if (hasExcessiveRepetition(text)) {
        console.log(`削除対象: ${message.user.name}`);

        await client.kraken.chat.deleteMessage(channelName, message.id);

        /* ここは任意です。
        3分間（180秒）タイムアウト
        console.log(`${user} を3分間タイムアウトします`);
        await client.kraken.chat.timeoutUser(channelName, user, 180);
        */
    }
}

async function startBot() {
    const chat = client.kraken.chat;
    await chat.connect();

    chat.onMessage((channel, user, message) => {
        handleMessage(message);
    });

    console.log(`Botがチャットを監視中...`);
}

startBot();
