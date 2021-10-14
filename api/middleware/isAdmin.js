module.exports = (req, res, next) => {
    if (req.userData.isAdmin === true) {
        next()
    }
    else {
        return res.status(403).json({
            message: 'Access denied! User is not an admin!!'
        })
    }
}