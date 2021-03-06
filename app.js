var http = require("http");
var user = require("./userData/user");
var mongo = require("./userData/database");
var notifyHandler = require("./notification/notifyHandler");
var parseHandler = require("./parse/parseHandler");

var createUser = function(data, callback){
    mongo(user(data), "CreateUser", callback);
}
var searchUser = function(data, callback){
    mongo(data.email, "SearchUser", callback)
}
var findAllUser = function(callback){
    mongo(null, "FindAll", callback);
}

var server = http.createServer(function(request, response) {

    if (request.method == "POST"){
        request.on("data", function(jsonBody){
            var parsedBody = JSON.parse(jsonBody);
            console.log(parsedBody);
            if (parsedBody.method == "create"){
                parseHandler(parsedBody.address, function(err, garbageData){
                    console.log(garbageData);
                    parsedBody.garbage = garbageData.garbage
                    createUser(parsedBody, function(check){
                        console.log(check);
                        var preGarbageDay = parseInt(garbageData.dayOfWeek) - 2;
                        if(parsedBody.sendEmail){
                            notifyHandler({
                                email:parsedBody.email,
                                message:"Garbage day is tomorrow!",
                                garbageDay:preGarbageDay,
                                holidays:garbageData.holidays
                            }, null, null)
                        }
                        if(parsedBody.sendText){
                            notifyHandler(null, {
                                phoneNumber:parsedBody.phoneNumber,
                                message:"Garbage day is tomorrow!",
                                garbageDay:preGarbageDay,
                                holidays:garbageData.holidays
                            }, null)
                        }

                        var data = {}
                        if(check){
                            data.status = 200;
                            data.message = "Created user.";
                            response.writeHead(200, {"Content-Type": "application/json"});
                            response.write(JSON.stringify(parsedBody));
                            response.end();
                            console.log("end");
                        }
                        else{
                            data.status = 404;
                            data.message = "Failed to create user.";
                            response.writeHead(404, {"Content-Type": "application/json"});
                            console.log(data);
                            response.write(JSON.stringify(data));
                            response.end();
                        }
                        return;
                    })
                return;
                });
            }
            else if (parsedBody.method == "login"){
                searchUser(parsedBody, function(data){
                    console.log("in");
                    if(data){
                        console.log(data);
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
            else if (parsedBody.method == "find"){
                findAllUser(function(data){
                    console.log(data);
                    
                    data.forEach(function(entry){
                        notifyHandler(null, null, {
                            textValid:entry.sendText,
                            emailValid:entry.sendEmail,
                            message:parsedBody.message,
                            phoneNumber:entry.phoneNumber,
                            emailAddress:entry.email
                        })
                    })
                })
            }
        });
    }

});

server.listen(8080);
console.log("Server is listening");
