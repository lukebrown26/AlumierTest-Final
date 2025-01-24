require('dotenv').config()
const Shopify = require('shopify-api-node')

const shopify = new Shopify({
    shopName:process.env.SHOPIFY_STORE,
    accessToken:process.env.SHOPIFY_ACCESS_TOKEN    
})

const fetchOrders = async (productId) =>{
//Change the Created At Date below to 30 days ago
    const query = `
    {
        orders(first: 5, query: "created_at:>2019-07-06"){
            edges{
                node{
                    id
                    name
                    totalPriceSet {
                        shopMoney {
                            amount
                            currencyCode
                        }
                    }
                    lineItems(first: 5) {
                        edges {
                            node {
                                sku
                                title
                                quantity
                                id
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
        const filteredOrders = response.orders.edges.filter(order => {
            return order.node.lineItems.edges.some(item => item.node.id === productId)
        })
        console.log('Orders', JSON.stringify(filteredOrders, null, 1))
    } catch (error){
        console.log('Error fetching Orders', error)
    }
}
// Change the value below to the product ID you want to filter by
const productId = "34406063538553"
fetchOrders('gid://shopify/LineItem/' + productId)