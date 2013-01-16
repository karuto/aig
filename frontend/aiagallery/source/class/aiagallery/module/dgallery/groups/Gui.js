/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for group management and browsing
 */
qx.Class.define("aiagallery.module.dgallery.groups.Gui",
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
      var             canvas = module.canvas;
      var             manageCanvas;
      var             browseCanvas;
      var             btnManage;
      var             btnBrowse;
      var             label;       

      // Layouts
      var             btnLayout; 

      // Need to access the fsm from other functions
      this.fsm = fsm; 

      // Two views to this module
      manageCanvas = new qx.ui.container.Composite(new qx.ui.layout.VBox);
      browseCanvas = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      this.__radioView = 
        new aiagallery.widget.radioview.RadioView(this.tr("Groups: "));

      canvas.add(this.__radioView); 

      // Create the pages
      [
        {
          field  : "__containerBrowse",
          label  : this.tr("Browse and Join Groups"),
          custom : this._browseGroups
        },
        {
          field  : "__containerManage",
          label  : this.tr("Create and Manage Groups"),
          custom : this._manageGroups
        }
      ].forEach(
        function(pageInfo)
        {
          var             layout;

          // Create the page
          this[pageInfo.field] =
            new aiagallery.widget.radioview.Page(pageInfo.label);

          // Set its properties
          this[pageInfo.field].set(
          {
            layout       : new qx.ui.layout.VBox(),
            padding      : 20
          });
        
          // If there's a function for customizing this page, ...
          if (pageInfo.custom)
          {
            // ... then call it now. It's called in our own context, with the
            // page container as the parameter.
            qx.lang.Function.bind(pageInfo.custom, this)(this[pageInfo.field]);
          }
        
          // Add this page to the radio view
          this.__radioView.add(this[pageInfo.field]);
        },
        this);
    
      // When the radioview selection changes, copy fields or clear entry
      this.__radioView.addListener(
        "changeSelection",
        function(e)
        {       
          // Determine what page we are switching to and fire off the 
          // appropriate FSM event to get the data we need
  
        },
        this);
      
    },

    /**
     * Create the static content in the browseGroups page
     * 
     * @param container {qx.ui.core.Widget}
     *   The container in which the content should be placed. 
     */
    _browseGroups : function(container)
    {
      var      groupScroller;
      var      vBox; 

      // Create the scroller to hold all of the groups
      groupScroller = new qx.ui.container.Scroll();
      container.add(groupScroller, {flex : 1});
      
      // The Scroller may contain only one container, so create that container.
      vBox = new qx.ui.layout.VBox();
      this.groupScrollContainer =
        new qx.ui.container.Composite(vBox);
      groupScroller.add(this.groupScrollContainer);      
    },

    /**
     * Create the static content in the manageGrousp page
     * 
     * @param container {qx.ui.core.Widget}
     *   The container in which the content should be placed. 
     */
    _manageGroups : function(container)
    {
      var       layout; 

      // Gui objects
      var             saveBtn;
      var             deleteBtn;  
      var             groupNameField;
      var             groupDescriptionField;
      var             label; 
      var             ownedGroupBox; 
      var             groupNameList; 
      var             groupUsersList;
      var             groupUsersField;
      var             groupWaitList; 

      // Utility objects
      var             userDataArray;
      var             waitListDataArray; 

      // Layouts
      var             mainHBox;
      var             hBox;
      var             vBoxBtns; 
      var             vBoxText; 
      var             listLayout; 

      // Horizatal layout to hold everything
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      mainHBox = new qx.ui.container.Composite(layout);

      // Create a vertical box for the buttons
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBtns = new qx.ui.container.Composite(layout);
      
      // Create an Save Permission Group button
      saveBtn = new qx.ui.form.Button(this.tr("Save"));
      saveBtn.set(
      {
        maxHeight : 24,
        width     : 100
      });
      vBoxBtns.add(saveBtn);

      saveBtn.addListener(
        "click",
        function(e)
        {
          // Fire immediate event
          this.fsm.fireImmediateEvent(
            "save", this, e.getTarget());
        }, this); 

      // Disable button on startup 
      saveBtn.setEnabled(false); 

      // Create a Delete button
      deleteBtn = new qx.ui.form.Button(this.tr("Delete"));
      deleteBtn.set(
      {
        maxHeight : 24,
        width     : 100,
        enabled   : false
      });
      vBoxBtns.add(deleteBtn);
      deleteBtn.addListener(
        "click",
        function(e)
        {
          // Fire immediate event
          this.fsm.fireImmediateEvent(
            "delete", this, e.getTarget());
        }, this); 
      
      mainHBox.add(vBoxBtns); // Add buttons to layout

      // Create a vertical layout just for the two textfields and labels.
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxText = new qx.ui.container.Composite(layout);

      // Create a label for describing the textfields 
      label = new qx.ui.basic.Label(this.tr("Group Name:"));
      vBoxText.add(label);

      // Create textfield for entering in a group name
      groupNameField = new qx.ui.form.TextField;
      groupNameField.set(
      {
        width     : 200
      });
      vBoxText.add(groupNameField);

      // Only enable add button if there is something in the textfield
      groupNameField.addListener("input", function(e) 
      {
        var value = e.getData();
        saveBtn.setEnabled(value.length > 0);
        
        // Deselet all group names
        groupNameList.resetSelection(); 
        
        // Clear description field 
        groupDescriptionField.setValue("");           
      }, this); 

      // Create friendly name to get it from the FSM
      this.fsm.addObject("groupNameField", 
         groupNameField,"main.fsmUtils.disable_during_rpc");

      // Create a label for describing the textfields 
      label = new qx.ui.basic.Label(this.tr("Description:"));
      vBoxText.add(label);
         
      // Create a textfield to enter a description for the pGroup
      groupDescriptionField = new qx.ui.form.TextField;
      groupDescriptionField.set(
      {
        width     : 200
      });

      // Add textfield to layout
      vBoxText.add(groupDescriptionField);

      // Create friendly name to get it from the FSM
      this.fsm.addObject("groupDescriptionField", 
         groupDescriptionField,"main.fsmUtils.disable_during_rpc");

      // Create a label for describing the textfield
      label =  new qx.ui.basic.Label(this.tr("Request the Following Users (seperate by comma):"));
      vBoxText.add(label);
         
      // Create a textfield to enter a description for the pGroup
      groupUsersField = new qx.ui.form.TextField;
      groupUsersField.set(
      {
        width     : 200
      });

      // Add textfield to layout
      vBoxText.add(groupUsersField);

      // Create friendly name to get it from the FSM
      this.fsm.addObject("groupUsersField", 
         groupUsersField,"main.fsmUtils.disable_during_rpc");
    
      // Add vertical layout to horizantal layout
      mainHBox.add(vBoxText); 

      // Create a set of finder-style multi-level browsing groups
      // This will show the groups a user owns
      ownedGroupBox = new qx.ui.groupbox.GroupBox("User Management");
      ownedGroupBox.setLayout(new qx.ui.layout.HBox());
      ownedGroupBox.setContentPadding(5);
      mainHBox.add(ownedGroupBox);

      // create and add the lists.
      // 
      // Each list has a label to describe it
      // the label and the list are combined into a layout
      // the layout goes into the groupbox
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      label = new qx.ui.basic.Label(this.tr("Group Name"));
      listLayout.add(label);

      groupNameList = new qx.ui.form.List();
      groupNameList.setWidth(150);
      groupNameList.addListener("changeSelection", 
        this.fsm.eventListener, this.fsm);
      
      // Disable delete/save button unless something is selected
      groupNameList.addListener("changeSelection", function(e) 
      {
        var bEnable = (groupNameList.getSelection().length != 0);
        saveBtn.setEnabled(bEnable);
        deleteBtn.setEnabled(bEnable);

        // Put the selected name in the name field
        //var value = groupNameList.getSelection()[0].getLabel(); 
         
        //groupNameField.setValue(value); 
      }, this); 

      // Add list of group names to group box
      listLayout.add(groupNameList);
      ownedGroupBox.add(listLayout);

      // Need to be able to access this list from the fsm 
      this.fsm.addObject("groupNameList", 
        groupNameList, "main.fsmUtils.disable_during_rpc");     

      // Track users who belong to the group
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      label = new qx.ui.basic.Label(this.tr("Members"));
      listLayout.add(label);

      groupUsersList = new qx.ui.form.List();
      groupUsersList.setWidth(150);
      groupUsersList.addListener("changeSelection", 
        this.fsm.eventListener, this.fsm);

      // Allow user to select multiple items
      groupUsersList.setSelectionMode("multi");
      
      // Array to add users to
      userDataArray = new qx.data.Array(); 

      // Create controller to add users to groupUser list
      this.userController 
        = new qx.data.controller.List(userDataArray, groupUsersList); 
        
      // Add to layout
      listLayout.add(groupUsersList);
      ownedGroupBox.add(listLayout);

      this.fsm.addObject("groupUsers", 
        groupUsersList, "main.fsmUtils.disable_during_rpc");

      // Track users who are on the group waitList
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      label = new qx.ui.basic.Label(this.tr("Wait List"));
      listLayout.add(label);

      groupWaitList = new qx.ui.form.List();
      groupWaitList.setWidth(150);
      groupWaitList.addListener("changeSelection", 
        this.fsm.eventListener, this.fsm);

      // Array to add users to
      waitListDataArray = new qx.data.Array(); 

      // Create controller to add users to groupWait list
      this.waitListController 
        = new qx.data.controller.List(waitListDataArray, groupWaitList); 

      // Add to layout 
      listLayout.add(groupWaitList);
      ownedGroupBox.add(listLayout);

      // Add to main layout 
      container.add(mainHBox);

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
      var             groupList; 

      // Objects from the gui we will add/subtract from
      var             groupNameList = fsm.getObject("groupNameList"); 
      var             groupDescriptionField = fsm.getObject("groupDescriptionField");

      // System Objects
      //var             userController = fsm.getObject("userController"); 

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
      // Browse Groups
      case "appear":
        groupList = response.data.result;

        groupList.forEach(
          function(group)
          {
            // Add each group name to the list
            var name = new qx.ui.form.ListItem(group.name);
            groupNameList.add(name); 

            // Fill fields 
            groupDescriptionField.setValue(group.description); 

            // Select it
            groupNameList.setSelection([name]);

            // Convert user lists into data arrays
            var userMemberDataArray = new qx.data.Array(group.users);
            var userRequestList = new qx.data.Array(group.joiningUsers);
            var userWaitList = new qx.data.Array(group.requestedUsers); 

            // Populate lists 
            this.userController.setModel(userMemberDataArray); 
            this.waitListController.setModel(userWaitList); 
	  }, this);


        // Populate list of existing groups
        // Each item on the list has a button to ask to join group
 
        break; 
      
      // Manage Groups
      case "getOwnedGroups":
        // Populate list of groups owned by this user

        // Select the top one

        // Populate userList of that selected group

        // Populate both textfields with info about this group

        break;

      case "deleteGroup":
        // Remove group from list
      
        break;

      case "addOrEditGroup":
        // If the group did not exist add it to the list
        // if it did, do nothing 
        break;


      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
