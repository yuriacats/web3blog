SET CHARSET UTF8;
CREATE USER backend IDENTIFIED WITH mysql_native_password BY 'toor';
GRANT SELECT, INSERT ON webblog.* TO backend;
