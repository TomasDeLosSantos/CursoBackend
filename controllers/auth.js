const getLogged = async ctx => {
    if(req.session.username) ctx.body({login: 1, username: req.session.username});
    else ctx.body({login: 0});
}

const getLogout = async ctx => {
    let user = ctx.session.username;
    ctx.session.destroy(err => {
        if (err) {
            ctx.body({ login: 0 })
        } else {
            ctx.body({login: 0, username: user})
        }
    })
}

const postLogin = async ctx => {
    console.log(req.body.username);
    ctx.session.username = req.body.username;
    ctx.body({login: 1, username: req.body.username});
}

const postRegister = async ctx => {
    console.log(req.body.username);
    ctx.session.username = ctx.body.username;
    ctx.body({login: 1, username: ctx.body.username});
}

module.exports = { getLogged, getLogout, postLogin, postRegister };