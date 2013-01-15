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

    this.registerService("aiagallery.features.joinGroup",
                         this.joinGroup,
                         [ "groupName" ]);

    this.registerService("aiagallery.features.addMembers",
                         this.addMembers,
                         [ "groupName", "members" ]);
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

        // Possibly send emails to all these users 
        groupData.requestedUsers = this._mapUsernamesToIds(requestedUsers);    
     
        // Put on db 
        liberated.dbif.Entity.asTransaction(
          function()
          {
            group.put();
          });

        return true; 

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

        // Write updated group to db
        group.put(); 

        return true; 
      }
      else 
      {
        // Group exists, but does not belong to owner
        // This is an error, the user must choose a new name 
        var warnString = this.tr("A group exists with this name already"); 
 
        error.setCode(1);
        error.setMessage(warningString);
        return error;
      }

      return true; 
    },

    /**
     * Get a group
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @return {Map}
     *   A map of data related to a group. This includes the list of users
     *   associated with the group, the apps they have produced, a
     *   description of the group, and the users waiting to join the group. 
     */ 
    getGroup : function(groupName)
    {
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
     * Add waiting members to an existing group. This is done by
     * the group owner.
     * 
     * @param groupName {String}
     *   The name of the group
     * 
     * @param usersToAdd {StringArray}
     *   The users to add to the existing group
     * 
     */ 
    addMembers : function(groupName, usersToAdd)
    {
    },

    /**
     * Take a list of user ids and get their user ids
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
              value : name
            }; 

           ids = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                      criteria);

           return ids.length == 1 ? ids[0].id : null;
        }
      ); 

      return userIdMap;
    }
  }
}); 
