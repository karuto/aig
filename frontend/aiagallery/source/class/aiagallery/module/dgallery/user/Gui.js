/**
 * Copyright (c) 2012 Derrell Lipman
 *                    Paul Geromini 
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the user's own details page. and
 * The place to manage studios 
 */
qx.Class.define("aiagallery.module.dgallery.user.Gui",
{
  type : "singleton",
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
      var             pageArray; 

      this._fsm = fsm; 

      outerCanvas.setLayout(new qx.ui.layout.VBox());   
      var scrollContainer = new qx.ui.container.Scroll();       
      outerCanvas.add(scrollContainer, { flex : 1 });

      // Create a layout for this page
      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox(30));
      canvas.setLayout(new qx.ui.layout.VBox());   

      // Put layout in a scroller
      scrollContainer.add(canvas, {flex : 1});       

      // Create two seperate pages with in this one page
      // do so with the radioview widget
      this.__radioView = 
        new aiagallery.widget.radioview.RadioView(this.tr("User: "));

      canvas.add(this.__radioView);

      // Create the pages
      pageArray = [
        {
          field  : "__containerProfile",
          label  : this.tr("Manage Profile"),
          custom : this._buildProfile
        }
      ];

      // Create the pages
      pageArray.push (
        {
          field  : "__containerStudios",
          label  : this.tr("Manage Studios"),
          custom : this._buildStudios
        }
      );

      pageArray.forEach(
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

      // When the radioview selection changes, if it changes to 
      // the manage groups tab then we need to pull group info
      this.__radioView.addListener(
        "changeSelection",
        function(e)
        {       
          // Only run this when we are switching to the studio management
          if (e.getData()[0].getLabel() == "Manage Studios")
          {
            this._fsm.fireImmediateEvent(
              "initialStudioLoad", this);
          }
  
        },
        this);
    },

    /**
     * Create the static content in the manageProfile page
     * 
     * @param container {qx.ui.core.Widget}
     *   The container in which the content should be placed. 
     */
    _buildProfile : function(container)
    {
      // System helpers
      var             o;

      // Help Popups
      var             helpString; 
      var             emailHelpPopup;
      var             usernameHelpPopup;
      var             dobHelpPopup; 
      var             locationHelpPopup;
      var             orgHelpPopup;
      var             locHelpPopup;
      var             urlHelpPopup; 
      var             bioHelpPopup;
      var             userOptionHelpPopup;

      // Layouts
      var             layout;
      var             hBoxUsername;
      var             vBoxText;
      var             vBoxBio;
      var             vBoxEmail; 
      var             hBoxEmail;
      var             hBox; 
      var             vBoxBtn;
      var             hBoxDobLabel;
      var             hBoxDob;
      var             hBoxLocation; 
      var             hBoxOrganization;
      var             hBoxUrl; 
      var             hBoxBio;
      var             hBoxOptions; 
      var             vBoxOptions;
      var             vBoxOptionLike;
      var             vBoxOptionDownload;
      var             vBoxOptionComment; 

      // GUI objects 
      var             label;
      var             submitBtn;

      // Create a vertical layout just for the textfields and labels.
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(15);      
      vBoxText = new qx.ui.container.Composite(layout);
      
      // variable to store old username
      this.oldName = ""; 

      // Create a hbox layout for the username label and help icon
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(15);      
      hBoxUsername = new qx.ui.container.Composite(layout);

      // Create a label for the username textfield 
      label = new qx.ui.basic.Label(this.tr("Username:"));
      label.setFont("bold"); 
      hBoxUsername.add(label);

      // Add imagebutton
      o = new qx.ui.basic.Image("aiagallery/question_blue.png");
      o.set(
        {
          focusable : true
        });
      this.usernameHelpPrompt = o;

      // define the popup we need
      usernameHelpPopup = new qx.ui.popup.Popup(
        new qx.ui.layout.Canvas()).set({
          backgroundColor: "#FFFAD3",
          padding: [2, 4],
          offset : 3,
          offsetBottom : 20
      });

      // Add a label widget to the popup
      // Line overflow to avoid compile warning
      usernameHelpPopup.add(new qx.ui.basic.Label().set({ 
        value: this.tr("Valid usernames must be between 2 and 30 characters. It must not be admin, administrator, guest, superuser, or root."),
        rich : true,
        width: 300 
      }));

      // bind onClick event for the popup
      this.usernameHelpPrompt.addListener("click", function(e)
      {
          usernameHelpPopup.placeToMouse(e);
          usernameHelpPopup.show();
      }, this);

      // Add to layouts
      hBoxUsername.add(this.usernameHelpPrompt);
      vBoxText.add(hBoxUsername);

      // Create textfield for entering in a username
      // Only allow certain values 
      this.userNameField = new qx.ui.form.TextField;
      this.userNameField.set(
      {
        maxWidth     : 200,
        maxLength    : aiagallery.dbif.Constants.FieldLength.User,
        filter       : /[a-zA-Z0-9 _-]/
      });
      vBoxText.add(this.userNameField);      
   
      // Create friendly name to get username field from the FSM
      this._fsm.addObject("userNameField", 
         this.userNameField,"main.fsmUtils.disable_during_rpc");

      // Create a hbox layout for the username label and help icon
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(15);      
      hBoxDobLabel = new qx.ui.container.Composite(layout);

      // DOB label 
      label = new qx.ui.basic.Label(this.tr("Date of Birth (Not Displayed):"));
      label.setFont("bold"); 
      hBoxDobLabel.add(label);

      // Add imagebutton
      o = new qx.ui.basic.Image("aiagallery/question_blue.png");
      o.set(
        {
          focusable : true
        });
      this.dobHelpPrompt = o;

      // define the popup we need
      dobHelpPopup = new qx.ui.popup.Popup(
        new qx.ui.layout.Canvas()).set({
          backgroundColor: "#FFFAD3",
          padding: [2, 4],
          offset : 3,
          offsetBottom : 20
      });

      // add a label widget to the popup
      dobHelpPopup.add(new qx.ui.basic.Label().set({ 
        value: this.tr("The date of birth info is for site statistics only."
               + " It is not displayed."),
        rich : true,
        width: 300 
      }));

      // bind onClick event for the popup
      this.dobHelpPrompt.addListener("click", function(e)
      {
          dobHelpPopup.placeToMouse(e);
          dobHelpPopup.show();
      }, this);

      hBoxDobLabel.add(this.dobHelpPrompt);
      vBoxText.add(hBoxDobLabel); 

      // Create a horizantal layout just for the DOB dropdowns
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(5);      
      hBoxDob = new qx.ui.container.Composite(layout);

      // Create two DOB drop down menus, one for month and 
      // the other for year
      this.dobMonthSBox = new qx.ui.form.SelectBox();
 
      // Default Value 
      this.dobMonthSBox.add(new qx.ui.form.ListItem(this.tr("Month")));

      this.dobMonthSBox.add(new qx.ui.form.ListItem("January"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("February"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("March"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("April"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("May"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("June"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("July"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("August"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("Spetember"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("October"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("November"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("December"));

      // Create friendly name to get username field from the FSM
      this._fsm.addObject("dobMonthSBox", 
         this.dobMonthSBox,"main.fsmUtils.disable_during_rpc");

      hBoxDob.add(this.dobMonthSBox);

      // DOB year list
      this.dobYearSBox = new qx.ui.form.SelectBox();
 
      // Add Years to the box 
      // Default value
      this.dobYearSBox.add(new qx.ui.form.ListItem(this.tr("Year")));

      var todaysDate = new Date();
      for(var i = todaysDate.getFullYear(); i > 1900; i--)
      {
        this.dobYearSBox.add(new qx.ui.form.ListItem(String(i)));
      }

      // Create friendly name to get username field from the FSM
      this._fsm.addObject("dobYearSBox", 
         this.dobYearSBox,"main.fsmUtils.disable_during_rpc");

      hBoxDob.add(this.dobYearSBox);
      vBoxText.add(hBoxDob); 

      // Layout for label and help icon
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxEmail = new qx.ui.container.Composite(layout);

      // Create a label for describing the email field
      label = new qx.ui.basic.Label(this.tr("Email:"));
      label.setFont("bold"); 
      hBoxEmail.add(label);

      // Add imagebutton
      o = new qx.ui.basic.Image("aiagallery/question_blue.png");
      o.set(
        {
          focusable : true
        });
      this.emailHelpPrompt = o;

      // define the popup we need
      emailHelpPopup = new qx.ui.popup.Popup(
        new qx.ui.layout.Canvas()).set({
          backgroundColor: "#FFFAD3",
          padding: [2, 4],
          offset : 3,
          offsetBottom : 20
      });

      // Add a label widget to the popup
      emailHelpPopup.add(new qx.ui.basic.Label().set({ 
        value: this.tr("Check this box to show your "
                       + "email on your public profile."),
        rich : true,
        width: 300 
      }));

      // bind onClick event for the popup
      this.emailHelpPrompt.addListener("click", function(e)
      {
          emailHelpPopup.placeToMouse(e);
          emailHelpPopup.show();
      }, this);

      hBoxEmail.add(this.emailHelpPrompt);
      vBoxText.add(hBoxEmail); 
 
      // Create a vertical layout for the email and checkbox 
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(15);      
      vBoxEmail = new qx.ui.container.Composite(layout);
     
      // Create textfield for entering in a email
      //this.emailField = new qx.ui.form.TextField;
      this.emailField = new qx.ui.basic.Label(""); 
      this.emailField.set(
      {
        maxWidth     : 200
      });
      vBoxEmail.add(this.emailField);      
   
      // Do not let users edit this field for now
      //this.emailField.setReadOnly(true); 

      // Create friendly name to get this option from the FSM
      this._fsm.addObject("emailField", 
         this.emailField,"main.fsmUtils.disable_during_rpc");

      // Checkbox to show or not show email
      // by deafult this is unchecked 
      this.showEmailCheck = 
        new qx.ui.form.CheckBox(this.tr("Display Email on Public Profile"));

      // Create friendly name to get username field from the FSM
      this._fsm.addObject("showEmailCheck", 
         this.showEmailCheck,"main.fsmUtils.disable_during_rpc");

      vBoxEmail.add(this.showEmailCheck); 
      vBoxText.add(vBoxEmail); 

      // Layout for the location bar
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxLocation = new qx.ui.container.Composite(layout);

      // Create a label for describing the location field 
      label = new qx.ui.basic.Label(this.tr("Location:"));
      label.setFont("bold"); 
      hBoxLocation.add(label);

      // Add imagebutton
      o = new qx.ui.basic.Image("aiagallery/question_blue.png");
      o.set(
        {
          focusable : true
        });
      this.locationHelpPrompt = o;

      // define the popup we need
      locationHelpPopup = new qx.ui.popup.Popup(
        new qx.ui.layout.Canvas()).set({
          backgroundColor: "#FFFAD3",
          padding: [2, 4],
          offset : 3,
          offsetBottom : 20
      });

      // add a label widget to the popup
      locationHelpPopup.add(new qx.ui.basic.Label().set({ 
        value: this.tr("Enter where you are. It could be a state, "
                       + "a country, or somewhere else."),
        rich : true,
        width: 300 
      }));

      // bind onClick event for the popup
      this.locationHelpPrompt.addListener("click", function(e)
      {
          locationHelpPopup.placeToMouse(e);
          locationHelpPopup.show();
      }, this);

      hBoxLocation.add(this.locationHelpPrompt); 
      vBoxText.add(hBoxLocation);       

      // Create textfield for entering in a location
      this.locationField = new qx.ui.form.TextField;
      this.locationField.set(
      {
        maxLength    : aiagallery.dbif.Constants.FieldLength.User,
        maxWidth     : 200
      });
      vBoxText.add(this.locationField);  
            
      // Create friendly name to get location field from the FSM
      this._fsm.addObject("locationField", 
         this.locationField,"main.fsmUtils.disable_during_rpc");

      // Layout for the organization bar
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxOrganization = new qx.ui.container.Composite(layout);

      // Create a label for describing the organization field 
      label = new qx.ui.basic.Label(this.tr("Organization:"));
      label.setFont("bold");
      hBoxOrganization.add(label); 

      // Add imagebutton
      o = new qx.ui.basic.Image("aiagallery/question_blue.png");
      o.set(
        {
          focusable : true
        });
      this.orgHelpPrompt = o;

      // define the popup we need
      orgHelpPopup = new qx.ui.popup.Popup(
        new qx.ui.layout.Canvas()).set({
          backgroundColor: "#FFFAD3",
          padding: [2, 4],
          offset : 3,
          offsetBottom : 20
      });

      // add a label widget to the popup
      // line overflow to avoid compile warning
      orgHelpPopup.add(new qx.ui.basic.Label().set({ 
        value: this.tr("Enter the organization you are affiliated with if you have one. It could be a school, or a company, or something else."),
        rich : true,
        width: 300 
      }));

      // bind onClick event for the popup
      this.orgHelpPrompt.addListener("click", function(e)
      {
          orgHelpPopup.placeToMouse(e);
          orgHelpPopup.show();
      }, this);

      hBoxOrganization.add(this.orgHelpPrompt);
      vBoxText.add(hBoxOrganization); 
      
      // Create textfield for entering in an organization
      this.orgField = new qx.ui.form.TextField;
      this.orgField.set(
      {
        maxLength    : aiagallery.dbif.Constants.FieldLength.User,
        maxWidth     : 200
      });
      vBoxText.add(this.orgField);      
   
      // Create friendly name to get organization field from the FSM
      this._fsm.addObject("orgField", 
         this.orgField,"main.fsmUtils.disable_during_rpc");

      // Layout for the url label and help icon
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxUrl = new qx.ui.container.Composite(layout);

      // Create a label for describing the URL field 
      label = new qx.ui.basic.Label(this.tr("URL:"));
      label.setFont("bold"); 
      hBoxUrl.add(label);
      
      // Add imagebutton
      o = new qx.ui.basic.Image("aiagallery/question_blue.png");
      o.set(
        {
          focusable : true
        });
      this.urlHelpPrompt = o;

      // define the popup we need
      urlHelpPopup = new qx.ui.popup.Popup(
        new qx.ui.layout.Canvas()).set({
          backgroundColor: "#FFFAD3",
          padding: [2, 4],
          offset : 3,
          offsetBottom : 20
      });

      // add a label widget to the popup
      urlHelpPopup.add(new qx.ui.basic.Label().set({ 
        value: this.tr("Enter your site url if you have one."),
        rich : true,
        width: 300 
      }));

      // bind onClick event for the popup
      this.urlHelpPrompt.addListener("click", function(e)
      {
          urlHelpPopup.placeToMouse(e);
          urlHelpPopup.show();
      }, this);

      hBoxUrl.add(this.urlHelpPrompt);
      vBoxText.add(hBoxUrl); 

      // Create textfield for entering in a url
      this.urlField = new qx.ui.form.TextField;
      this.urlField.set(
      {
        maxLength    : aiagallery.dbif.Constants.FieldLength.User,
        width     : 300
      });
      vBoxText.add(this.urlField);      
   
      // Create friendly name to get url field from the FSM
      this._fsm.addObject("urlField", 
         this.urlField,"main.fsmUtils.disable_during_rpc");

      // Main Layout for bio box
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBio = new qx.ui.container.Composite(layout);

      // Layout for bio box label and help icon
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxBio = new qx.ui.container.Composite(layout);

      // Create a label for describing the bio text area
      label = new qx.ui.basic.Label(this.tr("Describe Yourself:"));
      label.setFont("bold"); 
      hBoxBio.add(label); 

      // Add imagebutton
      o = new qx.ui.basic.Image("aiagallery/question_blue.png");
      o.set(
        {
          focusable : true
        });
      this.bioHelpPrompt = o;

      // define the popup we need
      bioHelpPopup = new qx.ui.popup.Popup(
        new qx.ui.layout.Canvas()).set({
          backgroundColor: "#FFFAD3",
          padding: [2, 4],
          offset : 3,
          offsetBottom : 20
      });

      // Add a label widget to the popup
      // Line overflow to avoid compile warning
      bioHelpPopup.add(new qx.ui.basic.Label().set({ 
        value: this.tr("Tell us about yourself, the kind of apps you make, why you make apps, and anything else that floats your fancy."),
        rich : true,
        width: 300 
      }));

      // bind onClick event for the popup
      this.bioHelpPrompt.addListener("click", function(e)
      {
          bioHelpPopup.placeToMouse(e);
          bioHelpPopup.show();
      }, this);

      hBoxBio.add(this.bioHelpPrompt);

      // Add to main bio layout 
      vBoxBio.add(hBoxBio);

      // Create textarea for entering in bio
      this.bioTextArea = new qx.ui.form.TextArea;
      this.bioTextArea.set(
      {
        width        : 300,
        height       : 400,
        maxLength    : aiagallery.dbif.Constants.FieldLength.Bio,
        placeholder  : this.tr("Tell people about yourself")
      });
 
      // Update character count as text is entered
      this.bioTextArea.addListener("input", 
        function(e) { 
          var curLen = this.bioTextArea.getValue().length;
          var newLen = 
            Math.abs(curLen - aiagallery.dbif.Constants.FieldLength.Bio); 
          this.bioWarningLabel.setValue(newLen.toString() 
            + this.tr(" Characters left")); 
        }, this); 

      vBoxBio.add(this.bioTextArea);

      // Set friendly name so we can get the text area value later
      this._fsm.addObject("bioTextArea", 
                    this.bioTextArea,
                    "main.fsmUtils.disable_during_rpc");

      // Warning about character limit
      this.bioWarningLabel = 
        new qx.ui.basic.Label(this.tr("500 Character Limit"));
      vBoxBio.add(this.bioWarningLabel);

      // Button layout
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBtn = new qx.ui.container.Composite(layout);

      // Create a submit button
      this.submitBtn = 
        new qx.ui.form.Button(this.tr("Save Changes"));
      this.submitBtn.set(
      {
        maxHeight    : 24,
        maxWidth     : 150
      });
      vBoxBtn.add(new qx.ui.core.Spacer(25)); 
      vBoxBtn.add(this.submitBtn);
      this.submitBtn.addListener("execute", this._fsm.eventListener, this._fsm);

      // We'll be receiving events on the object so save its friendly name
      this._fsm.addObject("saveBtn", 
         this.submitBtn, "main.fsmUtils.disable_during_rpc");

      // Disable button on startup since no changes will have been made
      //this.submitBtn.setEnabled(false);

      // Create a main layout to list options for a user
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxOptions = new qx.ui.container.Composite(layout);    

      // Create a layout to list options for a user
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxOptions = new qx.ui.container.Composite(layout);    

      // Create a label for describing the options section
      label = new qx.ui.basic.Label(this.tr("User Options:"));
      label.setFont("bold"); 
      hBoxOptions.add(label); 

      // Add imagebutton
      o = new qx.ui.basic.Image("aiagallery/question_blue.png");
      o.set(
        {
          focusable : true
        });
      this.userOptionHelpPrompt = o;

      // define the popup we need
      userOptionHelpPopup = new qx.ui.popup.Popup(
        new qx.ui.layout.Canvas()).set({
          backgroundColor: "#FFFAD3",
          padding: [2, 4],
          offset : 3,
          offsetBottom : 20
      });

      // add a label widget to the popup
      userOptionHelpPopup.add(new qx.ui.basic.Label().set({ 
        value: this.tr("Options for sending emails to the email address"
                       + " you logged in with."),
        rich : true,
        width: 300 
      }));

      // bind onClick event for the popup
      this.userOptionHelpPrompt.addListener("click", function(e)
      {
          userOptionHelpPopup.placeToMouse(e);
          userOptionHelpPopup.show();
      }, this); 

      hBoxOptions.add(this.userOptionHelpPrompt);

      // Add to main layout
      vBoxOptions.add(hBoxOptions); 

      label = new qx.ui.basic.Label(this.tr("Notify me by email if:"));
      vBoxOptions.add(label);       

      // Layout to store both the checkbox and frequency dropdown
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(15);      
      vBoxOptionLike = new qx.ui.container.Composite(layout);

      // Checkbox to get updates if an app of theirs is liked
      // by deafult this is unchecked 
      this.likedAppCheck = 
        new qx.ui.form.CheckBox(this.tr("Someone likes one of my apps"));

      // Create friendly name to get this option from FSM
      this._fsm.addObject("likedAppCheck", 
         this.likedAppCheck,"main.fsmUtils.disable_during_rpc");

      // Set Frequency
      this.likedAppUpdateFrequency = new qx.ui.form.SelectBox();
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(this.tr("Every...")));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(1)));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(5)));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(10)));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(25)));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(100))); 

      // Create friendly name to get the frequency from FSM
      this._fsm.addObject("likedAppUpdateFrequency", 
         this.likedAppUpdateFrequency,"main.fsmUtils.disable_during_rpc");

      // Add to layout
      vBoxOptionLike.add(this.likedAppCheck);
      // Turn of frequency for now 
      //vBoxOptionLike.add(this.likedAppUpdateFrequency);
      vBoxOptions.add(vBoxOptionLike); 

      // Layout to store both the checkbox and frequency dropdown
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(15);      
      vBoxOptionComment = new qx.ui.container.Composite(layout);

      // Checkbox to get updates if an app of theirs is commented on
      // by deafult this is unchecked 
      this.commentAppCheck = 
        new qx.ui.form.CheckBox(this.tr("Someone comments on one of my apps"));

      // Create friendly name to get this option from FSM
      this._fsm.addObject("commentAppCheck", 
         this.commentAppCheck,"main.fsmUtils.disable_during_rpc");

      // Set Frequency
      this.commentAppUpdateFrequency = new qx.ui.form.SelectBox();
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(this.tr("Every...")));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(1)));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(5)));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(10)));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(25)));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(100))); 

      // Create friendly name to get the frequency from FSM
      this._fsm.addObject("commentAppUpdateFrequency", 
         this.commentAppUpdateFrequency,"main.fsmUtils.disable_during_rpc");

      // Add to layout
      vBoxOptionComment.add(this.commentAppCheck);
      // Turn of frequency for now
      //vBoxOptionComment.add(this.commentAppUpdateFrequency);
      vBoxOptions.add(vBoxOptionComment); 

      // Layout to store both the checkbox and frequency dropdown
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(15);      
      vBoxOptionDownload = new qx.ui.container.Composite(layout);

      // Checkbox to get updates if an app of theirs is downloaded on
      // by deafult this is unchecked 
      this.downloadAppCheck = 
        new qx.ui.form.CheckBox(this.tr("Someone downloads one of my apps"));

      // Create friendly name to get this option from FSM
      this._fsm.addObject("downloadAppCheck", 
         this.downloadAppCheck,"main.fsmUtils.disable_during_rpc");

      // Set Frequency
      this.downloadAppUpdateFrequency = new qx.ui.form.SelectBox();
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(this.tr("Every...")));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(1)));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(5)));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(10)));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(25)));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(100)));

      // Create friendly name to get the frequency from FSM
      this._fsm.addObject("downloadAppUpdateFrequency", 
         this.downloadAppUpdateFrequency,"main.fsmUtils.disable_during_rpc");

      // Add to layout
      vBoxOptionDownload.add(this.downloadAppCheck);
      // Turn of frequency for now
      //vBoxOptionDownload.add(this.downloadAppUpdateFrequency);
      vBoxOptions.add(vBoxOptionDownload); 

      // Overall layout
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBox = new qx.ui.container.Composite(layout);

      // Add to hBox text field objects
      hBox.add(vBoxText);

      // Give some flex space
      hBox.add(new qx.ui.core.Spacer(25)); 

      // Add hBox bio field to hBox
      hBox.add(vBoxBio);

      // Give some flex space
      hBox.add(new qx.ui.core.Spacer(25)); 

      // Add options layout to overall layout
      hBox.add(vBoxOptions); 

      // Add to main canvas
      container.add(hBox);

      // Add Btn layout
      container.add(vBoxBtn); 

    },

    /**
     * Create the static content in the manage studios page
     * 
     * @param container {qx.ui.core.Widget}
     *   The container in which the content should be placed. 
     */
    _buildStudios : function(container)
    {
      // Gui objects
      var             newBtn; 
      var             saveStudioBtn;
      var             deleteBtn;
      var             requestBtn;
      var             removeBtnMember;
      var             removeBtnWaitList;
      var             removeBtnRequest; 
      var             approveAllBtn; 
      var             approveUsersBtn;    
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
      var             userJoinRadioButtonGroup;
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
      saveStudioBtn = new qx.ui.form.Button(this.tr("Save"));
      saveStudioBtn.set(
      {
        maxHeight : 24,
        width     : 100
      });
      vBoxBtns.add(saveStudioBtn);
      saveStudioBtn.addListener("execute", this._fsm.eventListener, this._fsm);

      // We'll be receiving events on the object so save its friendly name
      this._fsm.addObject("saveStudioBtn", 
         saveStudioBtn, "main.fsmUtils.disable_during_rpc");

      // Disable button on startup 
      saveStudioBtn.setEnabled(false); 

      // Create a Delete button
      deleteBtn = new qx.ui.form.Button(this.tr("Delete"));
      deleteBtn.set(
      {
        maxHeight : 24,
        width     : 100,
        enabled   : false
      });
      vBoxBtns.add(deleteBtn);
      deleteBtn.addListener("execute", this._fsm.eventListener, this._fsm);

      // We'll be receiving events on the object so save its friendly name
      this._fsm.addObject("deleteBtn", 
         deleteBtn, "main.fsmUtils.disable_during_rpc");            

      // Create a vertical layout just for the two textfields and labels.
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxText = new qx.ui.container.Composite(layout);

      // Create a label for describing the textfields 
      label = new qx.ui.basic.Label(this.tr("Studio Name:"));
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
        saveStudioBtn.setEnabled(value.length > 0);
        
      }, this); 

      // Create friendly name to get it from the FSM
      this._fsm.addObject("groupNameField", 
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
      this._fsm.addObject("groupDescriptionField", 
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
      this._fsm.addObject("eduTypeRadioButtonGroup", 
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
      this._fsm.addObject("groupTypeBox", 
        groupTypeBox, "main.fsmUtils.disable_during_rpc");   

      // Add to text layout 
      vBoxText.add(groupTypeBox); 
      vBoxText.add(eduTypeRadioButtonGroup);

      // Create a set of finder-style multi-level browsing groups
      // This will show the groups a user owns and users in the group
      ownedGroupBox = new qx.ui.groupbox.GroupBox("Studio Management");
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

      label = new qx.ui.basic.Label(this.tr("Studio Name"));
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
        saveStudioBtn.setEnabled(bEnable);
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
      this._fsm.addObject("groupNameList", 
        groupNameList, "main.fsmUtils.disable_during_rpc");     

      // Reinit vbox to hold btns for user management 
      layout = new qx.ui.layout.VBox(10);  
      vBoxBtns = new qx.ui.container.Composite(layout);

      // Space the buttons down by one by adding a spacer
      vBoxBtns.add(new qx.ui.basic.Label()); 

      // Create a remove user button
      removeBtnMember = new qx.ui.form.Button(this.tr("Remove Members(s)"));
      removeBtnMember.set(
      {
        maxHeight : 30
      });
      vBoxBtns.add(removeBtnMember);
      removeBtnMember.addListener("execute", this._fsm.eventListener, this._fsm);

      // We'll be receiving events on the object so save its friendly name
      this._fsm.addObject("removeGroupUsersMember", 
         removeBtnMember, "main.fsmUtils.disable_during_rpc");

      // Radio buttons to allow owner to 
      // disable users from joining by themselves
      userJoinRadioButtonGroup = new qx.ui.form.RadioButtonGroup();

      userJoinRadioButtonGroup.addListener("changeSelection", 
          this._fsm.eventListener, this._fsm);

      translatedTxt = this.tr("Anyone may request to join");
      radioButton = new qx.ui.form.RadioButton(translatedTxt);
      radioButton
        .setUserData("enum", aiagallery.dbif.Constants.JoinType.Public);
      userJoinRadioButtonGroup.add(radioButton); 

      translatedTxt = this.tr("Invite-only");
      radioButton = new qx.ui.form.RadioButton(translatedTxt);
      radioButton
        .setUserData("enum", aiagallery.dbif.Constants.JoinType.Private);
      userJoinRadioButtonGroup.add(radioButton); 

      // Need to be able to access the radiobuttons on the fsm
      this._fsm.addObject("userJoinRadioButtonGroup", 
        userJoinRadioButtonGroup, "main.fsmUtils.disable_during_rpc");  

      vBoxBtns.add(userJoinRadioButtonGroup); 

      // Add button layout to layout
      userHBox.add(vBoxBtns);   

      // Track users who belong to the group
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      label = new qx.ui.basic.Label(this.tr("Members"));
      listLayout.add(label);

      groupUsersList = new qx.ui.form.List();
      groupUsersList.setWidth(150);
      groupUsersList.addListener("changeSelection", 
        function(e)
        {
          removeBtnMember.setEnabled(e.getData().length != 0);
        }
      );

      // Create friendly name to get it from the FSM
      this._fsm.addObject("groupUsersList", 
         groupUsersList,"main.fsmUtils.disable_during_rpc");

      // Allow user to select multiple items
      groupUsersList.setSelectionMode("multi");
      
      // Array to add users to
      userDataArray = new qx.data.Array(); 

      // Create controller to add users to groupUser list
      this.userController 
        = new qx.data.controller.List(userDataArray, groupUsersList); 
        
      this._fsm.addObject("groupUsers", 
        groupUsersList, "main.fsmUtils.disable_during_rpc");

      // Add to layout
      listLayout.add(groupUsersList);
      userHBox.add(listLayout); 

      // Reinit vbox to hold btns for wait list management 
      layout = new qx.ui.layout.VBox(10);  
      vBoxBtns = new qx.ui.container.Composite(layout);

      vBoxBtns.add(new qx.ui.core.Spacer(0, 20)); 

      // Create a remove user button
      removeBtnWaitList = new qx.ui.form.Button(this.tr("Remove Pending User(s)"));
      removeBtnWaitList.set(
      {
        maxHeight : 30
      });
      removeBtnWaitList.addListener("execute", this._fsm.eventListener, this._fsm);

      // We'll be receiving events on the object so save its friendly name
      this._fsm.addObject("removeGroupUsersWaitList", 
         removeBtnWaitList, "main.fsmUtils.disable_during_rpc");

      vBoxBtns.add(removeBtnWaitList); 

      // Button to approve a user from the wait list 
      approveUsersBtn = new qx.ui.form.Button(this.tr("Approve User(s)"));
      approveUsersBtn.set(
      {
        maxHeight : 24
      });
      vBoxBtns.add(approveUsersBtn);

      approveUsersBtn.addListener(
        "click",
        function(e)
        {
          // Fire immediate event
          this._fsm.fireImmediateEvent(
            "approveGroupUser", this, e.getTarget());
        }, this); 

      approveUsersBtn.addListener("execute", this._fsm.eventListener, this._fsm);

      // We'll be receiving events on the object so save its friendly name
      this._fsm.addObject("approveGroupUser", 
         approveUsersBtn, "main.fsmUtils.disable_during_rpc");

      // Button to approve a user from the wait list 
      approveAllBtn = new qx.ui.form.Button(this.tr("Approve All"));
      approveAllBtn.set(
      {
        maxHeight : 24
      });
      vBoxBtns.add(approveAllBtn);

      approveAllBtn.addListener("execute", this._fsm.eventListener, this._fsm);

      // We'll be receiving events on the object so save its friendly name
      this._fsm.addObject("approveAllGroupUser", 
         approveAllBtn, "main.fsmUtils.disable_during_rpc");

      // Add button layout to Hbox
      userHBox.add(vBoxBtns); 

      // Track users who are on the group waitList
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      label = new qx.ui.basic.Label(this.tr("Pending Joins"));
      listLayout.add(label);

      groupWaitList = new qx.ui.form.List();
      groupWaitList.setWidth(150);
      groupWaitList.addListener("changeSelection", 
        function(e)
        {
          var    bOn = e.getData().length != 0;

          approveUsersBtn.setEnabled(bOn);
          removeBtnWaitList.setEnabled(bOn);
        }
      );

      // Create friendly name to get it from the FSM
      this._fsm.addObject("groupWaitList", 
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
      userHBox.add(listLayout); 

      // Reinit vbox to hold btns for wait list management 
      layout = new qx.ui.layout.VBox(10);  
      vBoxBtns = new qx.ui.container.Composite(layout);
      vBoxBtns.add(new qx.ui.core.Spacer(0, 20)); 

      // Create a remove user button
      removeBtnRequest = new qx.ui.form.Button(this.tr("Remove Invite(s)"));
      removeBtnRequest.set(
      {
        maxHeight : 30
      });
      removeBtnRequest.addListener("execute", this._fsm.eventListener, this._fsm);

      // We'll be receiving events on the object so save its friendly name
      this._fsm.addObject("removeGroupUsersInvite", 
         removeBtnRequest, "main.fsmUtils.disable_during_rpc");

      vBoxBtns.add(removeBtnRequest); 
      userHBox.add(vBoxBtns); 

      // Track users who are on the group waitList
      listLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      label = new qx.ui.basic.Label(this.tr("Outstanding Invites"));
      listLayout.add(label);
      groupRequestList = new qx.ui.form.List();
      groupRequestList.setWidth(150);
      groupRequestList.addListener("changeSelection", 
        function(e)
        {
          // Only turn on if something is selected
          var    bOn = e.getData().length != 0;
          removeBtnRequest.setEnabled(bOn);
        }
      );

      // Create friendly name to get it from the FSM
      this._fsm.addObject("groupRequestList", 
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
      userHBox.add(listLayout); 
 
      // Layout to hold the request user section
      requestLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(10)); 

      // Create a request button
      requestBtn = new qx.ui.form.Button(this.tr("Invite User(s)"));
      requestBtn.set(
      {
        maxHeight : 24,
        width     : 100
      });
      requestLayout.add(requestBtn);
      requestBtn.addListener("execute", this._fsm.eventListener, this._fsm);

      // We'll be receiving events on the object so save its friendly name
      this._fsm.addObject("requestBtn", 
         requestBtn, "main.fsmUtils.disable_during_rpc");    

      // Hold label and text area
      layout =  new qx.ui.container.Composite(new qx.ui.layout.VBox(10));    

      // Create a label for describing the textfield
      label =  new qx.ui.basic.Label(this.tr("Invite the Following Users (seperate by comma):"));
      layout.add(label);
         
      // Create a textfield to request specific users
      groupUsersField = new qx.ui.form.TextArea;
      groupUsersField.set(
      {
        maxWidth     : 350,
        maxHeight    : 350,
        liveUpdate   : true 
        //maxLength    : aiagallery.dbif.Constants.FieldLength.Group
      });

      // Add textfield to layout
      layout.add(groupUsersField);
      requestLayout.add(layout);

      // Create friendly name to get it from the FSM
      this._fsm.addObject("groupUsersField", 
         groupUsersField,"main.fsmUtils.disable_during_rpc"); 

      // Turn on invite button only if something is in the field
      groupUsersField.addListener("changeValue", 
        function(e)
        {
          // Only turn on if something is selected
          var    bOn = e.getData().length != 0;
          requestBtn.setEnabled(bOn);
        }
      );


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
      var             warnString; 
      var             savedStr;
      var             whoAmI; 

      // Manage studio objects
      var             groupList; 

      // System objects
      var             userMemberDataArray;
      var             userRequestList;
      var             userWaitList;
      var             warnString; 
      var             joinType; 

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
      var             userJoinRadioButtonGroup = fsm.getObject("userJoinRadioButtonGroup");

      // Buttons from the gui to enable/disable
      var             requestBtn = fsm.getObject("requestBtn");
      var             removeBtnMember = fsm.getObject("removeGroupUsersMember");
      var             removeBtnWaitList = fsm.getObject("removeGroupUsersWaitList");
      var             removeBtnRequest = fsm.getObject("removeGroupUsersInvite");
      var             approveAllBtn = fsm.getObject("approveAllGroupUser");
      var             approveUsersBtn = fsm.getObject("approveGroupUser");


      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      // Errors with special codes will be handled specially 
      if (response.type == "failed" && (response.data.code == 1 ||
          response.data.code == 2 ||
          response.data.code == 3 ||
          response.data.code == 4 ||
          response.data.code == 5 ||
          response.data.code == 6))
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

        case 6:
          // Change back to original user name
          this.userNameField.setValue(this.oldName);

          //warnString = this.tr(response.data.message);
          warnString = response.data.message; 

          break; 

        default:
          warnString = this.tr("Unknown error relating to group management"); 
          break;
        }  

        dialog.Dialog.warning(warnString);
        return;
      }
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
      // PROFILE FSM REQUESTS

      // On appear populate fields with data if there is some
      case "appear":
          
          // Map of user profile data
          var userProfile = response.data.result;

          // If the user is anon return pop a warning
          if (userProfile.id == "")
          {
             warnString = this.tr("You must log in to edit your profile"); 
             dialog.Dialog.warning(warnString);

             break; 
          }

          // Populate fields with data from map
          this.userNameField.setValue(userProfile.displayName);
          this.oldName = userProfile.displayName; 

          this.emailField.setValue(userProfile.email);

          // These fields may be empty, do not display null if they are
          if (userProfile.location != null)
          {
            this.locationField.setValue(userProfile.location);        
          }
          
          if (userProfile.bio != null)
          {
            this.bioTextArea.setValue(userProfile.bio);

            // Set remaining amount of enterable characters if any
            // Limit is 500.
            var len = aiagallery.dbif.Constants.FieldLength.Bio
                       - parseInt(userProfile.bio.length); 
            this.bioWarningLabel.setValue(len.toString()
              + this.tr(" Characters left"));
          }

          if (userProfile.org != null)
          {
            this.orgField.setValue(userProfile.org); 
          }

          if (userProfile.url != null)
          {
            this.urlField.setValue(userProfile.url); 
          }

          // Only work with date if it has been set
          if (userProfile.birthMonth != null || userProfile.birthMonth == "") 
          {
                  
            // Set Selection for month and year
            var children = this.dobMonthSBox.getChildren();
            for(var i = 0; i < children.length; i++)
            {
              if(children[i].getLabel() == userProfile.birthMonth)
              {
                this.dobMonthSBox.setSelection([children[i]]);
                break; 
              }
            }

            if (userProfile.birthYear != 0)
            {
              children = this.dobYearSBox.getChildren();
              var date = new Date();
              date = date.getFullYear();
            
              var childToSelect = 
                parseInt(date) - parseInt(userProfile.birthYear); 
              this.dobYearSBox.setSelection([children[childToSelect]]);
            }
          }
   
          // This means show email box is checked 
          if (userProfile.showEmail == 1)
          {
            this.showEmailCheck.setValue(true); 
          }

          // Set user options
          // send email on app likes
          if(userProfile.updateOnAppLike == 1)
          {
            this.likedAppCheck.setValue(true);

            // Set selction on frequency
            var children = this.likedAppUpdateFrequency.getChildren();
            for(var i = 0; i < children.length; i++)
            {
              if(children[i].getLabel() == userProfile.updateOnAppLikeFrequency)
              {
                this.likedAppUpdateFrequency.setSelection([children[i]]);
                break; 
              }
            }
          }

          // send email on app comments
          if(userProfile.updateOnAppComment == 1)
          {
            this.commentAppCheck.setValue(true);

            // Set selction on frequency
            var children = this.commentAppUpdateFrequency.getChildren();
            for(var i = 0; i < children.length; i++)
            {
              if(children[i].getLabel() == userProfile.updateCommentFrequency)
              {
                this.commentAppUpdateFrequency.setSelection([children[i]]);
                break; 
              }
            }
          }

          // send email on app downloads
          if(userProfile.updateOnAppDownload == 1)
          {
            this.downloadAppCheck.setValue(true);

            // Set selction on frequency
            var children = this.downloadAppUpdateFrequency.getChildren();
            for(var i = 0; i < children.length; i++)
            {
              if(children[i].getLabel() == userProfile.updateOnAppDownloadFrequency)
              {
                this.downloadAppUpdateFrequency.setSelection([children[i]]);
                break; 
              }
            }
          }

          // All done
          break;

      case "editUserProfile":
        // User submited new profile info, disable submit button
        //this.submitBtn.setEnabled(false);

        // Check to see if name change was successful
        //if (response.data.result.message != null)
        if(false)
        {
          // Name change error 
          dialog.Dialog.warning(response.data.result.message); 
          break; 
        }

        // Popup dialog that info was saved
        savedStr = this.tr("New profile information saved."); 
        dialog.Dialog.alert(savedStr); 
 
        // If the username is changed, change it in the application header
        whoAmI = qx.core.Init.getApplication().getUserData("whoAmI");
        whoAmI.setDisplayName(this.userNameField.getValue().trim());
        whoAmI.setHasSetDisplayName(true);
        
        // change old username value
        this.oldName = this.userNameField.getValue().trim(); 

        break;

     // STUIDO FSM REQUESTS
     case "initialStudioLoad":
 
        // Ensure correct buttons are disabled 
        requestBtn.setEnabled(false);
        removeBtnMember.setEnabled(false);
        removeBtnWaitList.setEnabled(false);
        removeBtnRequest.setEnabled(false);
        approveAllBtn.setEnabled(false);
        approveUsersBtn.setEnabled(false);

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

            // If there is a subtype select it
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

            // Select join type
            children = userJoinRadioButtonGroup.getChildren();
            for (i = 0; i < children.length; i++)
            {
              if(children[i].getUserData("enum") == group.joinType)
              {
                userJoinRadioButtonGroup.setSelection([children[i]]);
                break;
              }
            } 

            
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
          fsm.eventListener, this._fsm);
 
        break;   

      // Manage Groups
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

        // Update the user join type
        children = userJoinRadioButtonGroup.getChildren();
        joinType = result.joinType;

        userJoinRadioButtonGroup.setSelection([children[joinType]]);

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
 
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
