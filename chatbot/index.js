//Fix bug:
//1.沒有公司資料時，不用再“更多”
//Once tyoe subscribe will be see as subscribe
//subscribeAirticle modify default: ['Facebook',,,,,] to []]
//function greeting() how to actived! ==>https://doofenshmirtzevilincorporated.blogspot.tw/2017/08/messenger-chatbot.html
//title: companyName ==> company 改成 title name
//url ==> bitton (triger)==>web_url
//solution: https://github.com/howdyai/botkit/issues/652
'use strict'
const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const moment = require('moment')
const path = require('path');

const app = express()

app.set('port', (process.env.PORT || 5000))


// Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,'public')));
// ROUTES

app.get('/', function(req, res) {
    res.send("Hi I am a chatbot")
})



    const token = "EAAHvSChIjDUBAKZBp3kyUZBZCB5Akq3yBsvMm15Sys6XuZAhUuJatPdkA1YTej9rCNUkROXOwF7tOGKWveVeQ9qgatYYPIS2K0ZBWJEHSzlZBRxP3OPWTGUTPN4wzo8CWqEviU5rqWZBvk8w6BZC0hOWvEstZAoWbxVOBLJxMNq9G0Vu9vHHw7uT3"    


    //Facebook
    app.get('/webhook/', function(req, res) {
        //Callback URL:ngrok http 5000  token:FacebookChatBot
        if (req.query['hub.verify_token'] === "nccucs_fintech_rentinghouse") { //FacebookChatBot
            return res.send(req.query['hub.challenge'])
        }
        res.send("Wrong token")
    })


app.post('/webhook/', function(req, res) {
    var event_entry = req.body.entry[0];

    if(event_entry.messaging){
        var messaging_events = event_entry.messaging;

        for (var i = 0; i < messaging_events.length; i++) {
            var event = messaging_events[i];
            var sender = event.sender.id;

            if(event.postback){
                if(event.postback.title != undefined){
                    switch (event.postback.title) {
                       /////////////
                        case "登入":
                            login(sender, "Text echo: 請輸入你的API key")
                            break;
                       ////////////
                        case "瀏覽最新房源":
                            browseAirticle(sender, "Text echo: 瀏覽最新房源")
                            break;
                        case "訂閱最新房源":
                            //subscribeActive(sender, "Text echo: 訂閱最新房源")
                            subscribeAirticle(sender, "Text echo: 訂閱最新房源")
                            break;
                        case "回首頁":
                            backHome(sender, "Text echo: 回首頁")
                            break;
                        case "各地房源":
                            checkStocklist(sender, "Text echo: 各地房源", 0)
                            break;
                        case "房屋訂閱管理":
                            subscribeManagement_show_and_modify(sender, "Text echo: 房屋訂閱管理", "subscribeList")
                            break;
                        case "訂閱":
                            subscribeList_addElement(sender,String("Text echo: "+event.postback.payload), event.postback.payload)
                            break;
                        case "更多相關文章":
                            moreAboutairticles(sender, String("Text echo: 更多相關文章"), event.postback.payload)
                            break;
                        case "回上一頁":
                            subscribeList_addElement(sender,"Text echo: 回上一頁", event.postback.payload)
                            break;
                            //case "閱讀此文章":
                            //updatereadHistory(sender,"Text echo: 閱讀此文章", )
                            //break;
                        default:
                            break;
                    }
                }
                else{
                    console.log("event.postback.title == undefined") 
                }
            }

            /*text button*/
            else if(event.message.text && event.message.quick_reply){
                switch(event.message.quick_reply.payload){

                    case "checkStocklist":
                        if(event.message.text == "更多:1"){
                            checkStocklist(sender,"Text echo: 更多資訊",1)
                        }
                        else if(event.message.text !== "更多:1"){
                            subscribe_and_readStocklist(sender, String("Text echo: "+event.message.text), event.message.text)
                        }
                        else{}
                        break;
                    case "subscribeManagement_show_and_modify":
                        subscribeManagement_show_and_modify(sender, String("Text echo: "+event.message.text), event.message.text)
                        break;
                    default:
                        break;
                }
            }
            /*nlp text*/
            else if(event.message.text){

                backHome(sender, "Text echo: 回首頁")
            }
            /*Noisy*/
            else{

            }

            //process.exit(1);
        }
    }
    res.sendStatus(200)
})


////////////////////////////////////////////
////////////////////////////////////////////

/*excute function*/ //fetch all user data from database []
//backHome(sender, "Text echo: 回首頁")
/*interval time:1s and trigger*/
//setInterval(fetchUsersubscribe,1000,"Text echo: 本週訂閱");

//setInterval(fetchUsersubscribe,10000,"最新資訊"); //10s send different value
//setInterval(fetchUsersubscribe,10000,"訂閱資訊"); //10s send different value

