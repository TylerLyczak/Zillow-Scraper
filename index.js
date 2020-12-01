
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const userAgent = require('user-agents');

function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}


fs.writeFile('data.csv', 'Address, Zip Code, Value, SQFT, Price Per SQFT, Number of Bedrooms, Number of bathrooms, Number of Full Bathrooms, Year Built, Heating, Cooling, Parking, Type, Has Garage, Number of Stories\n', function(err) {
    if (err) throw err;
    console.log("File created");
});

let initPage = 1;
let initUrl = "https://www.zillow.com/chicago-il/" + initPage.toString() + "_p/";
let numOfPages = 20;

(async () => {

    let countAdded = 0;
    let countSkip = 0;
    let countTotal = 0;

    while (initPage <= numOfPages)  {

        countAdded = 0;
        countSkip = 0;

        console.log("Page: " + initPage);

        // Makes the browser for puppeteer to run on
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false,
        });
    
        // Makes a page to load the mixer screen
        const page = await browser.newPage();
    
        await page.setRequestInterception(true);
    
        page.on('request', (request) => {
            if (request.resourceType() === 'image') request.abort();
            else request.continue();
        });
            
        //await page.goto('https://www.zillow.com/homes/Chicago,-IL_rb/', {timeout:0});
        await page.goto(initUrl);
    
        await page.setViewport({ width: 800, height: 600 });
    
        await page.waitForSelector('[class="photo-cards photo-cards_wow photo-cards_short"]', {timeout:0});
    
        await wait(2000);

        // Wait for listings to be loaded
        await page.waitForSelector('[class="photo-cards photo-cards_wow photo-cards_short"]', {timeout:0});

        // Get all of the houses
        const getThemAll = await page.$$('[class="list-card list-card_not-saved"]');

        countTotal = getThemAll.length;

        // Loop through all of the houses
        for (var i=0; i<getThemAll.length; i++)  {
            await wait(500);

            // Get the element from the array
            const elem = getThemAll[i];

            // Make a promis and click on it
            await Promise.all([
                elem.click()
                //page.waitForNavigation({waitUntil: 'networkidle0'})
            ]);

            // Wait for the 'Facts and Features' section to load
            await page.waitForSelector('[class="ds-home-fact-list"]', {timeout:0});

            let type = "null";
            let yearBuilt = "null";
            let heating = "null";
            let cooling = "null";
            let parking = "null";
            let pricePerSqft = "null";
            let price = "null";
            let address = "null";
            let zip_code = "null";
            let bedroomNum = "null";
            let bathroomNum = "null";
            let fullBathroomNum = "null";
            let hasGarage = "null";
            let sqft = "null";
            let stories = "null";

            const addrAndZip = await page.evaluate(
                () => Array.from(
                document.querySelectorAll('h1'),
                a => a.innerText.trim()
                )
            );
            
            let addrAndZipArr = addrAndZip[0].split(',');
            address = addrAndZipArr[0]
            address = address.replace(/,/g, "");
            zip_code = addrAndZipArr[2].slice((" IL ").length, addrAndZipArr[2].length);
            zip_code = zip_code.replace(/\D/g,'');

            if (address.includes("Floor plan:") || address.includes("Undisclosed Address") || address.includes("plan")) {
                await wait(500);
                await page.goBack({waitUntil: 'networkidle0'});
                countSkip ++;
                continue;
            }
            
            let text = await page.evaluate(
                () => Array.from(
                    document.querySelectorAll('[class="Text-c11n-8-11-1__aiai24-0 hqfqED"]'), 
                    element => element.textContent)
            );

            let titles = await page.evaluate(
                () => Array.from(
                    document.querySelectorAll('[class="Text-c11n-8-11-1__aiai24-0 sc-pTWqp jMCspH"]'), 
                    element => element.textContent)
            );

            text.shift();

            for (var j=0; j<titles.length; j++) {

                if (titles[j] == "Type: ")  {
                    type = text[j]
                }
                else if (titles[j] == "Year Built: ")    {
                    yearBuilt = text[j]
                }
                else if (titles[j] == "Heating: ")   {
                    heating = text[j]
                }
                else if (titles[j] == "Cooling: ")   {
                    cooling = text[j]
                }
                else if (titles[j] == "Parking: ")   {
                    parking = text[j]
                }
                else if (titles[j] == "Price/sqft: ")    {
                    pricePerSqft = text[j]
                }
            }

            text = text.slice(titles.length, text.length);

            for (var j=0; j<text.length; j++)   {

                if (text[j].includes("Bedrooms: ")) {
                    bedroomNum = text[j].slice(("Bedrooms: ").length, text[j].length);
                    bedroomNum = bedroomNum.replace(/\D/g,'');
                }
                else if (text[j].includes("Full bathrooms: "))  {
                    fullBathroomNum = text[j].slice(("Full bathrooms: ").length, text[j].length);
                    fullBathroomNum = fullBathroomNum.replace(/\D/g,'');
                }
                else if (text[j].includes("Bathrooms: "))   {
                    bathroomNum = text[j].slice(("Bathrooms: ").length, text[j].length);
                    bathroomNum = bathroomNum.replace(/\D/g,'');
                }
                else if (text[j].includes("Has garage: "))  {
                    hasGarage = text[j].slice(("Has garage: ").length, text[j].length);
                }
                else if (text[j].includes("Total interior livable area: ")) {
                    sqft = text[j].slice(("Total interior livable area: ").length, text[j].length-(" sqft").length);
                    sqft = sqft.replace(/\D/g,'');
                }
                else if (text[j].includes("Stories: ")) {
                    stories = text[j].slice(("Stories: ").length, text[j].length);
                    stories = stories.replace(/\D/g,'');
                }
            }

            // Get the price
            const ele = await page.$(".ds-summary-row-content");
            const valueNotFormat = await page.evaluate(ele => ele.textContent, ele);
            const value = (valueNotFormat.substring(1, (valueNotFormat.indexOf(" bd")-1))).replace(/\D/g,'');

            /*
            console.log(address)
            console.log(zip_code)
            console.log(price)
            console.log(sqft)
            console.log(pricePerSqft)
            console.log(bedroomNum)
            console.log(bathroomNum)
            console.log(fullBathroomNum)
            console.log(yearBuilt)
            console.log(heating)
            console.log(cooling)
            console.log(parking)
            console.log(type)
            console.log(hasGarage)
            console.log(stories)
            */
            

            intPrice = parseInt(value);
            intSqft = parseInt(sqft);
            if (intSqft != 0)   {
                pricePerSqft = intPrice/intSqft
                pricePerSqft = Math.round(pricePerSqft)
            }

            
            fs.appendFile('data.csv', address + "," + zip_code + "," + value + "," + sqft + "," + pricePerSqft + "," + bedroomNum + "," + 
                bathroomNum + "," + fullBathroomNum + "," + yearBuilt + "," + heating + "," + cooling + "," + parking + "," + 
                type + "," + hasGarage + "," + stories + "\n", function(err)  {
                if (err) throw err;
                //console.log('Appened');
            });
            

            await wait(500);
            await page.goBack({waitUntil: 'networkidle0'});
            //await wait(1000);
            countAdded++;
        }

        console.log("Appended: " + countAdded);
        console.log("Skipped: " + countSkip);
        console.log("Total: " + countTotal);
        
        await browser.close();
        console.log("new browser");
        initPage = initPage + 1;
        initUrl = "https://www.zillow.com/chicago-il/" + initPage.toString() + "_p/";
        await wait(1000);
    }
})();
