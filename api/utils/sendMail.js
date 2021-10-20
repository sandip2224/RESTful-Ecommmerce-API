const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
})

const subjects = ['Your order is on it\'s way 🎉']
const texts = [
    'Your payment is successful.'
]

function sendMail1(email, address, pin, state) {
    let mailOption1 = {
        from: process.env.EMAIL,
        to: `${email}`,
        subject: subjects[0],
        html: `<h2>Payment status: <small>Confirmed</small></h2>
        <h2>Home Address: <small>${address}</small></h2>
        <h2>Pincode: <small>${pin}</small></h2>
        <h2>State: <small>${state}</small></h2>
        <h2>Thank you for shopping with us! 💕</h2>
        `
    }
    transporter.sendMail(mailOption1, (err, data) => {
        if (err) {
            return console.log('Error occurs', err);
        }
        return console.log('Email sent!!');
    })
}

module.exports = sendMail1