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
                         [ "appId", "groupName" ]);
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
              field : "user",
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
      // create a new AppAsc object for this association
      appAsc = new aiagallery.dbif.ObjAppAsco(appId);
      appAscData = appAsc.getData(); 

      // New AppAsc set fields 
      if(appAsc.getBrandNew())
      {
        appAscData.groupName = groupName;
      }

      // Else nothing else to do 
 
      return true;
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
          obj = new aiagallery.dbif.ObjLikes(result.app);
              
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
          obj = new aiagallery.dbif.ObjLikes(result.app);
              
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