///////////////////////////////////////////
////////////////////////////////////////////
function fetchUsersubscribe(text){ ///!!!!!! change!!
    // just fetch user id!!!!!! 
    axios({
        method: 'GET',
        url: 'http://192.168.1.131/trista/v1/FBuser/user_list',
        headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
        responseType:"application/json"
    }).then(function(response) {
        /*Fetch user subscribeUser_inf*/ 
        //var subscribeUser_inf = {};
        //subscribeUser_inf = response.data.data.data 
        var alluserData = response.data.data //a array
        //var subscribeCategory =  subscribeUser_inf.subscribeCategory
        console.log("fetchUsersubscribe");
        /*text:company*/
        var userIdlist = []
        alluserData.forEach(function(user){
            userIdlist.push(user.id)
        });
        //sub_and_latestnotification(userIdlist, text)
        //push latestNews
        if(text == "最新資訊"){
            //var latestNews = require('./latestNews.json');
            for(var i=0; i<userIdlist.length; i++){
                notifyLatestNews(userIdlist[i]); 
            }
        }
        //push subscription
        else if(text == "訂閱資訊"){
            var fs = require('fs');
            var allCompanyInf=JSON.parse(fs.readFileSync('brandandCompanyNews.json'), 'utf8');
            for(var i=0; i<userIdlist.length; i++){
                notifySubscription(userIdlist[i], allCompanyInf); 
            }
        }
        else{}
    })
}

function pushNotification(sender,messageData){
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs : {access_token: token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message : messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log(response.body.error);
        }
    })
} 

//////////////////////////////////////////
/////////////////////////////////////////
/*check dates*/
function dayDiff(airticleDate){
    //console.log(airticleDate)
    var moment = require('moment');
    var nowEnd = moment();
    var nowStart = moment();
    var endDate = nowEnd.add(1,'days')
    var startDate = nowStart.subtract(7,'days')

    //process.exit()
    return (airticleDate.isBefore(endDate) && airticleDate.isAfter(startDate))
}

/*subscribe*/
function notifySubscription(sender, allCompanyInf){

    function pickRandomProperty(obj) {
        var result;
        var count = 0;
        for (var prop in obj)
            if (Math.random() < 1/++count)
                result = prop;
        return result;
    }

    var messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: []
            }
        }
    }

    var subscribeUser_inf=[]
    axios({
        method: 'GET',
        url: 'http://192.168.1.131/trista/v1/FBuser/user/'+sender,
        headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
        responseType:"application/json"
    }).then(function(response) {
        /*Fetch user subscribeUser_inf*/
        subscribeUser_inf = response.data.data.data
        var subscribeCategory =  subscribeUser_inf.subscribeCategory
        //have latestNews
        if(subscribeCategory.indexOf("latestNews") != -1){
            subscribeCategory.splice(subscribeCategory.indexOf("latestNews"),1)
        }
        //No latestNews
        else{}

        //subscribeCategory list,length 
        var airticlecontentlistLength=0
        var searchedCompany=[]
        while(airticlecontentlistLength < 2){
            //choose comapny this week news
            var companyName = subscribeCategory[pickRandomProperty(subscribeCategory)]
            var userData = allCompanyInf.filter(function(value){return value.name == companyName;})
            var airticle_inf = userData[0].companyNews
            for(var j=0; j<airticle_inf.length; j++){
                var date = airticle_inf[j].date
                if(dayDiff(moment(date,"YYYY-MM-DD"))){
                    messageData.attachment.payload.elements.push({
                        title: airticle_inf[j].title,
                        subtitle:  String(airticle_inf[j].brief+": "+date),
                        item_url: airticle_inf[j].newsLink,
                        image_url: airticle_inf[j].airticlePhoto,
                        buttons: [{
                            type: "web_url",
                            url: airticle_inf[j].newsLink,
                            title: "閱讀此文章",
                            webview_height_ratio: "full"
                        },{
                            type:"element_share"
                        },{
                            type: "postback",
                            title: "回首頁",
                            payload: "weekly",
                        }]
                    })

                    airticlecontentlistLength = airticlecontentlistLength + 1
                    if(airticlecontentlistLength >= 3){
                        break;
                    }
                }    
                else{}
            }
            if(searchedCompany.indexOf(companyName) == -1){
                searchedCompany.push(companyName)
            }
            else{
                if(searchedCompany.length >= subscribeCategory.length){
                    break;
                }
                else{
                    continue;
                }
            }
        }


        ///
        //////
        //console.log(messageData)
        //process.exit()
        if(messageData.attachment.payload.elements.length != 0){
            pushNotification(sender,messageData)
        }
        else{}
        /////
    }).catch(function(error){
        console.log(error)
    });

}


/*latestNews*/
function notifyLatestNews(sender){
    axios({
        method: 'GET',
        url: 'http://192.168.1.131/trista/v1/FBuser/user/'+sender,
        headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
        responseType:"application/json"
    }).then(function(response) {
        /*Fetch user subscribeUser_inf*/
        subscribeUser_inf = response.data.data.data
        var subscribeCategory =  subscribeUser_inf.subscribeCategory
        if(subscribeCategory.indexOf("latestNews")!= -1){
            backHome(sender,"Text echo: weekly news")
        }
        else{}
    })

}


