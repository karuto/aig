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
 
      var             label; 

      // Wrap layout in scroller
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });

      canvas = new qx.ui.container.Composite(new qx.ui.layout.HBox(10)); 
      scrollContainer.add(canvas, { flex : 1 });

      // Will hold the group info
      this.groupLayout 
        = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));

      // Button to join group
      this.joinGroupBtn = new qx.ui.form.Button(this.tr("Join Group")); 

      this.joinGroupBtn.addListener("execute", fsm.eventListener, fsm);
      this.joinGroupBtn.set(
        {
          maxWidth  : 100,
          maxHeight : 60
        }
      );

      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("joinBtn", 
         this.joinGroupBtn, "main.fsmUtils.disable_during_rpc");    

      // We will add this button later
      //this.groupLayout.add(this.joinGroupBtn);

      canvas.add(this.groupLayout); 
      canvas.add(new qx.ui.core.Spacer(20));   

      // Sidebar to hold apps made by members of the group
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      // Bump the list down a bit
      listLayout.add(new qx.ui.core.Spacer(0, 70)); 

      label = new qx.ui.basic.Label(this.tr("Apps by Group Members"));
      label.setFont("bold");
      listLayout.add(label);

      this.byGroup = new qx.ui.list.List();
      this.byGroup.set(
        {
          itemHeight : 130,
          width      : 400,
          height     : 600, 
          labelPath  : "title",
          iconPath   : "image1",
          delegate   :
          {
            createItem : function()
            {
              return new aiagallery.widget.SearchResult("byAuthor");
            },
            
            bindItem : function(controller, item, id) 
            {
              [
                "uid",
                "image1",
                "title",
                "numLikes",
                "numDownloads",
                "numViewed",
                "numComments",
                "displayName"
              ].forEach(
                function(name)
                {
                  controller.bindProperty(name, name, null, item, id);
                });
            },

            configureItem : qx.lang.Function.bind(
              function(item) 
              {
                // Listen for clicks on the title or image, to view the app
                item.addListener("viewApp", fsm.eventListener, fsm);
              },
              this)
          }
        });

      listLayout.add(this.byGroup); 
      canvas.add(listLayout);
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

      // Errors with code 1 will be handled specially 
      if (response.type == "failed" && response.data.code != 1)
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      } 
      else if (response.data.code == 1 ||
               response.data.code == 2)
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
            width      : 350,
            height     : 100   
          }
        );

        this.groupLayout.add(guiObject); 

        // Members
        label = new qx.ui.basic.Label(this.tr("Members: "));
        label.setFont("bold");
        this.groupLayout.add(label); 

        // Create a layout to show 5 users across.
        // Each user should be clickable to their profile page.
        layout = new qx.ui.container.Composite(new qx.ui.layout.HBox());

         group.users.forEach(
           function(user)
           {
             if (count == 4)
             {
               // Reint count
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

                 // Remove "by" from displayName
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
        case aiagallery.dbif.Constants.GroupStatus.User:
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

        // Update sidebar with apps made by members of this group
        model = qx.data.marshal.Json.createModel(group.groupApps);
        this.byGroup.setModel(model);

        // Add joining button
        this.groupLayout.add(this.joinGroupBtn);

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
