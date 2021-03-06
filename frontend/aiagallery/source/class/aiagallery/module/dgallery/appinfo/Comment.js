/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.module.dgallery.appinfo.Comment",
{
  extend    : qx.ui.container.Composite,
  implement : [qx.ui.form.IModel],
  include   : [qx.ui.form.MModelProperty],
  
 /**
  * Create a new comment object. 
  *
  * @param data {Map}
  *   Initial data to display if any
  *
  * @param fsm {FSM}
  *   The finate state machine associated with the module creating the comment
  *
  * @param treeId {String}
  *   The tree id of the comment
  *
  * @param appId {Integer}
  *   The app id associated with the comment
  *
  * @param bMgmt {Boolean}
  *   True if this comment is beaing created on the management page.
  *   False if this comment is created on an app info page. 
  *
  * @param bFlagged {Boolean}
  *   True if the user has already flagged this comment
  */
  construct : function(data, fsm, treeId, appId, bMgmt, bFlagged)
  {
    var             layout;
    var             flagBtn; 
         
    // Set fsm, treeId, and appId so its available later for comments
    this.fsm = fsm;
    
    // Tree id of the comment 
    this.treeId = treeId; 
    
    // App id on which the comment is located
    this.appId = appId;
    
    // Determine if this is a management view or not
    this.bMgmt = bMgmt; 
    
    // Has the user flagged this comment once before
    this.bFlagged = bFlagged; 
    
    // Call the superclass constructor
    this.base(arguments);

    // Don't let the comment be near its container edges
    this.set(
    {
      marginLeft  : 20,
      marginRight : 20
    });

    layout = new qx.ui.layout.Grid(6, 0);
    layout.setRowFlex(0, 1);    // comment text takes up space as needed
    layout.setColumnWidth(0, 40);
    layout.setColumnFlex(4, 1);
    layout.setColumnAlign(0, "right", "middle");
    layout.setRowAlign(0, "left", "bottom");
    layout.setRowAlign(1, "left", "top");
    
    this.setLayout(layout);
    
    // Specify the format of date output
    this.dateFormat = aiagallery.Application.getDateFormat();
    
    // Create each of the child controls
    this.getChildControl("text");
    this.getChildControl("pointer");
    this.getChildControl("displayName");
    this.getChildControl("timestamp");
    this.getChildControl("spacer");
    
    // If we were given the initial data to display...
    if (data)
    {
      // ... then display it now
      this.set(data);
    }
    
  },

  properties :
  {
    visitor :
    {
      check    : "String",
      nullable : false
    },

    text :
    {
      check    : "String",
      nullable : false,
      apply    : "_applyText"
    },
    
    displayName :
    {
      check    : "String",
      nullable : false,
      apply    : "_applyDisplayName"
    },
    
    timestamp :
    {
      nullable  : false,
      transform : "_transformTimestamp",
      apply     : "_applyTimestamp"
    }
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var             control;
      var             font;
      var             flagComment; 

      switch(id)
      {
      case "text":
        control = new qx.ui.form.TextArea("hello world");
        control.set(
          {
//            appearance        : "widget",
            decorator         : "app-comment",
            readOnly          : true,
            wrap              : true,
            anonymous         : true,
            autoSize          : true,
            minimalLineHeight : 1
          });
        this._add(control, { row : 0, column : 0, colSpan : 5 });
        break;
        
      case "pointer":
        control = new qx.ui.basic.Image("aiagallery/comment-pointer.png");
        this._add(control, { row : 1, column : 0 });
        break;

      case "displayName":
        // The displayName should be displayed android green
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.set(
          {
            color      : "#75940c"     // android-green-dark
            // decoration : "underline"
          });
        control = new qx.ui.basic.Label();
        control.set(
          {
            textColor : null,       // don't let it override font's color
            font      : font,
            cursor    : "pointer"
          });

        // Visitor clicks lead to the user's profile page
        control.addListener(
          "click",
          function(e)
          {
            var             query;
            var             displayName;

            // Prevent the default 'click' behavior
            e.preventDefault();
            e.stop();

            // Remove "by" from displayName
            displayName = this.getDisplayName().replace("by ", "");

            // Launch user page module
            aiagallery.module.dgallery.userinfo.UserInfo.addPublicUserView(
            displayName);
          },
          this);

        this._add(control, { row : 1, column : 1 });
                
        // If this is true, viewing comment from management view
        if(this.bMgmt)
        {
          var         commentToFlagData; 
        
          // Package up data for fsm in a map
          commentToFlagData = 
          {
            "appId"  : this.appId,
            "treeId" : this.treeId
          };
        
          // Add the nessesary mgmt buttons
          // Keep comment 
          this.keepCommentButton = 
            new qx.ui.form.Button(this.tr("Keep Comment"));
            this.keepCommentButton.set(
            {
              maxHeight      : 50,
              maxWidth       : 200
            });
            
          // Create listener to catch click and send to fsm
          this.keepCommentButton.addListener(
            "click",
            function(e)
            {
              // Fire our own event to capture this click
              this.fsm.fireImmediateEvent(
              "keepComment", this, commentToFlagData);
            }, 
            this);
            
          // Add to comment  
          this._add(this.keepCommentButton, { row : 2, column : 1 });
            
          // Delete comment 
          this.deleteCommentButton = 
            new qx.ui.form.Button(this.tr("Delete Comment"));
            this.deleteCommentButton.set(
            {
              maxHeight      : 50,
              maxWidth       : 200
            });
            
          // Create listener to catch click and send to fsm
          this.deleteCommentButton.addListener(
            "click",
            function(e)
            {
            
              // Fire our own event to capture this click
              this.fsm.fireImmediateEvent(
              "deleteComment", this, commentToFlagData);
            }, 
            this);
            
          // Add to comment  
          this._add(this.deleteCommentButton, { row : 2, column : 2 });

          // Visit app info page
          this.visitCommentButton = 
            new qx.ui.form.Button(this.tr("Visit App"));
            this.visitCommentButton.set(
            {
              maxHeight      : 50,
              maxWidth       : 200
            });
            
          // Create listener to catch click and send to fsm
          this.visitCommentButton.addListener(
            "click",
            function(e)
            {
            
              // Fire our own event to capture this click
              this.fsm.fireImmediateEvent(
                "visitComment", this, commentToFlagData);
 
            }, 
            this);
            
          // Add to comment  
          this._add(this.visitCommentButton, { row : 2, column : 3 });
            
        } 
        else 
        {
          // add a flagit label that will be a link after that
          // If the user has already flagged this comment do not
          // add the listener nor display the flag text
          if(this.bFlagged)
          {
            this.flagComment = 
              new qx.ui.basic.Label(this.tr("Comment Flagged"));
            this.flagComment.set(
            {
              font        : "default", 
              textColor   : "black"
            });
          }
          else 
          {
            this.flagComment =
              new qx.ui.basic.Label(this.tr("Flag as inappropriate?"));
            this.flagComment.set(
              {
                maxHeight   : 30,
                textColor   : null, 
                font        : font, 
                toolTipText : this.tr("Flag this comment")
              });
            
            // Add to fsm
            this.fsm.addObject("flagComment", this.flagComment);
            
            // Create listener to catch click and send to fsm
            // Record id so we can remove it later
            this.flagCommentListener = 
              this.flagComment.addListener( "click", this._onFlagClick, this); 
          }
         
          // Add to comment  
          this._add(this.flagComment, { row : 1, column : 3 });
        }
        
        break;
        
      case "timestamp":
        control = new qx.ui.basic.Label();
        this._add(control, { row : 1, column : 2 });
        break;
        
      case "spacer":
        control = new qx.ui.core.Spacer(10, 10);
        this.add(control, { row : 2, column : 0 });
        break;
      }

      return control || this.base(arguments, id);
    },

    _onFlagClick : function()
    {
      var win = new aiagallery.widget.FlagPopUp(
        aiagallery.dbif.Constants.FlagType.Comment, this);

      win.show();
    },

    // Property apply.
    _applyText : function(value, old)
    {
      this.getChildControl("text").setValue(value);
    },

    // Property apply.
    _applyDisplayName : function(value, old)
    {
      this.getChildControl("displayName").setValue(value);
    },

    // Property apply.
    _applyTimestamp : function(value, old)
    {
      this.getChildControl("timestamp").setValue(value);
    },

    // Property transform. Convert from numeric timestamp to formatted string
    _transformTimestamp : function(value)
    {
      return(this.dateFormat.format(new Date(Number(value))));      
    }
  }
});
