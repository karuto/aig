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

    this.registerService("aiagallery.features.cleanOrphanedAppAscObjects",
                         this.cleanOrphanedAppAscObjects,
                         [ "currentAscList", "uid", "error" ]);
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

      if(resultList == 0)
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
      }

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
    cleanOrphanedAppAscObjects : function(currentAscList, uid, error)
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
