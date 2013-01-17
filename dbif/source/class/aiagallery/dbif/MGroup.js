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
                         [ "groupName", "description"]);

    this.registerService("aiagallery.features.getGroup",
                         this.getGroup,
                         [ "groupName" ]);

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
     * @return {ObjGroup || Error}
     *   Return the group object we made / edited or an error 
     * 
     */
    addOrEditGroup : function(groupName, description, requestedUsers, error)
    {
      var         whoami;
      var         criteria; 
      var         resultList; 
      var         group; 
      var         groupData;
      var         userIds; 

      // Get the current user
      whoami = this.getWhoAmI();

      group = new aiagallery.dbif.ObjGroup(groupName, whoami.id);
      groupData = group.getData(); 

      if (group.getBrandNew())
      {
        // Group does not exist, create new one
        // If no description provided it will be null
        groupData.description = description;

        // By design the first user is the owner
        groupData.users = [whoami.id]; 

        // FIME : Possibly send emails to all these users 
        // Convert all requested users to ids 
        // Only do so if requested users is not null
        if (requestedUsers)
        {
          requestedUsers = this._mapUsernamesToIds(requestedUsers);

          // User cannot add themselves to requestedUser list
          for (var i = 0; i < requestedUsers.length; i++)
          {
            if (requestedUsers[i] == whoami.id)
            {
              // Remove owner from requested user list 
              requestedUsers.splice(i,1);
              break; 
            }
          }

          groupData.requestedUsers = requestedUsers;    
        }
      } 
      else if (groupData.owner == whoami.id)
      {
        // Group exists and belongs to owner          
        // New data
        groupData.description = description;
          
        // Owner may have provided a list of users they want
        // to be part of the group
        //        
        // Convert all names in list to ids and then check to see 
        // if the id exists in both joiningUsers array and requestedUsers array.
        // If it does then both the user and the admin want the user to
        // join the group. If not add the id to the list. 
        
        // Do not do anything if there are no users requesting to join
        if (groupData.joiningUsers != null && 
            groupData.joiningUsers.length != 0)
        {

          // User cannot add themselves to requestedUser list
          for (var i = 0; i < requestedUsers.length; i++)
          {
            if (requestedUsers[i] == whoami.id)
            {
              // Remove owner from requested user list 
              requestedUsers.splice(i,1);
              break; 
            }
          }

          userIds = this._mapUsernamesToIds(requestedUsers);       
 
          userIds.forEach(
           function(id)
            {
              var     i;  

              // If null we did not find the name
              if(id == null)
              {
                return;
              }
             
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

      }
      else 
      {
        // Group exists, but does not belong to owner
        // This is an error, the user must choose a new name 
        var warnString = this.tr("A group exists with this name already"); 
 
        error.setCode(1);
        error.setMessage(warnString);
        return error;
      }

       // Write updated or new group to db
       group.put(); 

       // Clean up the return data
       return this._turnToMap(groupData);
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
     * @return {Map || Error}
     *   A map of data related to a group. This includes the list of users
     *   associated with the group, the apps they have produced, a
     *   description of the group, and the users waiting to join the group. 
     */ 
    getGroup : function(groupName, error)
    {
      var      criteria;
      var      resultList;
      var      group; 

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
        var warnString = this.tr("Group does not exist");

        error.setCode(1);
        error.setMessage(warnString);
        return error;
      } 

      group = resultList[0]; 

      return this._turnToMap(group); 
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
     * @param username {String}
     *   The name of the user trying to join a group
     * 
     */ 
    joinGroup : function(groupName, username)
    {
    },

    /**
     * Take a list of user displayNames and remove them
     *   from the user list of a group
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param removeList {Array}
     *   String array of display names to remove
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Array || Error}
     *   The array of removed user display names, an error otherwise
     * 
     */ 
    removeGroupUsers : function(groupName, removeList, error)
    {
      var        group;
      var        groupData; 
      var        removedUsers = [];
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
      removeList = this._mapUsernamesToIds(removeList); 

      // Get logged in user
      whoami = this.getWhoAmI();

      // Remove each user on the removeList from the user array
      removeList.forEach(
        function(user)
        {
          for(var i = 0; i < groupData.users.length; i++)
          {
            // User cannot remove themselves from the group
            if(user == groupData.users[i] && user == whoami.id)
            {
              delete groupData.users[i];
              removedUsers.push(user);

              break;
            }
          }
        }
      );
  
      // Save back onto db
      group.put();

      return removedUsers;    
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
     */ 
    approveUsers : function(groupName, usersToAdd, error)
    {
      var     group;
      var     groupData;

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

      // Take the array of added users and convert display names to ids
      usersToAdd = this._mapUsernamesToIds(usersToAdd); 
      
      // remove the user from the requestedUsers array
      // and add to user array
      usersToAdd.forEach(
        function(user)
        {
          // Find the user in the requestedUsers list
          for (var i; i < groupData.requestedUser.length; i++)
          {
            if (groupData.requestedUser[i] == user)
            {
              // add to users list
              groupData.users.push(group.requestedUser[i]); 

              delete groupData.requestedUsers[i];
              break;
            }
          }
        });
      
      // Update group
      group.put();

      // Return array of current users
      return this._mapIdToDisplayname(groupData.users); 

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
     * @return {Array}
     *   Array containing all the users who are members of the group 
     * 
     */ 
    approveAllUsers : function(groupName, error)
    {
      var     whoami;
      var     group;
      var     groupData;

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

      // Add all users on the wait list to the user list
      groupData.users.push(groupData.joiningUsers);

      // clear out the waitlist
      delete groupData.joiningUsers;
      groupData.joiningUsers = [];

      // Push back to db
      group.push();
 

      return groupData.users; 

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
        var warnString = this.tr("Group does not exist");

        error.setCode(1);
        error.setMessage(warnString);
        return error;
      } 
      else if (!bManagement && groupData.owner != whoami.id)
      {
        // User does not own the group
        var warnString = this.tr("You do not own this group");

        error.setCode(2);
        error.setMessage(warnString);
        return error; 
      }

      group.removeSelf();
      return true; 
    },

    /**
     * Take a list of user names and get their user ids
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
        return null;
      }

      userIdMap = usernameArray.map(
        function(name)
        {
          criteria =
            {
              type  : "element",
              field : "displayName", 
              value : name.trim()
            }; 

           ids = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                      criteria);

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
     * @return {ObjGroup || Error}
     *   ObjGroup if it exists and is owned by the user,
     *     an error otherwise.
     */
    _checkExistenceAndOwnership : function(groupName)
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
        var warnString = this.tr("Group does not exist");

        error.setCode(1);
        error.setMessage(warnString);
        throw error;
      } 
      else if (groupData.owner != whoami.id)
      {
        // User does not own the group
        var warnString = this.tr("You do not own this group");

        error.setCode(2);
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

      // Init group map
      groupMap = 
        {
          name           : groupData.name,
          description    : groupData.description, 
          users          : null,
          joiningUsers   : null,
          requestedUsers : null
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

      return groupMap; 
    }
  }
}); 
