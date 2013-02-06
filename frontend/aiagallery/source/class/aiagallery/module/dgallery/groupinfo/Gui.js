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
      var             button;

      // Wrap layout in scroller
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });

      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox()); 
      scrollContainer.add(canvas, { flex : 1 });

      // Will hold the group info
      this.groupLayout 
        = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
      
      canvas.add(this.groupLayout); 
      canvas.add(new qx.ui.core.Spacer(0, 20));

      // Button to join group
      button = new qx.ui.form.Button(this.tr("Join Group")); 

      button.addListener("execute", fsm.eventListener, fsm);
      button.set(
        {
          maxWidth  : 100,
          maxHeight : 60
        }
      );

      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("joinBtn", 
         button, "main.fsmUtils.disable_during_rpc");    

      canvas.add(button);     

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
      var             transText; 

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
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

        // FIXME: remove some options if the user is not logged in

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
        transText = this.tr("Group Owner: ");
        label = new qx.ui.basic.Label(transText + group.owner);
        this.groupLayout.add(label); 

        // Description
        label = new qx.ui.basic.Label(this.tr("Description: "));
        this.groupLayout.add(label); 

        guiObject = new qx.ui.form.TextArea("");
        guiObject.set(
          {
            value      : group.description, 
            //appearance : "widget",
            readOnly   : true,
            wrap       : true,
            maxWidth      : 450,
            height     : 100   
          }
        );

        this.groupLayout.add(guiObject); 

        // Members
        label = new qx.ui.basic.Label(this.tr("Members: "));
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

        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