///////////////////////////////////////////
///////////Don't need to use below////////
/*Subscribe and latestNews*/
function sub_and_latestnotification(userIdlist, text){
    var latestNews = require('./latestNews.json');
    var fs = require('fs');
    var allCompanyInf = JSON.parse(fs.readFileSync('brandandCompanyNews.json'), 'utf8');
    for(var i=0; i<userIdlist.length; i++){
        //console.log(userIdlist[i])
        sub_and_latestContent(userIdlist[i], allCompanyInf, latestNews); 
    }
}

/*Subscribe and latestNews*/
function sub_and_latestContent(sender, allCompanyInf, latestNews){
    /*Random*/
    //console.log(allCompanyInf)
    //console.log(latestNews)
    function pickRandomProperty(obj) {
        var result;
        var count = 0;
        for (var prop in obj)
            if (Math.random() < 1/++count)
                result = prop;
        return result;
    }

    var messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: []
            }
        }
    }

    var subscribeUser_inf=[]
    axios({
        method: 'GET',
        url: 'http://192.168.1.131/trista/v1/FBuser/user/'+sender,
        headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
        responseType:"application/json"
    }).then(function(response) {
        /*Fetch user subscribeUser_inf*/
        subscribeUser_inf = response.data.data.data
        var subscribeCategory =  subscribeUser_inf.subscribeCategory
        //console.log("Fetch user subscribe information");

        /*Push Notification*/
        //push 1 latestNews
        //unscribe latestNews
        if(subscribeCategory.indexOf("latestNews") == -1){
            //empty
            if(subscribeCategory.length == 0){
                console.log("Nothing in the list")
                //push nothong
            }
            //not empty ==>Condition still need to fix
            else{
                //subscribe 1 comapny
                if(subscribeCategory.length == 1){
                    var companyName = subscribeCategory[0]
                    var parsedJSON = allCompanyInf.filter(function(value){return value.name == subscribeCategory[0];})
                    var companyinformation = parsedJSON[0]
                    parsedJSON = companyinformation.companyNews
                    var parse1 = parsedJSON[pickRandomProperty(parsedJSON)]
                    var title1 = parse1.title
                    var link1 = parse1.newsLink
                    var airticle1 = parse1.newsLink
                    var date1 =  parse1.date
                    var brief1 = parse1.brief
                    var photo1 = parse1.airticlePhoto
                    ////////////////////
                    ///////////////////

                    messageData.attachment.payload.elements.push({
                        title: title1,
                        subtitle: String(brief1+": "+date1),
                        item_url: airticle1,
                        image_url: photo1,
                        buttons: [{
                            type: "web_url",
                            url: airticle1,
                            title: "閱讀此文章",
                            webview_height_ratio: "full"
                        },{
                            type:"element_share"
                        },{
                            type: "postback",
                            title: "回首頁",
                            payload: "browseAirticle",
                        }]
                    })
                    //pushN
                    //console.log(messageData.attachment.payload.elements)
                    pushNotification(sender,messageData)
                }
                //subscribe 2 comapny
                else if(subscribeCategory.length == 2){
                    for(var i=0;i<=1;i++){
                        var companyName = subscribeCategory[i]
                        var parsedJSON = allCompanyInf.filter(function(value){return value.name == companyName;})
                        var companyinformation = parsedJSON[0]
                        parsedJSON = companyinformation.companyNews
                        var parse1 = parsedJSON[pickRandomProperty(parsedJSON)]
                        var title1 = parse1.title
                        var link1 = parse1.newsLink
                        var airticle1 = parse1.newsLink
                        var date1 =  parse1.date
                        var brief1 = parse1.brief
                        var photo1 = parse1.airticlePhoto
                        ////
                        messageData.attachment.payload.elements.push({
                            title: title1,
                            subtitle: String(brief1+": "+date1),
                            item_url: airticle1,
                            image_url: photo1,
                            buttons: [{
                                type: "web_url",
                                url: airticle1,
                                title: "閱讀此文章",
                                webview_height_ratio: "full"
                            },{
                                type:"element_share"
                            },{
                                type: "postback",
                                title: "回首頁",
                                payload: "browseAirticle",
                            }]
                        })
                        ///
                    }
                    //pushN
                    pushNotification(sender,messageData)
                }
                //subscribe more than 3 comapny 
                else{
                    var list=[]
                    var company1 = subscribeCategory[pickRandomProperty(subscribeCategory)]
                    list.push(company1)
                    var company2 = subscribeCategory[pickRandomProperty(subscribeCategory)]
                    while(company1 == company2){
                        var company2 = subscribeCategory[pickRandomProperty(subscribeCategory)]
                    }
                    list.push(company2)
                    var company3 = subscribeCategory[pickRandomProperty(subscribeCategory)]
                    while((company1 == company3) || (company2 == company3) ){
                        var company3 = subscribeCategory[pickRandomProperty(subscribeCategory)]
                    }
                    list.push(company3)

                    for(var i=0;i<=2;i++){
                        var companyName = list[i]
                        var parsedJSON = allCompanyInf.filter(function(value){return value.name == companyName;})
                        var companyinformation = parsedJSON[0]
                        parsedJSON = companyinformation.companyNews
                        var parse1 = parsedJSON[pickRandomProperty(parsedJSON)]
                        var title1 = parse1.title
                        var link1 = parse1.newsLink
                        var airticle1 = parse1.newsLink
                        var date1 =  parse1.date
                        var brief1 = parse1.brief
                        var photo1 = parse1.airticlePhoto
                        messageData.attachment.payload.elements.push({
                            title: title1,
                            subtitle: String(brief1+": "+date1),
                            item_url: airticle1,
                            image_url: photo1,
                            buttons: [{
                                type: "web_url",
                                url: airticle1,
                                title: "閱讀此文章",
                                webview_height_ratio: "full"
                            },{
                                type:"element_share"
                            },{
                                type: "postback",
                                title: "回首頁",
                                payload: "browseAirticle",
                            }]
                        })
                    }
                    /////push
                    //console.log(messageData)
                    pushNotification(sender,messageData)
                }

            }
        }
        //subscribe latestNews (Default)
        else{
            //subscribe latest and others
            if(subscribeCategory.length>1){
                //2 latestNews
                for(var i=0;i<=1;i++){
                    var parsedJSON = require('./latestNews.json');
                    var title1 = parsedJSON[i].title
                    var link1 = parsedJSON[i].newsLink
                    var airticle1 = parsedJSON[i].newsLink
                    var photo1 = parsedJSON[i].airticlePhoto
                    var brief1 = parsedJSON[i].brief
                    var date1= parsedJSON[i].date
                    ///
                    messageData.attachment.payload.elements.push({
                        title: title1,
                        subtitle: String(brief1+": "+date1),
                        item_url: airticle1,
                        image_url: photo1,
                        buttons: [{
                            type: "web_url",
                            url: airticle1,
                            title: "閱讀此文章",
                            webview_height_ratio: "full"
                        },{
                            type:"element_share"
                        },{
                            type: "postback",
                            title: "回首頁",
                            payload: "browseAirticle",
                        }]
                    })
                }
                //1 random from array
                var companyName = subscribeCategory[pickRandomProperty(subscribeCategory)]
                var parsedJSON = allCompanyInf.filter(function(value){return value.name == companyName;})
                var companyinformation = parsedJSON[0]
                parsedJSON = companyinformation.companyNews
                var parse1 = parsedJSON[pickRandomProperty(parsedJSON)]
                var title1 = parse1.title
                var link1 = parse1.newsLink
                var airticle1 = parse1.newsLink
                var date1 =  parse1.date
                var brief1 = parse1.brief
                var photo1 = parse1.airticlePhoto
                ////
                messageData.attachment.payload.elements.push({
                    title: title1,
                    subtitle: String(brief1+": "+date1),
                    item_url: airticle1,
                    image_url: photo1,
                    buttons: [{
                        type: "web_url",
                        url: airticle1,
                        title: "閱讀此文章",
                        webview_height_ratio: "full"
                    },{
                        type:"element_share"
                    },{
                        type: "postback",
                        title: "回首頁",
                        payload: "browseAirticle",
                    }]
                })
                //console.log(messageData.attachment.payload.elements)
                //push
                pushNotification(sender,messageData)
            }

            //only subscribe latestNews
            else{
                //3 latestNews
                browseAirticle(sender, "本週最新房源")
            }
        }

    });
    console.log("send subscribe weekly")
}

