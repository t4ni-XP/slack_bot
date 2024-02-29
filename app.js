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
  userToken: process.env.SLACK_USER_TOKEN,
  // ソケットモードではポートをリッスンしませんが、アプリを OAuth フローに対応させる場合、
  // 何らかのポートをリッスンする必要があります
  port: process.env.PORT || 3000
});

//ファイルをslackからダウンロードする関数
async function downloadFromSlack(downloadUrl, auth, name) {
  try {
      const response = await axios.get(downloadUrl, {
          headers: {
              Authorization: `Bearer ${auth}`,
          },
          responseType: 'arraybuffer',
      });
      console.log(response);

      const filename = `${name}`;
      fs.writeFileSync(filename, response.data, 'binary');
      console.log(filename);

      return filename;
  } catch (error) {
      console.error('Error downloading image from Slack:', error);
      return null;
  }
}

async function getMessageFromSlack(channelId, auth){
  try {
    const res = await app.client.conversations.history({
      token: auth,
      channel: channelId,
      include_all_metadata: 1
      // limit: 3
    })
    //console.log(res);
    // expected response
    // {
    //   ok: true,
    //   messages: [
    //     {
    //       client_msg_id: '8ba0cef0-9e0f-4f4d-97d4-d8c9ba394794',
    //       type: 'message',
    //       text: 'log',
    //       user: 'U06FS9ZRX24',
    //       ts: '1706586616.017669',
    //       blocks: [Array],
    //       team: 'T06F3GH04DQ'
    //     },
    //     {
    //       type: 'message',
    //       text: '',
    //       files: [Array],
    //       upload: false,
    //       user: 'U06FS9ZRX24',
    //       display_as_bot: false,
    //       ts: '1706586631.178189',
    //       client_msg_id: 'd021b957-fe50-4780-9f02-c5830bacf572'
    //     },
    //        ...
    //   ],
    //   has_more: false,
    //   pin_count: 0,
    //   channel_actions_ts: null,
    //   channel_actions_count: 0,
    //   response_metadata: {
    //     scopes: [
    //       'chat:write',...
    //     ],
    //     acceptedScopes: [
    //       'channels:history',...
    //     ]
    //   }
    // }
    const conversationHistory = res.messages;
    // console.log(conversationHistory);
    // console.log("messageの数:"+conversationHistory.length);
    return conversationHistory;
  } catch (err){
    return err;
  }
}

async function searchOldFiles(json, auth){
  console.log(json);
  const messages = json.message;
  console.log(messages);
  json.forEach((element) => {
    if (element.files != null){
      downloadFromSlack(element.files[0].url_private, auth, element.files[0].name).then(filename =>{
        console.log(filename);
      })
    }
  });
}

// async function searchOldImages(auth, query){
//   try {
//     const res = await app.client.search.files({
//       auth: auth,
//       query: query
//     })
//     return res;
//   } catch (err){
//     return err;
//   }
// }

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
  await downloadFromSlack(message.files[0].url_private, app.token).then(filename =>{
    console.log(filename);
  })
  console.log("-------");
});

app.message('log', async ({ message, say })=> {
  // console.log(message);
  console.log("-----");
  await getMessageFromSlack(message.channel, app.token).then(res => {
    console.log("success channel:"+message.channel);
    // console.log(res);
  }).catch(err => {
    console.log("error!!!");
    console.log(err);
  })
  console.log("--------");
  console.log(app.token);
});

(async () => {
  // アプリを起動します
  await app.start();

  console.log('⚡️ Bolt app is running!');
  //slackの過去のメッセージを全取得→searchOldFilesに入れる
  await getMessageFromSlack("C06GKK51EJV", app.token).then(res => {
    searchOldFiles(res, app.token);
    //console.log("success");
  }).catch(err => {
    console.log("error!!");
  })

})();