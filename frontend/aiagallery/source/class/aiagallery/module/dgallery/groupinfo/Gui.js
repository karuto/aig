/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for a studio info page.
 */
qx.Class.define("aiagallery.module.dgallery.groupinfo.Gui",
{
  type   : "singleton",
  extend : qx.ui.core.Widget,

  members :
  {
    __flagItListener : null,

    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             o;
      var             fsm = module.fsm;
 
      // Layouts and containers
      var             canvas;
      var             outerCanvas = module.canvas;
      var             scrollContainer;
      var             listLayout;
      var             groupAppsLayout;
 
      // Gui releated
      var             label; 
      var             font; 
      var             scroller; 

      // Attach fsm to the page
      this.fsm = fsm; 

      // Wrap layout in scroller
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });

      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox()); 
      canvas.set({ padding: 10 });
      scrollContainer.add(canvas, { flex : 1 });

      // Will hold the group info
      this.groupLayout 
        = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
      //this.groupLayout.setPadding(10);
      
      // Will hold the basic group info, such as name, type, action buttons, etc
      this.groupInfoLayout 
        = new qx.ui.container.Composite(new qx.ui.layout.HBox()); 
      this.groupInfoLayout.setBackgroundColor('#C0C0FF'); 
      
      // Button to join group
      this.joinGroupBtn = new qx.ui.form.Button(this.tr("Request Membership")); 

      this.joinGroupBtn.addListener("execute", fsm.eventListener, fsm);
      this.joinGroupBtn.set(
        {
          maxWidth : 160,
          maxHeight : 60 /* KM Original: 60 */
        }
      );

      // Button to pop asc apps window
      this.ascAppPopupBtn = new qx.ui.form.Button(this.tr("Associate Apps")); 

      // Open window on execute
      this.ascAppPopupBtn.addListener(
        "execute", 
        function(e)
        {
          // Create popup
          this._ascAppPopup(this.ownedAppList, this.ascAppList, this.fsm); 

        }, this);

      this.ascAppPopupBtn.set(
        {
          maxWidth : 160,
          maxHeight : 60 /* KM Original: 60 */
        }
      );

      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("joinBtn", 
         this.joinGroupBtn, "main.fsmUtils.disable_during_rpc");    

      // We will add this button later

      groupAppsLayout = new qx.ui.layout.VBox();
      groupAppsLayout.set(
        {
          alignX : "center"
        });

      this.groupApps = new qx.ui.container.Composite(groupAppsLayout);
      this.groupApps.set(
        {
          decorator : "home-page-ribbon",
          padding   : 20
        });

      groupAppsLayout = new qx.ui.layout.VBox();
      groupAppsLayout.set(
        {
          alignX : "center"
        });

      this.groupAscApps = new qx.ui.container.Composite(groupAppsLayout);
      this.groupAscApps.set(
        {
          decorator : "home-page-ribbon",
          padding   : 20
        });

      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(20);

      this.groupAppsHeader = new qx.ui.basic.Label();
      this.groupAppsHeader.set(
        {
          font      : font, 
          decorator : "home-page-header"
        });
      this.groupApps.add(this.groupAppsHeader);

      this.groupAscAppsHeader = new qx.ui.basic.Label();
      this.groupAscAppsHeader.set(
        {
          font      : font, 
          decorator : "home-page-header"
        });
      this.groupAscApps.add(this.groupAscAppsHeader);
      
      // slide bar of Apps made by members of this group
      scroller = new qx.ui.container.Scroll();
      this.groupApps.add(scroller);
      
      // Scroll container can hold only a single child. Create that child.
      this.groupAppsContainer =
        new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
      this.groupAppsContainer.set(
          {
            height : 210
          });
      scroller.add(this.groupAppsContainer, {flex : 1});

      // slide bar of apps associated with this group
      scroller = new qx.ui.container.Scroll();
      this.groupAscApps.add(scroller);
      
      // Scroll container can hold only a single child. Create that child.
      this.groupAscAppsContainer =
        new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
      this.groupAscAppsContainer.set(
          {
            height : 210
          });
      scroller.add(this.groupAscAppsContainer, {flex : 1});
      
      // we will add this later     

      // Flag a user for having inappropriate content
      this.flagItLabel = new qx.ui.basic.Label(this.tr("Flag this Studio"));
      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.set(
        {
          color      : "#75940c",     // android-green-dark
          decoration : "underline"
        });

      this.flagItLabel.set(
        {
          maxHeight   : 30,
          textColor   : null, 
          font        : font, 
          toolTipText : this.tr("Flag this Studio")
        });

      // Pop a flag window on click
      this.__flagItListener = this.flagItLabel.addListener(
        "click",
        function(e)
        {
           var win = new aiagallery.widget.FlagPopUp(
              aiagallery.dbif.Constants.FlagType.Group, this);

           win.show();          
        },
        this);    
        
      this.groupLayout.add(this.groupInfoLayout);

      canvas.add(this.groupLayout); 
      this.canvas = canvas; 
    },

    
    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;
      var             group;

      var             layout;
      var             font; 
      var             label; 
      var             guiObject; 
      var             count = 0; 

      var             typeString;
      var             warnString; 
      var             stringMsg; 
      var             who;
      var             model;

      var             bShowBtn = false; 

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }
      if (response.type == "failed" &&
         (response.data.code == 1 || response.data.code == 2))
      {
        // Special error
        warnString = "";

        switch(response.data.code)
        {
        case 1:
        case 2:
          warnString = this.tr("Studio does not exist");  
          break;

        case 3:
          warnString = this.tr("You cannot flag your own studio.");
          break; 

        default:
          warnString = this.tr("Unknown error relating to pulling studio info"); 
          break;
        }  

        dialog.Dialog.warning(warnString);
        return;
      }
      // Generic errors
      else if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      } 

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "appear":
 
        group = response.data.result;

        // Save the user's apps and asc app
        this.ownedAppList = group.userApps;
        this.ascAppList = group.userAscApps;

        // If we are reloading the same page make sure the layout is clean
        this.groupLayout.removeAll(); 

        // Remove some options if the user is not logged in
        who = qx.core.Init.getApplication().getUserData("whoAmI");
        
        if(who.getIsAnonymous())
        {
          this.joinGroupBtn.setLabel(this.tr("Login to join")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);
          this.ascAppPopupBtn.setEnabled(false); 

          this._clearFlagListener(); 

          this.flagItLabel.set(
          {
            value     : this.tr("Login to flag this studio."),
        
            font      : "default",
            textColor : "black"
          });
        }

        // Add all the detail of the group to the canvas
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.setSize(21);

        // Header on the page 
        label = new qx.ui.basic.Label(group.name);
        label.set(
          {
            rich   : true,
            height : 30,
            font   : font,
            width  : 200
          }
        );

        // Save group name as user data so the flag it widget
        // can retrieve it later
        this.setUserData("studioname", group.name);
        this.groupInfoLayout.add(label); 

        // Group type info, setup string
        typeString = "<span style='display: inline;'>" 
                    + group.type + "</span>";
