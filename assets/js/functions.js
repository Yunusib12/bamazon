require("dotenv").config(); // Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
const mysql = require("mysql"); // mysql npm used for connecting to the db
const inquirer = require("inquirer"); // inquirer included used for user prompts
const Table = require("cli-table"); // Table display in cli
const colors = require('colors'); // color text in cli

let db;
let nQty;
let quantities = [];
let shopingCart = [];

// DB Connect
let dbCon = function() {

    db = mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    db.connect(function(err) {
        if (err) throw err;
        console.log("We are Connected with id " + db.threadId);
        checkProducts();
    });

};

// Displaying available Products in the DB
let checkProducts = function() {

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
                    // console.log("Manager Dashboard");
                    manager();
                    break;
                case 'Customer':
                    console.log("Welcome Dear Customer");
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
    // console.log(productID, quantity);

    new Promise((resolve, reject) => {

        let queryP = "SELECT item_id, product_name, department_name, price FROM products WHERE?";

        db.query(queryP, {
                item_id: productID
            },
            function(err, res) {
                if (err) reject(err);
                shopingCart.push(res);
            })
        return resolve()
    }).then(() => {

        // console.log("SC", resolve);

    }).catch(console.log)

    quantities.push(quantity);
};

// Function for checkout

let checkOut = function() {

    let total = 0;

    console.log(`\n----- We are processing your order ----------\n`.yellow);

    setTimeout(function() {

        console.log(`\nThanks for shopping with us! \nHere is the sumary of your purchase\n`.green);

        let tableC = new Table({
            head: ['Product ID', 'Item', 'Department', 'Qty', 'Total Price'],
            colWidths: [13, 33, 33, 10, 15]
        });

        shopingCart.forEach(function(prod, index) {

            let tPrice = "$ " + prod[0].price * quantities[index];

            tableC.push([prod[0].item_id, prod[0].product_name, prod[0].department_name, quantities[index], tPrice]);
            total += parseFloat(prod[0].price, 10) * quantities[index];
        })

        console.log(tableC.toString());
        console.log(`\nYour total: $ ${total}`.red);
        db.end();
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
                //console.log("We got this" + productID);
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
    })

};

let productSale = function() {


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
        db.end();
    });

    // inquirer.prompt([{
    //     message: 'Product Sale Menu',
    //     name: 'productSaleM',
    //     type: 'list',
    //     choices: ['Back to Manager Menu', 'Back to Main Menu', 'Exit']
    // }]).then(function(choice) {
    //     switch (choice.productSaleM) {
    //         case 'Back to Manager Menu':
    //             manager();
    //             break;
    //         case 'Back to Main Menu':
    //             checkProducts();
    //             break;
    //         case 'Exit':
    //             db.end();
    //             break;
    //     }
    // });

};



let lowInventory = function() {

    let query = "SELECT item_id,product_name,department_name, price, quantity FROM products WHERE quantity < ?";
    let qty = 5;
    db.query(query, qty,
        function(err, res) {
            if (err) throw err;

            let table = new Table({
                head: ["Product ID", "Name", "Department", "Price", "Stock Qty"],
                colWidths: [15, 35, 35, 15, 15]

            });

            res.forEach(elem => {
                table.push([elem.item_id, elem.product_name, elem.department_name, `$ ${elem.price}`, elem.quantity]);
            });

            console.log(table.toString());
            db.end();
        });

    inquirer.prompt([{
        message: 'Add inventory?',
        name: 'addInventory',
        type: 'list',
        choices: ['Add to existing stock', 'Create new item', 'Exit']
    }]).then(function(choice) {
        if (choice.addInventory === 'Add to existing stock ') {
            addInventory(false);
        } else if (choice.addInventory === 'Create new item') {
            addInventory(true);
        } else {
            db.end();
        }
    });
};


// Manager Prompt

let manager = function() {

    console.log("\n======= Welcome to the Manager Dashboard ========\n".green);

    inquirer.prompt([{
        message: 'Option Menu',
        name: 'menuOpt',
        type: 'list',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
    }]).then(function(choice) {
        switch (choice.menuOpt) {
            case ('View Products for Sale'):
                productSale();
                break;
            case ('View Low Inventory'):
                lowInventory();
                break;
            case ('Add to Inventory'):
                console.log("Add to Inventory");
                break;
            case ('Add New Product'):
                console.log("Add New Product");
                break;
            default:
                console.log("No Choice selected");
                break;
        }
    })

};


module.exports = {
    dbCon: dbCon
}