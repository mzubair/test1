// using git - Zubair test

var _ = require('underscore')._;

Parse.Cloud.define("sonicNotifyCheckin", function(request, response) {
			/**************************INPUT PARAMETERS***********************************/
			       // Destination Code
					
					/**************************DESCRIPTION***********************************/
					// returns the checkInID,destinationId,pointId,pointbalance
					/*************************OUTPUT PARAMETERS******************************/
					// checkInID,destinationId,pointId,pointbalance
					
			var Destination=Parse.Object.extend("Destination");
			var query=new Parse.Query(Destination);
			
			var destinationCode=request.params.destinationCode;
			
			 if (!destinationCode || destinationCode === "") {    
				response.error("Invalid code parameters in request"); 
					return;   
				}   
			
			var data=new Array();
			//global variable to save destination id from destination table
			var pointDesID;
			
			//retrive data from destination table
		   query.equalTo("destinationCode", destinationCode);
		  
		  		query.find({
					  success: function(Destination) {
						 for (var i = 0; i < Destination.length; ++i) {
								var prop = {};
								
						         prop.destinationId=Destination[i].id;
								data.push(prop);
						 }
						pointDesID=data[0].destinationId;
					 
					  },
					  error: function(error) {
							//alert("Error: " + error.code + " " + error.message);
	  }
	});
	//retrieve data from checkin table and also retrieve dtaa from poin account using inner query
			var Checkin=Parse.Object.extend("Checkin");
			var checkin=new Checkin();
			var dataCheckin=new Array();
			var datapointAccount=new Array();
			var checkinQuery=new Parse.Query(Checkin);
			var createdAt = checkin.createdAt;
			checkinQuery.equalTo("destination", pointDesID);
			checkinQuery.descending(createdAt);
			checkinQuery.first({
					  success: function(Checkin) {
					  var pop={};
				      pop.objectid=Checkin.id;
					  pop.userid=Checkin.get("user").id;
				      dataCheckin.push(pop); 
						
						
						 
						 var PointsAccount=Parse.Object.extend("PointsAccount");
						 var pointsaccount=new PointsAccount();
						 var pointsQuery=new Parse.Query(PointsAccount);
					    
	
						var User=Parse.Object.extend("User");
						var user=new User();
						user.id=dataCheckin[0].userid;
						
						pointsQuery.equalTo("user",user);
						pointsQuery.find({
					  success: function(PointsAccount) {
					 for (var i = 0; i < PointsAccount.length; ++i) {
								var pro = {};
								pro.pointsAccountId=PointsAccount[i].id;
								 pro.balance=PointsAccount[i].get("balance");
								 datapointAccount.push(pro);
								 
						 }
						 response.success(datapointAccount);
					  },
					  error: function(error) {
							//alert("Error: " + error.code + " " + error.message);
	  }
	});
						 
						 
					  //response.success(checkuserid);
					  },
					  error: function(error) {
							//alert("Error: " + error.code + " " + error.message);
	  }
	});
  
	
	});

Parse.Cloud.define("availableRewards", function(request, response) {   
		
				/*************************INPUT PARAMETERS*******************************/				
				// Destination Id (destinationId)
				/**************************DESCRIPTION***********************************/
				// List awards against destinationId param
				/*************************OUTPUT PARAMETERS******************************/
				// Return List Awards
		
		var destinationId = request.params.destinationId;  
		 // check for valid paramters   
		 if (!destinationId || destinationId === "") {    
		 response.error("Invalid parameters in request"); 
		 return;   
		 }   
		 // create destination object based on id    // NOTE you may want to define model objects in a separate js file  
		 var Destination = Parse.Object.extend("Destination");    
		 var destination = new Destination();   
		 destination.id = destinationId;    
		 // create query of Reward objects with destination  
		 var query = new Parse.Query("Reward");  
		 query.equalTo("destination", destination);   
		 query.find({        success: function(results) {     
		 // return reward objects        
		 response.success(results);  
		 },    
		 error: function(error) {   
		 // return the error directly          
		 response.error = "getRewardList query failed with error: " + error;   
		 }  
		 });  
 });

