# Extension for working with PostgreSQL in Obsidian #

This plugin is an opportunity to integrate a DBMS directly into the editor. It allows you to run queries and visualize data inside Obsidian, and will also allow you to practice SQL skills right in the application. This creates not only a unique learning environment (with theory and practice), but also allows you to document and create important notes on the database.

## *Step-by-step instructions for installing and configuring the plugin* ##
### 1. Install the plugin ###
Download the archive with the plugin from the GitHub repository.

Unzip the file and move the src folder to the plugins folder of your Obsidian repository.


### 2. Installing dependencies ###
Go to the plugin folder via terminal and run the following commands (to install the necessary modules):

`npm install`

`npm run build`


### 3. Server ###
Enter your data (user, password, database) and connect to the server before each use of the plugin:
in the plugin folder (in terminal) enter `node server.js`


### 4. Settings in Obsidian ###
Open Obsidian settings (gear)

Go to the "Plugins" section

Activate the plugin. There you will also be able to configure hotkeys (optional)


Congrats! You can use the extension.


## *Murder Mystery* ##
* Create a new database in PostgreSQL:

`CREATE DATABASE murder_mystery;`

* Open the .sql file from the MurderMystery folder in pgAdmin

* Execute the script to create the database structure

* In the plugin, click "Connect to Murder Mystery"

* Enter connection parameters to the created database


## *Important aspects:* ##

* The server must be running before using the plugin

* Check that PostgreSQL accepts connections from localhost
