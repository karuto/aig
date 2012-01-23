/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.mystuff.Detail",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    var             o;
    var             hBox;
    var             form;
    var             formRendered;
    var             categoryList;
    var             currentTags;

    this.base(arguments);

    // Use the canvas layout for ourself (which will contain only the hBox)
    this.setLayout(new qx.ui.layout.Canvas());

    // Create a HBox which will be the container for the form
    hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    this.add(hBox, { edge : 20 });

    // Create a form
    form = new qx.ui.form.Form();
    
    //
    // Add the fields
    //
    
    // Title
    o = new qx.ui.form.TextField();
    o.set(
      {
        required : true
      });
    form.add(o, "Title", null, "title", null,
             { row : 0, column : 0, colSpan : 6 });

    // Description
    o = new qx.ui.form.TextArea();
    o.set(
      {
        width    : 200,
        height   : 50,
        required : true
      });
    form.add(o, "Description", null, "description", null,
             { row : 1, column : 0, colSpan : 6 });

    // Categories, one of which must be selected
    categoryList =
      qx.core.Init.getApplication().getRoot().getUserData("categories");

    // Get the list of currently-selected tags
//    currentTags = rowData.tags.split(new RegExp(", *"));

    // Create a multi-selection list and add the categories to it.
    o = new qx.ui.form.List();
    o.set(
      {
        height        : 100,
        selectionMode : "multi",
        required      : true
      });
    categoryList.forEach(
      function(tagName) 
      {
        var item = new qx.ui.form.ListItem(tagName);
        o.add(item);

        // Is this a current tag of the app being edited?
//        if (qx.lang.Array.contains(currentTags, tagName))
        {
          // Yup. Select it.
//          o.addToSelection(item);
        }
      });
    form.add(o, "Categories", null, "categories", null,
             { row : 2, column : 0, rowSpan : 6 });
    
    // Tag to add
    o = new qx.ui.form.TextField();
    form.add(o, "New tag", null, null, null,
             { row : 2, column : 2 });


    // Tag to add
    o = new qx.ui.form.Button("Add");
    form.addButton(o, { row : 3, column : 3 });

    // Delete selected tag
    o = new qx.ui.form.Button("Delete");
    form.addButton(o, { row : 6, column : 5 });

    // Application-specific tags
    o = new qx.ui.form.List();
    o.set(
      {
        height        : 100,
        selectionMode : "single",
        required      : false
      });
    form.add(o, "Tags", null, "tags", null,
             { row : 2, column : 4, rowSpan : 4 });
    

    // Create the rendered form and add it to the HBox
    formRendered = new aiagallery.widget.mystuff.DetailRenderer(form);
    hBox.add(formRendered);
  },
  
  properties :
  {
    title :
    {
      check : "String",
      apply : "_applyTitle"
    },

    description :
    {
      check : "String",
      apply : "_applyDescription"
    },
    
    tags :
    {
      check : "Array",
      apply : "_applyTags"
    },
    
    sourceFileName :
    {
      check : "String",
      apply : "_applySourceFileName"
    },
    
    creationTime :
    {
      check : "Date",
      apply : "_applyCreationTime"
    },
    
    uploadTime :
    {
      check : "Date",
      apply : "_applyUploadTime"
    }
  },

  members :
  {
  }
});