Parse.Cloud.define("geolocationCheckin", function(request, response) {
				
				/*************************INPUT PARAMETERS******************************/
				// Geolocation (location)
				// Distance in Kilometers (distance) [Number] 
				/**************************DESCRIPTION***********************************/
				// Get Destination ID in Gelocation Range
				/*************************OUTPUT PARAMETERS******************************/
				//
				/***********************************************************************/
				
				var Destination = Parse.Object.extend("Destination"); 				
				var queryDestination = new Parse.Query(Destination);
				//var distanceRange = request.params.distance; // In Kilometers
				var distanceRange = 0.5; // In Kilometers
				var userGeoPoint = request.params.location;
				//var destinationCode = request.params.destinationCode;
				//var userGeoPoint = new Parse.GeoPoint( request.params.location.latitude, request.params.location.longitude ); //Location Points
				//var userGeoPoint = new Parse.GeoPoint({ latitude: 90.0, longitude: -80.0 });
				//var user = request.params.userId; // Parse.User.current() is not working, so we are passing in input param for function test
				
				var user = Parse.User.current();
 
						// check for valid paramters
							
						if (!user) {
							response.error("User must be logged in");
							return;
							}
				
				
						if (!userGeoPoint) {    
								response.error("Invalid parameters in request"); 
								return;   
							}   
				
				
				var data = new Array();
				
				queryDestination.find({ 
				success: function(results) { 
							
							for (var i = 0; i < results.length; ++i) {
								var lat =results[i].get("location").latitude;
								var lon =results[i].get("location").longitude;
								
								var resultGeoPoint = new Parse.GeoPoint(lat, lon);
								var resultDistance = userGeoPoint.kilometersTo(resultGeoPoint);
								
									if( resultDistance <= distanceRange)
									{										
										var prop = {};
										prop.destinationId = results[i].id;
										prop.name =results[i].get("name");
										data.push(prop);										
									}

							}	
							
							if(data.length>1)
							{
							for (var i = 0; i < data.length; ++i) {
								 	data[i].status = "false"			
								}
								response.success(data);								
							}
							else if(data.length==1)
							{
								var Checkin = Parse.Object.extend("Checkin");
								var destinationObject = new Destination();
								
								var Checkin = new Checkin();
								var date = new Date();
								
								
								destinationObject.id = data.destinationId;
							

								Checkin.set("state", "open");
								Checkin.set("openDate", date);
								Checkin.set("destination", destinationObject);
								
							
								
									Checkin.save(null, {
									success: function (Checkin) {
									
									data.status = "true";
									response.success(data);
									 											
									},
									error: function (Checkin, error) {
										response.error("Lookup failed");    
									}
								});
													
							}
							else
							response.success("No Business Exist"); 								
				}
 
				});

	});

Parse.Cloud.define("userPointsBalance", function(request, response) {
		/*************************INPUT PARAMETERS*******************************/
					// User Id
					
					/**************************DESCRIPTION***********************************/
					// returns the total points for a user
					/*************************OUTPUT PARAMETERS******************************/
					// pointsBalance
					/****************GET Destination within Location Range*******************/
				//var User=Parse.Object.extend("User"); 
				var user = Parse.User.current();
				//var user=new User();
			    var query=new Parse.Query(User);
				//var userid=request.params.userId;
				var userid = Parse.User.current();
				
				if (!userid) {
							response.error("User must be logged in");
							return;
							}
				
				
				var data=new Array();
				// defined as global variable of function to use more than one queries
				var Userid;
				var pointsAccount;
				//fetch data to retrieve points account from user class
				query.get(userid, {  success: function(resultUser) {   
				pointsAccount=resultUser.get("pointsAccount").id;
			    
		 
			
		},  
			error: function(object, error) 
			{  
			// The object was not retrieved successfully.    // error is a Parse.Error with an error code and description.  
			}
			});
		  var PointTransaction=Parse.Object.extend("PointTransaction");
		  var pointtransaction=new PointTransaction();
		  var createdAt = pointtransaction.createdAt;
		  
		  var querytransaction=new Parse.Query(PointTransaction);
		  querytransaction.equalTo("account", pointsAccount);
		  querytransaction.descending(createdAt);
		  		querytransaction.first({
					  success: function(PointTransaction) {
						 
						 var pop={};
						 pop.runningBalance=PointTransaction.get("runningBalance");
						data.push(pop);
						 
					  response.success(data);
					  },
					  error: function(error) {
							//alert("Error: " + error.code + " " + error.message);
	  }
	});
				
	 
	});
	
Parse.Cloud.define("localExploreDestinations", function(request, response) {
    // unpack parameters
    var userLocation = request.params.location;
    var searchRadius = request.params.searchRadius;
    var skip = request.params.skip ? request.params.skip: 0;
    var limit = request.params.limit ? request.params.limit: 25;
    var user = Parse.User.current();

    // check for valid paramters
    if (!user) {
        response.error("User must be logged in");
        return;
    }
        // searchRadius must be included if we have a userLocation
    if (userLocation && !searchRadius) {
        response.error("Invalid parameters in request");
        return;
    }

    // get destinations within searchRadius
    var query = new Parse.Query("Destination");
        if (userLocation) {
            query.withinKilometers("location", userLocation, searchRadius);
        }
    query.include("featuredReward");
    query.include("address");
    query.skip(skip);
    query.limit(limit);
    query.find({
        success: function(results) {
            var responseItems = new Array();
            // for every Destination, build an item in the response
            performInnerQuery(results, 0, responseItems, response);
        },

        error: function(error) {
            response.error("localExploreDestinations : error in destination query : " + error.message);
        }
    });
});
 
