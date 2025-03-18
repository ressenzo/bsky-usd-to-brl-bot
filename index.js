import fs from 'fs';

const TIME_EXECUTION = process.env.EXECUTION_TIME_MS;
const URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL";
const BIDS_FILE_NAME = "bids.txt";
const CHARACTER_FORMAT = "utf8";

async function getValue() {
    const shouldValidateHour = process.env.VALIDATE_HOUR === "true";
    var date = new Date();

    if (shouldValidateHour &&
        ((date.getUTCHours() >= 0 && date.getUTCHours() < 9) ||
        (date.getUTCHours() >= 18 || date.getUTCHours() <= 23)))
    {
        console.log("Market is closed");
        setTimeout(getValue, TIME_EXECUTION);
        return;        
    }
    
    const response = await fetch(URL);
    if (response.status == 200) {
        const data = await response.json();
        console.log(data.USDBRL);

        const bids = new Set(fs.readFileSync(BIDS_FILE_NAME, CHARACTER_FORMAT).split("\n"));
        const bidDay = bids.values().next().value; 
        const today = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
        
        if (bidDay != today) {
            fs.writeFileSync(BIDS_FILE_NAME, "", CHARACTER_FORMAT);
            fs.appendFileSync(BIDS_FILE_NAME, `${today}\n`)
        }

        fs.appendFileSync(BIDS_FILE_NAME, `${data.USDBRL.bid}\n`)

    } else {
        console.log(`Error to get data - ${response.status}`);
    }

    setTimeout(getValue, TIME_EXECUTION);
}

getValue();

// https://docs.awesomeapi.com.br/api-de-moedas
// node --env-file=.env index.js
