// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/* ========================== Const -- declaration ==========================*/

/* Home-Page btn */
const homeBtn = document.querySelector(".sec-2");

/* Main-Page */
const fileUpload = document.getElementById("upload-button");
const feedback = document.getElementById("feedback");
const progress = document.getElementById("progress");

/* Signup btn*/
const createAcountBtn = document.getElementById("signup");
const exitBtn = document.querySelector(".exit-symbol");

/* Forms*/
const resetBtn = document.querySelector(".reset-password-form");
const signupBtn = document.querySelector(".signup-form");
const submitBtn = document.querySelector(".contact-form");

/* Password-reset btn*/
const copyBtn = document.querySelector("#login-btn");
const downBtn = document.querySelector(".downBtn");

const viewBtn = document.querySelector(".eye-password");

/* Profile btn */
const discardBtn = document.querySelector(".btn-discard");
const editBtn = document.querySelector(".btn-edit");
const editImage = document.querySelector(".fa-camera");
const exitImage = document.querySelector(".exit-image");

/* Mail btn */
const mailBtn = document.querySelector(".mail-btn");

// ============================================================================

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/* ================================= functions ===============================*/

window.onload = () => {
  let flag = document.getElementById("hidden-input-flag");
  // console.log(flag);
  if (flag) {
    popSignupForm();
  }
};
const popSignupForm = () => {
  document.querySelector(".sec-2").style.opacity = ".1";
  document.querySelector(".sec-3").style.display = "block";
  document.querySelector(".sec-3").style.visibility = "visible";
  document.querySelector(".sec-3").style.opacity = "1";
};
const unpopSignupForm = () => {
  document.querySelector(".sec-3").style.display = "none";
  document.querySelector(".sec-3").style.visibility = "hidden";
  document.querySelector(".sec-2").style.opacity = "1";
  document.querySelector(".sec-3").style.opacity = "0";
};
const viewPassword = () => {
  document.querySelector("i").classList.toggle("fa-eye-slash");
  document.querySelector("i").classList.toggle("fa-eye");
  if (document.querySelector("i").classList.contains("fa-eye")) {
    document.getElementById("l-pass").setAttribute("type", "text");
  } else {
    document.getElementById("l-pass").setAttribute("type", "password");
  }
};

// ============================================================================

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/* ============================== Ajax -- action =============================*/

/* Forms -- action*/

resetBtn?.addEventListener("submit", (e) => {
  e.preventDefault();
  // console.log("clicked");
  mailBtn.classList.remove("primary");
  mailBtn.classList.add("loading");
  let email = document.getElementById("rp-email");
  let formData = {
    email: email.value,
  };
  // console.log(formData);
  $.ajax({
    url: "/reset-password",
    method: "post",
    data: formData,
    success: (response) => {
      // console.log(response);
      if (response.status) {
        // alert(response);
        // popup("Password Sent");
        mailBtn.classList.remove("loading");
        mailBtn.classList.add("completed");
        setInterval(() => {
          location.href = "/";
        }, 1500);
      } else if (response.error) {
        // popup("Error , Try after some time.");
        mailBtn.classList.remove("loading");
        mailBtn.classList.add("uncompleted");
        setInterval(() => {
          location.href = "/contact-us";
        }, 1500);
      } else {
        // popup("Error , Try after some time.");
        mailBtn.classList.remove("loading");
        mailBtn.classList.add("uncompleted");
        setInterval(() => {
          location.href = "/forget-password";
        }, 1500);
      }
    },
  });
});
signupBtn?.addEventListener("submit", (e) => {
  e.preventDefault();
  mailBtn.classList.remove("primary");
  mailBtn.classList.add("loading");
  let name = document.querySelector(".sf-name");
  let mobile = document.querySelector(".sf-mobile");
  let email = document.querySelector(".sf-email");
  // let job = document.querySelector(".sf-job");
  // let loc = document.querySelector(".sf-location");
  let password = document.querySelector(".sf-password");
  let question = document.querySelector(".sf-question");
  let answer = document.querySelector(".sf-answer");
  let formData = {
    name: name.value,
    email: email.value,
    mob: mobile.value,
    pass: password.value,
    ques: question.value,
    ans: answer.value,
  };
  console.log(formData);
  $.ajax({
    url: "/signup",
    method: "post",
    data: formData,
    success: (response) => {
      console.log(response);
      if (response.reload) {
        location.href = "/login";
      } else if (response.status) {
        // alert(response);
        // popup("Password Sent");
        mailBtn.classList.remove("loading");
        mailBtn.classList.add("completed");
        setInterval(() => {
          location.href = "/";
        }, 1500);
      } else {
        // popup("Error , Try after some time.");
        mailBtn.classList.remove("loading");
        mailBtn.classList.add("uncompleted");
        setInterval(() => {
          location.href = "/contact-us";
        }, 1500);
      }
    },
  });
});
submitBtn?.addEventListener("submit", (e) => {
  e.preventDefault();
  mailBtn.classList.remove("primary");
  mailBtn.classList.add("loading");
  let name = document.getElementById("cf-name");
  let subject = document.getElementById("cf-subject");
  let email = document.getElementById("cf-email");
  let mobile = document.getElementById("cf-mobile");
  let message = document.getElementById("cf-message");
  let formData = {
    name: name.value,
    mobile: mobile.value,
    email: email.value,
    subject: subject.value,
    message: message.value,
  };
  // console.log(formData);
  $.ajax({
    url: "/contact-form",
    method: "post",
    data: formData,
    success: (response) => {
      if (response.status) {
        // alert(response);
        // popup("Mail Sent");
        mailBtn.classList.remove("loading");
        mailBtn.classList.add("completed");
        setInterval(() => {
          location.href = "/";
        }, 1500);
      } else {
        // popup("Error , Try after some time.");
        mailBtn.classList.remove("loading");
        mailBtn.classList.add("uncompleted");
        setInterval(() => {
          location.href = "/contact-us";
        }, 1500);
      }
    },
  });
});

