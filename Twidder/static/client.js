function socket(){
  console.log("1");
  var ws = new WebSocket('ws://127.0.0.1:5000/echo');

  ws.onopen = function() {
    var token = localStorage.getItem('token');
    console.log('token:', token)
    ws.send(token);
  }

  ws.onmessage = function (message) {
    console.log("2")
    localStorage.removeItem('token');
    console.log("token removed");
    document.getElementById("main").innerHTML = document.getElementById("welcomeview").innerHTML;
    console.log('Automatic log out');
  }

}

function signin() //FUNKAR
{
    var email = document.getElementById("email1").value;
    var password = document.getElementById("password1").value;
    var payload = {"email": email, "password" : password}

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/signin", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onreadystatechange = function() {
      if (this.readyState ==4 && this.status == 200) {
        var parsedJson = JSON.parse(xhttp.responseText)
        var message = parsedJson.message;
        var success = parsedJson.success;
        var data = parsedJson.token;


        if (success) {
            localStorage.setItem("token", data);
            check_token();
            socket();
        }
        else {
            document.getElementById("SignInMessage").innerHTML = message;
        }
      }

    }
    xhttp.send(JSON.stringify(payload))

    return false;
}

//FUNKAR
function check_token() {
    if (localStorage.getItem("token"))
      {
        document.getElementById("main").innerHTML = document.getElementById("profileview").innerHTML;
        socket();
      }
    else
        {document.getElementById("main").innerHTML = document.getElementById("welcomeview").innerHTML;}

}

function ValidatePassword() //signup
{
    var Password = document.getElementById("password2").value;
    var RepeatPassword = document.getElementById("repeatpsw2").value;

    if (Password.length < 6) {
        document.getElementById("Message").innerHTML = "Password must be at least 6 characters long";
        return false;
    }

    else if(Password != RepeatPassword){
        document.getElementById("Message").innerHTML = "Passwords do not match";
        return false;
    }

    else {

        var user = {
            'email': document.getElementById("email2").value,
            'password': document.getElementById("password2").value,
            'firstname': document.getElementById("firstname").value,
            'familyname': document.getElementById("familyname").value,
            'gender': document.getElementById("gender").value,
            'city': document.getElementById("city").value,
            'country': document.getElementById("country").value,

        }
      }

      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", "/signup", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.onreadystatechange = function() {
        if (this.readyState ==4 && this.status == 200) {
          var parsedJson = JSON.parse(xhttp.responseText)
          var message = parsedJson.message;
          var success = parsedJson.success;
          var data = parsedJson.token;


          if (success) {
            document.getElementById("Message").innerHTML = message;
          }
          else {
              document.getElementById("Message").innerHTML = message;
          }
        }

      }
      xhttp.send(JSON.stringify(user))

      return false;
    }


//FUNKAR
function homeTab(evt, name) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
    showProfile();
    showmyWall();
}




function UpdatePassword()//FUNKAR
{
    var old_password = document.getElementById("old_password").value;
    var new_password = document.getElementById("new_password").value;
    var new_password2 = document.getElementById("new_password2").value;

    if (new_password.length < 6) {
        document.getElementById("Message2").innerHTML = "Password must be at least 6 characters long";
        return false;
    }

    else if(new_password != new_password2){
        document.getElementById("Message2").innerHTML = "Passwords do not match";
        return false;
    }

    else {
        var token = localStorage.getItem("token");
        var payload = {"token": token, "oldPassword": old_password, "newPassword" : new_password};
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/changepassword", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.onload = function()
         {
            var parsedJson = JSON.parse(xhttp.responseText)
            var message = parsedJson.message;
            var success = parsedJson.success;
            console.log(message)

            document.getElementById("Message2").innerHTML = message;
          }
        xhttp.send(JSON.stringify(payload))
        return false;

        }
}

