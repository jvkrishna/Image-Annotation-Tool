# Image-Annotation-Tool

Image annotation tool is developed for Nvidia AI City Challenge. The tool is designed to provide a platform for the participating teams to annotate their assigned images collaboratively.

## Setup
1. Download and install [MongoDB](https://docs.mongodb.com/manual/installation/)
2. Download and install latest [NodeJS](https://nodejs.org/en/download/current/)
3. Host all your images in a server.
4. Update database info "config/database.js" file.
5. Update the token value in "config/authenticator.js" file. This value will be used as a access token for REST APIs. 

## Installation:
1. Run "npm install" to download all modules.
2. Run "npm start" to start the server.
3. By default the server will run on "3000" port.
4. A default "admin/admin" user will be created with admin role.

## API's
1. To create a new user, use the sign up page (http://\<host>:\<port>/signup) or the REST APIs.
2. To use the user create API, make a post request to the below URL.

    **http://\<host>:\<port>/api/user/create?accesstoken=\<token-value>**
    1. Headers: {content-type:application/json}
    2. Sample Request Body: 
       
            {
                "name":"test",
                "teamName":"test",
                "username":"test",
                "password":"test",
                "roles":["annotator"]
            }

3. To setup the image meta data, make a post request to the following URL.

    **http://\<host>:\<port>/api/image/create?accesstoken=\<token-value>**
    1. Headers: {content-type:application/json}
    2. Sample Request Body: 
       
            {
            	"imageURL":"https://upload.wikimedia.org/wikipedia/commons/3/3e/I-80_Eastshore_Fwy.jpg",
            	"users":[
            		{
            			"username":"admin"
            			
            		},{
            			"username":"test"
            		}
            	]
            }

