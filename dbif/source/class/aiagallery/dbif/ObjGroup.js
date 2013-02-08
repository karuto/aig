/**
 * Copyright (c) 2013 Derrell Lipman 
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjGroup",
{
  extend : aiagallery.dbif.Entity,
 
  construct : function(name, owner)
  {
    if (typeof name != "undefined")
    {
      // Give the entity its name, and a simple description
      this.setData(
        { 
          "owner"           : owner,
          "name"            : name,
          "description"     : null,
          "users"           : [],
          "joiningUsers"    : [],
          "requestedUsers"  : [],
          "type"            : null,
          "subType"         : null
        });
    }

    // Use the group's name as the DB key
    this.setEntityKeyProperty("name");
    
    // Call the superclass constructor
    this.base(arguments, "group", name);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname,
                                              "group");

    var databaseProperties =
      {
        /** The name of this group, i.e. UMass Lowell */
        "name"  : "String",

        /** The group's owner (id of Visitor object) */
        "owner" : "String",
        
        /** A simple description of the group, 
	 * i.e. "Class 2013 of UMass Lowell" */
        "description" : "String",

        /** User ids of visitors associated with this group. */
        "users" : "StringArray",

        /** User ids of visitors the admin has requested to join,
	 *  and have not made an active attempt to join, by joining
	 *  the joiningUsers array. */
        "requestedUsers" : "StringArray",

        /** User ids of visitors waiting to join this group, 
	 * but are not on the  requested user array. */
        "joiningUsers" : "StringArray",

        /** The type of a group as defined in dbif.constants.GroupTypes*/
        "type" : "String",

        /** The subtype of a group as defined in dbif.constants.GroupTypes */
        "subType" : "String"

      };

    var canonicalize = 
      {
        "name" :
        {
          // Store names as lowercase in this field 
          prop : "name_lc",

          // Type
          type : "String",

          // Function to convert a value to lower case
          func : function(value)
          {
            return (typeof value == "undefined" || value === null
                    ? null
                    : value.toLowerCase());
          }
        }
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("group",
                                                 databaseProperties,
                                                 "name",
                                                 canonicalize);
  }
});