//FUNKAR
var log_out = function()
{
    var token = { "token" : localStorage.getItem("token")};

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/signout", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function()
     {
        var parsedJson = JSON.parse(xhttp.responseText)
        var message = parsedJson.message;
        var success = parsedJson.success;

        if (success)
        {
            localStorage.removeItem("token");
            check_token();

        }
        document.getElementById("Message2").innerHTML = message;

      }
      xhttp.send(JSON.stringify(token))

};

function showProfile() //FUNKAR
{
     console.log('showprofile')
     var token = localStorage.getItem("token");
     var xhttp = new XMLHttpRequest();
     xhttp.open("GET", "/getuserdatabytoken/" + token, true);
     xhttp.setRequestHeader("Content-Type", "application/json");
     xhttp.onload = function(){
         var parsedJson = JSON.parse(xhttp.responseText);
         var message = parsedJson.message;
         var success = parsedJson.success;
         var data = parsedJson.data;
         console.log(data)

         if(success)
         {document.getElementById("user_name").innerHTML = data.firstname;
         document.getElementById("user_family").innerHTML = data.familyname;
         document.getElementById("user_gender").innerHTML = data.gender;
         document.getElementById("user_city").innerHTML = data.city;
         document.getElementById("user_country").innerHTML = data.country;
         document.getElementById("user_email").innerHTML = data.email;
         document.getElementById("pic").src = "static/" + data.picture}
       }
       xhttp.send();

}


function post_message() // FUNKAR
{
    var token = localStorage.getItem("token");
    var email = document.getElementById("user_email").innerHTML;
    var content = document.getElementById("text_message").value;
    var payload = {"message": content, "token": token, "email": email}
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/postmessage", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function(){
        var parsedJson = JSON.parse(xhttp.responseText);
        var message = parsedJson.message;
        var success = parsedJson.success;

        if(success)
        {
            document.getElementById("text_message").value = "";
            showmyWall();
        }

      }
      xhttp.send(JSON.stringify(payload));
}

function post_message_friend(event)//FUNKAR
{
    var token = localStorage.getItem("token");
    var toEmail = document.getElementById("friend").value;
    var content = document.getElementById("text_message_browse").value;
    var payload = {"message": content, "token": token, "email": toEmail}
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/postmessage", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function(){
        var parsedJson = JSON.parse(xhttp.responseText);
        var message = parsedJson.message;
        var success = parsedJson.success;
        console.log(success)

        if(success)
        {   console.log(message);
            document.getElementById("text_message_browse").value = "";
            showUsersWall();
        }

      }
      xhttp.send(JSON.stringify(payload));
}


function showmyWall() //FUNKAR
{
    var token = localStorage.getItem("token");
    var payload = {"token": token}
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/getusermessagesbytoken/" + token, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function() {
        var parsedJson = JSON.parse(xhttp.responseText)
        var message = parsedJson.message;
        var success = parsedJson.success;
        var data = parsedJson.data;


        if (success) {
          document.getElementById("wall").innerHTML = " ";
          for(var i= 0; i<data.length; i++){
              var row = "<div class='row'>"
              row  = row + data[i].writer + ":" + data[i].content;
              document.getElementById("wall").innerHTML += row;
          }
        }
      }
   xhttp.send();
}

function showUsersWall() //FUNKAR
{
    var token = localStorage.getItem("token");
    var email_friend = document.getElementById("friend").value;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/getusermessagesbyemail/" + token + "/" + email_friend, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function() {
        var parsedJson = JSON.parse(xhttp.responseText)
        var message = parsedJson.message;
        var success = parsedJson.success;
        var data = parsedJson.data;
        console.log(data);

        if (success) {
          document.getElementById("browse_wall").innerHTML = " ";
          for(var i= 0; i<data.length; i++){
            var row = "<div class='row'>"
            row  = row + data[i].writer + ":" + data[i].content;
            document.getElementById("browse_wall").innerHTML += row;
          }
        }
      }
   xhttp.send();

}

