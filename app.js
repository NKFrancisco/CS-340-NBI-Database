// App.js

/*
    SETUP
*/
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
PORT        = 9951;                 // Set a port number at the top so it's easy to change in the future
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));



// Database
var db = require('./database/db-connector');

// Handlebars 
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.


/* 
    Blood_Donors Page 
*/
app.get('/', function(req, res) {  

    // Define and run the query
    let query1 = "SELECT * FROM Blood_Donors;";               

    db.pool.query(query1, function(error, rows, fields){   

        res.render('index', {data: rows});                  
    })                                                      
});   
    
// Add Blood Donors
app.post('/add-blood-donor-form', function(req, res){

    let data = req.body;

    // Define and run the query
    query1 = `INSERT INTO Blood_Donors (donorGender, donorLastName, donorFirstName, \
        donorPhoneNumber, donorAddress, donorEmail, donorBloodGroup, donorDOB, donorLastDonation, \
        donorBloodComponent, donationMethod) VALUES ('${data['donorGender-Input']}', \
        '${data['donorLastName-Input']}', '${data['donorFirstName-Input']}', '${data['donorPhoneNumber-Input']}', \
        '${data['donorAddress-Input']}', '${data['donorEmail-Input']}', '${data['donorBloodGroup-Input']}', \
        '${data['donorDOB-Input']}', '${data['donorLastDonation-Input']}', '${data['donorBloodComponent-Input']}', \
        '${data['donationMethod-Input']}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            res.redirect('/');
        }
    })
})

// Delete Blood Donors
app.delete('/delete-donor-ajax/', function(req,res,next){

    let data = req.body;
    let donorID = parseInt(data.id);

    console.log(donorID);

    // Create the query and run it on the database
    let deleteBlood_Donors = `DELETE FROM Blood_Donors WHERE bloodDonorID = ?`;
  
          db.pool.query(deleteBlood_Donors, [donorID], function(error, rows, fields){

            if (error) {
                console.log(error);
                res.sendStatus(400);
                }
            else
                res.sendStatus(204);
                
})});

// Update Blood Donors
app.put('/put-donor-ajax', function(req,res,next){

    let data = req.body;

    let iDUpdate = req.body.donorID;
    let genderUpdate = req.body.donorGender;
    let lastName = req.body.donorLastName;
    let firstName = req.body.donorFirstName;
    let phone = req.body.donorPhoneNumber;
    let address = req.body.donorAddress;
    let email = req.body.donorEmail;
    let bloodGroup = req.body.donorBloodGroup;
    let DOB = req.body.donorDOB;
    let lastDonation = req.body.donorLastDonation;
    let bloodComponent = req.body.donorBloodComponent;
    let donationMethod = req.body.donationMethod;
  
    // Define and run the query
    let queryUpdateBloodDonor = `UPDATE Blood_Donors SET donorGender= ? , donorLastName= ? , donorFirstName= ? , \
    donorPhoneNumber= ? , donorAddress= ? , donorEmail= ? , donorBloodGroup= ? ,  donorDOB= ? ,  donorLastDonation= ? ,\
      donorBloodComponent= ? , donationMethod= ? WHERE bloodDonorID = ?`;

    db.pool.query(queryUpdateBloodDonor, [genderUpdate, lastName, firstName, phone, address, email, bloodGroup, DOB, lastDonation, bloodComponent, donationMethod, iDUpdate], function(error, rows, fields){

    if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else
            res.sendStatus(200);
  })});

/* 
    Blood_Bags Page 
*/
app.get('/Blood_Bags', (req, res) => {

    let query1;

    // Search SELECT query
    if (req.query.group === undefined){
         query1 = "SELECT Blood_Bags.bloodBagID, Blood_Bags.bloodDonorID, Blood_Bags.bloodBankID, Blood_Donors.donorBloodGroup, \
         Blood_Bags.bloodComponent, Blood_Bags.hbCount, Blood_Bags.unitsReceived, Blood_Bags.donationDate, Blood_Bags.isEmpty \
         FROM Blood_Bags INNER JOIN Blood_Donors ON Blood_Bags.bloodDonorID = Blood_Donors.bloodDonorID;";
    }
    // SELECT query
    else {
         query1 = `SELECT Blood_Bags.bloodBagID, Blood_Bags.bloodDonorID, Blood_Bags.bloodBankID, Blood_Donors.donorBloodGroup, \
         Blood_Bags.bloodComponent, Blood_Bags.hbCount, Blood_Bags.unitsReceived, Blood_Bags.donationDate, Blood_Bags.isEmpty \
         FROM Blood_Bags INNER JOIN Blood_Donors ON Blood_Bags.bloodDonorID = Blood_Donors.bloodDonorID \
         WHERE Blood_Donors.donorBloodGroup LIKE "${req.query.group}%"`;
    }

    db.pool.query(query1, function(error, rows, fields){    

        let bags = rows;
        let query2 = "SELECT Blood_Donors.bloodDonorID FROM Blood_Donors;";

        db.pool.query(query2, function(error, rows, fields){ 

            let donorsIDs = rows; 
            let query3 = "Select Blood_Banks.bloodBankID FROM Blood_Banks;"

            db.pool.query(query3, function(error, rows, fields){ 

                let bankIDs = rows;
                res.render('Blood_Bags', {data: bags, donorID: donorsIDs, bankID: bankIDs}); 
            })
        })              
    })                                                          
})

// Add Blood Bags
app.post('/add-blood-bag-form', function(req, res){

    let data = req.body;

    // Create the query and run it on the database
    query1 = `INSERT INTO Blood_Bags (bloodDonorID, bloodBankID, bloodComponent, hbCount, unitsReceived, donationDate, isEmpty) \
    VALUES ('${data['bloodDonorID-Input']}', '${data['bloodBankID-Input']}', '${data['bloodComponent-Input']}', '${data['hbCount-Input']}', \
    '${data['unitsRecieved-Input']}', '${data['donationDate-Input']}', '${data['recipientBloodGroup-Input']}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        // If there was no error, we redirect back to our root route
        else
        {
            //Add to Blood Donation Inventories
            let query2 = `SELECT bloodBagID FROM Blood_Bags ORDER BY bloodBagID DESC LIMIT 1;`

            db.pool.query(query2, function(error, rows, fields){

                let bagID = rows;
                let iD = bagID[0].bloodBagID;
                let query3 = `INSERT INTO Blood_Donation_Inventories (bloodBagID, bloodBankID) VALUES ('${iD}', '${data['bloodBankID-Input']}')`;
                
                db.pool.query(query3, function(error, rows, fields){ 

                    if (error) {
                        console.log(error)
                        res.sendStatus(400);
                    } 
                    else
                        res.redirect('/Blood_Bags');
                })
            })
        }
    })   
})

