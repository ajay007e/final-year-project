const { response } = require("express");
var express = require("express");
var router = express.Router();
var userHelper = require("../helpers/user-helper");

const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/__admin/login");
  }
};

/* GET users listing. */
router.get("/", verifyLogin, async (req, res) => {
  await userHelper.getData().then((response) => {
    // console.log(
    //   "----------------------------------------------------------------------"
    // );
    // console.log(response.resp);
    // console.log(response.data[0].clickCount);
    // console.log(response.data[0].searchCount);
    // console.log(
    //   "----------------------------------------------------------------------"
    // );
    res.render("user/index", {
      title: "Job Search Portal | Admin Portal",
      users: response.resp,
      admin: true,
      searchCount: response.data[0].searchCount,
      clickCount: response.data[0].clickCount,
    });
  });
});

router.get("/login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/__admin");
  } else {
    res.render("user/login", {
      title: "Admin Login",
    });
  }
});
router.post("/a-login", (req, res) => {
  // console.log(req.body);
  userHelper.adminLogin(req.body).then((response) => {
    // console.log(response);
    if (response.status) {
      // req.session.loggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/__admin/");
    } else {
      // req.session.loginErr = true;
      res.redirect("/__admin/login");
    }
  });
});
router.get("/logout", (req, res) => {
  // req.session.destroy((err) => {
  //   if (!err) res.redirect("/login");
  //   else console.log(err);
  // });
  req.session.admin = null;
  if (!req.session.admin) {
    res.redirect("/__admin/login");
  } else res.redirect("/__admin");
});
// router.post("/a-signup", (req, res) => {
//   // console.log(req.body);
//   // console.log(req.headers.host);
//   userHelper.adminSignup(req.body).then((response) => {
//     console.log(response);
//     if (response.status) {
//       req.session.loggedIn = true;
//       req.session.admin = response.insertedId.toString();
//       res.redirect("/__admin");
//     } else {
//       res.redirect("/__admin/a-login");
//     }
//   });
// });
router.get("/profile/:id", (req, res) => {
  // console.log(req.params.id);
  userHelper.userData(req.params.id).then((response) => {
    // console.log(response);
    if (response.status) {
      res.render("user/profile", {
        title: "Profile",
        user: response,
      });
    } else {
      res.redirect("/__admin/");
    }
  });
});
// router.get("/mail", (req, res) => {
//   res.render("user/email");
// }),
router.get("/suspend/:id", (req, res) => {
  // console.log(req.params.id);
  userHelper.suspendUser(req.params.id).then((response) => {
    console.log(response);
    res.redirect(`/__admin/profile/${req.params.id}`);
  });
});

module.exports = router;
