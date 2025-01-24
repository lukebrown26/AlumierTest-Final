const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
require('dotenv').config()
const Shopify = require('shopify-api-node')
const fs = require('fs');

const shopify = new Shopify({
    shopName:process.env.SHOPIFY_STORE,
    accessToken:process.env.SHOPIFY_ACCESS_TOKEN    
})

const app = express()
const port = 3000

app.use(bodyParser.json())

const emailer = nodemailer.createTransport({
  host: "", //Enter your Email Host
  port: 2525,           //Enter your Email Port
  auth: {
    user: "",//Enter your Email User Name
    pass: "" //Enter your Email Password
  }
});
function sendEmail(product, newPrice, oldPrice, percentageChange) {
    const mailOptions = {
        from: '',  //Enter your Email From
      to: '',   //Enter your Email Destination
        subject: 'Price Has Decreased',
        text: `${product.title} has dropped by ${percentageChange}% starting at ${oldPrice} and now sits at ${newPrice}`
    }

    emailer.sendMail(mailOptions, (error, info) => {
        if (error) {
           console.log('Error sending email: ', error)
        } else {
           console.log('Email sent: ' + info.response)
       }
 })
}
async function fetchProductDetails() {
    const query = `
      query {
        products(first: 100) {
        edges {
          node {        
            id
            title
            variants(first: 10) {
                edges {
                    node {
                        id
                        price
                        }
                    }
                }
            } 
        }
      }
    }   
    `
    try {
      const response = await shopify.graphql(query)

      fs.writeFileSync('products_data.txt', JSON.stringify(response, null, 2))
  } catch (error) {
    console.error('Error fetching product details:', error)
    return null
  }
}
fetchProductDetails();

const readProductData = (): any => {
  try {
    const data = fs.readFileSync('products_data.txt', 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading or parsing file:", error)
    return null
  }
};


const getProductPriceById = (productId: string) => {
  const productsData = readProductData()

  for (const product of productsData.products.edges) {
    const productNode = product.node
    
    if (productNode.id === productId) {
      const variant = productNode.variants.edges[0].node
      const price = variant.price
      
      return price
    }
  }
  return null
};

const updatePriceInFile = (productId: string, newPrice: number) => {
  const filedata = readProductData()
  for (const product of filedata.products.edges) {
    const productNode = product.node
    
    if (productNode.id === productId) {
      const variant = productNode.variants.edges[0].node
      variant.price = newPrice
    }
  }  
  const updatedData = JSON.stringify(filedata, null, 2)

  fs.writeFileSync('products_data.txt', updatedData, 'utf8')
  console.log(`File updated with new price: ${newPrice}`)
}




app.post('/webhook/product-updated', async (req, res) => {

    const product = req.body
    console.log(product)
    const productId = product.admin_graphql_api_id
    const currentPrice: number = product.variants[0].price
    const previousPrice = getProductPriceById(productId);
    if(previousPrice && currentPrice) {
        const pricechangepercent: any = Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
        if (pricechangepercent > 20) {
            sendEmail(product, currentPrice, previousPrice, pricechangepercent)
          }
    }
  updatePriceInFile(productId, currentPrice)
   res.status(200).send('Webhook Received')

});



app.listen(port, () => {
    console.log(`Server Listening on localhost, port = ${port}`)
});