// Update Blood Recipient
app.put('/put-bag-ajax', function(req,res,next){

    let data = req.body;

    // Define and run the query
    let queryUpdateBloodBag = `UPDATE Blood_Bags SET bloodDonorID= '${data['bloodDonorID']}', bloodBankID= '${data['bloodBankID']}', \
    bloodComponent= '${data['bloodComponent']}', hbCount= '${data['hbCount']}', unitsReceived= '${data['unitsReceived']}', \
    donationDate= '${data['donationDate']}', isEmpty= '${data['isEmpty']}' WHERE bloodBagID = '${data['bloodBagID']}'`;

    db.pool.query(queryUpdateBloodBag, function(error, rows, fields){

    if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else
            res.sendStatus(200);
        
  })});

/*
    Blood_Recipients Page
*/
app.get('/Blood_Recipients', (req, res) => {

    // Define and execute the query
    let query1 = "SELECT * FROM Blood_Recipients;"

    db.pool.query(query1, function(error, rows, fields){    

        //Save data and get list of bags query
        let recipients = rows;
        let query2 = "SELECT Blood_Bags.bloodBagID FROM Blood_Bags;";

        db.pool.query(query2, function(error, rows, fields){ 

            let bagIDs = rows; 
            res.render('Blood_Recipients', {data: recipients, bag: bagIDs}); 
        })
    })
})

