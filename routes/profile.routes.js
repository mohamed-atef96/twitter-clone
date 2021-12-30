const express = require("express");
const router = express.Router();
const USER =   require('../models/users.model');

router.get('/:id' ,async (req,res)=>{
    let user = await USER.findById(req.params.id)
    if(!user){
       let  payload = {
            pageTitle:"Not Found",
            userJs: JSON.stringify(req.session.user),
            userLoggedIn: req.session.user,
        }
        res.render('profilenotfound' , payload)        
    }
    
    let payload = {
        pageTitle: user.userName,
        userJs: JSON.stringify(req.session.user),
        userLoggedIn: req.session.user,
        userProfile: user,
        userProfileJs: JSON.stringify(user)
        
    }
    res.render('profile' , payload)
})


module.exports = router