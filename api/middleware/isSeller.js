module.exports = (req, res, next) => {
    if (req.userData.level === 'seller') {
        next()
    }
    else {
        return res.status(403).json({
            message: 'Access denied! User is not a registered seller!!'
        })
    }
}