/* Jquery -- actions*/
$("#mob-click").click((e) => {
  // e.preventDefault();
  $.ajax({
    url: "/increment-count",
    method: "get",
    // data: $("#reset-password").serialize(),
    success: (response) => {
      console.log(response);
      // if (response.status) {
      //   // alert(response.password);
      //   $("#password").val(response.password);
      //   $("#password").removeAttr("hidden");
      //   $("#login-btn").removeAttr("hidden");
      //   $("#pass-label").removeAttr("hidden");
      //   $("#reset-password").hide();
      //   // location.href = "/login";
      //   // $("#password").html(response.password);
      // } else {
      //   location.href = "/forget-password";
      // }
    },
  });
});
$("#reset-password").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/forget-password",
    method: "post",
    data: $("#reset-password").serialize(),
    success: (response) => {
      console.log(response);
      if (response.status) {
        // alert(response.password);
        $("#password").val(response.password);
        $("#password").removeAttr("hidden");
        $("#login-btn").removeAttr("hidden");
        $("#pass-label").removeAttr("hidden");
        $("#reset-password").hide();
        // location.href = "/login";
        // $("#password").html(response.password);
      } else {
        location.href = "/forget-password";
      }
    },
  });
});
$(document).ready(function () {
  $("#example").DataTable();
});
const verifyProfile = function (userId) {
  mailBtn.classList.remove("primary");
  mailBtn.classList.add("loading");
  $.ajax({
    url: "verify-profile",
    method: "get",
    data: userId,
    success: (response) => {
      console.log(response);
      if (response.sentMail) {
        // alert(response);
        // popup("Password Sent");
        mailBtn.classList.remove("loading");
        mailBtn.classList.add("completed");

        setInterval(() => {
          location.href = "/";
        }, 500);
      } else {
        // popup("Error , Try after some time.");
        mailBtn.classList.remove("loading");
        mailBtn.classList.add("uncompleted");
        setInterval(() => {
          location.href = "/contact-us";
        }, 500);
      }
    },
  });
};

// =============================================================================

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

/* Password-reset btn -- action*/
copyBtn?.addEventListener("click", (e) => {
  const text = document.querySelector("input#password");
  text.select();
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
});
downBtn?.addEventListener("click", function () {
  document.querySelector(".way-2").classList.toggle("active");
  document.querySelector(".fa-angle-down").classList.toggle("active");
});

viewBtn?.addEventListener("click", () => {
  viewPassword();
});

/* Signup btn -- action*/
createAcountBtn?.addEventListener("click", function () {
  //   console.log();
  popSignupForm();
});
exitBtn?.addEventListener("click", function () {
  //   console.log("clicked");
  unpopSignupForm();
});

/* Profile btn -- action*/
discardBtn?.addEventListener("click", function () {
  document.querySelector(".btn-save").style.visibility = "hidden";
  discardBtn.style.visibility = "hidden";
  document.querySelectorAll("input").forEach((val) => {
    val.setAttribute("readonly");
  });
});
editBtn?.addEventListener("click", function () {
  document.querySelector(".btn-save").style.visibility = "visible";
  document.querySelector(".p-para").style.display = "block";
  discardBtn.style.visibility = "visible";
  document.querySelectorAll("input").forEach((val) => {
    val.removeAttribute("readonly");
  });
});
editImage?.addEventListener("click", () => {
  document.querySelector(".sec-2").style.opacity = ".1";
  document.querySelector(".popup-editImage").style.display = "flex";
});
exitImage?.addEventListener("click", () => {
  document.querySelector(".sec-2").style.opacity = "1";

  document.querySelector(".popup-editImage").style.display = "none";
});

/* Home-Page btn -- action */
homeBtn?.addEventListener("click", function (e) {
  if (e.x > 30 && e.x < 85 && e.y > 20 && e.y < 85) {
    console.log(e.x, e.y);
    window.location = "/";
  }
});

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// const verifyBtn = document.querySelector("#verify-btn");
// const signupBtn = document.querySelector("#signup-btn");

// verifyBtn?.addEventListener("click", () => {
//   mailBtn.classList.remove("primary");
//   mailBtn.classList.add("loading");
// });

// signupBtn?.addEventListener("click", () => {
//   mailBtn.classList.remove("primary");
//   mailBtn.classList.add("loading");
// });

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

const reader = new FileReader();
fileUpload?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  reader.readAsDataURL(file);

  reader.addEventListener("progress", (e) => {
    if (e.loaded && e.total) {
      if (progress.classList.contains("hide")) {
        progress.classList.remove("hide");
        progress.style.visibility = "visible";
      }
      const percent = (e.loaded / e.total) * 100;
      progress.value = percent;
      document.getElementById("progress-label").innerHTML =
        Math.round(percent) + "%";

      if (Math.round(percent) === 100) {
        if (!progress.classList.contains("hide")) {
          progress.classList.add("hide");
          progress.style.visibility = "hidden";
        }
        let msg = `<span>${file.name.substring(
          0,
          35
        )}... uploaded successfully.</span>`;
        feedback.innerHTML = msg;
        console.log(file.name);
      }
    }
  });
});

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
