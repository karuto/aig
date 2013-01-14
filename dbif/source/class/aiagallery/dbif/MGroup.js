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
                         [ "groupName"]);

    this.registerService("aiagallery.features.getGroup",
                         this.getGroupPermissions,
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
     */
    addOrEditGroup : function(groupName)
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
     *   associated with the group, the apps they have produced, and a
     *   description of the group. 
     */ 
    getGroup : function(groupName)
    {
    }
  }
}); 