///////////Don't need to use above////////
///////////////////////////////////////////

///////////////////////////////
//////////////How to actived!
function greeting(sender){
    /*Fectch the user data*/
    request({
        url: "https://graph.facebook.com/v2.6/"+sender+"?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token="+token,
        qs : {access_token: token},
        method: "POST",
    }, function(error, response, body){
        if (error) {
            console.log("sending error")
        } else if (response.body.error){
            console.log("response body error")
        }
        const content = JSON.parse(body);

        /*Gretting text: Weclome*/
        axios({
            url: String("https://graph.facebook.com/v2.6/me/thread_settings?access_token="+token),
            method: "POST",
            responseType:"application/json",
            data:{
                id:sender,
                data:{
                    setting_type:"greeting",
                    greeting:{
                        text: String("Hi "+content.first_name+", welcome to tradingValley bot.")
                    }
                }
            }
        }).then(function(response){
            console.log("Get user data:greeting")
        }).catch(function(error){
            console.log("error:greeting")
        })

        /*Recorder user data*/
        /*Check the user if exist in the list and saved user data*/
        axios({
            method: 'POST',
            url: 'http://192.168.1.131/trista/v1/FBuser/user/',
            //data: user_inf,
            data:{
                id:sender,
                data:{
                    first_name: content.first_name,
                    last_name: content.last_name,
                    profile_pic: content.profile_pic,
                    locale: content.locale,
                    timezone: content.timezone,
                    gender: content.gender,
                    readHistory: [], //
                    //subscribeCategory: [] //Default: news , random
                    subscribeCategory: [] //Default: news , random
                }
            },
            headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
            responseType:"application/json"
        }).then(function(response) {
            //console.log(response)
            console.log("User data was saved!");
        }).catch(function(error){
            console.log("User data has Existed!");
        });
    })
}
/////////////
////////////
function getDateTime(){
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + sec;
}
////
////

