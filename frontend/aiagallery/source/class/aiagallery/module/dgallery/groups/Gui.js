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
      var             canvas;
      var             outerCanvas = module.canvas;
      var             manageCanvas;
      var             browseCanvas;
      var             btnManage;
      var             btnBrowse;
      var             label;       

      // Layouts
      var             btnLayout; 

      var             scrollContainer; 

      // Need to access the fsm from other functions
      this.fsm = fsm; 

      // Two views to this module
      manageCanvas = new qx.ui.container.Composite(new qx.ui.layout.VBox);
      browseCanvas = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      this.__radioView = 
        new aiagallery.widget.radioview.RadioView(this.tr("Groups: "));

      // Put whole page into scroller
      scrollContainer = new qx.ui.container.Scroll();

      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox); 
      scrollContainer.add(canvas); 
      outerCanvas.add(scrollContainer, {flex : 1});

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
      //var      groupScroller;

      // Layouts
      var      vBox; 
      var      layout;
      var      searchLayout; 

      // GUI Objects
      var      searchTextField;
      var      searchButton; 
      var      label; 

      // Create a search bar to search for groups
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(5);      
      searchLayout = new qx.ui.container.Composite(layout);

      // Description label
      label = new qx.ui.basic.Label(this.tr("Find a group"));

      // Text field to enter search query
      searchTextField = new qx.ui.form.TextField;
      searchTextField.setWidth(500); 

      // Need to access the field on the fsm
      this.fsm.addObject("searchTextField", 
         searchTextField, "main.fsmUtils.disable_during_rpc");     

      // Button to execute search
      searchButton = new qx.ui.form.Button(this.tr("Search"));
      searchButton.addListener("execute", this.fsm.eventListener, this.fsm);

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("searchBtn", 
         searchButton, "main.fsmUtils.disable_during_rpc");      

      // Allow 'Enter' to fire a search
      //command = new qx.ui.core.Command("Enter");
      //this.searchButton.setCommand(command);

      // Add label, button. and search text field to layout
      searchLayout.add(label); 
      searchLayout.add(searchTextField);
      searchLayout.add(searchButton);
    
      // Add to main layout
      container.add(searchLayout); 

      // Browse categories 
    
      // Create the container to hold all the group objects
