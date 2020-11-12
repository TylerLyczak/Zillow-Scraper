
const puppeteer = require('puppeteer');

(async () => {

    // Makes the browser for puppeteer to run on
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
    });

    // Makes a page to load the mixer screen
    const page = await browser.newPage();

    /*
    // Makes a cookie to view mature streams
    const cookie = {
        'name': '_sde_allowedInSession',
        'value': '1',
        'domain': 'mixer.com',
        'path': '/',
        'Expires / Max-Age': 'Session',
        'size': '22',
        'priority': 'Medium',
    };
    */

    // Sets the cookie
    //await page.setCookie(cookie);

    await page.setRequestInterception(true);
    page.on('request', request => {
        request.continue();
    });

    
    // Goes to the mixer page
    await page.goto('https://www.zillow.com/homes/60606_rb/',)
        .catch((e) => {console.log(e)});
    page.on('load', () => console.log('=====Page loaded!====='));


    await page.waitForSelector('[class="photo-cards photo-cards_wow photo-cards_short"]');

    //const count = await page.$$eval('li', li => li.length);
    //console.log(count);

    
    
    let content = await page.evaluate(() => {
        let divs = [...document.querySelectorAll('article')];
        return divs.map((div) => div.textContent);
    });

    for (let i=0; i<content.length; i++)    {
        
        let split = content[i].split(',');
        //console.log(split);

        // Get address and zip code based off of the split
        let address = split[0];
        let zip_code = split[2].substring(4, 9);

        let bdIndex = content[i].indexOf('bd');
        let bedroomNum = content[i].substring(bdIndex-2, bdIndex-1)

        let moneyStart = content[i].indexOf("$");
        let value = content[i].substring(moneyStart+1, bdIndex-2);
        value = value.replace(/,/g,"");


        console.log(content[i]);
        console.log(split);
        console.log(address + ":" + zip_code + ":" + bedroomNum + ":" + value);
        break;
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