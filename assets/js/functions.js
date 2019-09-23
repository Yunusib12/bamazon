require("dotenv").config(); // Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
const mysql = require("mysql"); // mysql npm used for connecting to the db
const inquirer = require("inquirer"); // inquirer included used for user prompts
const Table = require("cli-table"); // Table display in cli
let colors = require('colors'); // color text in cli

let db;
let nQty;
let quantities = [];
let shopingCart = [];


// Displaying available Products in the DB
let checkProducts = function() {

    // Connecting to the DB
    db = mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    db.connect(function(err) {
        if (err) throw err;
        console.log("We are Connected with id " + db.threadId);
    });

    let query = "SELECT item_id,product_name,department_name, price, quantity FROM products";

    db.query(query, function(err, res) {
        if (err) throw err;

        //console.log(res);

        let table = new Table({
            head: ["Product ID", "Name", "Department", "Price", "Stock Qty"],
            colWidths: [15, 35, 35, 15, 15]

        });

        res.forEach(elem => {
            table.push([elem.item_id, elem.product_name, elem.department_name, `$ ${elem.price}`, elem.quantity]);
        });
        console.log(table.toString());
        // database = res;
        inquirer.prompt([{
            name: 'whouare',
            type: 'list',
            choices: ['Manager', 'Customer', 'Exit'],
            message: 'Who are You?'
        }]).then(function(choice) {
            switch (choice.whouare) {
                case 'Manager':
                    console.log("Your ar a Manager");
                    break;
                case 'Customer':
                    console.log("You are a Customer");
                    buyProduct();
                    break;
                default:
                    console.log('----- Thank You For Your Visit ----'.green);
                    db.end();
            }
        });
    });

};

// Function that addProduct to Shoping Cart
let addProductToCart = function(productID, quantity) {

    shopingCart.push(productID);
    quantities.push(quantity);

    console.log(shopingCart);
    console.log(quantities);
};

// Function for checkout

let checkOut = function() {

    let total = 0;

    console.log(`
----- We are processing your order ----------`.yellow);

    setTimeout(function() {

        console.log(`
Thanks for shopping with us!
Here is the sumary of your purchase`.green);

        let tableC = new Table({
            head: ['Product ID', 'Item', 'Department', 'Total Price'],
            colWidths: [15, 35, 35, 15]
        });

        shopingCart.forEach(function(productID, index) {

            let queryP = "SELECT item_id, product_name, department_name, price FROM products WHERE?";
            db.query(queryP, {
                    item_id: productID
                },
                function(err, res) {
                    if (err) throw err;
                    console.log(res[0].item_id, res[0].product_name, res[0].department_name, res[0].price * quantities[index]);
                    // console.log(res[index].item_id);
                    tableC.push([res[0].item_id, res[0].product_name, res[0].department_name, res[0].price * quantities[index]]);
                    total = total + parseFloat(res[0].price, 10) * quantities[index];
                    console.log(total);
                })
        })
        console.log(tableC.toString());
        console.log(`
            
============ Your Total: $ ${total} ==============
                                
                                `.blue);

        // console.log(productID);
        //console.log(quantities[index]);
    }, 2000);

};

// Function that Update product
let updateProductQuantities = function(item, qtyA, qtyND, trans) {

    if (trans === "SELL") {

        nQty = qtyA - qtyND;

    } else {

        nQty = qtyA + qtyND;
    }

    let query = "UPDATE products SET? WHERE?";
    db.query(query, [{
                quantity: nQty
            },
            {
                item_id: parseInt(item)
            }
        ],
        function(err, res) {
            if (err) throw err;
            // console.log(`${res.affectedRows} products updated!`);
        });

};
// Function used to buy Products
let buyProduct = function() {

    inquirer.prompt([{
            name: 'productID',
            type: 'input',
            message: 'Please choose a product you would like to buy?',
            validate: function(value) {

                var valid = !isNaN(parseFloat(value));
                return valid || "Only Numbers are allowed";
            }
        },
        {
            name: 'quantity',
            type: 'input',
            message: 'How many units would you like to buy?',
            validate: function(value) {

                var valid = !isNaN(parseFloat(value));
                return valid || "Only Numbers are allowed";
            }
        }
    ]).then(function(answer) {
        let qtyND = parseInt(answer.quantity, 10);
        let productID = parseInt(answer.productID);

        let queryQtyAvailable = "SELECT quantity FROM products WHERE?";
        db.query(queryQtyAvailable, { item_id: productID }, function(err, res) {
            if (err) throw err;

            let qPA = res[0].quantity;
            if (qPA < qtyND) {
                console.log("There is not enough stock for the amount you choose. Please select another Item or Reduce the Amount.".red);
                buyProduct();
            } else {
                //console.log("We got this");
                updateProductQuantities(productID, qPA, qtyND, "SELL");
                addProductToCart(productID, qtyND);

                //ask if want more items before checkOut
                inquirer.prompt([{
                    name: 'anotherItem',
                    type: 'list',
                    choices: ['Yes', 'No'],
                    message: 'Add another Product?'.blue

                }]).then(function(choice) {
                    if (choice.anotherItem === "Yes") {
                        buyProduct();
                    } else {
                        checkOut();
                    }
                });
            };
        });

        // console.log(qty);
        // console.log(productID);
        // console.log(database[answer.productID - 1].quantity);
    })

};








module.exports = {
    checkProducts: checkProducts,
    buyProduct: buyProduct
}