// Add Blood Recipients
app.post('/add-blood-recipient-form', function(req, res){
    
    let data = req.body;

    // Capture NULL Blood Bag value
    if (data.bloodBagInput == "NULL") {
        query1 = `INSERT INTO Blood_Recipients (bloodBagID, recipientLastName, recipientFirstName, bloodComponentTransfused, recipientBloodGroup, \
            recipientPhoneNumber, recipientEmail, recipientAddress, recipientDiagnosis, recipientDOB, recipientLastTransfusionDate) \
            VALUES (NULL, '${data['recipientLastName-Input']}', '${data['recipientFirstName-Input']}', '${data['bloodComponentTransfused-Input']}', \
            '${data['recipientBloodGroup-Input']}', '${data['recipientPhoneNumber-Input']}', '${data['recipientEmail-Input']}', '${data['recipientAddress-Input']}', \
            '${data['recipientDiagnosis-Input']}', '${data['recipientDOB-Input']}', '${data['recipientLastTransfusion-Input']}')`;
    } else {
        query1 = `INSERT INTO Blood_Recipients (bloodBagID, recipientLastName, recipientFirstName, bloodComponentTransfused, recipientBloodGroup, \
            recipientPhoneNumber, recipientEmail, recipientAddress, recipientDiagnosis, recipientDOB, recipientLastTransfusionDate) \
            VALUES ('${data['bloodBagInput']}', '${data['recipientLastName-Input']}', '${data['recipientFirstName-Input']}', '${data['bloodComponentTransfused-Input']}', \
            '${data['recipientBloodGroup-Input']}', '${data['recipientPhoneNumber-Input']}', '${data['recipientEmail-Input']}', \
            '${data['recipientAddress-Input']}', '${data['recipientDiagnosis-Input']}', '${data['recipientDOB-Input']}', '${data['recipientLastTransfusion-Input']}')`;

    }

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
            res.redirect('/Blood_Recipients');
    })   
})

// Update Blood Recipient
app.put('/put-recipient-ajax', function(req,res,next){

    let data = req.body;

    let queryUpdateBloodRecipient = ``;

    if (bagID === "NULL") {
        // Define NULL query 
        queryUpdateBloodRecipient = `UPDATE Blood_Recipients SET bloodBagID= NULL, recipientLastName= '${data['recipientLastName']}', \
        recipientFirstName= '${data['recipientFirstName']}', bloodComponentTransfused= '${data['bloodComponentTransfused']}', \
        recipientBloodGroup= '${data['recipientBloodGroup']}', recipientPhoneNumber= '${data['recipientPhoneNumber']}', \
        recipientEmail= '${data['recipientEmail']}', recipientAddress= '${data['recipientAddress']}', recipientDiagnosis= '${data['recipientDiagnosis']}', \
        recipientDOB= '${data['recipientDOB']}', recipientLastTransfusionDate= '${data['recipientLastTransfusionDate']}' \
        WHERE bloodRecipientID = '${data['recipientID']}'`;
    } else {
        // Define query 
        queryUpdateBloodRecipient = `UPDATE Blood_Recipients SET bloodBagID= '${data['bloodBagID']}', recipientLastName= '${data['recipientLastName']}', \
        recipientFirstName= '${data['recipientFirstName']}', bloodComponentTransfused= '${data['bloodComponentTransfused']}', \
        recipientBloodGroup= '${data['recipientBloodGroup']}', recipientPhoneNumber= '${data['recipientPhoneNumber']}', recipientEmail= '${data['recipientEmail']}', \
        recipientAddress= '${data['recipientAddress']}', recipientDiagnosis= '${data['recipientDiagnosis']}', recipientDOB= '${data['recipientDOB']}', \
        recipientLastTransfusionDate= '${data['recipientLastTransfusionDate']}' WHERE bloodRecipientID = '${data['recipientID']}'`;
    
    }

    // Run the query
    db.pool.query(queryUpdateBloodRecipient, function(error, rows, fields){

    if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else
            res.sendStatus(200);
  })});