performInnerQuery = function(destinations, index, responseItems, response) {
        // send response after all are done
    if (index >= destinations.length) {
                response.success({
            items: responseItems
        });
                return;
        }
        // for every desination, find the last updated reward
        var destination = destinations[index];
    var innerQuery = new Parse.Query("Reward");
    innerQuery.descending("updatedAt");
    innerQuery.equalTo("destination", destination);
    innerQuery.first({
        success: function(reward) {
            var responseItem = createExploreDestinationResponseItem(destination, reward);
            responseItems.push(responseItem);
            performInnerQuery(destinations, index + 1, responseItems, response);
        }
    });
};
 
createExploreDestinationResponseItem = function(destination, featuredReward) {
	// determine which info to use for description
	// not sure how to check for points
	// not sure of the logic here exactly, so using simple logic
	var description = "";
	var rewardType = null;
	// var featuredReward = destination.get("featuredReward");
	if (featuredReward) {
	description = featuredReward.get("rewardDescription");
	rewardType = featuredReward.get("rewardType");
	}
	else {
	var address = destination.get("address");
	if (address) {
	description = address.get("street");
	}
	}
	var destinationIcon = destination.get("iconImage");
	 
	var destinationResult = {
	destination: destination,
	name: destination.get("name"),
	destinationIcon: destinationIcon,
	description: description,
	reward: featuredReward,
	rewardType: rewardType,
	};
	 
	return destinationResult;
};
 

Parse.Cloud.define("localCheckinDestination", function(request, response) {

				/*************************INPUT PARAMETERS*******************************/
				// Geolocation (location)
				// Distance in Kilometers (distance) [Number] 
				/**************************DESCRIPTION***********************************/
				// Get Destination ID in Gelocation Range
				/*************************OUTPUT PARAMETERS******************************/
				// List of Destination Id (destinationId)	
				/****************GET Destination within Location Range*******************/
				
				var Destination = Parse.Object.extend("Destination"); 
				var queryDestination = new Parse.Query(Destination);
				queryDestination.include("destinationType");
				//var distanceRange = request.params.distance; // In Kilometers
				var distanceRange = 0.5; // In Kilometers				
				
				var userGeoPoint = new Parse.GeoPoint( request.params.location.latitude, request.params.location.longitude ); //Location Points
				
				// check for valid paramters    
				if (!userGeoPoint || userGeoPoint === "") 
				{
					response.error("Invalid parameters in request"); 
					return; 
				}				
				
				var data = new Array();
				
				//queryDestination.exists("destinationType");
				queryDestination.find({
				success: function(results) { 
				
					for (var i = 0; i < results.length; ++i) {
						
								var lat =results[i].get("location").latitude;
								var lon =results[i].get("location").longitude;
								//var destiType =results[i].get("destinationType").IconImage;
								//var iconURL = destiType;
								
								var resultGeoPoint = new Parse.GeoPoint(lat, lon);
								var resultDistance = userGeoPoint.kilometersTo(resultGeoPoint);
								
								if( resultDistance <= distanceRange)
									{	
										var prop = {};										
										prop.destinationId = results[i].id;
										prop.name =results[i].get("name");
										prop.distance = resultDistance;
										//prop.destinationIcon = iconURL;
										data.push(prop);										
									}

							}	
				
				response.success(data);
				
				},
				error: function (Checkin, error) {
					response.error("Lookup failed");    
				}

				});

	});

Parse.Cloud.define("localFeaturedRewards", function(request, response) {

    // unpack parameters
    var userLocation = request.params.location;
        // default search radius
    var searchRadius = 50;
    var limit = 10;

    // get rewards within searchRadius
    var query = new Parse.Query("Reward");
    if (userLocation) {
        query.withinKilometers("location", userLocation, searchRadius);
    }
    query.equalTo("featuredReward", true);
    query.include("destination");
    query.skip(0);
    query.limit(limit);
    query.find({
        success: function(results) {
            var responseItems = new Array();
            _.each(results,
            function(reward) {
                var destination = reward.get("destination");
                if (destination) {
                    var item = {
                        "reward": reward,
                        "destination": destination,
                        "featureImage": reward.get("featureImage")
                    }
                    responseItems.push(item);
                }
            });
            response.success({
                items: responseItems
            });
        },
        error: function(error) {
            response.error("localFeaturedRewards: error in Reward query : " + error.message);
        }
    });
});