function moreAboutairticles(sender, text, companyName){
    /*Read a Links.json*/
    /*Synchronous version*/
    //var fs = require('fs');
    //var links = JSON.parse(fs.readFileSync('links.json', 'utf8'));
    var fs = require('fs');
    var allCompanyInf = JSON.parse(fs.readFileSync('brandandCompanyNews.json'), 'utf8');

    /*Asynchronous version*/
    /*=====================*/
    //var messageData = {text: text}
    //var parsedJSON = require('./links.json');

    var parsedJSON = allCompanyInf.filter(function(value){ return value.name == companyName;})
    parsedJSON = parsedJSON[0].companyNews


    /*Random*/
    console.log(parsedJSON.length)
    function pickRandomProperty(obj) {
        var result;
        var count = 0;
        for (var prop in obj)
            if (Math.random() < 1/++count)
                result = prop;
        return result;
    }

    var parse1 = parsedJSON[pickRandomProperty(parsedJSON)] 
    var title1 = parse1.title
    var link1 = parse1.newsLink
    var airticle1 = parse1.newsLink
    var date1 =  parse1.date
    var brief1 = parse1.brief
    var photo1 = parse1.airticlePhoto

    var parse2 = parsedJSON[pickRandomProperty(parsedJSON)]
    while(parse2.title == parse1.title && parsedJSON.length>=2)
    {
        parse2 = parsedJSON[pickRandomProperty(parsedJSON)]
    }
    var title2 = parse2.title
    var link2 = parse2.newsLink
    var airticle2 = parse2.newsLink
    var photo2 = parse2.airticlePhoto
    var date2 = parse2.date
    var brief2 = parse2.brief


    /*control maxiuam 3 airticle*/ //==>if okay push!!
    var messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [{
                    title: title1,
                    subtitle: String(brief1+": "+date1),
                    item_url: airticle1,
                    image_url: photo1,
                    buttons: [{
                        type: "web_url",
                        url: airticle1,
                        title: "閱讀此文章",
                        //messenger_extensions: true,
                        //fallback_url: "https://petersfancyapparel.com/fallback",
                        webview_height_ratio: "full" //compact, tall, full
                    },{
                        type:"element_share",
                    },{
                        type: "postback",
                        title: "回上一頁", //回上一頁
                        payload: companyName //!!!!!+===////
                    }
                    ],
                }, {
                    title: title2,
                    subtitle: String(brief2+": "+date2),
                    item_url: airticle2,
                    image_url: photo2,
                    buttons: [{
                        type: "web_url",
                        url: airticle2,
                        title: "閱讀此文章",
                        webview_height_ratio: "full"
                    },{
                        type:"element_share"
                    },{
                        type: "postback",
                        title: "回上一頁", //回上一頁
                        payload: companyName //!!!-----///
                    }]
                }]
            }
        }
    };

    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs : {access_token: token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message : messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log(response.body.error);
        }
    })
}


function subscribeList_addElement(sender, text, companyName){
    var subscribeUser_inf={}
    var resetUser=[]

    axios({
        method: 'GET',
        url: 'http://192.168.1.131/trista/v1/FBuser/user/'+sender,
        headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
        responseType:"application/json"
    }).then(function(response) {
        /*Fetch user subscribeUser_inf*/
        subscribeUser_inf = response.data.data.data
        var subscribeCategory =  subscribeUser_inf.subscribeCategory
        console.log("Fetch user subscribe information");
        /*text:company*/
        subscribeCategory.forEach(function(value){
            resetUser.push(value)
        });
        /*Add company to the list*/
        if(resetUser.indexOf(companyName)>-1 && text!= "Text echo: 回上一頁"){
            console.log(resetUser.indexOf(companyName))//
            console.log(text)
            console.log("Has subscribed")
        }
        else if(resetUser.indexOf(companyName)==-1 && companyName!="回上一頁"){
            resetUser.push(companyName)
            /*PUT update subscribeList*/
            axios({
                method: 'PUT',
                url: 'http://192.168.1.131/trista/v1/FBuser/user/',
                //data: user_inf,
                data:{
                    id:sender,
                    data:{
                        first_name: subscribeUser_inf.first_name,
                        last_name: subscribeUser_inf.last_name,
                        profile_pic: subscribeUser_inf.profile_pic,
                        locale: subscribeUser_inf.locale,
                        timezone: subscribeUser_inf.timezone,
                        gender: subscribeUser_inf.gender,
                        readHistory: subscribeUser_inf.readHistory,
                        subscribeCategory: resetUser
                    }
                },
                headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
                responseType:"application/json"
            }).then(function(response) {
                console.log("User subscribe has been change!");
            }).catch(function(error){
                console.log("PUT! Error: User data has been existed");
            });
        }
        //"回上一頁"
        else{
            subscribe_and_readStocklist(sender, text, companyName)
        }

    }).catch(function(error){
        console.log("GET request error");
    });
}

