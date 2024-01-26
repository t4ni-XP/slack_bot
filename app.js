const { App, subtype } = require('@slack/bolt');
const axios = require('axios');
const { log } = require('console');
const fs = require('fs');
const { DateTime } = require('luxon');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // ソケットモードではポートをリッスンしませんが、アプリを OAuth フローに対応させる場合、
  // 何らかのポートをリッスンする必要があります
  port: process.env.PORT || 3000
});

//ファイルをslackからダウンロードする関数
async function downloadFromSlack(downloadUrl, auth) {
  try {
      const response = await axios.get(downloadUrl, {
          headers: {
              Authorization: `Bearer ${auth}`,
          },
          responseType: 'arraybuffer',
      });

      const filename = `sample_${DateTime.now().toFormat('yyyyMMddHHmmss')}.png`;
      fs.writeFileSync(filename, response.data, 'binary');
      console.log(filename);

      return filename;
  } catch (error) {
      console.error('Error downloading image from Slack:', error);
      return null;
  }
}

// "hello" を含むメッセージをリッスンします
app.message('hello', async ({ message, say }) => {
  // イベントがトリガーされたチャンネルに say() でメッセージを送信します
  await say(`Hey there <@${message.user}>!`);
});
// ファイルが添付されたメッセージが来たらレスポンスを返す
app.message(subtype('file_share'), async({message, say})=>{
  console.log(message);
  console.log("-------------");
  console.log('file shared');
  await say('file shared!!!');
  const filename = downloadFromSlack(message.files[0].url_private_download,app.token);
  console.log("filename:"+filename);
});



(async () => {
  // アプリを起動します
  await app.start();

  console.log('⚡️ Bolt app is running!');
})();