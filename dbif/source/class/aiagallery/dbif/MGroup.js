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
    addOrEditGroup : function(groupName, description, error)
    {
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
    }
  }
}); 