/*
    Blood_Donation_Inventories Page
*/
app.get('/Blood_Donation_Inventories', (req, res) => {

    // Define and execute the query 
    let query1 = "SELECT Blood_Donation_Inventories.bloodDonationInventoryID, Blood_Donation_Inventories.bloodBankID, Blood_Donation_Inventories.bloodBagID, \
    Blood_Bags.isEmpty FROM Blood_Donation_Inventories INNER JOIN Blood_Bags ON Blood_Donation_Inventories.bloodBagID = Blood_Bags.bloodBagID;";

    db.pool.query(query1, function(error, rows, fields){ 

        res.render('Blood_Donation_Inventories', {data: rows}); 
    })
})

/*
    Blood_Donation_Centers Page
*/
app.get('/Blood_Donation_Centers', (req, res) => {

    // Define and execute the query 
    let query1 = "SELECT * FROM Blood_Donation_Centers;";

    db.pool.query(query1, function(error, rows, fields){    

        res.render('Blood_Donation_Centers', {data: rows}); 
    })
})

// Add Blood Donation Center 
app.post('/add-donation-center-form', function(req, res){

    let data = req.body;

    // Create the query and run it on the database
    query1 = `INSERT INTO Blood_Donation_Centers (donationName, donationAddress, donationPhoneNumber) VALUES ('${data['donationName-Input']}', \
    '${data['donationAddress-Input']}', '${data['donationPhoneNumber-Input']}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
            res.redirect('/Blood_Donation_Centers');
    })  
})

// Update Blood Donation Center
app.put('/put-donation-ajax', function(req,res,next){

    let data = req.body;

    // Define and run the query
    let queryUpdateDonation = `UPDATE Blood_Donation_Centers SET donationName= '${data['donationName']}', donationAddress= '${data['donationAddress']}', \
    donationPhoneNumber= '${data['donationPhoneNumber']}' WHERE bloodDonationCenterID = '${data['bloodDonationCenterID']}'`;
    
    db.pool.query(queryUpdateDonation, function(error, rows, fields){

    if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else
            res.sendStatus(200);
})});

// Delete Blood Donation Center
app.delete('/delete-donation-ajax/', function(req,res,next){

    let data = req.body;
    let bloodDonationCenterID = parseInt(data.id);

    // Define and run the query
    let deleteDonation = `DELETE FROM Blood_Donation_Centers WHERE bloodDonationCenterID = ?`;
  
          db.pool.query(deleteDonation, [bloodDonationCenterID], function(error, rows, fields){

            if (error) {
                console.log(error);
                res.sendStatus(400);
                }
                else
                    res.sendStatus(204);
})});

/*
    Blood_Banks Page
*/
app.get('/Blood_Banks', (req, res) => {

    // Define and execute the query
    let query1 = "SELECT * FROM Blood_Banks;";

    db.pool.query(query1, function(error, rows, fields){    

        res.render('Blood_Banks', {data: rows}); 
    })
})

// Add Blood Bank 
app.post('/add-blood-bank-form', function(req, res){

    let data = req.body;

    // Create the query and run it on the database
    query1 = `INSERT INTO Blood_Banks (bloodBankName, bloodBankAddress, bloodBankPhoneNumber) VALUES ('${data['bloodBankName-Input']}', \
    '${data['bloodBankAddress-Input']}', '${data['bloodBankPhoneNumber-Input']}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
            res.redirect('/Blood_Banks');
    })  
})

