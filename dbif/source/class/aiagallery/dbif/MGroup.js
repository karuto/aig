/**
 * Copyright (c) 2013 Derrell Lipman 
 *                    Paul Geromini 
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MGroup",
{
  construct : function()
  {
    this.registerService("aiagallery.features.addOrEditGroup",
                         this.addOrEditGroup,
                         [ "groupName", "description",
                           "groupType", 
                           "subGroupType"]);

    this.registerService("aiagallery.features.requestUsers",
                         this.requestUsers,
                         [ "groupName", "requestedUsers" ]);

    this.registerService("aiagallery.features.getGroup",
                         this.getGroup,
                         [ "groupName", "bGetApps" ]);

    this.registerService("aiagallery.features.getUserGroups",
                         this.getUserGroups,
                         []);

    this.registerService("aiagallery.features.joinGroup",
                         this.joinGroup,
                         [ "groupName" ]);

    this.registerService("aiagallery.features.approveUsers",
                         this.approveUsers,
                         [ "groupName", "members" ]);

    this.registerService("aiagallery.features.approveAllUsers",
                         this.approveAllUsers,
                         [ "groupName" ]);

    this.registerService("aiagallery.features.removeGroupUsers",
                         this.removeGroupUsers,
                         [ "groupName", "members" ]);

    this.registerService("aiagallery.features.deleteGroup",
                         this.deleteGroup,
                         [ "groupName" ]);

    this.registerService("aiagallery.features.mgmtDeleteGroup",
                         this.mgmtDeleteGroup,
                         [ "groupName" ]);

    this.registerService("aiagallery.features.groupSearch",
                         this.groupSearch,
                         [ "query" ]);

    this.registerService("aiagallery.features.browseSearch",
                         this.browseSearch,
                         [ "type", "subType" ]);
  },

  members :
  {
   
    /**
     * Create a new group, or edit an existing group
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param description {String}
     *   Short description of the group
     * 
     * @param groupType {String}
     *   The type of group this is
     *  
     * @param subGroupType {String || null}
     *   The sub type this group is
     * 
     * @param joinType {Enum}
     *   The way joining will be handled for the group 
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {ObjGroup || Error}
     *   Return the group object we made / edited or an error 
     * 
     */
    addOrEditGroup : function(groupName, description, 
                              groupType, subGroupType,
                              joinType, error)
    {
      var         whoami;
      var         criteria; 
      var         resultList; 
      var         group; 
      var         groupData;
      var         userIds; 
      var         remainingUsers; 
      var         bUpdate = false; 
      var         returnMap; 

      // Get the current user
      whoami = this.getWhoAmI();

      group = new aiagallery.dbif.ObjGroup(groupName, whoami.id);
      groupData = group.getData(); 

      if (group.getBrandNew())
      {
        // Group does not exist, create new one
        // If no description provided it will be null
        groupData.description = description;

        // Assign group type
        groupData.type = groupType;

        // Join Type
        groupData.joinType = joinType; 

        if (subGroupType)
        {
          groupData.subType = subGroupType;
        }

        // By design the first user is the owner
        groupData.users = [whoami.id]; 

        // Prep empty arrays
        groupData.joiningUsers = []; 
      } 
      else if (groupData.owner == whoami.id)
      {
        // Update
        bUpdate = true; 

        // Group exists and belongs to owner          
        // New data
        groupData.description = description;

        // Assign group type
        groupData.type = groupType;

        // Join Type
        groupData.joinType = joinType; 

        if (subGroupType)
        {
          groupData.subType = subGroupType;
        }
        else 
        {
          groupData.subType = null; 
        }
                
      }
      else 
      {
        // Group exists, but does not belong to owner
        // This is an error, the user must choose a new name 
        var warnString = "A group exists with this name already"; 
 
        error.setCode(1);
        error.setMessage(warnString);
        return error;
      }

       // Write updated or new group to db
       group.put(); 

       returnMap = this._turnToMap(groupData);
             
       // Set update bit
       returnMap.update = bUpdate; 

       // Clean up the return data
       return returnMap; 
    },

    /**
     * Request some users join the group. Requested users will receive
     *   an email
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param requestedUsers {Array}
     *   An array of user displaynames the group owner is requesting 
     *   to join the group
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Map || Error}
     *   Retrun either a map of the group with the bad usernames or
     *   the error object. 
     */
    requestUsers : function(groupName, requestedUsers, error)
    {
    
      var     whoami;
      var     groupData;
      var     group; 
      var     userIds;
      var     badUsers = []; 
      var     i; 
      var     returnMap;   

      // Check for existence and ownership
      try
      {
        group = this._checkExistenceAndOwnership(groupName);
        groupData = group.getData(); 
      } 
      catch (x)
      {
        return x; 
      }

      // Need user 
      whoami = this.getWhoAmI();

      // Convert all requested users to ids 
      // Only do so if requested users is not null
      userIds = this._mapUsernamesToIds(requestedUsers);

      // In userIds is an array of ids or nulls.
      // Compare this array to the array of requested users.
      // If a name/email does not have a corresponding id
      // it is a bad name/email add it to the array of badUsers
      for (i = 0; i < userIds.length; i++)
      {
        if(userIds[i] == null)
        {
          badUsers.push(requestedUsers[i]);
        }
      }

      // If the lengths are equal all the users 
      // are bad, return
      if (badUsers.length == userIds.length)
      {
        returnMap = this._turnToMap(groupData); 
        returnMap["badUsers"] = badUsers;
           
        return returnMap; 
      }

      // We do not need to maintain the structure anymore so
      // clear out nulls from userIds
      for(i = 0; i < userIds.length; i++)
      {
        if(userIds[i] == null)
        {
          userIds.splice(i, 1);
        }
      } 

      // User cannot add themselves to requestedUser list
      for (i = 0; i < userIds.length; i++)
      {
        if (userIds[i] == whoami.id)
        {
          // Remove owner from requested user list 
          userIds.splice(i,1);
          break; 
        }
      }

      // Check to see 
      // if the id exists in both joiningUsers array and requestedUsers array.
      // If it does then both the user and the admin want the user to
      // join the group. If not add the id to the list.       

      // User cannot add a user who is already on the requested
      // user list
      for (i = 0; i < userIds.length; i++)
      {
        if (groupData.requestedUsers.indexOf(userIds[i]) != -1)
        {
          userIds.splice(i, 1);
        }
      }

      // Push the requested user param to the actual obj
      userIds.forEach(
        function(user)
        {
          groupData.requestedUsers.push(user);
        }
      );

      // Do not do a check if there are no users requesting to join
      if (groupData.joiningUsers.length != 0)
      {
        userIds.forEach(
          function(id)
          {
            var     i;  
            
            // Check to see if a user who the admin has requested
            // is on the list of users who have requested to join
            for(i = 0; i < groupData.joiningUsers.length; i++)
            {
              if (groupData.joiningUsers[i] == id)
              {
                // Add id to list of users in this group
                groupData.users.push(id);

                // Remove from joining list
                delete groupData.joiningUsers[i]; 
  
                break; 
              }
            }         
          }
        );
      }

      // Send email to all the users who requested to join
      userIds.forEach(
        function(user)
        {
          var     criteria;
          var     ids;
          var     email; 
          var     msgBody; 
          var     subject;
          var     siteUrl;
          var     urlFragment; 

          // Get the user's email
          criteria =
            {
              type  : "element",
              field : "id", 
              value : user
            }; 

          ids = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                    criteria);

          // Should only be one result
          email = ids[0].email;
 
          siteUrl = "http://mit-appinventor-gallery.appspot.com/#page";
          urlFragment = "=GroupInfo&groupname=" + groupName; 

          siteUrl += encodeURIComponent(urlFragment); 

          msgBody = "You have been invited to join the " + groupName + ".\n" 
                    + "To join to the group page at: " + siteUrl 
                    + " and click \"Join Group\" ";

          subject = "MIT AIG Invitation to Join " + groupName + " Group";

          // Send email
          this.sendEmail(msgBody, subject, email);
        }

      , this);

      // Update group object
      group.put();

      returnMap = this._turnToMap(groupData); 
      returnMap["badUsers"] = badUsers;
          
      return returnMap; 
    }, 

    /**
     * Get a group
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param error {Error}
     *   The error object
     * 
     * @param bGetApps {Boolean}
     *   If true get the apps made by members of this group
     * 
     * @return {Map || Error}
     *   A map of data related to a group. This includes the list of users
     *   associated with the group, the apps they have produced, a
     *   description of the group, and the users waiting to join the group. 
     */ 
    getGroup : function(groupName, bGetApps, error)
    {
      var      criteria;
      var      resultList;
      var      group; 
      var      groupMap;
      var      flagsList; 

      criteria = 
        {
          type  : "element",
          field : "name",
          value : groupName
        };

      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjGroup",
                                               criteria);

      if (resultList.length != 1)
      {
        // Group not found
        var warnString = "Group does not exist";

        error.setCode(2);
        error.setMessage(warnString);
        return error;
      } 

      group = resultList[0]; 
      groupMap = this._turnToMap(group); 

      // Will only be true for call from the group info fsm
      if (bGetApps)
      {
        // Get the apps user members have made
        groupMap["groupApps"] = this._getMemberApps(group);

        // Also determine if the user has flagged this group
       // Construct query criteria for "flags of this group by current visitor
        criteria = 
          {
            type : "op",
            method : "and",
            children : 
            [
              {
                type  : "element",
                field : "groupName",
                value : groupName
              },
              {
                type  : "element",
                field : "visitor",
                value : this.getWhoAmI().id

              },
              {
                type  : "element",
                field : "type",
                value : aiagallery.dbif.Constants.FlagType.Group
              }              
            ]
          };

        // Query for the flags of this app by the current visitor
        // (an array, which should have length zero or one).
        flagsList = liberated.dbif.Entity.query("aiagallery.dbif.ObjFlags",
                                                criteria,
                                                null);


        groupMap["bFlag"] = flagsList.length != 0; 
      }

      return groupMap;
    },

    /**
     * Get all the groups a user owns 
     * 
     * @return {Array}
     *   An array of all the groups a user owns
     *   All user ids will be converted to displayNames
     */ 
    getUserGroups : function()
    {
      var         whoami;
      var         criteria;
      var         resultList; 

      // Get the current user
      whoami = this.getWhoAmI();

      criteria = 
        {
          type  : "element",
          field : "owner",
          value : whoami.id
        };

      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjGroup",
                                               criteria);

      // Convert all user ids to display names 
      resultList.forEach(
        function(group)
        {
          var     waitList = [];
          var     authList = [];
          var     memberList = [];
          var     queryResult;
          var     usernameCriteria;
 
          // Convert all users waiting to join
          if (group.joiningUsers != null && group.joiningUsers.length != 0)
          {
            waitList = this._mapIdToDisplayname(group.joiningUsers);    
          }

          // Users who have been given authorization, but not joined yet
          if (group.requestedUsers != null && group.requestedUsers.length != 0)
          {
            authList = this._mapIdToDisplayname(group.requestedUsers);      
          }

          // Convert all users who have joined 
          // should always be atleast one user, the admin
          memberList = this._mapIdToDisplayname(group.users);     

          // End of name replacement
          // Replace lists on group
          group.joiningUsers = waitList; 
          group.requestedUsers = authList;
          group.users = memberList;
        }, this);

      return resultList;
    },

    /**
     * Join a group. The user will be added to the waiting list
     *   for approval by the owner of the group 
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param error {Error}
     *   The error object 
     * 
     * @return {aiagallery.dbif.Constants.GroupStatus || Error}
     *   Return either the users group status constant, or an error. 
     */ 
    joinGroup : function(groupName, error)
    {
      var     criteria;
      var     whoami;
      var     resultList;
      var     group; 
      var     groupData;
      var     i;
      var     bUserAdded = false;
      var     joinStatus; 

      // Get the current user
      whoami = this.getWhoAmI();

      // Get the group this user is trying to join
      criteria = 
        {
          type  : "element",
          field : "name",
          value : groupName
        };

      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjGroup",
                                               criteria);
      
       // Should be one and only one group
       if (resultList.length != 1)
       {
         // Object does not exist
         var warnString = "Group does not exist";
 
         error.setCode(1);
         error.setMessage(warnString);
         throw error;
       } 

       group = new aiagallery.dbif.ObjGroup(resultList[0].name, 
                                            resultList[0].owner);
       groupData = group.getData();

       // If the user is on the requested user list then add the user as
       // a memeber of the group, else add them to the requested user list.
       for (i = 0; i < groupData.requestedUsers.length; i++)
       {
         if (groupData.requestedUsers[i] == whoami.id)
         {
           // Remove user from requested user array
           groupData.requestedUsers.splice(i, 1);

           // Add to user array
           groupData.users.push(whoami.id); 

           // Set flag to indicate we are all done
           bUserAdded = true;

           // Set join status 
           joinStatus = aiagallery.dbif.Constants.GroupStatus.Member;
 
           break;
         }
       }

       // If we did not find the user on the requested user array
       // we must add them to the joiningUsers array
       if (!bUserAdded)
       {
         groupData.joiningUsers.push(whoami.id); 

         // Set join status
         joinStatus = aiagallery.dbif.Constants.GroupStatus.WaitList; 
       } 

       // All done, let us bounce
       group.put();

       return joinStatus;
       
    },

    /**
     * Take a list of user displayNames and remove them
     *   from the user list of a group
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param removeMap {Map}
     *   Map of the three categories of users to remove 
     *   (users, waitlist, and requested)
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Array || Error}
     *   The array of removed user display names, an error otherwise
     * 
     */ 
    removeGroupUsers : function(groupName, removeMap, error)
    {
      var        group;
      var        groupData; 
      var        removedUsers = [];
      var        returnMap = {}; 
      var        whoami;

      // Check for existence and ownership
      try
      {
        group = this._checkExistenceAndOwnership(groupName);
        groupData = group.getData(); 
      } 
      catch (x)
      {
        return x; 
      }

      // Convert all display names to user ids
      removeMap.users = this._mapUsernamesToIds(removeMap.users); 
      removeMap.waitList = this._mapUsernamesToIds(removeMap.waitList); 
      removeMap.requestedUsers = this._mapUsernamesToIds(removeMap.requested); 

      // Get logged in user
      whoami = this.getWhoAmI();

      // Remove each user on the removeMap from their respective array
      removeMap.users.forEach(
        function(user)
        {
          for(var i = 0; i < groupData.users.length; i++)
          {
            // User cannot remove themselves from the group
            if(user == groupData.users[i] && user != whoami.id)
            {
              groupData.users.splice(i, 1);
              removedUsers.push(user);

              break;
            }
          }
        }
      );

      removeMap.waitList.forEach(
        function(user)
        {
          for(var i = 0; i < groupData.joiningUsers.length; i++)
          {
            if(user == groupData.joiningUsers[i])
            {
              groupData.joiningUsers.splice(i, 1);
              removedUsers.push(user);

              break;
            }
          }
        }
      );

      // Ensure field is not null 
      if (groupData.joiningUsers == null)
      {
        groupData.joiningUsers = [];
      }

      removeMap.requestedUsers.forEach(
        function(user)
        {
          for(var i = 0; i < groupData.requestedUsers.length; i++)
          {
            // User cannot remove themselves from the group
            if(user == groupData.requestedUsers[i])
            {
              groupData.requestedUsers.splice(i, 1);
              removedUsers.push(user);

              break;
            }
          }
        }
      );

      // Ensure field is not null 
      if (groupData.requestedUsers == null)
      {
        groupData.requestedUsers = [];
      }
  
      // Prep map for return
      returnMap.users = this._mapIdToDisplayname(groupData.users);
      returnMap.requestedUsers 
        = this._mapIdToDisplayname(groupData.requestedUsers);
      returnMap.joiningUsers = this._mapIdToDisplayname(groupData.joiningUsers);

      // Save back onto db
      group.put();

      return returnMap;    
    },

    /**
     * Delete a group that the user owns
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Boolean || Error}
     *   True if the group was deleted, an error otherwise
     * 
     */ 
    deleteGroup : function(groupName, error)
    {
      return this._deleteGroup(groupName, false, error);
    },

    /**
     * Delete any group. User must have permissions to do so
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Boolean || Error}
     *   True if the group was deleted, an error otherwise
     * 
     */ 
    mgmtDeleteGroup : function(groupName, error)
    {
      return this._deleteGroup(groupName, true, error); 
    },

    /**
     * Add waiting members to an existing group. This is done by
     * the group owner.
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param usersToAdd {StringArray}
     *   The users to add to the existing group
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Map || Error}
     *   The map containing the waitlist users and approved users
     *   or an error. 
     */ 
    approveUsers : function(groupName, usersToAdd, error)
    {
      var     group;
      var     groupData;
      var     returnMap; 
      var     i;

      // Check for existence and ownership
      try
      {
        group = this._checkExistenceAndOwnership(groupName);
        groupData = group.getData(); 
      } 
      catch (x)
      {
        return x; 
      }

      // Do we have any users to approve
      if(usersToAdd.length == 0)
      {
        // Object does not exist
        var warnString = "Select users from the wait "
                         + "list to allow membership. ";

        error.setCode(3);
        error.setMessage(warnString);
        return error;
      }

      // Take the array of added users and convert display names to ids
      usersToAdd = this._mapUsernamesToIds(usersToAdd); 
      
      // remove the user from the joiningUsers array
      // and add to user array
      usersToAdd.forEach(
        function(user)
        {
          // Find the user in the requestedUsers list
          for (i = 0; i < groupData.joiningUsers.length; i++)
          {
            if (groupData.joiningUsers[i] == user)
            {
              // add to users list
              groupData.users.push(groupData.joiningUsers[i]); 

              groupData.joiningUsers.splice(i, 1); 
              break;
            }
          }
        });

      // Update group
      group.put();

      // Create return map 
      returnMap = 
        {
          users    : this._mapIdToDisplayname(groupData.users),
          waitList : this._mapIdToDisplayname(groupData.joiningUsers)
        }; 

      return returnMap;

    },

    /**
     * Add all waiting members to an existing group. This is done by
     * the group owner.
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Map || Error}
     *   The map containing the waitlist users and approved users
     *   or an error. 
     * 
     */ 
    approveAllUsers : function(groupName, error)
    {
      var     whoami;
      var     group;
      var     groupData;
      var     returnMap; 

      // Check for existence and ownership
      try
      {
        group = this._checkExistenceAndOwnership(groupName);
        groupData = group.getData(); 
      } 
      catch (x)
      {
        return x; 
      }

      // Do we have any users to approve
      if(groupData.joiningUsers.length == 0)
      {
        // Object does not exist
        var warnString = "No waiting users";

        error.setCode(4);
        error.setMessage(warnString);
        return error;
      }

      // Add all users on the wait list to the user list
      groupData.joiningUsers.forEach(
        function(user)
        {
          // Add new user
          groupData.users.push(user);
        } 
      );

      // clear out joiningUsers array
      delete groupData.joiningUsers;
      groupData.joiningUsers = [];

      // Push back to db
      group.put();

      // Return array of current users
      returnMap = 
        {
          users    : this._mapIdToDisplayname(groupData.users),
          waitList : this._mapIdToDisplayname(groupData.joiningUsers)
        }; 

      return returnMap;

    },

    /**
     * Find groups with this name
     * 
     * @param query {String}
     *   The search query
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Array || Error}
     *   An array of group objects that satisfy the search 
     *   or the error object.
     */
    groupSearch : function (query, error )
    {
      var        criteria;
      var        whoami;
      var        resultList; 
      var        returnList = []; 

      // Get logged in user
      whoami = this.getWhoAmI();

      criteria =
        {
          type  : "element",
          field : "name",
          value : query
        }; 

      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjGroup",
                                               criteria);

      // For each found group convert to a map after determining status
      // of searching user in relation to the group
      resultList.forEach(
        function(group)
        {
          var     status;
          var     i; 
          var     map;
  
          // Does the user owner the group
          if (group.owner == whoami.id)
          {
            status = aiagallery.dbif.Constants.GroupStatus.Owner; 
          } 
          else if (!status)
          {
            for (i = 0; i < group.users.length; i++)
            {
              if (group.users[i] == whoami.id)
              {
                status = aiagallery.dbif.Constants.GroupStatus.Member; 
                break;
              }
            }  
          }
          else if (!status)
          {
            for (i = 0; i < group.joiningUsers.length; i++)
            {
              if (group.joiningUsers[i] == whoami.id)
              {
                status = aiagallery.dbif.Constants.GroupStatus.WaitList; 
                break;
              }
            }  
          }
          else if (!status)
          {
            for (i = 0; i < group.requestedUsers.length; i++)
            {
              if (group.requestedUsers[i] == whoami.id)
              {
                status = aiagallery.dbif.Constants.GroupStatus.Requested; 
                break;
              }
            }  
          }
          else 
          {
            status = aiagallery.dbif.Constants.GroupStatus.NonMemeber;
          }

          // Convert group to map
          map = this._turnToMap(group); 

          // Add status part
          map["Status"] = status; 
          
          returnList.push(map); 
        }

      , this);

      return returnList; 
    },

    /** 
     * Browse for groups of a certain type
     * 
     * @param type {String}
     *   The type of group we are searching for
     * 
     * @param subType {Null || String}
     *   The optional subgroup to look for
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Array || Error}
     *   An array of groups that match the critiera 
     *   or the error object
     */
    browseSearch : function(type, subType, error)
    {
      var       criteria;
      var       resultList;
      var       returnArray = [];

      // If we were given a subtype
      if (subType)
      {
        criteria = 
          {
            type : "op",
            method : "and",
            children : 
            [
              {
                type: "element",
                field: "type",
                value: type
              },
              {
                type: "element",
                field: "subType",
                value: subType 
              }
            ]
          };
      }
      else 
      {
        criteria =
          {
            type  : "element",
            field : "type",
            value : type
          }; 
      }

      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjGroup",
                                               criteria);

      // Convert to map and push to return array
      resultList.forEach(
        function(group)
        {
          returnArray.push(this._turnToMap(group));
        }
      , this);

      return returnArray;

    },

    /**
     * Delete a group
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param bManagement {Boolean}
     *   If the user is an admin or not
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Boolean || Error}
     *   True if the group was deleted, an error otherwise
     * 
     */
    _deleteGroup : function(groupName, bManagement, error)
    {
      var     whoami;
      var     group;
      var     groupData;

      // Get logged in user
      whoami = this.getWhoAmI();

      // Check to see that user owns this group
      group = new aiagallery.dbif.ObjGroup(groupName, whoami.id);
      groupData = group.getData();

      if (group.getBrandNew())
      {
        // Object does not exist
        var warnString = "Group does not exist";

        error.setCode(2);
        error.setMessage(warnString);
        return error;
      } 
      else if (!bManagement && groupData.owner != whoami.id)
      {
        // User does not own the group
        var warnString = "You do not own this group";

        error.setCode(5);
        error.setMessage(warnString);
        return error; 
      }

      group.removeSelf();

      // Remove any flags this group may have had
      this.clearGroupFlags(groupData.name, error);

      return true; 
    },

    /**
     * Take a list of user names or emails and get their user ids
     * 
     * @param usernameArray {StringArray}
     *   An array of user names
     * 
     * @return {StringArray}
     *   An array of user ids 
     */
    _mapUsernamesToIds : function (usernameArray)
    {
      var    ids; 
      var    criteria;
      var    userIdMap;

      // Do nothing if the array is not filled
      if (usernameArray == null || usernameArray.length == 0)
      {
        return [];
      }

      userIdMap = usernameArray.map(
        function(name)
        {

          // Check for email ending
          if (name.indexOf("@gmail") == -1 && name.indexOf("@") == -1)
          {
            // Non email search
            criteria =
              {
                type  : "element",
                field : "displayName", 
                value : name.trim()
              }; 

            ids = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                      criteria);

          }
          else 
          {
            // Email search 
            criteria =
              {
                type  : "element",
                field : "email", 
                value : name.trim()
              }; 

            ids = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                      criteria);

          }

          return ids.length == 1 ? ids[0].id : null;

        }
      ); 

      return userIdMap;
    },

    /**
     * Accept an array of user ids and convert them to display names
     * 
     * @param idArray {Array}
     *   The array of user ids to be converted
     * 
     * @return {Array}
     *   An array containing display names
     */
    _mapIdToDisplayname : function (idArray)
    {

      var    displaynameArray = [];

      idArray.forEach(
        function(userId)
        {
          var     criteria;
          var     queryResult; 

          criteria = 
            {
              type  : "element",
              field : "id",
              value : userId
            };

          queryResult = liberated.dbif.Entity.query(
                        "aiagallery.dbif.ObjVisitors",
                        criteria);
                   
          if(queryResult.length == 1)
          {
            displaynameArray.push(queryResult[0].displayName ); 
          }
        }
      );

      return displaynameArray;  
    },

    /**
     * Check that a group exists and is owned by the user
     *   trying to do something with it.
     * 
     * @param groupName {String}
     *   Group name
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {ObjGroup || Error}
     *   ObjGroup if it exists and is owned by the user,
     *     an error otherwise.
     */
    _checkExistenceAndOwnership : function(groupName, error)
    {
      var     whoami;
      var     group;
      var     groupData;

      // Get logged in user
      whoami = this.getWhoAmI();

      // Check to see that user owns this group
      group = new aiagallery.dbif.ObjGroup(groupName, whoami.id);
      groupData = group.getData();

      if (group.getBrandNew())
      {
        // Object does not exist
        var warnString = "Group does not exist";

        error.setCode(2);
        error.setMessage(warnString);
        throw error;
      } 
      else if (groupData.owner != whoami.id)
      {
        // User does not own the group
        var warnString = "You do not own this group";

        error.setCode(5);
        error.setMessage(warnString);
        throw error; 
      }

      return group; 
    },

    /**
     * Take groupData and turn it into a map suitable for
     *   using on the frontend
     * 
     * @param groupData {ObjGroup Data}
     *   The easily accessible ObjGroup Data
     * 
     * @return {Map}
     *   A map of the group data with properties mapped to data
     */
    _turnToMap : function(groupData)
    {
      var     groupMap;
      var     i;
      var     whoami; 

      // Init group map
      groupMap = 
        {
          name           : groupData.name,
          owner          : null, 
          description    : groupData.description, 
          users          : null,
          joiningUsers   : null,
          requestedUsers : null,
          type           : groupData.type, 
          subType        : groupData.subType,
          joinType       : groupData.joinType, 
          userStatus     : aiagallery.dbif.Constants.GroupStatus.NonMember
        };

      // Convert all user fields from ids to displayNames
      // Convert all users waiting to join
      if (groupData.joiningUsers != null && 
          groupData.joiningUsers.length != 0)
      {
        groupMap.joiningUsers 
          = this._mapIdToDisplayname(groupData.joiningUsers);    
      }

      // Users who have been given authorization, but not joined yet
      if (groupData.requestedUsers != null && 
         groupData.requestedUsers.length != 0)
      {
        groupMap.requestedUsers 
          = this._mapIdToDisplayname(groupData.requestedUsers);      
      }

      // Convert all users who have joined 
      // should always be atleast one user, the admin
      groupMap.users = this._mapIdToDisplayname(groupData.users); 

      // Take the owner id and get their display name
      // Should be the first result in the returned array
      groupMap.owner = this._mapIdToDisplayname([groupData.owner])[0];

      // Modify the userStatus field
      // Get logged in user
      whoami = this.getWhoAmI();

      // Check if user owns group
      if(groupData.owner == whoami.id)
      {
        groupMap.userStatus = aiagallery.dbif.Constants.GroupStatus.Owner;
      } 
      // User on waitlist
      else if (groupData.joiningUsers.indexOf(whoami.id) != -1)
      {
        groupMap.userStatus = aiagallery.dbif.Constants.GroupStatus.WaitList;
      }
      // User has been requested to join
      else if (groupData.requestedUsers.indexOf(whoami.id) != -1)
      {
        groupMap.userStatus = aiagallery.dbif.Constants.GroupStatus.Requested;
      }
      // User is a member of this group
      else if (groupData.users.indexOf(whoami.id) != -1)
      {
        groupMap.userStatus = aiagallery.dbif.Constants.GroupStatus.Member;
      }
      // Already set to nonmemeber status so no need to do anything else 

      return groupMap; 
    },

    /**
     * Get the apps the members of the group have made
     * 
     * @param groupData {ObjGroup}
     *   The group data
     * 
     * @return {Array}
     *   An array of the apps the members of a group have made. 
     * 
     */
    _getMemberApps : function(groupData)
    {

      var     appArray = [];
      var     requestedFields;

      requestedFields = {
        uid         : "uid",
        owner       : "owner",
        image1      : "image1",
        title       : "title",
        displayName : "displayName"
      }; 

      // Take each id in the user array and get their apps 
      groupData.users.forEach(
        function(user)
        {
          var     criteria;
          var     queryResult; 
          var     resultList;
          var     displayName;   

          criteria = 
            {
              type : "op",
              method : "and",
              children : 
              [
                {
                  type: "element",
                  field: "owner",
                  value: user
                },
                {
                  type: "element",
                  field: "status",
                  value: aiagallery.dbif.Constants.Status.Active
                }
              ]
            };

          queryResult = liberated.dbif.Entity.query(
                        "aiagallery.dbif.ObjAppData",
                        criteria);

          criteria = 
            {
              type  : "element",
              field : "id",
              value : user
            }; 
         
          resultList = 
             liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors", 
                                         criteria);

          displayName = resultList[0].displayName; 

          // Replace owner id with owner name
          queryResult.forEach(
            function(app)
            {
              app.displayName = displayName || "<>";    
              delete app.owner;     

              appArray.push(app);

              // Trim unneeded app info
              aiagallery.dbif.MApps._requestedFields(app, requestedFields);

              // Remove the owner field
              delete app.owner;      
            });
        }
      );

      return appArray; 
    }
  }
}); 
