// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

var db = require("../config/connection");
var collection = require("../config/collections");
var credential = require("../config/credentials");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
var nodemailer = require("nodemailer");
const crypto = require("crypto");
const { text, response } = require("express");
const { resolve } = require("path");
const flash = require("express-flash");
var hbs = require("nodemailer-express-handlebars");

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

module.exports = {
  // ---------------------------------------------------------------------------------

  doSignup: (userData, domain) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      userData.emailToken = crypto.randomBytes(32).toString("hex");
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then(async (data) => {
          // console.log(data);
          response.user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id: data.insertedId });
          response.status = true;
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: credential.EMAIL,
              pass: credential.PASSWORD,
            },
          });
          transporter.use(
            "compile",
            hbs({
              viewEngine: {
                extname: ".hbs", // handlebars extension
                layoutsDir: "views/email/", // location of handlebars templates
                defaultLayout: "verification", // name of main template
              },
              // viewPath: "views",
              viewPath: "views/email",
              extName: ".hbs",
            })
          );

          //           let msg = `Hai, thanks for registering in our website.
          // please verify your account using the link : http://${domain}/verify-account?token=${response.user.emailToken}`;

          const mailOption = {
            to: response.user.email,
            from: "ajay010e@gmail.com",
            subject: "Verify Your Account",
            template: "verification",
            context: {
              name: response.user.name,
              link: `http://${domain}/verify-account?token=${response.user.emailToken}`,
            },
          };

          transporter.sendMail(mailOption, (err, data) => {
            if (err) {
              console.log(err);
              response.sentMail = false;
              response.error = err;
              resolve(response);
            } else {
              // console.log("Email Sent.");
              response.sentMail = true;
              response.details = data;
              resolve(response);
            }
          });
          // --------------------------------
          // resolve(response);
        });
    });
  },
  doLogin: (userdata) => {
    return new Promise(async (resolve, reject) => {
      //   let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mobile: userdata.mob });
      // console.log(user);
      if (user) {
        bcrypt.compare(userdata.pass, user.password).then((status) => {
          if (status) {
            // console.log("Login Success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            // console.log("Password error");
            resolve({ status: false });
          }
        });
      } else {
        // console.log("Login Failed");
        resolve({ status: false });
      }
    });
  },
  validate: (data) => {
    // console.log(data);
    return new Promise(async (resolve, reject) => {
      // let regexPass = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{5,15}$/;
      // let regexPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,15}$/;
      let regexPass = /^(?=.*\d).{3,}/;

      // let regexEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ $or: [{ email: data.email }, { mobile: data.mob }] })
        .then((resp) => {
          // console.log(data);
          if (resp) {
            resolve({
              status: false,
              message:
                "Already registerd with the given mail or mobile, please login",
            });
          } else if (
            data.ans === undefined ||
            data.ques === undefined ||
            data.ans === "" ||
            data.ques === ""
          ) {
            resolve({ status: false, message: "All fields must be filled." });
          } else if (!regexPass.test(data.pass)) {
            resolve({
              status: false,
              message:
                "Password must contain atleast 5 letter, alpha-numeric-special charcter combination.",
            });
          }
          // else if (!regexEmail.test(data.email)) {
          //   resolve({
          //     status: false,
          //     message:
          //       "Enter a valid mail Id.",
          //   });
          // }
          else {
            resolve({ status: true });
          }
        });
    });
  },
  // ---------------------------------------------------------------------------------

  editProfile: (userId, userData) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find(
          {
            $or: [{ email: userData.email }, { mobile: userData.mob }],
          },
          { _id: 1 }
        )
        .toArray()
        .then((resp) => {
          // console.log(resp);
          // console.log(resp._id);
          // console.log(typeof resp._id);
          // console.log(objectId(userId));
          // console.log(typeof objectId(userId));
          // console.log(resp._id === objectId(userId));
          if (resp[0]._id.toString() !== userId) {
            resolve({
              status: false,
              message: "Email or Mobile is already registered.",
            });
          } else {
            db.get()
              .collection(collection.USER_COLLECTION)
              .updateOne(
                { _id: objectId(userId) },
                {
                  $set: {
                    name: userData.name.toLowerCase(),
                    mobile: userData.mob,
                    email: userData.email,
                  },
                }
              )
              .then(() => {
                resolve({
                  status: true,
                  message: "Profile Updated.",
                });
              });
          }
        });
    });
  },

  // ---------------------------------------------------------------------------------

  userData: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) })
        .then((data) => {
          resolve(data);
        });
    });
  },

  // ---------------------------------------------------------------------------------

  editPassword: (userId, pass, newPass) => {
    return new Promise(async (resolve, reject) => {
      // console.log();
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });
      // console.log(user);
      if (user) {
        bcrypt.compare(pass, user.password).then(async (status) => {
          if (status) {
            let newPassword = await bcrypt.hash(newPass, 10);
            // console.log(newPassword);
            db.get()
              .collection(collection.USER_COLLECTION)
              .updateOne(
                { _id: objectId(userId) },
                {
                  $set: {
                    password: newPassword,
                  },
                }
              )
              .then(() => {
                resolve({ status: true, message: "Password Changed." });
              });
          } else {
            // console.log("Password error");
            resolve({
              status: false,
              message: "Current Password is Incorrect.",
            });
          }
        });
      } else {
        // console.log("Login Failed");
        resolve({
          status: false,
          message: "Some Error occured, Try after sometimes.",
        });
      }
    });
  },
  editQuestion: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      // console.log();
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });
      // console.log(user);
      if (user) {
        bcrypt.compare(data.pass, user.password).then(async (status) => {
          if (status) {
            // console.log(newPassword);
            db.get()
              .collection(collection.USER_COLLECTION)
              .updateOne(
                { _id: objectId(userId) },
                {
                  $set: {
                    question: data.ques,
                    answer: data.ans,
                  },
                }
              )
              .then(() => {
                resolve({
                  status: true,
                  message: "Security Question Changed.",
                });
              });
          } else {
            // console.log("Password error");
            resolve({
              status: false,
              message: "Current Password is Incorrect.",
            });
          }
        });
      } else {
        // console.log("Login Failed");
        resolve({
          status: false,
          message: "Some Error occured, Try after sometimes.",
        });
      }
    });
  },
  resetPassword: (data) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({
        mobile: data.mob,
        question: data.ques,
        answer: data.ans,
      });
      if (user) {
        let pass = (function () {
          var p = "";
          var str =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz0123456789@#$";

          for (i = 1; i <= 8; i++) {
            var char = Math.floor(Math.random() * str.length + 1);

            p += str.charAt(char);
          }

          return p;
        })();
        let newPassword = await bcrypt.hash(pass, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: user._id },
            {
              $set: {
                password: newPassword,
              },
            }
          )
          .then(() => {
            resolve({
              status: true,
              message: "Password Reset.",
              password: pass,
            });
          });
      } else {
        resolve({
          status: false,
          message: "Enter valid Entries.",
        });
      }
    });
  },
  sentPassword: (data) => {
    return new Promise(async (resolve, reject) => {
      // console.log(data);
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({
        email: data.email,
      });
      if (user) {
        let pass = (function () {
          var p = "";
          var str =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz0123456789@#$";

          for (i = 1; i <= 8; i++) {
            var char = Math.floor(Math.random() * str.length + 1);

            p += str.charAt(char);
          }

          return p;
        })();
        let newPassword = await bcrypt.hash(pass, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: user._id },
            {
              $set: {
                password: newPassword,
              },
            }
          )
          .then(() => {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: credential.EMAIL,
                pass: credential.PASSWORD,
              },
            });
            transporter.use(
              "compile",
              hbs({
                viewEngine: {
                  extname: ".hbs", // handlebars extension
                  layoutsDir: "views/email/", // location of handlebars templates
                  defaultLayout: "forget", // name of main template
                },
                // viewPath: "views",
                viewPath: "views/email",
                extName: ".hbs",
              })
            );
            // let msg = ``;
            const mailOption = {
              from: "ajay010e@gmail.com",
              to: data.email,
              subject: `Temporary Password Generated`,
              template: "forget",
              context: {
                name: user.name,
                password: pass,
              },
            };
            transporter.sendMail(mailOption, (err, response) => {
              if (err) {
                // console.log(err);
                resolve({
                  status: false,
                  error: err,
                  message: "Some Error occured, try after sometimes.",
                });
              } else {
                // console.log("Email Sent.");
                resolve({
                  status: true,
                  message: "Tempoparary Password is sent to your mail.",
                });
              }
            });
          });
      } else {
        // console.log("Login Failed");
        resolve({ status: false, message: "Enter Valid mail ID." });
      }

      // ------------------
    });
  },

  // ---------------------------------------------------------------------------------

  sentContactMail: (data) => {
    return new Promise((resolve, reject) => {
      // console.log(data);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: credential.EMAIL,
          pass: credential.PASSWORD,
        },
      });
      transporter.use(
        "compile",
        hbs({
          viewEngine: {
            extname: ".hbs", // handlebars extension
            layoutsDir: "views/email/", // location of handlebars templates
            defaultLayout: "contact", // name of main template
          },
          // viewPath: "views",
          viewPath: "views/email",
          extName: ".hbs",
        })
      );
      const mailOption = {
        from: data.email,
        to: credential.EMAIL,
        subject: `${data.subject}`,
        template: "contact",
        context: {
          name: data.name,
          message: data.message,
          email: data.email,
          mobile: data.mobile,
        },
      };
      transporter.sendMail(mailOption, (err, response) => {
        if (err) {
          console.log(err);
          resolve({
            status: false,
            error: err,
            message: "Some Error occured, try after sometimes.",
          });
        } else {
          // console.log("Email Sent.");
          resolve({
            status: true,
            detail: response,
            message: "Email sent ,we will get back to you soon.",
          });
        }
      });
    });
  },

  // ---------------------------------------------------------------------------------

  verifyAccount: (token) => {
    return new Promise(async (resolve, reject) => {
      // console.log(token);
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ emailToken: token });
      if (user) {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: user._id },
            {
              $set: {
                emailToken: null,
                verified: true,
                status: "active",
              },
            }
          )
          .then(() => {
            resolve({
              status: true,
              message: "Account Verified,Please Login.",
            });
          });
      } else {
        resolve({
          status: false,
          message: "Some Error occured, try after sometimes.",
        });
      }
    });
  },
  verifyProfile: (userId, domain) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId, domain);
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          _id: objectId(userId),
        });
      if (user) {
        let token = crypto.randomBytes(32).toString("hex");
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: user._id },
            {
              $set: {
                emailToken: token,
              },
            }
          )
          .then((data) => {
            // console.log(data);
            // --------------------------------
            if (data.acknowledged) {
              const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: credential.EMAIL,
                  pass: credential.PASSWORD,
                },
              });
              transporter.use(
                "compile",
                hbs({
                  viewEngine: {
                    extname: ".hbs", // handlebars extension
                    layoutsDir: "views/email/", // location of handlebars templates
                    defaultLayout: "verification", // name of main template
                  },
                  // viewPath: "views",
                  viewPath: "views/email",
                  extName: ".hbs",
                })
              );
              //           let msg = `Hai, thanks for registering in our website.
              // please verify your account using the link : http://${domain}/verify-account?token=${token}`;

              const mailOption = {
                from: user.email,
                to: "ajay010e@gmail.com",
                subject: "Verify Your Account",
                template: "verification",
                context: {
                  name: user.name,
                  link: `http://${domain}/verify-account?token=${token}`,
                },
              };

              transporter.sendMail(mailOption, (err, info) => {
                if (err) {
                  console.log(err);
                  response.sentMail = false;
                  response.error = err;
                  resolve(response);
                } else {
                  // console.log("Email Sent.");
                  response.sentMail = true;
                  response.details = info;
                  response.token = token;
                  resolve(response);
                }
              });
            }
          });
      } else {
        resolve({ status: false });
      }
    });
  },

  // ---------------------------------------------------------------------------------
  search: (data) => {
    // console.log(data);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .updateOne(
          {
            _id: objectId("611d41403b274a2cfefff887"),
          },
          {
            $inc: { searchCount: 1 },
          }
        );
      // .then((response) => {
      //   // console.log(response);
      // });
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find({
          location: data.place.toLowerCase(),
          job: data.job.toLowerCase(),
          //  status:"active"
        })
        .toArray();
      // console.log(users);

      if (users.length) {
        resolve({ status: true, result: true, emp: users });
      } else {
        let emp = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .find({
            job: data.job.toLowerCase(),
            // status:"active"
          })
          .toArray();
        // console.log(emp);

        if (emp.length) {
          resolve({ status: true, result: false, emp: emp });
        } else {
          resolve({ status: false });
        }
      }
    });
  },
  incrementCount: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .updateOne(
          {
            _id: objectId("611d41403b274a2cfefff887"),
          },
          {
            $inc: { clickCount: 1 },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------

  // adminSignup: (data) => {
  //   return new Promise(async (resolve, reject) => {
  //     // console.log(
  //     //   "------------------------------------------------------------------"
  //     // );
  //     // console.log(data);
  //     // console.log(
  //     //   "------------------------------------------------------------------"
  //     // );
  //     data.code = await bcrypt.hash(data.code, 10);
  //     data.id = await bcrypt.hash(data.id, 10);
  //     data.searchCount = 0;
  //     data.clickCount = 0;
  //     // console.log(
  //     //   "------------------------------------------------------------------"
  //     // );
  //     // console.log(data);
  //     // console.log(
  //     //   "------------------------------------------------------------------"
  //     // );
  //     db.get()
  //       .collection(collection.ADMIN_COLLECTION)
  //       .insertOne(data)
  //       .then((response) => {
  //         // console.log(
  //         //   "------------------------------------------------------------------"
  //         // );
  //         // console.log(response);
  //         // console.log(
  //         //   "------------------------------------------------------------------"
  //         // );
  //         if (response.acknowledged) {
  //           response.status = true;
  //           resolve(response);
  //         } else {
  //           resolve({ status: false });
  //         }
  //       });
  //   });
  // },

  adminLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      // console.log(
      //   "------------------------------------------------------------------"
      // );
      // console.log(data);
      // console.log(
      //   "------------------------------------------------------------------"
      // );
      let user = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .find()
        .toArray();
      // console.log(
      //   "------------------------------------------------------------------"
      // );
      // console.log(user);
      // console.log(
      //   "------------------------------------------------------------------"
      // );
      bcrypt.compare(data.id, user[0].id).then((r1) => {
        // console.log(r1);
        if (r1) {
          bcrypt.compare(data.code, user[0].code).then((r2) => {
            // console.log(r2);
            if (r2) {
              resolve({ status: true, admin: user[0]._id.toString() });
            } else {
              resolve({ status: false });
            }
          });
        } else {
          resolve({ status: false });
        }
      });
    });
  },
  getData: () => {
    return new Promise(async (resolve, reject) => {
      // console.log();
      let data = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .find()
        .toArray();
      // console.log(
      //   "----------------------------------------------------------------------"
      // );
      // console.log(data);
      // console.log(
      //   "----------------------------------------------------------------------"
      // );

      let resp = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      // console.log(
      //   "----------------------------------------------------------------------"
      // );

      // console.log(resp);
      // console.log(
      //   "----------------------------------------------------------------------"
      // );
      resolve({ status: true, data, resp });
    });
  },
  suspendUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .update(
          { _id: objectId(userId) },
          {
            $set: {
              status: "suspended",
              verified: false,
            },
          }
        )
        .then((response) => {
          console.log(response);
          if (response) {
            resolve({ status: true });
          } else {
            resolve({ status: false });
          }
        });
    });
  },
  editImage: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              image: true,
            },
          }
        )
        .then((response) => {
          // console.log(response);
          if (response) resolve({ status: true });
          else resolve({ status: false });
        });
    });
  },
  removeImage: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              image: false,
            },
          }
        )
        .then((response) => {
          // console.log(response);
          if (response) resolve({ status: true });
          else resolve({ status: false });
        });
    });
  },
};

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