function subscribe_and_readStocklist(sender, text, companyName){
    console.log(companyName)
    //Add: item_url, subtitle, url
    //
    var fs = require('fs');
    var allCompanyInf = JSON.parse(fs.readFileSync('brandandCompanyNews.json'), 'utf8');
    //var brands_and_photos = require('./links.json');
    //var companyPhotolink = brands_and_photos[companyName]
    //var allCompanyInf = require('./brandandcCompanyNews1.json');
    var parsedJSON = allCompanyInf.filter(function(value){ return value.name == companyName;})
    var companyinformation = parsedJSON[0]
    parsedJSON = companyinformation.companyNews

    /*Random*/
    //console.log(parsedJSON.length)
    function pickRandomProperty(obj) {
        var result;
        var count = 0;
        for (var prop in obj)
            if (Math.random() < 1/++count)
                result = prop;
        return result;
    }


    var parse1 = parsedJSON[pickRandomProperty(parsedJSON)]
    var title1 = parse1.title
    var link1 = parse1.newsLink
    var airticle1 = parse1.newsLink
    var date1 =  parse1.date
    var brief1 = parse1.brief
    var photo1 = parse1.airticlePhoto


    //process.exit(1)

    var messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [{
                    title: companyName,
                    subtitle: String("點選訂閱把"+companyName+"加入訂閱清單"),
                    item_url: companyinformation.photoLink,
                    image_url: companyinformation.photoLink,
                    //item_url:String("https://c8a9d666.ngrok.io/companyPhoto/"+companyName+".png"),
                    //image_url:String("https://c8a9d666.ngrok.io/companyPhoto/"+companyName+".png"),
                    buttons: [{
                        type: "postback",
                        title: "訂閱",
                        payload: companyName  ///!!!!!!!!!!!!///
                    },{
                        type: "postback",
                        title: "回首頁",
                        payload: "subscribe_and_readStocklist"
                    }],
                },{
                    title: title1,
                    subtitle: String(brief1+": "+date1),
                    item_url: airticle1,//
                    image_url: photo1,
                    buttons: [{
                        type: "web_url",
                        url: airticle1,
                        title: "閱讀此文章",
                        webview_height_ratio: "full" //compact, tall, full
                    },{
                        type:"element_share",
                    },{
                        type: "postback",
                        title: "更多相關文章",//String("更多"+companyName+"相關文章"),
                        payload: companyName /////!!!!!!!!/////
                    }],
                }],
            }
        }
    }


    //console.log(messageData)
    //process.exit()

    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs : {access_token: token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message : messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log(response.body.error);
        }
    })
}

function subscribeManagement_show_and_modify(sender, text, subscribeCompany){
    /*Fetch user subscribeUser_inf*/
    var subscribeCompany_list=[];
    var messageData={};
    var subscribeUser_inf = {};//
    var resetUser=[];//
    ///////////////////
    ///////////////////
    var subscribeCategory = ['最新房源','台北市','台南市','基隆市']
    subscribeCategory.forEach(function(value){
        subscribeCompany_list.push({
            content_type:"text",
            title:value,
            payload:"subscribeManagement_show_and_modify",
        })
    });
    /*subscribe list show and modify*/
    if(subscribeCompany=="subscribeList"){
        subscribeCompany_list.push({
            content_type:"text",
            title:"完成", //use payload to change page
            payload:"subscribeManagement_show_and_modify",
        })
        messageData = {
            text:"請選擇欲取消訂閱之主題，完成後請點選'完成'",
            quick_replies:subscribeCompany_list
            //quick_replies:['最新房源','台北市','台南市','基隆市']
        }
        /*Facebook API:subscribe content*/
        request({
            url: "https://graph.facebook.com/v2.6/me/messages",
            qs : {access_token: token},
            method: "POST",
            json: {
                recipient: {id: sender},
                message : messageData,
            }
        }, function(error, response, body) {
            if (error) {
                console.log("sending error")
            } else if (response.body.error) {
                //console.log(response.body)
                console.log(response.body.error);
            }
        })
    }
    else if(subscribeCompany=="完成"){
        backHome(sender, "Text echo: 完成") //
    }
    
    /*subscribe list updates:text*/
    else{
        subscribeCompany_list.forEach(function(value){
            resetUser.push(value.title)
        });
        var nth_element = resetUser.indexOf(subscribeCompany);
        resetUser.splice(nth_element,1);
        
        /*Update subscribeList*/
        subscribeCompany_list = []
        resetUser.forEach(function(value){
            subscribeCompany_list.push({
                content_type:"text",
                title:value,
                payload:"subscribeManagement_show_and_modify",
            })
        });
        /*modify the subscribe list*/
        subscribeCompany_list.push({
            content_type:"text",
            title:"完成", //use payload to change page
            payload:"subscribeManagement_show_and_modify",
        })
        messageData = {
            text:"請選擇欲取消訂閱之主題，完成後請點選'完成'",
            quick_replies:subscribeCompany_list
        }
        /*Facebook API:subscribe content*/
        request({
            url: "https://graph.facebook.com/v2.6/me/messages",
            qs : {access_token: token},
            method: "POST",
            json: {
                recipient: {id: sender},
                message : messageData,
            }
        }, function(error, response, body) {
            if (error) {
                console.log("sending error")
            } else if (response.body.error) {
                //console.log(response.body)
                console.log(response.body.error);
            }
        })
    }
}


