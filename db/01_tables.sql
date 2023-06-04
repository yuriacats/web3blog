CREATE DATABASE webblog;
SET CHARSET UTF8;
USE webblog;
CREATE TABLE tag_name(
    id int AUTO_INCREMENT PRIMARY KEY,
    name varchar(20) UNIQUE NOT NULL
    );
CREATE TABLE post(
    id int AUTO_INCREMENT PRIMARY KEY,
    slug varchar(20) UNIQUE NOT NULL,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE tag_post(
        tag_id int NOT NULL, 
        post_id int NOT NULL,
        FOREIGN KEY (tag_id) REFERENCES tag_name(id) ,
        FOREIGN KEY (post_id) REFERENCES post(id)
    );
CREATE TABLE author(
    id int AUTO_INCREMENT PRIMARY KEY,
    name varchar(20) NOT NULL
    );
CREATE TABLE author_secret(
    author_id int PRIMARY KEY UNIQUE,
    email varchar(256) UNIQUE NOT NULL,
    password varchar(256) NOT NULL, 
    FOREIGN KEY (author_id) REFERENCES author(id) 
    );
CREATE TABLE post_revision(
    id int UNIQUE AUTO_INCREMENT PRIMARY KEY,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP ,
    title varchar(256) NOT NULL,
    author_id int NOT NULL,
    post_id int NOT NULL,
    public int NOT NULL, 
    post_data MEDIUMTEXT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES author(id), 
    FOREIGN KEY (post_id) REFERENCES post(id) 
);