/*
        if (group.type === "Educational") {
          if(group.subType) {
            typeString = "<span style='display: inline;'>" 
                        + group.subType + "</span>";
          }
        }
*/        
        label = new qx.ui.basic.Label(typeString);
        label.set(
          {
            rich   : true
          }
        );

        this.groupInfoLayout.add(label); 


        // KM
        this.groupLayout.add(this.groupInfoLayout);

/*
        // Owner
        label = new qx.ui.basic.Label(this.tr("Studio Owner:"));
        label.setFont("bold");
 
        // Need to have two seperate labels here.
        // Use hbox layout.
        layout = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        layout.add(label);

        label = new qx.ui.basic.Label(group.owner);

        font.set(
          {
            color      : "#75940c",     // android-green-dark
            decoration : "underline",
            size       : 12
          });

        label.set(
          {
            textColor : null,       // Prevent color overide
            font      : font,
            cursor    : "pointer"
          });

        label.addListener(
           "click",
           function(e)
           {
             var             displayName;

             // Prevent the default 'click' behavior
             e.preventDefault();
             e.stop();

             // Remove "by" from displayName
             displayName = e.getTarget().getValue();

             // Launch user page module
             aiagallery.module.dgallery.userinfo.UserInfo.addPublicUserView(
               displayName);
           },
           this);

        layout.add(label); 

        this.groupLayout.add(layout); 
*/

        // Description
        guiObject = new qx.ui.form.TextArea("");
        guiObject.set(
          {
            value      : group.description, 
            appearance : "widget", 
            readOnly   : true,
            wrap       : true
          }
        );

        this.groupLayout.add(guiObject); 

        // Members
        layout = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
        label = new qx.ui.basic.Label("Members: ");
        label.setFont("bold");
        layout.add(label); 

        // Create a layout to show 5 users across.
        // Each user should be clickable to their profile page.
         group.users.forEach(
           function(user)
           {
             if (count == 4)
             {
               // re-int count
               count = 0;
 
               // Add existing layout and reint
               this.groupLayout.add(layout);
               layout = new qx.ui.container.Composite(new qx.ui.layout.HBox());
             } 

             label = new qx.ui.basic.Label(user);

             font.set(
               {
                 color      : "#75940c",     // android-green-dark
                 decoration : "underline",
                 size       : 12
               });

             label.set(
               {
                 textColor : null,       // Prevent color overide
                 font      : font,
                 cursor    : "pointer"
               });

             // Launch user profile
             label.addListener(
               "click",
               function(e)
               {
                 var             displayName;

                 // Prevent the default 'click' behavior
                 e.preventDefault();
                 e.stop();

                 // Get displayname 
                 displayName = e.getTarget().getValue();

                 // Launch user page module
                 aiagallery.module.dgallery.userinfo.UserInfo.addPublicUserView(
                   displayName);
               },
               this);

             layout.add(label); 

             count++;
           }
         ,this);

        // Add remaining names 
        this.groupLayout.add(layout);
        
        

        // Based on the status of the user in relation to the group
        // modify the join group button
        switch (group.userStatus)
        {
        case  aiagallery.dbif.Constants.GroupStatus.NonMember:
          // Only Members can associate apps 
          this.ascAppPopupBtn.setEnabled(false); 

          this.joinGroupBtn.setEnabled(true);
          break; 

        case aiagallery.dbif.Constants.GroupStatus.Requested:
          // Pop message
          stringMsg = this.tr("The admin of this studio has requested you to join, to complete this proccess click the \"Request Membership\" button");

          label = new qx.ui.basic.Label(stringMsg); 

          this.groupLayout.add(label);

          // Show the button if the owner has made the group's join 
          // type private. 
          bShowBtn = true;  

          // Only Members can associate apps 
          this.ascAppPopupBtn.setEnabled(false); 

          break;

        case aiagallery.dbif.Constants.GroupStatus.WaitList:
          this.joinGroupBtn.setLabel(this.tr("Waiting for Approval")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);

          // Disable asc. app popup
          this.ascAppPopupBtn.setEnabled(false); 

          break;
        case aiagallery.dbif.Constants.GroupStatus.Member:
          this.joinGroupBtn.setLabel(this.tr("Already Joined")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);

          // Enable asc. app popup
          this.ascAppPopupBtn.setEnabled(true); 

          break;
        case aiagallery.dbif.Constants.GroupStatus.Owner:
          this.joinGroupBtn.setLabel(this.tr("Studio Owner")); 

          // Disable join button
          this.joinGroupBtn.setEnabled(false);

          // Enable asc. app popup
          this.ascAppPopupBtn.setEnabled(true); 

          break;

        default:
          break;
        }

        // Update layout with apps associated with this group
        if (group.ascApps.length > 0)
        {
           // Set header
           this.groupAscAppsHeader.
               setValue(this.tr("This studio has ") + group.ascApps.length
                       + " associated apps"); 

           // On reloads ensure container is clean
           this.groupAscAppsContainer.removeAll(); 

           for(var i = 0; i < group.ascApps.length; i++)
           {
             // If this isn't the first one
             if (i > 0)
             {
               // Then add a spacer between the previous one and this one
               this.groupAscAppsContainer.add(new qx.ui.core.Spacer(10));
             }

             // Add the thumbnail for this app
             var appLiked = group.ascApps[i];
             var appThumbLiked = 
               new aiagallery.widget.SearchResult("homeRibbon", appLiked);
             this.groupAscAppsContainer.add(appThumbLiked);

             // Associate the app data with the UI widget so it can be passed
             // in the click event callback
             appThumbLiked.setUserData("App Data", appLiked);
         
             // Fire an event specific to this application, no friendly name.
             appThumbLiked.addListener(
               "click", 
               function(e)
               {
                 fsm.fireImmediateEvent(
                   "authoredAppClick", 
                   this, 
                   e.getCurrentTarget().getUserData("App Data"));
               });             
           }  
        }
        // There are no apps associated with this studio so 
        // do not show this scroller
        else 
        {
           this.groupAscAppsHeader.exclude(); 
           this.groupAscApps.exclude(); 
           this.groupAscAppsContainer.exclude();
	}

        // Update layout with apps made by members of this group
        if (group.groupApps.length > 0) 
        {
           // Set header
           this.groupAppsHeader.
               setValue(this.tr("This studio has ") + group.groupApps.length
                       + " apps"); 

           // On reloads ensure container is clean
           this.groupAppsContainer.removeAll(); 

           for(var i = 0; i < group.groupApps.length; i++)
           {
             // If this isn't the first one
             if (i > 0)
             {
               // Then add a spacer between the previous one and this one
               this.groupAppsContainer.add(new qx.ui.core.Spacer(10));
             }

             // Add the thumbnail for this app
             var appLiked = group.groupApps[i];
             var appThumbLiked = 
               new aiagallery.widget.SearchResult("homeRibbon", appLiked);
             this.groupAppsContainer.add(appThumbLiked);

             // Associate the app data with the UI widget so it can be passed
             // in the click event callback
             appThumbLiked.setUserData("App Data", appLiked);
         
             // Fire an event specific to this application, no friendly name.
             appThumbLiked.addListener(
               "click", 
               function(e)
               {
                 fsm.fireImmediateEvent(
                   "authoredAppClick", 
                   this, 
                   e.getCurrentTarget().getUserData("App Data"));
               });             
           }  
         }

        // Add join button only if the admin has allowed user to join
        // Unless the user has been requested to join
        if (group.joinType == aiagallery.dbif.Constants.JoinType.Public
            || bShowBtn)
        {
          this.groupInfoLayout.add(this.joinGroupBtn); /* KM: Change layout to HBox */
          this.groupInfoLayout.add(this.ascAppPopupBtn);
        }

        // Add associated apps scroller
        this.canvas.add(this.groupAscApps, {flex : 1});

        // Add group app scroller
        this.canvas.add(this.groupApps, {flex : 1});

        // Allow users to flag this group for bad content 
        this.canvas.add(this.flagItLabel);  

        if(group.bFlag)
        {
          // If the user has flagged this app before disable the flagit button
          this._clearFlagListener();

          // Replace the label
          this.flagItLabel.set(
            {
              value     : this.tr("Flagged as inappropriate."),
              font      : "default",
              textColor : "black"
            });

          // Reset the cursor
          this.flagItLabel.setCursor("default");
        }       

        break;

      case "joinGroup":
        result = response.data.result;  

        // Based on the status change the join group / asc app button
        switch (result)
        {
        case aiagallery.dbif.Constants.GroupStatus.Member:
          this.joinGroupBtn.setLabel(this.tr("Joined")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);

          // FIXME:Add user's name to list of members

          this.ascAppPopupBtn.setEnabled(true); 

          break;

        case aiagallery.dbif.Constants.GroupStatus.WaitList:
          this.joinGroupBtn.setLabel(this.tr("Waiting for Approval")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);
 
          // Pop message
          stringMsg = this.tr("You have been added to the wait list.\nThe group admin will review your request to join.");

          dialog.Dialog.alert(stringMsg);

          break;

        default:
          // Not possible at this time
          break;
      
        }

        break;

      case "flagGroup":
        this._clearFlagListener();

        // Replace the label
        this.flagItLabel.set(
          {
            value     : this.tr("Flagged as inappropriate."),
            font      : "default",
            textColor : "black"
          });

        // Reset the cursor
        this.flagItLabel.setCursor("default");

        break; 

      case "ascApps":
        // Valid, but nothing to do here
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    },

    /** 
     * Private helper function to clear the flag listener 
     * from the flagIt label. 
     * */
    _clearFlagListener : function() 
    {
      // Remove the listener.
      if (this.__flagItListener !== null)
      {
        this.flagItLabel.removeListenerById(this.__flagItListener);
        this.__flagItListener = null;
      }
    },

    /**
     * Create a popup dialog to allow a user to associate 
     * an app with this group they are a memeber of.
     * 
     * @param ownedAppList {Array}
     *   An array containg all the apps a user owns
     * 
     * @param ascAppList {Array}
     *   An array of all the apps this particular user has
     *   associated with this group 
     * 
     * @param fsm {Fsm Context}
     *   Fsm context of the group page so we can fire an event off
     * 
     */
    _ascAppPopup : function(ownedAppList, ascAppList, fsm)
    {

      var     instrLabel; 
      var     win;
      var     appList; 
      var     dataArray;
      var     selectionList = [];
      var     appChildren; 

      var     command; 
      var     okBtn;
      var     cancelBtn;
      var     hBox; 
      var     i;

      win = new qx.ui.window.Window(this.tr("Associate Apps with Group"));

      // Set properties
      win.set(
        {
          maxWidth : 400,
          layout   : new qx.ui.layout.VBox(30)
        }
      );

      // Add instructions
      instrLabel = new qx.ui.basic.Label(this.tr("Associate an app with this studio."));

      win.add(instrLabel);

      // Create a list to show the apps a user owns 
      appList = new qx.ui.form.List(); 
      appList.set(
        {
          width         : 300,
          maxHeight     : 500, 
          selectionMode : "multi"
        }
      );

      // Add each owned app to the list 
      ownedAppList.forEach(
        function(app)
        {
          var listItem; 

          listItem = new qx.ui.form.ListItem(app.title);
          listItem.setUserData("appId", app.uid); 

          appList.add(listItem);
        }
      );

      // For each app on the list see if the user has already associated it
      // with this group 
      appChildren = appList.getChildren();
         
      appChildren.forEach(
        function(listItem)
        {
          for(var i = 0; i < ascAppList.length; i++)
          {
            if(listItem.getUserData("appId") == ascAppList[i].app)
            {
              selectionList.push(listItem);

              // No need to look further
              break;
            }

          }
        }
      );

      // Set Selection
      if (selectionList.length != 0)
      {
        appList.setSelection(selectionList); 
      }

      //dataArray = new qx.data.Array(ownedAppList);
      // Controller for list
      //this.ascAppController = new qx.data.controller.List(dataArray, appList);

      win.add(appList); 

      // Add ok button
      // Create a horizontal box to hold the buttons
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

      // Add the Ok button
      okBtn = new qx.ui.form.Button(this.tr("Ok"));
      okBtn.set(
      {
        width  : 100,
        height : 30
      });

      hBox.add(okBtn);

      // Allow 'Enter' to confirm entry
      command = new qx.ui.core.Command("Enter");
      okBtn.setCommand(command);

      // add listener to ok
      okBtn.addListener(
        "execute", 
        function(e)
        {
          var   cleanList = [];
          var   children;
         
          // Close dialog
          win.close();

          children = appList.getSelection();

          children.forEach(
            function(listItem)
            {
              cleanList.push(listItem.getUserData("appId"));
            }
          );

          // Fire event to to FSM
          fsm.fireImmediateEvent("ascApp", fsm, cleanList);  

        }
      );      

      // Add cancel button
      // Add the Cancel button
      cancelBtn = new qx.ui.form.Button(this.tr("Cancel"));
      cancelBtn.set(
      {
        width  : 100,
        height : 30
      });

      hBox.add(cancelBtn);

      // Allow 'Escape' to cancel
      command = new qx.ui.core.Command("Esc");
      cancelBtn.setCommand(command);

      // Close the window if the cancel button is pressed
      cancelBtn.addListener(
      "execute",
      function(e)
      {
        win.close();

        // Reset to original selection
        if (selectionList.length != 0)
        {
          appList.setSelection(selectionList); 
        } 
        else
        {
          // Originally was an empty list 
          appList.setSelection([]);
        }
      },
      this);

      // Add button layout
      win.add(hBox); 

      // Open up popup
      win.open();

    }
  }
});
