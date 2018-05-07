


create table user(email text, password text, firstname text, familyname text, gender text, city text,  country text, primary key(email));

create table user_token(email text, token text, foreign key(email) references user(email));

create table messages(sender text, email text, content text);

create table profile_pic(email text, picture text);

create table media_messages(sender text, email text, media text);
