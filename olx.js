const fs = require('fs');
const puppeteer = require("puppeteer");

const url = 'https://www.olx.com.br/estado-pe/grande-recife/recife/boa-viagem?f=p&q=aluguel%20imovel';

//função principal 

(async() => {

    //abrir site

    const browser = await puppeteer.launch();
    
    const page = await browser.newPage({headless: false});

    await page.setDefaultNavigationTimeout(0);

    await page.goto(url);

    await page.waitForSelector('#ad-list');

    //selecionar itens (imóveis)

    const lista = await page.$('#ad-list')
    const imoveis = await lista.$$('li')


    //selecionar os elementos

    const data = [];
    let counter = 0;

    for(const imovel of imoveis){

        counter++;

        const link = (await imovel.$$eval('div > a', el => el.map(link => link.href)))[0];

        const titulo = (await imovel.$$eval('div > a',  el => el.map(titulo => titulo.title)))[0];

        const preco = (await imovel.$$eval('.m7nrfa-0', el => el.map(preco => preco.textContent)))[0];

        if (titulo){
            const [areax]  = (await page.$x('//*[@id="ad-list"]/li['+counter+']/div/a/div/div[2]/div[2]/div[3]/div[1]/div/div/span'));
            let area;
    
            if (areax){
                area = await page.evaluate(element => element.innerText, areax);
            }
            else {
                area = null
            }
    
            let quartos;
    
            quartosx = (await page.$x('//*[@id="ad-list"]/li['+counter+']/div/a/div/div[2]/div[1]/div[2]/div/div/div[1]/div/div/span'));
    
            if (quartosx.length){
                for (quartox of quartosx){
                    quartos = await page.evaluate(element => element.innerText, quartox);
                    if (/^.*quarto.*$/.test(quartos)){
                        quartos = quartos.replace(/\D/g, "");
                        break
                    }
                    else {
                        quartos = null
                    }
                }
            }
            else {
                quartos = null
            }

        // adicionar os dados ao dict

        if (link && titulo) {

            data.push({ link, titulo, preco, quartos, area});
        }}
    


    }

    // printar os dados

    console.log(data);

    //arquivo json
    fs.writeFileSync('dados_imoveis.json', JSON.stringify(data, null, 2));

    console.log('Dados salvos em dados_imoveis.json.');

    // fechar o browser 

    await browser.close();

})(); 
