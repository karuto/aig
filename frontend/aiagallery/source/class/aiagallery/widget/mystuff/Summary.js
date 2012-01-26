/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.mystuff.Summary",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    var             height;

    this.base(arguments);
    
    // Set a reasonable height so the image isn't tiny
    height = aiagallery.widget.mystuff.Summary.Height;
    this.set(
      {
        height    : height,
        minHeight : height,
        maxHeight : height
      });
    
    // Create a layout. Summary is always an HBox
    this.setLayout(new qx.ui.layout.HBox(10));
    
    // Create each of the child controls
    this.getChildControl("icon");
    this.getChildControl("image1");
    this.getChildControl("title");
    this.getChildControl("status");
    this.getChildControl("numLikes");
    this.getChildControl("numDownloads");
    this.getChildControl("numViewed");
    this.getChildControl("numComments");
  },
  
  properties :
  {
    /** Any URI String supported by qx.ui.basic.Image to display an icon */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      themeable : true,
      event : "changeIcon"
    },
    
    image1 :
    {
      check : "String",
      apply : "_applyImage1"
    },

    title :
    {
      check : "String",
      apply : "_applyTitle"
    },
    
    status :
    {
      check : "Number",
      apply : "_applyStatus"
    },
    
    numLikes :
    {
      check : "Number",
      apply : "_applyNumLikes"
    },
    
    numDownloads :
    {
      check : "Number",
      apply : "_applyNumDownloads"
    },
    
    numViewed :
    {
      check : "Number",
      apply : "_applyNumViewed"
    },
    
    numComments :
    {
      check : "Number",
      apply : "_applyNumComments"
    }
  },

  statics :
  {
    Height : 32,

    Width :
    {
      icon         : 20,
      image1       : 0,         // set in defer: function
      title        : 200,
      status       : 120,
      numLikes     : 50,
      numDownloads : 50,
      numViewed    : 50,
      numComments  : 50
    }
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var             control;
      var             width;

      switch(id)
      {
      case "icon":
        control = new qx.ui.basic.Image(this.getIcon());
        width = aiagallery.widget.mystuff.Summary.Width.icon;
        control.set(
          {
            anonymous : true,
            width     : width,
            minWidth  : width,
            maxWidth  : width
          });
        this._addAt(control, 0);
        break;

      case "image1":
        control = new qx.ui.basic.Image();
        control.setAnonymous(true);
        width = aiagallery.widget.mystuff.Summary.Width.image1;
        control.set(
          {
            anonymous : true,
            scale     : true,
            width     : width,
            minWidth  : width,
            maxWidth  : width,
            maxHeight : aiagallery.widget.mystuff.Summary.Height
          });
        this._addAt(control, 1);
        break;

      case "title":
        control = new qx.ui.basic.Label();
        width = aiagallery.widget.mystuff.Summary.Width.title;
        control.set(
          {
            anonymous : true,
            width     : width,
            minWidth  : width,
            maxWidth  : width
          });
        this._addAt(control, 2);
        break;

      case "status":
        control = new qx.ui.basic.Label();
        width = aiagallery.widget.mystuff.Summary.Width.status;
        control.set(
          {
            anonymous : true,
            rich      : true,
            width     : width,
            minWidth  : width,
            maxWidth  : width
          });
        this._addAt(control, 3);
        break;

      case "numLikes":
        control = new qx.ui.basic.Label();
        width = aiagallery.widget.mystuff.Summary.Width.numLikes;
        control.set(
          {
            anonymous : true,
            textAlign : "right",
            width     : width,
            minWidth  : width,
            maxWidth  : width
          });
        this._addAt(control, 4);
        break;

      case "numDownloads":
        control = new qx.ui.basic.Label();
        width = aiagallery.widget.mystuff.Summary.Width.numDownloads;
        control.set(
          {
            anonymous : true,
            textAlign : "right",
            width     : width,
            minWidth  : width,
            maxWidth  : width
          });
        this._addAt(control, 5);
        break;

      case "numViewed":
        control = new qx.ui.basic.Label();
        width = aiagallery.widget.mystuff.Summary.Width.numViewed;
        control.set(
          {
            anonymous : true,
            textAlign : "right",
            width     : width,
            minWidth  : width,
            maxWidth  : width
          });
        this._addAt(control, 6);
        break;

      case "numComments":
        control = new qx.ui.basic.Label();
        width = aiagallery.widget.mystuff.Summary.Width.numComments;
        control.set(
          {
            anonymous : true,
            textAlign : "right",
            width     : width,
            minWidth  : width,
            maxWidth  : width
          });
        this._addAt(control, 7);
        break;
      }

      return control || this.base(arguments, id);
    },

    // property apply
    _applyIcon : function(value, old)
    {
      this.getChildControl("icon").setSource(value);
    },

    // property apply
    _applyImage1 : function(value, old)
    {
      this.getChildControl("image1").setSource(value);
    },
    
    // property apply
    _applyTitle : function(value, old)
    {
      this.getChildControl("title").setValue(value);
    },

    // property apply
    _applyStatus : function(value, old)
    {
      var             control = this.getChildControl("status");
      var             Status = aiagallery.dbif.Constants.Status;
      var             StatusToName = aiagallery.dbif.Constants.StatusToName;
      var             color;
      var             bgColor;
      
      switch(value)
      {
      case Status.Banned:
        color = "white";
        bgColor = "red";
        break;
      case Status.Pending:
        color = "black";
        bgColor = "yellow";
        break;
      case Status.Active:
        color = "green";
        bgColor = null;
        break;
      case Status.Processing:
        color = "black";
        bgColor = "yellow";
        break;
      case Status.Invalid:
        color = "white";
        bgColor = "red";
        break;
      case Status.Unpublished:
        color = "darkgray";
        bgColor = null;
        break;
      }
      control.setValue(
          "<span style='" +
          " padding:4px;" +
          " color:" + color + ";" +
          " background-color:" + bgColor + ";" +
          "'>" +
          StatusToName[value] +
          "</span>");
    },

    // property apply
    _applyNumLikes : function(value, old)
    {
      this.getChildControl("numLikes").setValue(String(value));
    },

    // property apply
    _applyNumDownloads : function(value, old)
    {
      this.getChildControl("numDownloads").setValue(String(value));
    },

    // property apply
    _applyNumViewed : function(value, old)
    {
      this.getChildControl("numViewed").setValue(String(value));
    },

    // property apply
    _applyNumComments : function(value, old)
    {
      this.getChildControl("numComments").setValue(String(value));
    }
  },
  
  defer : function(statics)
  {
    statics.Width.image1 = statics.Height;
  }
});