function checkStocklist(sender, text, part){
    var fs = require('fs');
    var brands_and_photos = JSON.parse(fs.readFileSync(String('brands_and_photos_p'+part+'.json'), 'utf8'));
    var data=[];
    for(var key in brands_and_photos){
        data.push({
            content_type:"text",
            title:key,
            image_url:brands_and_photos[key],
            payload:"checkStocklist"
        })
    }
    //更多 選項
    part = part+1
    if(part < 2){
        data.push({
            content_type:"text",
            title:String("更多:"+part), //use payload to change page
            payload:"checkStocklist"
        })
    }

    var conversation = "我們列出各地房源，你也可以點選'更多'來找尋你感興趣的";
    /*
    if(part!=0){
        conversation="更多資訊";
    }
    else{
        conversation="我們列出各地房源，你也可以點選'更多'來找尋你感興趣的"
    }
     */
    var messageData = {
        text: conversation,
        quick_replies:data
    }

    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs : {access_token: token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message : messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log(response.body.error);
        }
    })
}

function login(sender, text){
    var messageData = {text:"請輸入API key"};

    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs : {access_token: token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message : messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log(response.body.error);
        }
    })
}

function subscribeAirticle(sender, text){
    /*Fectch the user data*/
    axios({
        method: 'GET',
        url: 'http://192.168.1.131/trista/v1/FBuser/user/'+sender,
        headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
        responseType:"application/json"
    }).then(function(response) {
        /*Fetch user subscribeUser_inf*/
        var subscribeUser_inf = response.data.data.data
        var subscribeCategory =  subscribeUser_inf.subscribeCategory
        if(subscribeCategory.indexOf("latestNews") == -1){

            axios({
                //method: 'POST',
                method: 'PUT',
                url: 'http://192.168.1.131/trista/v1/FBuser/user/',
                //data: user_inf,
                data:{
                    id:sender,
                    data:{
                        first_name: subscribeUser_inf.first_name,
                        last_name: subscribeUser_inf.last_name,
                        profile_pic: subscribeUser_inf.profile_pic,
                        locale: subscribeUser_inf.locale,
                        timezone: subscribeUser_inf.timezone,
                        gender: subscribeUser_inf.gender,
                        readHistory: [], //
                        //subscribeCategory: [] //Default: news , random
                        subscribeCategory: subscribeCategory.push("latestNews") //Default: news , random
                    }
                },
                headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
                responseType:"application/json"
            }).then(function(response) {
                //console.log(response)
                console.log("User latestNews subscribe!");
            }).catch(function(error){
                console.log("User latestNews subscribe error!");
            });
        }
        ///
        else{}
    })
}




function subscribeActive(sender, text){
    /*Fectch the user data*/
    request({
        url: "https://graph.facebook.com/v2.6/"+sender+"?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token="+token,
        qs : {access_token: token},
        method: "GET",
    }, function(error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log("response body error")
        }

        console.log("==========================")
        const content = JSON.parse(body);
        //const user_inf = JSON.stringify(content);

        /*Check the user if exist in the list and saved user data*/
        axios({
            method: 'POST',
            url: 'http://192.168.1.131/trista/v1/FBuser/user/',
            //data: user_inf,
            data:{
                id:sender,
                data:{
                    first_name: content.first_name,
                    last_name: content.last_name,
                    profile_pic: content.profile_pic,
                    locale: content.locale,
                    timezone: content.timezone,
                    gender: content.gender,
                    readHistory: [], //
                    //subscribeCategory: [] //Default: news , random
                    subscribeCategory: ["latestNews","Google","Netflix","Facebook"] //Default: news , random
                }
            },
            headers: {"Pragma-T": "e8c62ed49e57dd734651fad21bfdaf40"},
            responseType:"application/json"
        }).then(function(response) {
            //console.log(response)
            console.log("User data was saved!");
        }).catch(function(error){
            console.log("User data has Existed!");
        });
    })
}



