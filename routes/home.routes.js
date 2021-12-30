const express = require('express');
const router = express.Router();

router.get('/' , (req,res)=>{
   const payload = {
      pageTitle:"home",
      userLoggedIn:req.session.user,
      userJs:JSON.stringify(req.session.user)
   }
   res.render('home' , payload)
})

module.exports = router