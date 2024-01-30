const axios = require("axios");
const fs = require("fs");
const puppeteer = require("puppeteer");

// site list
const sites = [
  "https://www.loperahotel.com.br",
  "https://www.filadelfiahotel.com.br/contatos",
];

async function extrairEmail(page) {
  try {
    const body = await page.evaluate(() => document.body.textContent);

    // regex for email and phone
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const telefoneRegex = /(?:\(\d{2}\))?\s?\d{4,5}-?\d{4}/g;

    // Search for email addresses and phones using regex
    let emails = body.match(emailRegex);
    let telefone = body.match(telefoneRegex);
    const currentUrl = await page.evaluate(() => {
      return window.location.href;
    });
    const url = new URL(currentUrl);
    let siteName = url.hostname.split(".")[1];
    let result = {};
    //Json format
    result.name = siteName;

    if (emails) {
      if (emails[0].match(telefoneRegex)) {
        emails[0] = emails[0].replace(telefoneRegex, "");
        console.log("pass");
      }
      result.email = emails[0];
    }
    if (telefone) {
      result.telefone = telefone[0];
    }

    return result ? result : null;
  } catch (error) {
    console.error("Erro ao extrair email:", error);
    return null;
  }
}

(async () => {
  // Open browser
  const browser = await puppeteer.launch({
    headless: false, // change to true in production
    args: ["--start-maximized"],
  });

  // loop through the sites
  sites.forEach(async (site) => {
    const page = await browser.newPage();
    await page.goto(site);
    var email = await extrairEmail(page);
    console.log(email);
    await new Promise((r) => setTimeout(r, 5000));
    await browser.close();
  });
})();
