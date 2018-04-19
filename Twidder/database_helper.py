import sqlite3
from flask import g


DATABASE = ("/home/susba244/Desktop/TDDD97/Twidder/database.db")

def connect_db():
    g.db = sqlite3.connect(DATABASE)

def close_db():
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()

#def get_db():
#    db = getattr(g, 'db', None)
#    if db is None:
#        db = g.db = connect_db()
#        return db

#def query_db(query, args=(), one=False):
#	cur = get_db().execute(query, args)
#	rv = cur.fetchall()
#	get_db().commit()
#	cur.close()
#	return (rv[0] if rv else None) if one else rv


def insert_user(email, password, firstname, familyname, gender, city, country):


    try:
        cur = g.db.execute("insert into user values(?,?,?,?,?,?,?)", [email, password, firstname, familyname, gender, city, country])
        g.db.commit()
        return True
    except:
        return False


def insert_picture(email, picture):

    try:
        cur = g.db.execute("insert into profile_pic values(?,?)", [email, picture])
        g.db.commit()
        return True
    except:
        return False


def check_already_login(email):

    cursor = g.db.execute("select token from user_token where email = ?", [email])
    rows = cursor.fetchone()
    print rows
    cursor.close()

    if rows:
        return rows[0]
    else:
        return False


def check_user(email, password, token):
    result=[]

    cursor = g.db.execute("select * from user where email = ?", [email])
    rows = cursor.fetchall()
    cursor.close()

    print rows

    for index in range(len(rows)):
        result.append({'password':rows[index][1]})

    print result

    if result[0]['password'] == password:
        try:

            cur = g.db.execute("insert into user_token values(?,?)", [email, token])
            g.db.commit()

            return token
        except:
            return False
    else:
        return False


def remove_user_token(token):
    try:
        cur=g.db.execute("delete from user_token where token = ?", [token])
        g.db.commit()
        return True
    except:
        return False


def change_psw(token, oldPassword, newPassword):
    email = []
    current_password = []
    cursor = g.db.execute("select * from user_token where token = ?", [token])
    rows = cursor.fetchall()
    cursor.close()

    for index in range(len(rows)):
        email.append({'email':rows[index][0]})

    cur = g.db.execute("select * from user where email = ?", [email[0]['email']])
    row = cur.fetchall()
    cur.close()

    for index in range(len(row)):
        current_password.append({'password':row[index][1]})

    if oldPassword == current_password[0]['password']:

        cur = g.db.execute("update user set password=? where email=?", [newPassword, email[0]['email']])
        g.db.commit()
        return True
    else:
        return False

def get_email_by_token(token):
    print ("token_db:", token)
    cursor = g.db.execute("select email from user_token where token=?", [token])
    print ("cursor:", cursor)
    row = cursor.fetchall()
    cursor.close()
    print("row:", row)
    return row

def get_email_by_email(email):

    cursor = g.db.execute("select email from user_token where email=?", [email])
    print ("cursor:", cursor)
    row = cursor.fetchall()
    cursor.close()
    print("row:", row)
    return row



def get_data_by_token(token):
    print 'data_hl'
    try:
        cursor = g.db.execute("select user.email, firstname, familyname, gender, city, country " +
            "from user, user_token where user_token.token = ? and user.email = user_token.email", [token])
        row = cursor.fetchone()
        cursor.close()

        cursor = g.db.execute("select picture from profile_pic where email=?", [row[0]])
        rows = cursor.fetchone()
        cursor.close()

        return {
            "email": row[0],
            "firstname": row[1],
            "familyname": row[2],
            "gender": row[3],
            "city": row[4],
            "country": row[5],
            "picture": rows[0],
        }
    except Exception as e:
        print e
        return False


def get_data_by_email(token, email_friend):
    try:

        cursor = g.db.execute("select * from user_token where token = ?", [token])
        cursor.close()

        cursor = g.db.execute("select firstname, familyname, gender, city, country from user where email = ? ", [email_friend])
        row = cursor.fetchone()
        cursor.close()

        cur= g.db.execute("select picture from profile_pic where email=?", [email_friend])
        rows = cur.fetchone()
        cur.close()

        return {
            "email": email_friend,
            "firstname": row[0],
            "familyname": row[1],
            "gender": row[2],
            "city": row[3],
            "country": row[4],
            "picture": rows[0],
            }


    except Exception as e:
        print e
        return False




def get_messages_by_token(token):
    try:
        cursor = g.db.execute("select sender, content from messages, user_token where user_token.token = ? and messages.email = user_token.email", [token])
        rows = cursor.fetchall()
        cursor.close()

        result = []
        for row in rows:
            result.append({ "writer": row[0], "content": row[1] })

        return result

    except:
        return False


def get_messages_by_email(token, email_friend):
    try:
        cursor = g.db.execute("select * from user_token where token = ?", [token])
        cursor.close()
        cur = g.db.execute("select sender, content from messages where email = ? ", [email_friend])

        row = cur.fetchall()
        cur.close()
        result = []
        for rows in row:
            result.append({ "writer": rows[0], "content": rows[1] })
        return result

    except:
        return False



def post_my_message(token, retriever, message):
    try:

        sender = []

        cur = g.db.execute("select email from user_token where token = ?", [token])
        row = cur.fetchone()
        cur.close()


        sender = row[0]

        cur = g.db.execute("insert into messages values(?,?,?)", [sender, retriever, message])

        g.db.commit()
        return True

    except Exception as e:
        print e

        return False

def post_profilepic(email, picture):

    cursor=g.db.execute("delete from profile_pic where email = ?", [email])
    g.db.commit()

    cur = g.db.execute("insert into profile_pic values(?,?)", [email, picture])
    g.db.commit()

    return True
