const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

// Define the '/signup' route
router.post('/signup', (req, res) => {
    const user = req.body;

    // Query to check if the user already exists
    const checkUserQuery = "SELECT email FROM user WHERE email = ?";
    connection.query(checkUserQuery, [user.email], (err, results) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (results.length <= 0) {
            // Query to insert a new user into the database
            const insertUserQuery = "INSERT INTO user (name, contactNumber, email, password, status, role) VALUES (?, ?, ?, ?, 'false', 'user')";
            connection.query(insertUserQuery, [user.name, user.contactNumber, user.email, user.password], (err) => {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    return res.status(200).json({ message: "Successfully Registered" });
                }
            });
        } else {
            return res.status(400).json({ message: "Email Already Exists." });
        }
    });
});

// Define the '/login' route
router.post('/login', (req, res) => {
    const user = req.body;

    // Query to check user credentials
    const checkCredentialsQuery = "SELECT email, password, role, status FROM user WHERE email = ?";
    connection.query(checkCredentialsQuery, [user.email], (err, results) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (results.length <= 0 || results[0].password !== user.password) {
            return res.status(401).json({ message: "Incorrect Username or Password" });
        }

        if (results[0].status === "false") {
            return res.status(401).json({ message: "Wait for Admin Approval" });
        }

        // Generate JWT token
        const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
        return res.status(200).json({ token: accessToken });
    });
});

// Define the '/forgotpassword' route
router.post('/forgotPassword', (req, res) => {
    const user = req.body;

    // Query to get user details based on email
    const query = "SELECT email, password FROM user WHERE email = ?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            return res.status(500).json(err);
        }

        if (results.length > 0) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: results[0].email,
                subject: 'Password by Cafe Management System',
                html: `<p><b>Your Login details for Cafe Management System</b><br><b>Email: </b>${results[0].email}<br><b>Password: </b>${results[0].password}<br><a href="http://localhost:4200/">Click here to login</a></p>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: "Error sending email." });
                } else {
                    console.log('Email sent: ' + info.response);
                    return res.status(200).json({ message: "Password sent successfully to your email." });
                }
            });
        } else {
            return res.status(404).json({ message: "Email not found." });
        }
    });
});

router.get('/get',(req,res)=>{
    var query = "select id,name,email,contactNumber,status from usar where role='user'";
    connection.query(query,(err,results)=>{
        if (err) {
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.patch('/update',(req,res)=>{
    let user = req.body;
    var query = "update user set status=? where id=?";
    connection.query(query[user.status,user.id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"User id does not exist"});
            }
            return res.status(200).json({message: "User Updated Successfully"});
        }
        else{
            return res.status(500).json(err);

        }
        })
    })

    router.get('/checkToken',(req,res)=>{
        return res.status(200).json({message: "true"});
    })

    router.post('/changePassword', (req,res)=>{
        
    })
module.exports = router;
0