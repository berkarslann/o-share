const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');

const Comment = require('../models/comments');
const User = require('../models/user')



exports.getAddProduct = (req, res, next) => {

  
  Comment.find()
  .then(comments =>{
    res.render('feed', {
    comms : comments,
    pageTitle: 'Add Product',
    path: 'feed',
    editing: false,
    req: req,
    
    
  
  });
 
  })
  .catch(err=>{
    console.log(err)
  })
  
  
};


exports.getMyFeeds = (req, res, next) => {

  
  Comment.find()
  .then(comments =>{
    res.render('myfeeds', {
    comms : comments,
    pageTitle: 'Add Product',
    path: 'feed',
    editing: false,
    req: req,
    
    
  
  });
 
  })
  .catch(err=>{
    console.log(err)
  })
  
  
};

exports.postAddProduct = (req, res, next) => {
  
  const description = req.body.description
  const username = req.user.username.valueOf()
  const date = new Date().toJSON().slice(0, 10);
  const comment = new Comment({
  
    description: description,
    userId: req.user,
    date: date,
    userName: username
    
 
  });
  comment
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/feed');
    })
    .catch(err => {
      console.log(err);
    });

  
};

exports.deleteProduct = (req,res,next)=>{
  
  const commentId = req.body.commentId;
  
  Comment.deleteOne({
    _id: commentId, 
    userId: req.user._id
  
  })
  .then(()=>{
    
    console.log('DESTROYED PRODUCT');
      res.redirect('feed');
  })
  .catch(err => console.log(err));
}