function searchUser() //FUNKAR
{
    var token = localStorage.getItem("token"); /*token for the user, and email for the friend*/
    var email = document.getElementById("friend").value;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/getuserdatabyemail/" + token + "/" + email, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function() {
        var parsedJson = JSON.parse(xhttp.responseText)
        var message = parsedJson.message;
        var success = parsedJson.success;
        var data = parsedJson.data;
        console.log('picture:', data.picture)

        if (success) {

            document.getElementById("friend_name").innerHTML = data.firstname;
            document.getElementById("friend_family").innerHTML = data.familyname;
            document.getElementById("friend_gender").innerHTML = data.gender;
            document.getElementById("friend_city").innerHTML = data.city;
            document.getElementById("friend_country").innerHTML = data.country;
            document.getElementById("friend_email").innerHTML = data.email;
            document.getElementById("message_browse").innerHTML = message;
            document.getElementById("pic_browse").src = "static/" + data.picture;
            document.getElementById("browse_hide").style.display = "block";
            showUsersWall();
        }
        else {
            document.getElementById("message_browse").innerHTML = message;
            document.getElementById("browse_hide").style.display = "none";
            return false;
        }
      }
   xhttp.send();
}

var preview= function(event){
  var input = event.target;

  var reader = new FileReader();
  reader.onload = function() {
  var dataURL = reader.result;
  var output =document.getElementById('pic');
  output.src = dataURL;
  console.log('dataURL', dataURL)
  };
  reader.readAsDataURL(input.files[0]);
}




function upload_profilepicture()
{
      var token = localStorage.getItem("token");
      var email = document.getElementById("user_email").innerHTML;

      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", "/profilepicture/"+ token + "/" + email, true);

      xhttp.onload = function(){
          console.log(xhttp.responseText);
          var parsedJson = JSON.parse(xhttp.responseText);
          var message = parsedJson.message;
          var success = parsedJson.success;
          var data = parsedJson.data;
          if(success)
          {
              showProfile();
          }
      }

      var formData = new FormData();
      var picture = document.getElementById("post_pic").files[0];
      formData.append('file', picture);

      for(var entry of formData.entries()) {
          console.log("formdata", entry);
      }

      xhttp.send(formData);
}


function upload_media()
{

  var picture = document.getElementById("post_media").files[0];
  var formData = new FormData();
  var token = localStorage.getItem("token");
  console.log('picture', picture, 'token_js', token);
  var email = document.getElementById("user_email").innerHTML;
  formData.append('token', token);
  formData.append("email", email);
  formData.append("file", picture);
  for(var entry of formData.entries())
  console.log('formDAta', entry);

  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/addmedia", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.onload = function(){

      var parsedJson = JSON.parse(xhttp.responseText);
      var message = parsedJson.message;
      var success = parsedJson.success;
      var data = parsedJson.data;

      if(success)
      {
        showmyWall();
      }

    }
    xhttp.send(formData);
}


  //DRAG AND DROP
  function allowDrop(event) {
    console.log("allow drop");
      event.preventDefault();
  }

  function drag(event) {
      event.dataTransfer.setData("Text", event.target.id);
      console.log("drag");
  }

  function drop(event) {
      event.preventDefault();
      var data = event.dataTransfer.getData("Text");
      console.log("data", data);

      var nodeCopy = document.getElementById(data).cloneNode(true);
      console.log("nodeCopy", nodeCopy);
      nodeCopy.id = "copyId"
      event.target.appendChild(nodeCopy);
      post_message();
      console.log("drop");

  }


  function drop_friend(event) {
      event.preventDefault();
      var data = event.dataTransfer.getData("Text");
      console.log("data", data);

      var nodeCopy = document.getElementById(data).cloneNode(true);
      console.log("nodeCopy", nodeCopy);
      nodeCopy.id = "copyId"
      event.target.appendChild(nodeCopy);
      post_message_friend();
      console.log("drop");

  }

window.onload = function(){
    //localStorage.removeItem("token");
    check_token();
};
