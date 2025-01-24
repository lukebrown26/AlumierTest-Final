Hello!
I am assuming CLI knowledge and shopify backend knowledge as well as a knowledge of code to be able to edit variables

MAIN SETUP

Open a command line terminal and navigate to the clean folder to run the project
Assuming you have git CLI setup correctly and authenticated type gh repo clone lukebrown26/AlumierTest-Final
This should have cloned my repo into your folder but if it hasn't you can navigate to the repo on browser and download a zip and extract it into the folder

STEP 1

Now to run step one you can push it to your shopify repo on a branch and merge it but you will have to add some extra steps as well
I would navigate to your code and add a new file to your snippets called sale-tag and copy my code into that
Then head to the en locale and add under products product add to the top
"discount": "{{ amount }}% Off",
"discount_multiple": "Up to {{ amount }}% Off",
Then head to settings/custom data/products and add a new metafield called Show Sale Tag and set it to be true or false.
Finally head to your product section and insert {% include 'sale-tag' %} where you would like the sale tag to show this may need additional styling and include could be changed to render depending on theme version here
The metafield here will allow you to hide the sale tag if you want to like if its a premium product that you want to show a slash through price but not scream about how much it has off! It will show unless you set the metafield to false.


STEP 2

Open the folder in VSCode and navigate to the folder in the terminal
Run npm init -y and npm install shopify-api-node dotenv
Add your Access Token and Shopify Store URL to this file as well which you can access from developing an app in the backend of Shopify
You can change the date after the > on line 13 to select orders from after the date specified and change the product id at the bottom for the one you want to filter by
Run node fetchOrders.js
You will see an output of all orders that contain your product in the terminal

STEP 3

As you are already in the terminal Run npm install express body-parser nodemailer 
Open webhook.ts and edit where I have commented, I am assuming you already have a smtp or transport method setup and can provide the details to the code save the file and run npx tsc webhook.ts
Install and setup ngrok or any other local forwarding service
run ngrok http 3000 and copy the url it gives you for forwarding with /webhook/product-updated at the end
run webhook.js this should make a products_data.txt and start a local server
Head over to shopify/settings/notifications/webhooks/createwebhook
Add the URL into the field leave the format as JSON and the latest webhook api version
Edit a product so the price drops by 20% and it will log the data in the console and send an email

Thank you!
Luke 
