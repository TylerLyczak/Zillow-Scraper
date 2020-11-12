
const puppeteer = require('puppeteer');

(async () => {

    // Makes the browser for puppeteer to run on
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
    });

    // Makes a page to load the mixer screen
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', request => {
        request.continue();
    });

    // Goes to the mixer page
    await page.goto('https://www.zillow.com/homes/60606_rb/',)
        .catch((e) => {console.log(e)});
    page.on('load', () => console.log('=====Page loaded!====='));

    /*
    // Makes a cookie to view mature streams
    const cookie = {
        'name': "https://www.zillow.com",
        'personalization_id': "v1_hxpphgboDyeKXFReTcI23g==",
        'KruxAddition': true,
        'KruxPixel': true,
        'zgsession': '1|45e97927-5f8f-47d5-94f1-67efc2f784ee',
        'zjs_anonymous_id': '%22f6401f76-8d10-4064-affb-f4221be11e64%22',
        'zjs_user_id': null
    };
    

    // Sets the cookie
    await page.setCookie(cookie);
    */

    await page.waitForSelector('[class="photo-cards photo-cards_wow photo-cards_short"]');

    /*
    // Store all of the articles, which are the apartments/condos for sale
    let content = await page.evaluate(() => {
        let divs = [...document.querySelectorAll('article')];
        return divs.map((div) => div.textContent);
    });

    for (let i=0; i<content.length; i++)    {
        if (i!=7)   continue;
        
        let split = content[i].split(',');
        //console.log(split);

        // Get address and zip code based off of the split
        let address = split[0];
        let zip_code = split[2].substring(4, 9);

        // Get the number of bedrooms
        let bdIndex = content[i].indexOf('bd');
        let bedroomNum = content[i].substring(bdIndex-2, bdIndex-1);

        // Get the number of bathrooms
        let baIndex = content[i].indexOf('ba');
        let bathroomNum = content[i].substring(baIndex-2, baIndex-1);

        // Get the value of the property
        let moneyStart = content[i].indexOf("$");
        let value = content[i].substring(moneyStart+1, bdIndex-2);
        value = value.replace(/,/g,"");

        // Get the sqft of the property
        let sqftIndex = content[i].indexOf('sqft');
        let sqft = content[i].substring(baIndex+2, sqftIndex-1);

        
        console.log(content[i]);
        console.log(split);
        //console.log(address + ":" + zip_code + ":" + bedroomNum + ":" + value);
        console.log('address: ' + address);
        console.log('zip-code: ' + zip_code);
        console.log('value: ' + value);
        console.log('Number of bedrooms: ' + bedroomNum);
        console.log('Number of bathrooms: ' + bathroomNum);
        console.log('SQFT: ' + sqft);
        console.log('\n');
        break;
        
    }
    */

    //const selectors = await page.$$('article');
    //console.log(selectors.length)
    //console.log(content.length)
    //selectors.forEach( (element) => { console.log(element); });

    const data = await page.evaluate(() => {
        const tds = Array.from(document.querySelectorAll('article'))
        return tds.map(td => {
           //var txt = td.innerHTML;
           return td.innerText.trim();
        });
    });
  
    //console.log(data);
    for (var i=0; i<data.length; i++)   {
        //if (i!=7)   continue;
        //console.log(data[i]);
        //console.log(typeof data[i]);

        // Break up the newlines from the string
        let strArr = data[i].split('\n');
        
        // Get the address
        let addressArr = strArr[0].split(',');
        let address = addressArr[0]

        // Get the zip code
        let zipArr = addressArr[addressArr.length-1].trim()
        zipArr = zipArr.split(" ");
        let zip_code = zipArr[zipArr.length-1]

        // Get the value
        let value = strArr[2].replace(/\D/g,'');

        // Get the number of bedrooms
        // Some don't have bedrooms, so account for it
        let bedroomNum = "null"
        let bdIndex = strArr[3].indexOf('bd')
        if (bdIndex != 0)   {
            bedroomNum = strArr[3].substring(0, bdIndex-1);
            bedroomNum = bedroomNum.replace(/\D/g,'');

            if (bedroomNum == "")   bedroomNum = "null";
        }

        // Get the number of bathrooms
        // Some don't have bathrooms, so account for it
        let bathroomNum = "null"
        let baIndex = strArr[3].indexOf('ba')
        if (baIndex != 0)   {
            bathroomNum = strArr[3].substring(baIndex-2, baIndex-1);

            bathroomNum = bathroomNum.replace(/\D/g,'');

            if (bathroomNum == "")   bathroomNum = "null";
        }

        // Get the sqft of the property
        // Some dont have sqft, so account for it
        const sqftIndex = strArr[3].indexOf('sqft');
        let sqft = strArr[3].substring(baIndex+2, sqftIndex-1).replace(/\D/g,'')
        
        if (sqft == "") sqft = "null";



        console.log('address: ' + address);
        console.log('zip-code: ' + zip_code);
        console.log('value: ' + value);
        console.log('Number of bedrooms: ' + bedroomNum);
        console.log('Number of bathrooms: ' + bathroomNum);
        console.log('SQFT: ' + sqft);
        console.log('\n');
        //break;
    }
    



    /*
    // Click on the sign-in button
    await page.waitForSelector('[class="mdsButton_Kaw7D contained_2JbA5 signInButton_3fCKe"]');
    await page.click ('[class="mdsButton_Kaw7D contained_2JbA5 signInButton_3fCKe"]');

    // Click on the sign-in with microsoft button
    await page.waitForSelector('[class="mdsButton_Kaw7D showFocus_2wbiS signInBtn_1WMJ-"]');
    const newPagePromise = new Promise(x => page.once('popup', x));
    await page.click ('[class="mdsButton_Kaw7D showFocus_2wbiS signInBtn_1WMJ-"]');

    // Pop-up window opens
    const newPage = await newPagePromise;

    // Enter email address into field
    await newPage.waitForSelector('[type="email"]');
    await newPage.$eval('input[type="email"]', (el, value) => el.value = value, email_address);

    // Click the submit button
    await newPage.click('input[type="submit"]');

    // Type in the password
    await newPage.waitForSelector('[value="Sign in"]');
    await newPage.$eval('input[type="password"]', (el, value) => el.value = value, password);

    // Click the signin button
    await newPage.click('input[type="submit"]');

    // Now we are signed-in, go to the paladins stream
    await page.goto('https://mixer.com/browse/categories/1386',)
        .catch((e) => {console.log(e)});

    // Load the page of all Paladin games
    await page.waitForSelector('[class="contentGridGroup_1iaee"]');

    // Click on the first page on the streams list
    await page.click('[class="container_ZqIuE cardStyle_8PoHy"]');

    // Interval function to keep refreshing every 10 minutes
    setInterval( async () => {
        // Now we are signed-in, go to the paladins stream
        await page.goto('https://mixer.com/browse/categories/1386',)
            .catch((e) => {console.log(e)});

        // Load the page of all Paladin games
        await page.waitForSelector('[class="contentGridGroup_1iaee"]');

        // Click on the first page on the streams list
        await page.click('[class="container_ZqIuE cardStyle_8PoHy"]');
    }, 600000);
    */

    await browser.close();
    
})();