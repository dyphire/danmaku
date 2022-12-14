const axios = require('axios');
const tgbot = require("../tgbot/tgbot.js");

const rootPath = 'https://eservice.ssm.gov.mo/covidvacbook/'
const chatID = 619935997;
const IDTYPES = ["J", "f", "M", "h", "O", "n"]

console.log('covidbook.js loaded')

async function GetLocationQuotaList() {
    const url = rootPath + 'Booking/GetLocationQuotaList';
    const res = await axios.post(url, {});
    const data = res.data;
    const mrnalocationquotalist = data.filter(locationquota => (locationquota.rspsrv === 'HC6' || locationquota.rspsrv === 'HC8' || locationquota.rspsrv === 'CHCSJ(MRNA)' || locationquota.rspsrv === 'CHCSJ2(MRNA)' || locationquota.rspsrv === 'SSM1(MRNA)'));
    const ivlocationquotalist = data.filter(locationquota => (locationquota.rspsrv === 'HC1' || locationquota.rspsrv === 'HC2' || locationquota.rspsrv === 'HC3' || locationquota.rspsrv === 'HC4' || locationquota.rspsrv === 'HC5' || locationquota.rspsrv === 'HC7' || locationquota.rspsrv === 'HC9' || locationquota.rspsrv === 'HC11' || locationquota.rspsrv === 'CHCSJ' || locationquota.rspsrv === 'CHCSJ2' || locationquota.rspsrv === 'KW1' || locationquota.rspsrv === 'SSM1' || locationquota.rspsrv === 'MUST1' || locationquota.rspsrv === 'FAOM1' || locationquota.rspsrv === 'FAOM2' || locationquota.rspsrv === 'SSM2'));
    return { ivlocationquotalist, mrnalocationquotalist };
}

async function GetLocationPeriodByIdtype(idtype) {
    const url = rootPath + 'Booking/GetLocationPeriodByIdtype';
    var data = { idtype: idtype };
    const res = await axios.post(url, data);
    return { periodlist: res.data }
}

async function getlocationbyidtype(idtype) {
    var data = { idtype: idtype };
    var url = rootPath + 'Booking/GetLocationByIdtype';
    const res = await axios.post(url, data);
    return { location: res.data }
}

async function GetBookDate(idtype) {
    var url = rootPath + 'Booking/GetBookDate';
    var checkquota = false;

    let date = new Date()
    let year = date.getFullYear()
    let month = (date.getMonth() + 1).toString().padStart(2, '0')
    let day = date.getDate().toString().padStart(2, '0')
    var time2 = `${year}${month}${day}`

    var data = { idtype: idtype, afterdate: time2, checkquota: checkquota };
    const res = await axios.post(url, data);
    return { bookdatelist: res.data }
}

async function GetlocationList() {
    var url = rootPath + 'Booking/GetlocationList';
    const res = await axios.post(url, {});
}

async function main() {
    const bot = tgbot.hkaliyun;

    const { ivlocationquotalist, mrnalocationquotalist } = await GetLocationQuotaList();
    const quotalist = mrnalocationquotalist;

    console.log('covidbook query')
    //筛选出可预约的日期
    for (const idtype of IDTYPES) {
        const { bookdatelist } = await GetBookDate(idtype);
        const { location } = await getlocationbyidtype(idtype)
        const name = location[0].name_c;
        if (bookdatelist.length != 0) {
            bot.sendMessage(chatID, name + "\n" + bookdatelist.join('\n'));
        }
    }

    // // 筛选出当日有余量的接种站
    // const quotalistfilter = quotalist.filter(x => x.sum != '0')
    // if (quotalistfilter.length != 0) {
    //     console.log('有余量');
    //     const time2 = new Date().toLocaleTimeString();
    //     bot.sendMessage(chatID, `当前时间：${time2}，以下是有余量的接种站:`);
    //     for (const l of quotalistfilter) {
    //         bot.sendMessage(chatID, `${l.name_c} : ${l.sum}`);
    //     }
    // } else console.log('无余量');

    // 遍历每个接种站尚有余额之时段
    // for (const item of quotalist) {
    //     const { location } = await getlocationbyidtype(item.idtype)
    //     const { periodlist } = await GetLocationPeriodByIdtype(item.idtype)
    //     if (periodlist.length != 0) {
    //         const name = location[0].name_c;
    //         const periodlisttext = periodlist.map(l => `${l.booktime}  餘額 : ${l.ava_quota}`)
    //         bot.sendMessage(chatID, name + '\n' + periodlisttext.join('\n'));
    //     }
    // }

}

module.exports = main;

if (!module.parent) {
    // 引入环境变量
    require("dotenv").config('../.env');
    main()
}