// Update Blood Bank
app.put('/put-bank-ajax', function(req,res,next){

    let data = req.body;

    // Define and run the query
    let queryUpdateBank = `UPDATE Blood_Banks SET bloodBankName= '${data['bloodBankName']}', bloodBankAddress= '${data['bloodBankAddress']}', \
    bloodBankPhoneNumber= '${data['bloodBankPhoneNumber']}' WHERE bloodBankID = '${data['bloodBankID']}'`;

    db.pool.query(queryUpdateBank, function(error, rows, fields){

    if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else
            res.sendStatus(200);
  })});

/*
    Medical_Centers Page
*/
app.get('/Medical_Centers', (req, res) => {

        // Define and execute the query
        let query1 = "SELECT * FROM Medical_Centers";

        db.pool.query(query1, function(error, rows, fields){
            res.render('Medical_Centers', {data: rows}); 
        })
})

// Add Medical Center 
app.post('/add-medical-center-form', function(req, res){

    let data = req.body;

    //Define and execute the query
    query1 = `INSERT INTO Medical_Centers (medicalCenterName, medicalCenterAddress, medicalCenterPhoneNumber, medicalCenterPrimaryContact, \
        medicalCenterLicenseNumber) VALUES ('${data['medicalCenterName-Input']}', '${data['medicalCenterAddress-Input']}', \
        '${data['medicalCenterPhoneNumber-Input']}', '${data['medicalCenterPrimaryContact-Input']}', '${data['medicalCenterLicenseNumber-Input']}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
            res.redirect('/Medical_Centers');
    })  
})

// Update Medical Center
app.put('/put-center-ajax', function(req,res,next){

    let data = req.body;

    // Define and run the query
    let queryUpdateCenter = `UPDATE Medical_Centers SET medicalCenterName= '${data['medicalCenterName']}', medicalCenterAddress= '${data['medicalCenterAddress']}', \
    medicalCenterPhoneNumber= '${data['medicalCenterPhoneNumber']}', medicalCenterPrimaryContact= '${data['medicalCenterPrimaryContact']}', \
    medicalCenterLicenseNumber= '${data['medicalCenterLicenseNumber']}' WHERE medicalCenterID = '${data['medicalCenterID']}'`;

    db.pool.query(queryUpdateCenter, function(error, rows, fields){

    if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else
            res.sendStatus(200);
  })});

// Delete Blood Donation Center
app.delete('/delete-center-ajax/', function(req,res,next){

    let data = req.body;
    let centerID = parseInt(data.id);

    // Define and run the query
    let deleteCenter = `DELETE FROM Medical_Centers WHERE medicalCenterID = ?`;
  
          db.pool.query(deleteCenter, [centerID], function(error, rows, fields){

            if (error) {
                console.log(error);
                res.sendStatus(400);
                }
                else
                    res.sendStatus(204);
})});

/*
    Banks_has_Donations Page
*/
app.get('/Banks_has_Donations', (req, res) => {

    //SELECT table
    let query1 = "SELECT * FROM Blood_Banks_has_Blood_Donation_Centers";
    db.pool.query(query1, function(error, rows, fields){    

        //Save SELECT
        let selectRows = rows;
        //GET Bank IDs
        let query2 = "SELECT bloodBankID FROM Blood_Banks ORDER BY bloodBankID ASC;";
        db.pool.query(query2, function(error, rows, fields){   

            //Save Bank IDs
            let bankIDs = rows; 
            //GET Donation Centers IDs
            let query3 = "SELECT bloodDonationCenterID FROM Blood_Donation_Centers ORDER BY bloodDonationCenterID ASC;";

            db.pool.query(query3, function(error, rows, fields){   

                //Save Donation Centers IDs
                let donationIDs = rows; 
                //Render and send data
                res.render('Banks_has_Donations', {data: selectRows, bankID: bankIDs, donationID: donationIDs}); 
            })
        }) 
    })
})

// Add Banks has Donations 
app.post('/add-banks-has-donations-form', function(req, res){

    let data = req.body;

    // Define and run the query
    query1 = `INSERT INTO Blood_Banks_has_Blood_Donation_Centers (bloodBankID, bloodDonationCenterID) \
    VALUES ('${data['bloodBankID-Input']}', '${data['bloodDonationCenterID-Input']}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            res.redirect('/Banks_has_Donations');
        }
    })  
})

