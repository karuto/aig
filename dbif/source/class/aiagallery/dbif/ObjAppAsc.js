/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjAppAsc",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(uid)
  {
    // Pre-initialize the data
    this.setData(
      {
        "app"         : null,
        "groupName"   : null
      });

    // Call the superclass constructor
    this.base(arguments, "appAsc", uid);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "appAsc");

    var databaseProperties =
      {
        /** UID of the AppData object which was associated with a group */
        "app" : "Integer",

        /** Name of group app is associated with */
        "groupName" : "String"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("appAsc",
                                                 databaseProperties);
  }
});