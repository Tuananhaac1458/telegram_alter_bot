const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
require('dotenv').config();
const URL_DATA = __dirname + process.env.URL_DATA;
const URL_PROJECT = __dirname + process.env.URL_PROJECT;
var dataProject = readData(URL_PROJECT);
var dataInit = readData(URL_DATA);

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.APP_TOKEN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// express energy
var express = require('express');
var app = express();
app.use(express.json())

/*
*** send message 
*/
app.post('/message', function (req, res) {
  jsonBody = req.body;
  if (!jsonBody.project) { 
    res.json({message: "project empty!"}) 
    return
  }

  rooms = _.filter(dataInit, function(ele){
    return _.includes(ele.projects, jsonBody.project)
  })

  rooms.forEach(room => {
    var mes = " <==========> "
    mes +=  currenTime() + "***" + jsonBody.project + "***"
    mes += " <==========>\n "
    mes += JSON.stringify(jsonBody.message, null, 2).replace(/"([^"]+)":/g, '$1:');
    bot.sendMessage(room.id, mes);
  });

  res.json({message: "ok"});
})


/*
*** register project
*/
app.post('/project/add', function(req, res) {
  jsonBody = req.body;
  if(dataProject.includes(jsonBody.name)) {
      res.json({message: "Exist!"});
      return;
  }
  dataProject.push(jsonBody.name)
  dataProject = _.uniq(projects)
  writeFile(dataProject, URL_PROJECT);
  res.json({message: "ok"});
})
      
var server = app.listen(process.env.PORT, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Listen to : http://%s:%s", host, port)

})


/*
*** get list project  
*/
bot.onText(/\/projects/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  let user = {
    ...msg.chat
  }
  bot.sendMessage(chatId, JSON.stringify(dataProject));
  
});

/*
*** Register get message 
*/
bot.onText(/\/register (.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  let projects = [match[1]]
  if (match[1] === 'all') {
    projects = dataProject
  }
  const chatId = msg.chat.id;
  let user = {
    ...msg.chat,
    projects: _.uniq(projects)
  }
  let _index = _.findIndex(dataInit, {id: chatId});
  if(_index !== -1){
    dataInit[_index].projects = _.uniq(dataInit[_index].projects ?  dataInit[_index].projects.concat(projects) : projects)
    writeFile(dataInit, URL_DATA);
    await bot.sendMessage(chatId, "Successfully!");
    return;
  }
  dataInit.push(user)
  writeFile(dataInit, URL_DATA);
  bot.sendMessage(chatId, "Successfully!");
});


// // Listen for any kind of message. There are different kinds of
// // messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });


function readData(url){
    try {
        const data = fs.readFileSync(url, 'utf8');
        // parse JSON string to JSON object
        return JSON.parse(data);
    } catch (err) {
        console.log(`Error reading file from disk: ${err}`);
        return [];
    }
    
}

function writeFile(input, url){
    const dataInput = JSON.stringify(input);
    fs.writeFile(url, dataInput, 'utf8', (err) => {
        if (err) {
            console.log(`Error writing file: ${err}`);
        } else {
            console.log(`File is written successfully!`);
        }
    });
}

function currenTime(){
  return moment(new Date()).format("YYYY/MM/DD hh:mm:ss");
}