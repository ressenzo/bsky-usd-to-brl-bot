import fs from 'fs';
import { AtpAgent } from "@atproto/api";

const TIME_EXECUTION = process.env.EXECUTION_TIME_MS;
const URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL";
const BIDS_FILE_NAME = "bids.txt";
const CHARACTER_FORMAT = "utf8";
const BREAK_LINE = "\n";
const FRACTION_DIGITS = 3;

const agent = new AtpAgent({
    service: "https://bsky.social"
});

await agent.login({
    identifier: process.env.BLUESKY_USERNAME,
    password: process.env.BLUESKY_PASSWORD
});

async function execute() {
    const shouldValidateHour = process.env.VALIDATE_HOUR === "true";
    var date = new Date();

    if (shouldValidateHour &&
        ((date.getUTCHours() >= 0 && date.getUTCHours() < 9) ||
        (date.getUTCHours() >= 18 || date.getUTCHours() <= 23)))
    {
        console.log("Market is closed");
        setTimeout(execute, TIME_EXECUTION);
        return;        
    }
    
    const response = await fetch(URL);
    if (response.status == 200) {
        const data = await response.json();
        console.log(data.USDBRL);

        const bidsInFile = [ 
            fs.readFileSync(BIDS_FILE_NAME, CHARACTER_FORMAT).split(BREAK_LINE)
        ];
        const bids = bidsInFile[0];
        const bidDay = bids[0];
        const today = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
        
        if (bidDay != today) {
            fs.writeFileSync(BIDS_FILE_NAME, "", CHARACTER_FORMAT);
            fs.appendFileSync(BIDS_FILE_NAME, `${today}`)
        }

        const text = getText(data.USDBRL.bid);
        await agent.post({
            text: text
        });
        console.log(text);
        fs.appendFileSync(BIDS_FILE_NAME, `${BREAK_LINE}${roundTo2FractionDigits(data.USDBRL.bid)}`)
    } else {
        console.log(`Error to get data - ${response.status}`);
    }

    setTimeout(execute, TIME_EXECUTION);
}

function getText(currentBid) {
    const formatedBid = formatAsCurrency(currentBid);
    return `No momento, 1 dólar custa ${formatedBid} reais`;
}

function formatAsCurrency(bid) {
    return Number(bid).toLocaleString('pt-br', {
        minimumFractionDigits: FRACTION_DIGITS,
        maximumFractionDigits: FRACTION_DIGITS
    });
}

function roundTo2FractionDigits(bid) {
    return Number(bid).toFixed(FRACTION_DIGITS);    
}

execute();

// https://docs.awesomeapi.com.br/api-de-moedas
// node --env-file=.env index.js
