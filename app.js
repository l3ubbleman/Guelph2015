var http = require("http");
var user = require("./userData/user");
var mongo = require("./userData/database"); //change to name of file for accessing mongoDB

var createUser = function(data, callback){
    mongo(user(data), "CreateUser", callback);
}

var searchUser = function(data, callback){
    mongo(data.email, "SearchUser", callback)
}
//var searchDB = function(query){
//    return mongo.Query(query, function(data){
//        return data;
//    });
//}

var server = http.createServer(function(request, response) {

    if (request.method == "POST"){
        request.on("data", function(jsonBody){
            var parsedBody = JSON.parse(jsonBody);
            if (parsedBody.method == "create"){
                createUser(parsedBody, function(check){
                    if(check){
                        response.writeHead(200, {"Content-Type": "application/json"});
                        response.write("Created user.");
                        response.end();
                    }
                    else{
                        response.writeHead(404, {"Content-Type": "application/json"});
                        response.write("Failed to create user.");
                        response.end();
                    }
                });
            }
            else if (parsedBody.method == "search"){
                searchUser(parsedBody, function(data){
                    if(data){
                        response.writeHead(200, {"Content-Type": "application/json"});
                        response.write("" + JSON.stringify(data));
                        response.end();
                    }
                    else{
                        response.writeHead(404, {"Content-Type": "application/json"});
                        response.write("User does not exist.");
                        response.end();
                    }
                });
            }
        });
    }

});

server.listen(8080);
console.log("Server is listening");