Parse.Cloud.define("checkout", function(request, response) {

				/*************************INPUT PARAMETERS*******************************/
				// Checkin Id	(checkinId)			
				/**************************DESCRIPTION***********************************/
				// Update Checkin Status
				/*************************OUTPUT PARAMETERS******************************/
				// Return showSurvey(Bool)
				
						var checkinID=request.params.checkinId;
						//var destinationID=request.params.destinationId;
				// check for valid paramters   
				if (!checkinID || checkinID === "" )//|| !destinationID || destinationID === "") 
				{
					response.error("Invalid parameters in request"); 
					return; 
				}
				
				
						var Checkin=Parse.Object.extend("Checkin"); 
						var query=new Parse.Query(Checkin);
						var data = new Array();
						//var CheckOut = false;
						//var showSurvey = false;
						query.get(checkinID, {  success: function(Checkin) {   
						// The object was retrieved successfully.  
						//response.success(Checkin);
						var prop = {};	
						var state=Checkin.get("state");
						if(state == "open")
							{
								var date = new Date();
								Checkin.set("state","close");
								Checkin.set("closeDate",date);
								Checkin.save();
								prop.CheckOut=true;
							
							}else prop.CheckOut = false;
							
					  	prop.showSurvey = false;
						
						data.push(prop);
						response.success(data);
		  
		  
			},  
			error: function(object, error) 
			{  
			// The object was not retrieved successfully.    // error is a Parse.Error with an error code and description.  
			}
			});

 
});

Parse.Cloud.define("testCode", function(request, response) {
// This function is only used to Test Functions and Logics
var data = new Array();
						var query = new Parse.Query("Reward"); 
						
								 query.find({    
								 success: function(results) {  
								 var data = new Array();
								 for (var i = 0; i < results.length; ++i) {
																
																var prop = {};									  
																
																 prop.rewardId = results[i].id;
																 prop.featureImage = results[i].get("featureImage").url;
																 prop.destinationId= results[i].get("destination").id;
																// prop.rewardId = results[i].id;;
																//var queryReward = new Parse.Query("Reward");
																
																 data.push(prop);
																
															}
								// var destinationQuery =data.get("destination");
									//	console.log(destinationQuery);
										response.success(prop);    
								 },  
								 error: function(error) {      
								 
								 response.error("Lookup failed");    
								 
								 } 
						 });
			/*var dataDestination = new Array();
			var dataReward = new Array();
			var data = new Array();
			
			var Reward = Parse.Object.extend("Reward"); 	
			var queryReward = new Parse.Query(Reward); 
			var Destination = Parse.Object.extend("Destination"); 				
			var queryDestination = new Parse.Query(Destination);
				
			
			 Working Code
			for(var i =0; i<3;++i)
			
			{
				for(var j =0; j<3;++j)
				{
					var prop={};
					prop.i = i;
					prop.j = j;
					data.push(prop);
				}
			}*/
			/*queryDestination.find({ 
									success: function(results) {  
									
									for (var i = 0; i < results.length; ++i) {
									
								
									
										var prop = {};																																	
										prop.destinationId= results[i].id;
										dataDestination.push(prop);
									
								
									}
									
									},
									error: function(error) {   
									response.error("Lookup failed");    
									} 
									});
		
				queryReward.find({    
									success: function(resultsReward) {  
									
									for (var j = 0; j < resultsReward.length; ++j) {
										
										var prop = {};						
										prop.rewardId = resultsReward[j].id;										
										dataReward.push(prop);
															
									}
									
									},  
									error: function(error) {     
									response.error("Lookup failed");    
									} 
									});
		
			response.success(dataReward);*/

});
			
// beforeSave

Parse.Cloud.beforeSave("Destination", function(request, response) {
        // udpate all cached reward locations
        var destination = request.object;
        var location = destination.get("location");
        if (location) {
                var query = new Parse.Query("Reward");
                query.equalTo("destination", destination);
                query.find({
                        success: function(results) {
                                _.each(results, function(reward) {
                                        var rewardLocation = reward.get("location");
                                        if (!rewardLocation || rewardLocation.kilometersTo(location) > 0) {
                                                reward.set("location", location);
                                                reward.save();
                                        }
                                });
                                response.success();
                        },
                        error : function(error) {
                                response.error(error.message);
                        }
                });
        }
}); 
	

