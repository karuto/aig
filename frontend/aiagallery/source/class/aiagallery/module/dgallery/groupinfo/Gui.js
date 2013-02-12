/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for a group info page.
 */
qx.Class.define("aiagallery.module.dgallery.groupinfo.Gui",
{
  type   : "singleton",
  extend : qx.ui.core.Widget,

  members :
  {
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

      // Wrap layout in scroller
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });

      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)); 
      scrollContainer.add(canvas, { flex : 1 });

      // Will hold the group info
      this.groupLayout 
        = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));

      // Button to join group
      this.joinGroupBtn = new qx.ui.form.Button(this.tr("Request Membership")); 

      this.joinGroupBtn.addListener("execute", fsm.eventListener, fsm);
      this.joinGroupBtn.set(
        {
          maxWidth : 160,
          maxHeight : 60
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

      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(20);

      this.groupAppsHeader = new qx.ui.basic.Label();
      this.groupAppsHeader.set(
        {
          font  : font, 
          decorator : "home-page-header"
        });
      this.groupApps.add(this.groupAppsHeader);
      
      // slide bar of Newest Apps
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
     
      // we will add this later     

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

      var             warnString; 
      var             stringMsg; 
      var             who;
      var             model;

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
          warnString = this.tr("Group does not exist"); 
          break;

        default:
          warnString = this.tr("Unknown error relating to pulling group info"); 
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

        // Remove some options if the user is not logged in
        who = qx.core.Init.getApplication().getUserData("whoAmI");
        
        if(who.getIsAnonymous())
        {
          this.joinGroupBtn.setLabel(this.tr("Login to join")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);
        }

        // Add all the detail of the group to the canvas
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.setSize(26);

        // Header on the page 
        label = new qx.ui.basic.Label(group.name);
        label.set(
          {
            width  : 100,
            height : 30,
            font   : font
          }
        );

        this.groupLayout.add(label); 
        this.groupLayout.add(new qx.ui.core.Spacer(20)); 

        // Owner
        label = new qx.ui.basic.Label(this.tr("Group Owner:"));
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

        // Description
        label = new qx.ui.basic.Label(this.tr("Description: "));
        label.setFont("bold");
        this.groupLayout.add(label); 

        guiObject = new qx.ui.form.TextArea("");
        guiObject.set(
          {
            value      : group.description, 
            //appearance : "widget",
            readOnly   : true,
            wrap       : true,
            maxWidth      : 350,
            height     : 100   
          }
        );

        this.groupLayout.add(guiObject); 

        // Type info
        layout = new qx.ui.container.Composite(new qx.ui.layout.HBox());

        label = new qx.ui.basic.Label(this.tr("Type: "));
        label.setFont("bold");
        layout.add(label);

        label = new qx.ui.basic.Label(group.type);
        layout.add(label);

        if(group.subType)
        {
          label = new qx.ui.basic.Label(this.tr("Subtype: "));
          label.setFont("bold");
          layout.add(label);

          label = new qx.ui.basic.Label(group.subType);
          layout.add(label);
        }

        this.groupLayout.add(layout); 

        // Members
        label = new qx.ui.basic.Label(this.tr("Members: "));
        label.setFont("bold");
        this.groupLayout.add(label); 

        // Create a layout to show 5 users across.
        // Each user should be clickable to their profile page.
        layout = new qx.ui.container.Composite(new qx.ui.layout.HBox(7));

         group.users.forEach(
           function(user)
           {
             if (count == 4)
             {
               // re-int count
               count = 0;
 
               // Add existing layout and reint
               this.groupLayout.add(layout);
               layout = new qx.ui.container.Composite(new qx.ui.layout.HBox(7));
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
        case aiagallery.dbif.Constants.GroupStatus.Requested:
          // Pop message
          stringMsg = this.tr("The admin of this group has requested you to join, to complete this proccess click the \"Join Group\" button");

          label = new qx.ui.basic.Label(stringMsg); 

          this.groupLayout.add(label);
          break;

        case aiagallery.dbif.Constants.GroupStatus.WaitList:
          this.joinGroupBtn.setLabel(this.tr("Waiting for Approval")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);

          break;
        case aiagallery.dbif.Constants.GroupStatus.Member:
          this.joinGroupBtn.setLabel(this.tr("Already Joined")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);

          break;
        case aiagallery.dbif.Constants.GroupStatus.Owner:
          this.joinGroupBtn.setLabel(this.tr("Own Group")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);
          break;

        default:
          break;
        }

        // Update layout with apps made by members of this group
        if (group.groupApps.length > 0) 
        {
           // Set header
           this.groupAppsHeader.
               setValue(this.tr("This group has ") + group.groupApps.length
                       + " apps"); 

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

        // Add join button
        this.groupLayout.add(this.joinGroupBtn);
 
        // Add group app scroller
        this.canvas.add(this.groupApps, {flex : 1});

        break;

      case "joinGroup":
        result = response.data.result;  

        // Based on the status change the join group button
        switch (result)
        {
        case aiagallery.dbif.Constants.GroupStatus.Member:
          this.joinGroupBtn.setLabel(this.tr("Already Joined")); 

          // Disable button
          this.joinGroupBtn.setEnabled(false);

          // Add user's name to list of members

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

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