/*      
      this.groupContainer
        = new qx.ui.container.Composite(new qx.ui.layout.VBox());
*/    

      this.groupContainer = new qx.ui.list.List();

      // Space out search bar and results
      container.add(new qx.ui.core.Spacer(0, 20)); 

      // Add the search results label
      var font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(18);
      label = new qx.ui.basic.Label(this.tr("Search Results"));
      label.set(
        {
          font : font
        });
      container.add(label);

      // Add to layout
      container.add(this.groupContainer, {flex : 1}); 
      
    },

    /**
     * Create the static content in the manageGrousp page
     * 
     * @param container {qx.ui.core.Widget}
     *   The container in which the content should be placed. 
     */
    _manageGroups : function(container)
    {
      // Gui objects
      var             newBtn; 
      var             saveBtn;
      var             deleteBtn;
      var             requestBtn;   
      var             button; 

      var             groupNameField;
      var             groupDescriptionField;
      var             groupUsersField;
      var             groupTypeBox; 

      var             label; 

      var             ownedGroupBox; 
      var             userGroupBox;

      var             groupNameList; 
      var             groupUsersList;
      var             groupWaitList; 
      var             groupRequestList; 

      // Utility objects
      var             userDataArray;
      var             waitListDataArray; 
      var             requestListDataArray; 
      var             translatedTxt; 
      var             eduTypeRadioButtonGroup;
      var             radioButton;
      var             scrollContainer;

      // Layouts / Containers
      var             outerCanvas; 
      var             mainHBox;
      var             userHBox; 
      var             hBox;
      var             vBoxBtns; 
      var             vBoxText; 
      var             listLayout; 
      var             requestLayout;
      var             layout; 

      // MAIN LAYOUTS
      // Horizatal layout to hold group management 
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      mainHBox = new qx.ui.container.Composite(layout);

      // Horizatal layout to hold group management 
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      userHBox = new qx.ui.container.Composite(layout);

      // LAYOUTS WITHIN MAIN LAYOUT
      // Create a vertical box for the buttons
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBtns = new qx.ui.container.Composite(layout);
      
      // Space out the buttons to line up things nicely.
      vBoxBtns.add(new qx.ui.core.Spacer(0, 20));

      // Create an Save Permission Group button
      newBtn = new qx.ui.form.Button(this.tr("Create New"));
      newBtn.set(
      {
        maxHeight : 24,
        width     : 100
      });
      vBoxBtns.add(newBtn);

      newBtn.addListener("execute", function(e) 
      {
        // Clear out all the fields and deselect the group name
        // Deselet all group names
        groupNameList.resetSelection(); 

        // Clear out name field 
        groupNameField.setValue("");  
        
        // Clear description field 
        groupDescriptionField.setValue("");   

        // Clear out requested user field
        groupUsersField.setValue("");

        // Clear out user lists    
        groupUsersList.removeAll(); 
        groupWaitList.removeAll();
        groupRequestList.removeAll();  

        // Reset type info 
        // Select the first child
        var children = groupTypeBox.getChildren(); 
        groupTypeBox.setSelection([children[0]]); 
        eduTypeRadioButtonGroup.setEnabled(false); 
      }, this); 

      // Create an Save Permission Group button
      saveBtn = new qx.ui.form.Button(this.tr("Save"));
      saveBtn.set(
      {
        maxHeight : 24,
        width     : 100
      });
      vBoxBtns.add(saveBtn);
      saveBtn.addListener("execute", this.fsm.eventListener, this.fsm);

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("saveBtn", 
         saveBtn, "main.fsmUtils.disable_during_rpc");

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
      deleteBtn.addListener("execute", this.fsm.eventListener, this.fsm);

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("deleteBtn", 
         deleteBtn, "main.fsmUtils.disable_during_rpc");            

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
        width     : 200,
        maxLength : aiagallery.dbif.Constants.FieldLength.Title
      });
      vBoxText.add(groupNameField);

      // Only enable save button if there is something in the textfield
      groupNameField.addListener("input", function(e) 
      {
        var value = e.getData();
        saveBtn.setEnabled(value.length > 0);
        
      }, this); 

      // Create friendly name to get it from the FSM
      this.fsm.addObject("groupNameField", 
         groupNameField,"main.fsmUtils.disable_during_rpc");

      // Create a label for describing the textfields 
      label = new qx.ui.basic.Label(this.tr("Description:"));
      vBoxText.add(label);
         
      // Create a textarea to enter a description for the pGroup
      groupDescriptionField = new qx.ui.form.TextArea;
      groupDescriptionField.set(
      {
        width     : 200,
        maxLength : aiagallery.dbif.Constants.FieldLength.Group
      });

      // Add textfield to layout
      vBoxText.add(groupDescriptionField);

      // Create friendly name to get it from the FSM
      this.fsm.addObject("groupDescriptionField", 
         groupDescriptionField,"main.fsmUtils.disable_during_rpc");
    
      // Type of group
      groupTypeBox = new qx.ui.form.SelectBox(); 

      // Add group types
      translatedTxt = this.tr("General");
      groupTypeBox.add(new qx.ui.form.ListItem(translatedTxt));

      translatedTxt = this.tr("Educational");
      groupTypeBox.add(new qx.ui.form.ListItem(translatedTxt));

      // Create radio buttons for use if a user selects
      // an educational group type
      eduTypeRadioButtonGroup = new qx.ui.form.RadioButtonGroup();

      translatedTxt = this.tr("K-8");
      radioButton = new qx.ui.form.RadioButton(translatedTxt);
      eduTypeRadioButtonGroup.add(radioButton); 

      translatedTxt = this.tr("High School");
      radioButton = new qx.ui.form.RadioButton(translatedTxt);
      eduTypeRadioButtonGroup.add(radioButton); 

      translatedTxt = this.tr("College / University");
      radioButton = new qx.ui.form.RadioButton(translatedTxt);
      eduTypeRadioButtonGroup.add(radioButton); 

      // Need to be able to access the radiobuttons on the fsm
      this.fsm.addObject("eduTypeRadioButtonGroup", 
        eduTypeRadioButtonGroup, "main.fsmUtils.disable_during_rpc");   

      // If a user selects an educational group then
      // display some subgroup info
      groupTypeBox.addListener("changeSelection", 
        function(e)
          {
            // Is the new selection educational
            var label = groupTypeBox.getSelection()[0].getLabel();
            
            if (label == aiagallery.dbif.Constants.GroupTypes.Educational)
            {
              // Display Radiobuttons
              eduTypeRadioButtonGroup.setEnabled(true);
            } 
            else 
            {
              // Hide Radiobuttons
              eduTypeRadioButtonGroup.setEnabled(false);
            }

          }
      );

      // This group starts disabled 
      eduTypeRadioButtonGroup.setEnabled(false); 

      // Need to be able to access the radiobuttons on the fsm
      this.fsm.addObject("groupTypeBox", 
        groupTypeBox, "main.fsmUtils.disable_during_rpc");   

      // Add to text layout 
      vBoxText.add(groupTypeBox); 
      vBoxText.add(eduTypeRadioButtonGroup);

      // Create a set of finder-style multi-level browsing groups
      // This will show the groups a user owns and users in the group
      ownedGroupBox = new qx.ui.groupbox.GroupBox("Group Management");
      ownedGroupBox.setLayout(new qx.ui.layout.HBox());
      ownedGroupBox.setContentPadding(5);

      // All gorup manage gui objects made tweak order
      mainHBox.add(ownedGroupBox);

      // Add vertical layout to horizantal layout
      mainHBox.add(vBoxText); 

      // Add buttons to layout
      mainHBox.add(vBoxBtns); 

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
      groupNameList.setHeight(250); 

      // We will add a changeSelection listener to the FSM
      // In the handleResponse appear switch statement.
      // This ensures on appear we do not immediately call
      // getGroup unnecessarily

      // Ensure one item is always selected if possible
      groupNameList.setSelectionMode("single"); 
      
      // Disable delete/save button unless something is selected
      groupNameList.addListener("changeSelection", function(e) 
      {
        var bEnable = (groupNameList.getSelection().length != 0);
        saveBtn.setEnabled(bEnable);
        deleteBtn.setEnabled(bEnable);

        if (bEnable)
        {
          // Clear name field as long as something is selected
          //groupNameField.setValue(""); 

          // Put the selected name in the name field
          var value = groupNameList.getSelection()[0].getLabel(); 
          groupNameField.setValue(value); 
        }
      }, this); 

      // Add list of group names to group box
      listLayout.add(groupNameList);
      ownedGroupBox.add(listLayout);

      // Need to be able to access this list from the fsm 
      this.fsm.addObject("groupNameList", 
        groupNameList, "main.fsmUtils.disable_during_rpc");     

      // Reinit vbox to hold btns for user management 
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBtns = new qx.ui.container.Composite(layout);

      // Space the buttons down by one by adding a spacer
      vBoxBtns.add(new qx.ui.basic.Label()); 

      // Create a remove user button
      button = new qx.ui.form.Button(this.tr("Remove User(s)"));
      button.set(
      {
        maxHeight : 30,
        enabled   : false
      });
      vBoxBtns.add(button);
      button.addListener("execute", this.fsm.eventListener, this.fsm);

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("removeGroupUsers", 
         button, "main.fsmUtils.disable_during_rpc");

      // Button to approve a user from the wait list 
      button = new qx.ui.form.Button(this.tr("Approve User"));
      button.set(
      {
        maxHeight : 24,
        enabled   : false
      });
      vBoxBtns.add(button);
      button.addListener(
        "click",
        function(e)
        {
          // Fire immediate event
          this.fsm.fireImmediateEvent(
            "approveGroupUser", this, e.getTarget());
        }, this); 

      button.addListener("execute", this.fsm.eventListener, this.fsm);

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("approveGroupUser", 
         button, "main.fsmUtils.disable_during_rpc");

      // Button to approve a user from the wait list 
      button = new qx.ui.form.Button(this.tr("Approve All"));
      button.set(
      {
        maxHeight : 24,
        enabled   : false
      });
      vBoxBtns.add(button);

      button.addListener("execute", this.fsm.eventListener, this.fsm);

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("approveAllGroupUser", 
         button, "main.fsmUtils.disable_during_rpc");

      // Add button layout to layout
      userHBox.add(vBoxBtns); 

      // Group box showing users waiting and requesting to join
      userGroupBox = new qx.ui.groupbox.GroupBox("User Management");
      userGroupBox.setLayout(new qx.ui.layout.HBox());
      userGroupBox.setContentPadding(5);     

      // Track users who belong to the group
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      label = new qx.ui.basic.Label(this.tr("Members"));
      listLayout.add(label);

      groupUsersList = new qx.ui.form.List();
      groupUsersList.setWidth(150);
      groupUsersList.addListener("changeSelection", 
        this.fsm.eventListener, this.fsm);

      // Create friendly name to get it from the FSM
      this.fsm.addObject("groupUsersList", 
         groupUsersList,"main.fsmUtils.disable_during_rpc");

      // Allow user to select multiple items
      groupUsersList.setSelectionMode("multi");
      
      // Array to add users to
      userDataArray = new qx.data.Array(); 

      // Create controller to add users to groupUser list
      this.userController 
        = new qx.data.controller.List(userDataArray, groupUsersList); 
        
      this.fsm.addObject("groupUsers", 
        groupUsersList, "main.fsmUtils.disable_during_rpc");

      // Add to layout
      listLayout.add(groupUsersList);
      userGroupBox.add(listLayout);

      // Track users who are on the group waitList
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      label = new qx.ui.basic.Label(this.tr("Wait List"));
      listLayout.add(label);

      groupWaitList = new qx.ui.form.List();
      groupWaitList.setWidth(150);
      groupWaitList.addListener("changeSelection", 
        this.fsm.eventListener, this.fsm);

      // Create friendly name to get it from the FSM
      this.fsm.addObject("groupWaitList", 
         groupWaitList,"main.fsmUtils.disable_during_rpc");

      // Allow user to select multiple items
      groupWaitList.setSelectionMode("multi");

      // Array to add users to
      waitListDataArray = new qx.data.Array(); 

      // Create controller to add users to groupWait list
      this.waitListController 
        = new qx.data.controller.List(waitListDataArray, groupWaitList); 

      // Add to layout 
      listLayout.add(groupWaitList);
      userGroupBox.add(listLayout);

      // Track users who are on the group waitList
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      label = new qx.ui.basic.Label(this.tr("Requested List"));
      listLayout.add(label);

      groupRequestList = new qx.ui.form.List();
      groupRequestList.setWidth(150);
      groupRequestList.addListener("changeSelection", 
        this.fsm.eventListener, this.fsm);

      // Create friendly name to get it from the FSM
      this.fsm.addObject("groupRequestList", 
         groupRequestList,"main.fsmUtils.disable_during_rpc");

      // Allow user to select multiple items
      groupRequestList.setSelectionMode("multi");

      // Array to add users to
      requestListDataArray = new qx.data.Array(); 

      // Create controller to add users to groupWait list
      this.requestListController 
        = new qx.data.controller.List(requestListDataArray, groupRequestList);

      // Add to layout 
      listLayout.add(groupRequestList);
      userGroupBox.add(listLayout);
      userHBox.add(userGroupBox); 

      // Layout to hold the request user section
      requestLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

      // Create a request button
      requestBtn = new qx.ui.form.Button(this.tr("Request Users"));
      requestBtn.set(
      {
        maxHeight : 24,
        width     : 150,
        enabled   : false
      });
      requestLayout.add(requestBtn);
      requestBtn.addListener("execute", this.fsm.eventListener, this.fsm);

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("requestBtn", 
         requestBtn, "main.fsmUtils.disable_during_rpc");    

      // Hold label and text area
      layout =  new qx.ui.container.Composite(new qx.ui.layout.VBox(10));    

      // Create a label for describing the textfield
      label =  new qx.ui.basic.Label(this.tr("Request the Following Users (seperate by comma):"));
      layout.add(label);
         
      // Create a textfield to request specific users
      groupUsersField = new qx.ui.form.TextArea;
      groupUsersField.set(
      {
        maxWidth     : 350,
        maxHeight    : 350
        //maxLength    : aiagallery.dbif.Constants.FieldLength.Group
      });

      // Add textfield to layout
      layout.add(groupUsersField);
      requestLayout.add(layout);

      // Create friendly name to get it from the FSM
      this.fsm.addObject("groupUsersField", 
         groupUsersField,"main.fsmUtils.disable_during_rpc"); 

      // Outer canvas holds the layouts that comprise the
      // management gui
      outerCanvas = new qx.ui.container.Composite(new qx.ui.layout.VBox());

      outerCanvas.add(mainHBox); 
      outerCanvas.add(new qx.ui.core.Spacer(0, 30)); 
      outerCanvas.add(userHBox);
      outerCanvas.add(new qx.ui.core.Spacer(0, 30));
      outerCanvas.add(requestLayout); 

      // Container is the main layout for this radioButton page
      container.add(outerCanvas); 
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

      // System objects
      var             userMemberDataArray;
      var             userRequestList;
      var             userWaitList;
      var             warnString; 

      // Objects from the gui we will add/subtract from
      var             groupNameField = fsm.getObject("groupNameField");
      var             groupNameList = fsm.getObject("groupNameList"); 
      var             groupDescriptionField = fsm.getObject("groupDescriptionField");
      var             groupUsersList = fsm.getObject("groupUsersList");
      var             groupWaitList = fsm.getObject("groupWaitList");
      var             groupRequestList = fsm.getObject("groupRequestList");
      var             groupUsersField = fsm.getObject("groupUsersField"); 
      var             eduTypeRadioButtonGroup = fsm.getObject("eduTypeRadioButtonGroup");
      var             groupTypeBox = fsm.getObject("groupTypeBox"); 

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
               response.data.code == 2 ||
               response.data.code == 3 ||
               response.data.code == 4 ||
               response.data.code == 5 )
      {
        // Special error
        warnString = "";

        switch(response.data.code)
        {
        case 1:
          warnString = this.tr("A group exists with this name already"); 
          break;

        case 2:
          warnString = this.tr("Group does not exist");
          break;

        case 3:
          warnString = this.tr("Select users from the wait list to allow membership. ");
          break;

        case 4:
          warnString = this.tr("No waiting users");
          break; 

        case 5:
          warnString = this.tr("You do not own this group");
          break;

        default:
          warnString = this.tr("Unknown error relating to group management"); 
          break;
        }  

        dialog.Dialog.warning(warnString);
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

            // Select type/subtype 
            var children = groupTypeBox.getChildren(); 
            for(var i = 0; i < children.length; i++)
            {
              if(children[i].getLabel() == group.type)
              {
                groupTypeBox.setSelection([children[i]]);
                break; 
              }
            }          

            // If there is a subtype selec it
            if(group.subType)
            {
              children = eduTypeRadioButtonGroup.getChildren(); 
              for(i = 0; i < children.length; i++)
              {
                if(children[i].getLabel() == group.subType)
                {
                  eduTypeRadioButtonGroup.setSelection([children[i]]);
                  break; 
                }
              }                
            }

            // Convert user lists into data arrays
            userMemberDataArray = new qx.data.Array(group.users);
            userWaitList = new qx.data.Array(group.joiningUsers);
            userRequestList = new qx.data.Array(group.requestedUsers); 

            // Populate lists 
            this.userController.setModel(userMemberDataArray); 
            this.waitListController.setModel(userWaitList);
            this.requestListController.setModel(userRequestList); 
          }, this);


        // If the currently selected group has an educational type
        // enable the radio buttons, else disable
        if( groupTypeBox.getSelection()[0].getLabel() 
          ==  aiagallery.dbif.Constants.GroupTypes.Educational)
        {
          eduTypeRadioButtonGroup.setEnabled(true);
        }
        else 
        {
          eduTypeRadioButtonGroup.setEnabled(false); 
        }
      
        // Start listening for changes on name list
        groupNameList.addListener("changeSelection", 
          fsm.eventListener, this.fsm);
 
        break; 
      
      // Manage Groups
      case "getOwnedGroups":
        // Populate list of groups owned by this user

        // Select the top one

        // Populate userList of that selected group

        // Populate both textfields with info about this group

        break;

      case "deleteGroup":
        result = response.data.result;

        // Remove group from list 
        // by removing currently selected label
        groupNameList.remove(groupNameList.getSelection()[0]); 

        // If there are no remaning groups left clear fields/lists
        if (groupNameList.getSelection().length == 0)
        {
          // Clear our name field 
          groupNameField.setValue("");

          // Clear out requested user field
          groupUsersField.setValue("");

          // clear description field
          groupDescriptionField.setValue("");

          // Clear out user lists    
          groupUsersList.removeAll(); 
          groupWaitList.removeAll();
          groupRequestList.removeAll();  

          // Reset type info 
          // Select the first child
          var children = groupTypeBox.getChildren(); 
          groupTypeBox.setSelection([children[0]]); 
          eduTypeRadioButtonGroup.setEnabled(false); 
        }
      
        break;

      case "addOrEditGroup":
        // If the group did not exist add it to the list
        // if it did, do nothing  
        result = response.data.result;
        
        // Is this a new group or an existing one
        var groupLabels = groupNameList.getChildren().map(
          function(listItem)
          {
            return listItem.getLabel();
          }); 

        if (!qx.lang.Array.contains(groupLabels, result.name))
        {
          // New group add to groupList
          var name = new qx.ui.form.ListItem(result.name);   
          groupNameList.add(name);

          // Select this new group
          groupNameList.setSelection([name]);
        } 

        // Any of these lists may have been updated or 
        // it could be the first time we are updating them
        // Convert user lists into data arrays
        userMemberDataArray = new qx.data.Array(result.users);
        userWaitList = new qx.data.Array(result.joiningUsers);
        userRequestList = new qx.data.Array(result.requestedUsers); 

        // Populate lists 
        this.userController.setModel(userMemberDataArray); 
        this.waitListController.setModel(userWaitList);
        this.requestListController.setModel(userRequestList); 

        if (result.update)
        {
          // Update so change description field if we need to
          groupDescriptionField.setValue(result.description);
        }
        else 
        {
          // New 
          groupDescriptionField.setValue("");   
        }
            
        // If the currently selected group has an educational type
        // enable the radio buttons, else disable
        if( groupTypeBox.getSelection()[0].getLabel() 
          ==  aiagallery.dbif.Constants.GroupTypes.Educational)
        {
          eduTypeRadioButtonGroup.setEnabled(true);
        }
        else 
        {
          eduTypeRadioButtonGroup.setEnabled(false); 
        }

        break;

      case "getGroup":
        // Change selection event 
        result = response.data.result;

        // Update description
        groupDescriptionField.setValue(result.description);

        // Convert user lists into data arrays
        userMemberDataArray = new qx.data.Array(result.users);
        userWaitList = new qx.data.Array(result.joiningUsers);
        userRequestList = new qx.data.Array(result.requestedUsers); 

        // Populate lists 
        this.userController.setModel(userMemberDataArray); 
        this.waitListController.setModel(userWaitList);
        this.requestListController.setModel(userRequestList); 

        // Update type
        var children = groupTypeBox.getChildren(); 
        for(var i = 0; i < children.length; i++)
        {
          if(children[i].getLabel() == result.type)
          {
            groupTypeBox.setSelection([children[i]]);
            break; 
          }
        }          

        // If there is a subtype select it
        if(result.subType)
        {
          children = eduTypeRadioButtonGroup.getChildren(); 
          for(i = 0; i < children.length; i++)
          {
            if(children[i].getLabel() == result.subType)
            {
              eduTypeRadioButtonGroup.setSelection([children[i]]);
              break; 
            }
          }                
        }

        // If the currently selected group has an educational type
        // enable the radio buttons, else disable
        if( groupTypeBox.getSelection()[0].getLabel() 
          ==  aiagallery.dbif.Constants.GroupTypes.Educational)
        {
          eduTypeRadioButtonGroup.setEnabled(true);
        }
        else 
        {
          eduTypeRadioButtonGroup.setEnabled(false); 
        }

        break;

      case "removeGroupUsers":
        // Recieve a map of the three user lists
        result = response.data.result;

        // Convert user lists into data arrays
        if (result.users != null)
        {
          userMemberDataArray = new qx.data.Array(result.users);
          this.userController.setModel(userMemberDataArray); 
        }

        if (result.joiningUsers != null)
        {
          userWaitList = new qx.data.Array(result.joiningUsers);
          this.waitListController.setModel(userWaitList);
        }

        if (result.requestedUsers != null)
        {
          userRequestList = new qx.data.Array(result.requestedUsers); 
          this.requestListController.setModel(userRequestList); 
        }

        break;

      case "approveGroupUser":
      case "approveAllGroupUser":
        result = response.data.result;

        // Clean up lists
        // Convert user lists into data arrays
        userMemberDataArray = new qx.data.Array(result.users);
        userWaitList = new qx.data.Array(result.joiningUsers);

        // Populate lists 
        this.userController.setModel(userMemberDataArray); 
        this.waitListController.setModel(userWaitList);
        break;

      case "requestUsers":
        result = response.data.result;

        // Convert user lists into data arrays
        userMemberDataArray = new qx.data.Array(result.users);
        userWaitList = new qx.data.Array(result.joiningUsers);
        userRequestList = new qx.data.Array(result.requestedUsers); 

        // Populate lists 
        this.userController.setModel(userMemberDataArray); 
        this.waitListController.setModel(userWaitList);
        this.requestListController.setModel(userRequestList); 

        // Clear out requestUser text area
        groupUsersField.setValue(""); 

        // Popup with any bad names we found
        if(result.badUsers.length != 0)
        {
          warnString = "The following names/emails were not found: "; 
          dialog.Dialog.warning(warnString + result.badUsers);
        }

        break; 

      case "groupSearch":
        result = response.data.result;

        // Clear search field before populating it
        this.groupContainer.removeAll();
 
        // Create gui group obj for each found group
        result.forEach(
          function(group)
          {
            var   groupGui; 
            var   label; 
            var   layout;
           
            // Main group layout
            groupGui = new qx.ui.container.Composite(new qx.ui.layout.VBox());

            // Title and Author layout
            layout = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            label = new qx.ui.basic.Label(group.name);
            layout.add(label);

            label = new qx.ui.basic.Label(group.owner);
            layout.add(label); 

            // Add to main layout
            groupGui.add(layout);

            // Add description
            label = new qx.ui.basic.Label(group.description);
            groupGui.add(label);

            // Add category info
            layout = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            label = new qx.ui.basic.Label(group.type);
            layout.add(label); 

            // Space out category types
            layout.add(new qx.ui.core.Spacer(10));

            label = new qx.ui.basic.Label(group.subType);
            layout.add(label); 

            // Add to main layout
            groupGui.add(layout);

            // Update the container with all the found groups
            this.groupContainer.add(groupGui);

            // Space out any results that come next
            this.groupContainer.add(new qx.ui.core.Spacer(0, 20)); 
          }

        ,this);



        break; 

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
