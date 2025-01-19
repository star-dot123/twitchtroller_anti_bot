require('dotenv').config();
const { ApiClient } = require('twitch-js');

const clientId = process.env.TWITCH_CLIENT_ID;
const accessToken = process.env.TWITCH_ACCESS_TOKEN;
const channelName = process.env.TWITCH_CHANNEL_NAME;

const client = new ApiClient({ clientId, accessToken });

// 同じ文字の連続を検出する関数
function hasExcessiveCharacterRepetition(text) {
    const maxAllowedRepetition = 5; // 許容する最大連続文字数
    let lastChar = '';
    let repeatCount = 0;

    for (const char of text) {
        if (char === lastChar) {
            repeatCount++;
            if (repeatCount >= maxAllowedRepetition) {
                return true;
            }
        } else {
            lastChar = char;
            repeatCount = 1;
        }
    }

    return false;
}

// 同じフレーズが連続しているか確認する関数
function hasExcessivePhraseRepetition(text) {
    const phrases = text.split(/[\s。、.!?]+/).filter(word => word);
    let repeatedCount = 1;

    for (let i = 1; i < phrases.length; i++) {
        if (phrases[i] === phrases[i - 1]) {
            repeatedCount++;
            if (repeatedCount >= 3) { // 同じフレーズが3回以上連続している
                return true;
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

    if (hasExcessiveCharacterRepetition(text) || hasExcessivePhraseRepetition(text)) {
        console.log(`削除対象: ${message.text}`);

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
