/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MAppAsc",
{
  construct : function()
  {
    this.registerService("aiagallery.features.associateAppWithGroup",
                         this.associateAppWithGroup,
                         [ "appId", "groupName", "error" ]);

    this.registerService("aiagallery.features.associateAppsWithGroup",
                         this.associateAppsWithGroup,
                         [ "appIdList", "groupName", "error" ]);
  },

  members :
  {
    /**
     *  Associate an app with a group
     *   
     * @param appId {String}
     *  The App id 
     * 
     * @param groupName {String}
     *   The name of the group 
     * 
     * @param error {Error}
     *   The error object
     *
     */
    associateAppWithGroup : function(appId, groupName, error)
    {
      var        whoami;
      var        criteria;
      var        resultList; 
      var        appAsc; 
      var        appAscData;

      var        group;
      var        groupData;

      // Check to see user is a memeber of the group they 
      // are trying to associate this app with 
      
      // Get logged in user
      whoami = this.getWhoAmI();

      // Create the criteria for a search of groups the user is a part of
      criteria = 
        {
          type     : "op",
          method   : "and",
          children : 
          [
            {
              type  : "element",
              field : "users",
              value : whoami.id
            },
            {
              type  : "element",
              field : "name",
              value : groupName
            }
          ]
        };

      
      // Issue a query for groups the user is a member of 
      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjGroup", 
                                               criteria);

      if(resultList.length == 0)
      {
        // User is not part of this group
        var warnString = "You are not a member of this group";

        error.setCode(1);
        error.setMessage(warnString);
        throw error; 
      } 

      // User is a member of this group
      // See if this association already exists
      criteria = 
        {
          type : "op",
          method : "and",
          children : 
          [
            {
              type  : "element",
              field : "app",
              value : appId
            },
            {
              type  : "element",
              field : "groupName",
              value : groupName
            }
          ]
        };

      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjAppAsc",
                                              criteria,
                                              null);

      // Must create new association if the list is empty/invalid
      if (resultList.length === 0)
      {
        // create a new AppAsc object for this association
        appAsc = new aiagallery.dbif.ObjAppAsc();
        appAscData = appAsc.getData(); 

        appAscData.app = appId; 
        appAscData.groupName = groupName;

        // Save object
        appAsc.put();

        // FIXME : A bit inefficient when associateAppsWithGroup is called
        // New app has been associated with a group
        // need to update the group's lastUpdated field
        group = new aiagallery.dbif.ObjGroup(groupName);
        groupData = group.getData(); 

        // Group better exist
        if (!group.getBrandNew())
        {
          groupData.lastUpdated 
            = aiagallery.dbif.MDbifCommon.currentTimestamp();

          group.put(); 
        }

      }

      return true;
    },

    /**
     * Helper function that handles a list of appIds to
     * associate with a group
     * 
     * @param appIdList {Array}
     *   List of appIds
     * 
     * @param groupName {String}
     *   Groupname to associate list with
     * 
     * @param error {Error}
     *   The error object
     */
    associateAppsWithGroup : function(appIdList, groupName, error)
    {
      appIdList.forEach(
        function(appId)
        {
          this.associateAppWithGroup(appId, groupName, error);
        }
      ,this);

      // Clean up
      this.__cleanOrphanedAppAscObjectsByGroup(appIdList, groupName, error);
 
      return true; 
    },

    /**
     * Clean up any orphaned AppAsc objects based on the list
     * of current associations.
     * 
     * @param currentAscList {Array}
     *   Array of group to app associations this app has
     * 
     * @param uid {Integer}
     *   UID of the app groups would be associated with 
     * 
     * @param error {Error}
     *   The error object
     */
    __cleanOrphanedAppAscObjects : function(currentAscList, uid, error)
    {
      var       criteria;
      var       resultList;
      var       groupNames = [];
 
      // Construct list of group names
      currentAscList.forEach(
        function(group)
        {
          groupNames.push(group.split("by")[0].trim());
        }
      );

      // User is a member of this group
      // See if this association already exists
      criteria = 
        {
          type  : "element",
          field : "app",
          value : uid
        }; 

      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjAppAsc",
                                              criteria,
                                              null);

      // For each appAsc object we find releated to this app
      // check to make sure it is current with the list 
      // of current app associations.
      resultList.forEach(
        function(appAsc)
        {
          var obj; 

          // This appAsc object references a groupName which
          // the app is no longer part of, delete this object
          if (groupNames.indexOf(appAsc.groupName) == -1)
          {
            // Get this AppAsc object
            obj = new aiagallery.dbif.ObjAppAsc(appAsc.uid);
              
            // Assuming it exists (it had better!)...
            if (! obj.getBrandNew())
            {
              // ... then remove this object
              obj.removeSelf();
            }

          }
        }
      );

    },

    /**
     * Clean up any orphaned AppAsc objects based on the list
     * of current associations.
     * 
     * @param currentAscList {Array}
     *   Array of group to app associations this app has
     * 
     * @param groupName {String}
     *   Groupname of the associations to check  
     * 
     * @param error {Error}
     *   The error object
     */
    __cleanOrphanedAppAscObjectsByGroup
      : function(currentAscList, groupName, error)
    {
      var       criteria;
      var       resultList;

      // User is a member of this group
      // See if this association already exists
      criteria = 
        {
          type  : "element",
          field : "groupName",
          value : groupName
        }; 

      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjAppAsc",
                                               criteria,
                                               null);

      // For each appAsc object we find releated to this group
      // check to make sure it is current with the list 
      // of current app associations.
      resultList.forEach(
        function(appAsc)
        {
          var obj; 

          // This appAsc object references a groupName which
          // the app is no longer part of, delete this object
          if (currentAscList.indexOf(appAsc.app) == -1)
          {
            // Get this AppAsc object
            obj = new aiagallery.dbif.ObjAppAsc(appAsc.uid);
              
            // Assuming it exists (it had better!)...
            if (! obj.getBrandNew())
            {
              // ... then remove this object
              obj.removeSelf();
            }

          }
        }
      );

    },

    /**
     * A group has been deleted so remove all the AppAsc objects
     * releated to that group.
     * 
     * @param groupName {String}
     *   The name of the deleted group
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Boolean | Error}
     *   Return true for success of error otherwise
     */
    _deleteAppAscGroup : function(groupName, error)
    {

      // Get all the AppAsc objects releated to this group
      // and remove them
      liberated.dbif.Entity.query("aiagallery.dbif.ObjAppAsc", 
                                  {
                                    type  : "element",
                                    field : "groupName",
                                    value : groupName
                                  }).forEach(
        function(result)
        {
          var             obj;
              
          // Get this AppAsc object
          obj = new aiagallery.dbif.ObjAppAsc(result.uid);
              
          // Assuming it exists (it had better!)...
          if (! obj.getBrandNew())
          {
            // ... then remove this object
            obj.removeSelf();
          }
        }); 

      return true;
    },

    /**
     * An app has been deleted so remove all the AppAsc objects
     * releated to that app.
     * 
     * @param appId {String}
     *   The app id to be deleted
     * 
     * @param error {Error}
     *   The error object
     * 
     * @return {Boolean | Error}
     *   Return true for success of error otherwise
     */
    _deleteAppAscApp : function(appId, error)
    {

      // Get all the AppAsc objects releated to this group
      // and remove them
      liberated.dbif.Entity.query("aiagallery.dbif.ObjAppAsc", 
                                  {
                                    type  : "element",
                                    field : "app",
                                    value : appId
                                  }).forEach(
        function(result)
        {
          var             obj;
              
          // Get this AppAsc object
          obj = new aiagallery.dbif.ObjAppAsc(result.app);
              
          // Assuming it exists (it had better!)...
          if (! obj.getBrandNew())
          {
            // ... then remove this object
            obj.removeSelf();
          }
        }); 

      return true;
    }
  }
});