function browseAirticle(sender, text) {  //browseAirticle ==> sendMessage

    var parsedJSON = require('./latestNews.json');

    var title1 = parsedJSON[0].title 
    var link1 = parsedJSON[0].newsLink
    var airticle1 = parsedJSON[0].newsLink
    var photo1 = parsedJSON[0].airticlePhoto
    var brief1 = parsedJSON[0].brief
    var date1= parsedJSON[0].date

    var title2 = parsedJSON[1].title
    var link2 = parsedJSON[1].newsLink
    var airticle2 = parsedJSON[1].newsLink
    var photo2 = parsedJSON[1].airticlePhoto
    var brief2 = parsedJSON[1].brief
    var date2= parsedJSON[1].date

    var title3 = parsedJSON[2].title
    var link3 = parsedJSON[2].newsLink
    var airticle3 = parsedJSON[2].newsLink
    var photo3 = parsedJSON[2].airticlePhoto
    var brief3 = parsedJSON[2].brief
    var date3 = parsedJSON[2].date

    var messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [{
                    title: title1,
                    subtitle: String(brief1+": "+date1),
                    item_url: airticle1,
                    image_url: photo1,
                    buttons: [{
                        type: "web_url",
                        url: airticle1, //////////!!!!!!
                        title: "閱讀此文章",
                        //messenger_extensions: true,
                        //fallback_url: "https://petersfancyapparel.com/fallback",
                        webview_height_ratio: "full" //compact, tall, full
                    },{
                        type:"element_share",
                    },{
                        type: "postback",
                        title: "回首頁",
                        payload: "browseAirticle"
                    }
                    ],
                }, {
                    title: title2,
                    subtitle: String(brief2+": "+date2),
                    item_url: airticle2,
                    image_url: photo2,
                    buttons: [{
                        type: "web_url",
                        url: airticle2,
                        title: "閱讀此文章",
                        webview_height_ratio: "full"
                    },{
                        type:"element_share"
                    },{
                        type: "postback",
                        title: "回首頁",
                        payload: "browseAirticle",
                    }]
                },{
                    title: title3,
                    subtitle: String(brief3+": "+date3),
                    item_url: airticle3,
                    image_url: photo3,
                    buttons: [{
                        type: "web_url",
                        url: airticle3,
                        title: "閱讀此文章",
                        webview_height_ratio: "full"
                    },{
                        type:"element_share"
                    },{
                        type: "postback",
                        title: "回首頁",
                        payload: "browseAirticle",
                    }]
                }]
            }
        }
    };


    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs : {access_token: token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message : messageData,
        }
    }, function(error, response, body) {
        /*Judge if read: GET: redirect 3url*/
        //API
        //if(Result){//write into database}

        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log(response.body.error);
        }
    })

}



function backHome(sender, text){
    var link = "https://www.tradingvalley.com"
    var photo = "https://www.tradingvalley.com/images/sitethumb.jpg"
    var messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [{
                    title:"House Renting",
                    subtitle:"建立於blockchain上的租屋平台",
                    //image_url:photo,
                    image_url:'http://www.humblesavers.com/wp-content/uploads/2012/10/Investment-property.jpg',
                    buttons:[{
                        type: "web_url",
                        url: link,
                        title: "關於我們",
                        webview_height_ratio: "full" //compact, tall, full
                    },{
                        type: "postback",
                        title: "房屋訂閱管理",
                        payload: "backHome"
                    },{
                        type: "postback",
                        title: "登入",
                        payload: "login"
                    }]
                },{
                    title:"最新房源",
                    subtitle:"瀏覽與訂閱最新的房屋資訊",
                    image_url:"https://static01.nyt.com/images/2017/11/12/realestate/12IHH-BELGIUM-EDIT-slide-C9IO/12IHH-BELGIUM-EDIT-slide-C9IO-superJumbo.jpg",
                    buttons:[{
                        type: "postback",
                        title: "瀏覽最新房源",
                        payload: "backHome"
                    },{
                        type: "postback",
                        title: "訂閱最新房源",
                        payload: "backHome"
                    }]
                },{
                    title:"各地房源介紹",
                    subtitle:"為您介紹更多各地房源",
                    image_url:"https://www.fubon.com/banking/images/personal/fund_trust/TW/Fund_Homepage.jpg",
                    buttons:[{
                        type: "postback",
                        title: "各地房源",
                        payload: "backHome"
                    }]
                }]
            }
        }
    };

    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs : {access_token: token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message : messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log(response.body.error);
        }
    })
}



////////
////////
app.listen(app.get('port'), function() {
    console.log("running: port",app.get('port')) //app,get('port')
})
