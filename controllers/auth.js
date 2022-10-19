const getLogged = (req, res) => {
    if(req.session.username) res.json({login: 1, username: req.session.username});
    else res.json({login: 0});
}

const getLogout = (req, res) => {
    let user = req.session.username;
    req.session.destroy(err => {
        if (err) {
            res.json({ login: 0 })
        } else {
            res.json({login: 0, username: user})
        }
    })
}

const postLogin = (req, res) => {
    console.log(req.body.username);
    req.session.username = req.body.username;
    res.json({login: 1, username: req.body.username});
}

const postRegister = (req, res) => {
    console.log(req.body.username);
    req.session.username = req.body.username;
    res.json({login: 1, username: req.body.username});
}

module.exports = { getLogged, getLogout, postLogin, postRegister };