// Delete Banks has Donations 
app.delete('/delete-bank-has-donation-ajax/', function(req,res,next){

    let data = req.body;
    let bankID = parseInt(data.bankID);
    let donationID = parseInt(data.donationID);

    // Define and run the query
    let deleteBankDonation = `DELETE FROM Blood_Banks_has_Blood_Donation_Centers WHERE Blood_Banks_has_Blood_Donation_Centers.bloodBankID = ? \
    AND Blood_Banks_has_Blood_Donation_Centers.bloodDonationCenterID = ?`
  
    db.pool.query(deleteBankDonation, [bankID, donationID], function(error, rows, fields){

    if (error) {
        console.log(error);
        res.sendStatus(400);
        }
        else
            res.sendStatus(204);
    })
});


/*
    Donations_has_Donors Page
*/
app.get('/Donations_has_Donors', (req, res) => {

    //Select table
    let query1 = "SELECT * FROM Blood_Donation_Centers_has_Blood_Donors";
    db.pool.query(query1, function(error, rows, fields){    

        //Save SELECT 
        let selectRows = rows;
        //Get Donation Center IDs 
        let query2 = "SELECT bloodDonationCenterID FROM Blood_Donation_Centers ORDER BY bloodDonationCenterID ASC;";

        db.pool.query(query2, function(error, rows, fields){   

            //Save Donation Center IDs 
            let donationIDs = rows; 
            //Get Donor IDs
            let query3 = "SELECT bloodDonorID FROM Blood_Donors ORDER BY bloodDonorID ASC;";

            db.pool.query(query3, function(error, rows, fields){   

                //Save Donor IDs
                let donorIDs = rows; 
                //Render and send data 
                res.render('Donations_has_Donors', {data: selectRows, donationID: donationIDs, donorID: donorIDs}); 
            })
        }) 
    })
})

// Add Donations has Donors
app.post('/add-donations-has-donors-form', function(req, res){

    let data = req.body;

    //Insert query
    query1 = `INSERT INTO Blood_Donation_Centers_has_Blood_Donors (Blood_Donation_Centers_bloodDonationCenterID, Blood_Donors_bloodDonorID) \
    VALUES ('${data['bloodDonationCenterID-Input']}', '${data['bloodDonorID-Input']}')`;
    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
            res.redirect('/Donations_has_Donors');
    })  
})

// Delete Donations has Donors
app.delete('/delete-donation-has-donors-ajax/', function(req,res,next){

    let data = req.body;
    let donationID = parseInt(data.donationID);
    let donorID = parseInt(data.donorID);

    console.log(donationID);
    console.log(donorID);

    // Define and run the query
    let deleteDonationDonor = `DELETE FROM Blood_Donation_Centers_has_Blood_Donors \
    WHERE Blood_Donation_Centers_has_Blood_Donors.Blood_Donation_Centers_bloodDonationCenterID = ? \
    AND Blood_Donation_Centers_has_Blood_Donors.Blood_Donors_bloodDonorID = ?`;
  
    db.pool.query(deleteDonationDonor, [donationID, donorID], function(error, rows, fields){

    if (error) {
        console.log(error);
        res.sendStatus(400);
        }
        else
            res.sendStatus(204);
    })
});

/*
    Centers_has_Banks Page
*/
app.get('/Centers_has_Banks', (req, res) => {

    // SELECT query
    let query1 = "SELECT * FROM Medical_Centers_has_Blood_Banks";
    db.pool.query(query1, function(error, rows, fields){    

        //Save SELECT 
        let selectRows = rows;
        //Get Medical Center IDs 
        let query2 = "SELECT medicalCenterID FROM Medical_Centers ORDER BY medicalCenterID ASC;";

        db.pool.query(query2, function(error, rows, fields){   

            //Save Medical Center IDs 
            let medCenterIDs = rows; 
            //Get Bank IDs
            let query3 = "SELECT bloodBankID FROM Blood_Banks ORDER BY bloodBankID ASC;";

            db.pool.query(query3, function(error, rows, fields){   

                //Save Bank IDs
                let bankIDs = rows; 
                //Render and send data 
                res.render('Centers_has_Banks', {data: selectRows, medCenterID: medCenterIDs, bankID: bankIDs}); 
            })
        }) 
    })
})

