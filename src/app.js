"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { App, subtype } = require('@slack/bolt');
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    // ソケットモードではポートをリッスンしませんが、アプリを OAuth フローに対応させる場合、
    // 何らかのポートをリッスンする必要があります
    port: process.env.PORT || 3000
});
// "hello" を含むメッセージをリッスンします
app.message('hello', ({ message, say }) => __awaiter(void 0, void 0, void 0, function* () {
    // イベントがトリガーされたチャンネルに say() でメッセージを送信します
    yield say(`Hey there <@${message.user}>!`);
}));
// ファイルが添付されたメッセージが来たらレスポンスを返す
app.message(subtype('file_share'), ({ message, say }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(message);
    console.log('file shared');
    yield say('file shared!!!');
}));
// function fileDownload(fileURL){
//     return;
// }
(() => __awaiter(void 0, void 0, void 0, function* () {
    // アプリを起動します
    yield app.start();
    console.log('⚡️ Bolt app is running!');
}))();
