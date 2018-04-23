from flask import app, request
from flask import Flask, jsonify
import database_helper
import json
from random import randint
from gevent.wsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketError
from flask_sockets import Sockets

import sqlite3
from flask import g
DATABASE = ("/home/susba244/Desktop/TDDD97/Twidder/database.db")

app = Flask(__name__)

socket = Sockets(app)
socket_connections = {}

allow_reuse_address = True


@app.route('/')
def root():
    return app.send_static_file(filename='client.html')

@app.before_request
def before_request():
    database_helper.connect_db()

@app.teardown_request
def teardown_request(exception):
    database_helper.close_db()

#@app.route("/", methods=['POST'])
#def hello():
#    return request.get_json()['token']


@socket.route('/echo')
def echo_socket(ws):
    g.db = sqlite3.connect(DATABASE)

    print "ws", ws
    while True:
        print "ws: ", ws
        token = ws.receive()
        print "token:", token
        email = database_helper.get_email_by_token(token) #------------------------------------
        print "email:", email
        socket_connections[email[0]]= ws



@app.route("/signup", methods=['POST'])
def sign_up():

        email = request.json['email']
        password= request.json['password']
        firstname = request.json['firstname']
        familyname = request.json['familyname']
        gender = request.json['gender']
        city = request.json['city']
        country = request.json['country']
        picture = "/static/profile.png"


        if (email == None or password == None or firstname == None or familyname == None or gender== None or city== None or country == None):
            return jsonify({"success": False, "message": 'You need to complete all the information'})

        elif (len(password)<6):
            return jsonify({"success": False, "message": 'Password needs to be at least 6 characters long'})

        else:
            result_pic= database_helper.insert_picture(email, picture)
            result = database_helper.insert_user(email, password, firstname, familyname, gender, city, country)
            if result == True:
                return jsonify({"success": True, "message": 'user added'})
            else:
                return jsonify({"success": False, "message": 'could not add the user'})



@app.route("/signin", methods=['POST'])
def sign_in():
    username = request.json['email']
    password= request.json['password']
    username_2= database_helper.get_email_by_email(username) #mail is no jsonified
    tok = database_helper.check_already_login(username)
    print("tok:", tok)
    if tok:  # See if already logged in somewhere else
        database_helper.remove_user_token(tok)
        print("doubble inlog, one token removed")
        print("socket connections:", socket_connections)
        print(username_2[0] in socket_connections)
        if username_2[0] in socket_connections:
            ws = socket_connections[username_2[0]]
            ws.send('message')
            del socket_connections[username_2[0]]

    token = ""
    alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    print username
    for i in range(0,36):
        rand = randint(0, len(alphabet)-1)
        sign = alphabet[rand]
        token += sign

    result = database_helper.check_user(username, password, token)


    if result != False:
        return jsonify({"success": True, "message": 'succesfully signed in', "token": result})
    else:

        return jsonify({"success": False, "message": 'the user does not exist or wrong password'})


@app.route("/signout", methods = ['POST'])
def sign_out():
    token = request.json['token']
    result = database_helper.remove_user_token(token)
    if result == True:
        return jsonify({"success": True, "message": 'succesfully signed out'})
    else:
        return jsonify({"success": False, "message": 'still signed in'})


@app.route("/changepassword", methods = ['POST'])
def change_password():
    token = request.json['token']
    oldPassword = request.json['oldPassword']
    newPassword = request.json['newPassword']
    result = database_helper.change_psw(token, oldPassword, newPassword)

    if (len(newPassword)<6):
        return jsonify({"success": False, "message": 'Password needs to be at least 6 characters long'})

    elif result == True:
        return jsonify({"success": True, "message": 'Password changed'})

    else:
        return jsonify({"success": False, "message": 'Could not change password'})


@app.route("/getuserdatabytoken/<token>", methods = ['GET'])
def get_user_data_by_token(token):
    print 'server'
    try:
        result = database_helper.get_data_by_token(token)
        return jsonify({"success": True, "message": 'Your information is retrieved', "data": result})
    except Exception as e:
        print e
        return jsonify({"success": False, "message": 'Could not return your information', "data": result})



@app.route("/getuserdatabyemail/<token>/<email_friend>", methods = ['GET'])
def get_user_data_by_email(token, email_friend):

        result = database_helper.get_data_by_email(token, email_friend)
        if result != False:
            return jsonify({"success": True, "message": '', "data": result})
        else:
            return jsonify({"success": False, "message": 'user does not exist'})




@app.route("/getusermessagesbytoken/<token>", methods = ['GET'])
def get_user_messages_by_token(token):

    try:
        result = database_helper.get_messages_by_token(token)
        return jsonify({"success": True, "message": 'Message returned', "data": result})
    except:
        return jsonify({"success": False, "message": 'Could not return your message'})



@app.route("/getusermessagesbyemail/<token>/<email_friend>", methods = ['GET'])
def get_user_messages_by_email(token, email_friend):

    try:
        result = database_helper.get_messages_by_email(token, email_friend)
        return jsonify({"success": True, "message": 'Could return user messages', "data": result})
    except:
        return jsonify({"success": False, "message": 'Could not return user messages'})



@app.route("/postmessage", methods = ['POST'])
def post_message():
    message = request.json['message']
    token = request.json['token']
    retriever = request.json['email']
    result = database_helper.post_my_message(token, retriever, message)

    if result == True:
        return jsonify({"success": True, "message": 'Message sent'})
    else:
        return jsonify({"success": False, "message": 'Message not sent'})


#is not used right now
@app.route("/profilepicture/<token>/<email>", methods = ['POST'])
def profile_picture(token, email):
    print "PROFILE PICTURE"
    picture = request.files['file']
    #token = request.form['token']
    #email = request.form['email']
    print "PROF1"
    picturename = token + "___" + email + ".png"
    print "PROF2"
    picture.save("static/" + picturename)

    result = database_helper.post_profilepic(email, picturename)

    if result == True:
        return jsonify({"success": True, "message": 'Picture saved'})
    else:
        return jsonify({"success": False, "message": 'Picture not posted'})





#app.run()

if __name__== "__main__":
    print "start server"
    app.debug = True
    http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
