const { App, subtype, client } = require('@slack/bolt');
const { rejects } = require('assert');
const axios = require('axios');
const { log } = require('console');
const { channel } = require('diagnostics_channel');
const fs = require('fs');
const { DateTime } = require('luxon');
const { resolve } = require('path');

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
      //console.log(filename);

      return filename;
  } catch (error) {
      console.error('Error downloading image from Slack:', error);
      return null;
  }
}

async function getMessageFromSlack(channelId, auth){
  try {
    // const url = "https://slack.com/api/conversations.history" 
    // const response = await axios.get(url,{
    //   headers: {
    //     Authorization: `Bearer ${auth}`,
    //   },
    //   responseType: 'json',
    //   params: {
    //     channel: `${channelId}`
    //   }
    // })
    const res = await app.client.conversations.history({
      token: auth,
      channel: channelId
    })
    console.log(res.messages);
    // const conversationHistory = res.message;
    // console.log(conversationHistory.length + " messages found in " + channelId);
    return res;
  } catch (err){
    return err;
  }
}

// "hello" を含むメッセージをリッスンします
app.message('hello', async ({ message, say }) => {
  // イベントがトリガーされたチャンネルに say() でメッセージを送信します
  await say(`Hey there <@${message.user}>!`);
  console.log(message);
});
// ファイルが添付されたメッセージが来たらレスポンスを返す
app.message(subtype('file_share'), async({message, say})=>{
  console.log(message);
  console.log("-------------");
  console.log('file shared');
  await say('file shared!!!');
  await downloadFromSlack(message.files[0].url_private_download, app.token).then(filename =>{
    console.log(filename);
  })
  console.log("-------");
});

app.message('log', async ({ message, say })=> {
  console.log(message);
  console.log("-----");
  await getMessageFromSlack(message.channel, app.token).then(res => {
    console.log("success");
    console.log(res);
  }).catch(err => {
    console.log("error!!!");
    console.log(err);
  })
  console.log("--------");
});

(async () => {
  // アプリを起動します
  await app.start();

  console.log('⚡️ Bolt app is running!');
})();