// Add Centers has Banks
app.post('/add-center-has-bank-form', function(req, res){

    let data = req.body;

    // Define and run the query
    query1 = `INSERT INTO Medical_Centers_has_Blood_Banks (Medical_Centers_medicalCenterID, Blood_Banks_bloodBankID) VALUES ('${data['medicalCenterID-Input']}', '${data['bloodBankID-Input']}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
            res.redirect('/Centers_has_Banks');
    })  
})

// Delete Centers has Banks
app.delete('/delete-center-has-bank-ajax/', function(req,res,next){

    let data = req.body;
    let centerID = parseInt(data.centerID);
    let bankID = parseInt(data.bankID);

    // Define and run the query
    let deleteCenterBank = `DELETE FROM Medical_Centers_has_Blood_Banks WHERE Medical_Centers_has_Blood_Banks.Medical_Centers_medicalCenterID = ? AND Medical_Centers_has_Blood_Banks.Blood_Banks_bloodBankID = ?`;
  
    db.pool.query(deleteCenterBank, [centerID, bankID], function(error, rows, fields){

    if (error) {
        console.log(error);
        res.sendStatus(400);
        }
        else
            res.sendStatus(204);
    })
});

/*
    Centers_has_Recipients Page
*/
app.get('/Centers_has_Recipients', (req, res) => {

    // SELECT query
    let query1 = "SELECT * FROM Medical_Centers_has_Blood_Recipients";
    
    db.pool.query(query1, function(error, rows, fields){    

        //Save SELECT 
        let selectRows = rows;
        //Get Medical Center IDs 
        let query2 = "SELECT medicalCenterID FROM Medical_Centers ORDER BY medicalCenterID ASC;";

        db.pool.query(query2, function(error, rows, fields){   

            //Save Medical Center IDs 
            let medCenterIDs = rows; 
            //Get Recipient IDs

            let query3 = "SELECT bloodRecipientID FROM Blood_Recipients ORDER BY bloodRecipientID ASC;";
            db.pool.query(query3, function(error, rows, fields){   

                //Save Recipient IDs
                let recipientIDs = rows; 
                //Render and send data 
                res.render('Centers_has_Recipients', {data: selectRows, medCenterID: medCenterIDs, recipientID: recipientIDs}); 
            })
        }) 
    })
})

// Add Centers has Recipients
app.post('/add-center-has-recipient-form', function(req, res){

    let data = req.body;

    // Define and run the query
    query1 = `INSERT INTO Medical_Centers_has_Blood_Recipients (Medical_Centers_medicalCenterID, Blood_Recipients_bloodRecipientID) \
    VALUES ('${data['medicalCenterID-Input']}', '${data['bloodRecipientID-Input']}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            res.redirect('/Centers_has_Recipients');
        }
    })  
})

// Delete Centers has Recipients
app.delete('/delete-center-has-recipient-ajax/', function(req,res,next){

    let data = req.body;
    let centerID = parseInt(data.centerID);
    let recipientID = parseInt(data.recipientID);

    // Define and run the query
    let deleteCenterRecipient = `DELETE FROM Medical_Centers_has_Blood_Recipients \
    WHERE Medical_Centers_has_Blood_Recipients.Medical_Centers_medicalCenterID = ? \
    AND Medical_Centers_has_Blood_Recipients.Blood_Recipients_bloodRecipientID = ?`;

    db.pool.query(deleteCenterRecipient, [centerID, recipientID], function(error, rows, fields){

    if (error) {
        console.log(error);
        res.sendStatus(400);
        }
        else
        res.sendStatus(204);
    })
});

/*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});