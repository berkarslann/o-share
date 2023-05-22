const crypto = require('crypto')

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const {validationResult} = require('express-validator')

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({

  auth: {
    api_key:'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' ,
  }


}));


exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    res.render('main-page', {
      path: 'main-page',
      pageTitle: 'Giriş Yap',
      errorMessage: message,
      
     
    });
  };

  exports.getSignup = (req,res,next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('sign', {
      path: 'signup',
      pageTitle: 'Signup',
      errorMessage: message
    });
  };

  exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
 
    User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Hatalı şifre ya da kullanıcı adı.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
           
              console.log(err);
              res.redirect('/feed');
              
            });
          }
          
          req.flash('error', 'Hatalı şifre ya da kullanıcı adı.');
          res.redirect('/login');
        })
        .catch(err => {
        
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
  };

  exports.postSignup = (req, res, next) => {
    const username = req.body.username
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const bachelor = req.body.bachelor;
    const errors = validationResult(req);
    User.findOne({ email: email })
      .then(userDoc => {
        if (userDoc) {
          req.flash('error', 'Bu e-mail kullanımda. Lütfen başka bir tane girin.');
          return res.redirect('/signup');
        }
        return bcrypt
          .hash(password, 12)
          .then(hashedPassword => {
            const user = new User({
              username: username,
              email: email,
              password: hashedPassword,
              bachelor: bachelor,
              cart: { items: [] }
            });
            return user.save();
          })
          .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
              to: email,
              from: 'berkk.arslnv3@gmail.com',
              subject: 'Kayıt Başarılı',
              html: '<h1>Başarıyla kaydoldunuz!'
            }).catch(err=>{
              console.log(err)
            })
           
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  exports.getReset = (req,res,next)=>{
    let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    res.render('reset', {
      path: 'reset',
      pageTitle: 'Şifre yenile',
      errorMessage: message
    }
    )


  }

  exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect('/reset');
      }
      const token = buffer.toString('hex');
      User.findOne({ email: req.body.email })
        .then(user => {
          if (!user) {
            console.log('buraya geldi')
            req.flash('error', 'Bu e-maile bağlı bir hesap bulunamadı.');
            return res.redirect('/reset');
          }
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          transporter.sendMail({
            to: req.body.email,
            from: 'berkk.arslnv3@gmail.com',
            subject: 'Şifre sıfırlama',
            html: `
              <p>Şifre sıfırlama isteği gönderdiniz.</p>
              <p>Şifrenizi sıfırlamak için <a href="http://localhost:3000/reset/${token}">link</a> linkine tıklayın.</p>
            `
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    });
  };

  
  exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
      .then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
          message = message[0];
        } else {
          message = null;
        }
        res.render('new-password', {
          path: 'new-password',
          pageTitle: 'New Password',
          errorMessage: message,
          userId: user._id.toString(),
          passwordToken: token
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };
  

  exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
  
    User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId
    })
      .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
      })
      .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
      })
      .then(result => {
        res.redirect('/login');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };

  
  exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/login');
    });
  };
  


