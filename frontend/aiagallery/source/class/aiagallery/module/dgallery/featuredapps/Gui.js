/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the special contest page
 * 
 * NOTE: This page was cobbled together for a very temporary contest
 *       announcement. It was not designed to be maintainable, but
 *       to be made quickly. 
 */
qx.Class.define("aiagallery.module.dgallery.featuredapps.Gui",
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
      var             outerCanvas = module.canvas;
      var             canvas; 
      var             label;
      var             desc;
      var             fsPlaceCol1;
      var             fsPlaceCol2;
      var             fsPlaceCol3;
      var             secPlaceCol1;
      var             secPlaceCol2;
      var             secPlaceCol3;
      var             honPlaceCol1;
      var             honPlaceCol2;
      var             honPlaceCol3;
      var             font; 
      var             authorFont; 
      var             introLayout;
      var             introCanvas; 
      var             colLayout1; 
      var             colLayout2; 
      var             colLayout3; 
      var             comCol1;
      var             comCol2; 
      var             namesLayout; 

      
        // Create a large bold font
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.setSize(26);

 	// This is the scroller
	//var scrollContainer = new qx.ui.container.Scroll().set({ width: 750, height: 500});
	var scrollContainer = new qx.ui.container.Scroll();
	outerCanvas.setLayout(new qx.ui.layout.VBox());
        outerCanvas.add(scrollContainer, {flex: 1}); 
     
 	var main_container = new qx.ui.container.Composite();
	main_container.setWidth(qx.bom.Viewport.getWidth());
	main_container.setHeight(qx.bom.Viewport.getHeight());
	var layout_manager = new qx.ui.layout.VBox(50);
	main_container.setLayout(layout_manager);


	// SECTION II: This is the introduction container which is added to main_container
	var intro_container = new qx.ui.container.Composite(); 
	var intro_layout = new qx.ui.layout.VBox(20);
	intro_layout.setAlignX("center");
	intro_container.setLayout(intro_layout);


	var widget = new qx.ui.basic.Label("MIT App of the Week");
	widget.setFont(font);
	intro_container.add(widget, {flex: 1});
        intro_container.add(new qx.ui.basic.Label("The App of the Week feature showcases the talent and creativity of MIT AIG developers and encourages continued excellence in app design."), {flex: 1});
	intro_container.add(new qx.ui.core.Spacer(50));
	main_container.add(intro_container);
	

	// SECTION III: Main body section
	var first_entry = new qx.ui.container.Composite();
	var list_layout = new qx.ui.layout.HBox(20);
	list_layout.setAlignX("center");
        first_entry.setLayout(list_layout);
        var first = new qx.ui.basic.Label();
	first.set({value : "<a href=http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D916002%26label%3DPiano%20Composer>Piano Composer</a>", rich : true, width : 450, height: 160});
	var second = new qx.ui.basic.Image("aiagallery/question_blue.png");
        var third = new qx.ui.form.TextArea("");
        third.set({ value: "Feeling musical? This app allows you to harness your melodic imagination to create songs of your own. Simply drag and drop piano notes to begin. Each note’s pitch and duration can be altered. This app also features multi-track playing for chordal accompaniment. The usability of this app is limited only by the user’s creativity.", wrap: true, readOnly: true, maxHeight: 70});
	
        first_entry.add(first, {flex: 1});
        first_entry.add(second, {flex: 1});
        first_entry.add(third, {flex: 1})
	

	// SECOND ENTRY 
	var second_entry = new qx.ui.container.Composite();
	var list_layout = new qx.ui.layout.HBox(20);
	list_layout.setAlignX("center");
        second_entry.setLayout(list_layout);
        var first = new qx.ui.basic.Label();
	first.set({value : "<a href=http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D894001%26label%3DCurrency%20Converter>Currency Converter</a>", rich : true, width: 450, height: 160});
	
	var second = new qx.ui.basic.Image("aiagallery/question_blue.png");
        var third = new qx.ui.form.TextArea("");
        third.set({ value: "Ever have a burning desire to know how many Japanese yen go into $2.25 American dollar? There’s an app for that. You do need to look up the exchange rate, but once you have that down, you can figure the value of of any major currency to your heart’s content.", wrap: true, readOnly: true, maxHeight: 50});
        second_entry.add(first, {flex: 1});
        second_entry.add(second, {flex: 1});
        second_entry.add(third, {flex: 1})


	// THIRD ENTRY
	var third_entry = new qx.ui.container.Composite();
	var list_layout = new qx.ui.layout.HBox(20);
	list_layout.setAlignX("center");
        third_entry.setLayout(list_layout);
        var first = new qx.ui.basic.Label();
	first.set({value : "<a href=http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D145010%26label%3DNASA%20Image%20of%20the%20Day>Nasa Image <br>ofthe Day</a>", rich : true, width: 450, height: 160});
	var second = new qx.ui.basic.Image("aiagallery/question_blue.png");
	
	var third = new qx.ui.form.TextArea("");
        third.set({ value: "The title says it all. The app gives you a daily snapshot of the universe. And if you want to share your astonishment with your friends, you can post the image to Twitter on your behalf. This is a prime example of software which links together different parts of the web to add to the user experience.", wrap: true, readOnly: true, maxHeight: 70});
	
	var fourth = new qx.ui.basic.Label("JOE SMOE");
	fourth.setUserData("username", "scottfromscott");
	this.addUserLink(fourth);
	


        third_entry.add(first, {flex: 1});
        third_entry.add(second, {flex: 1});
        third_entry.add(third, {flex: 1});
	third_entry.add(fourth, {flex: 1});

	main_container.add(first_entry);
	main_container.add(second_entry); 
	main_container.add(third_entry);
	scrollContainer.add(main_container, {flex: 1});
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
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    },

    /** Add a link to the user profile and set the cursor to a pointer*/
    addUserLink : function(label)
    {
      label.setCursor("pointer");

      label.addListener(
        "click",
        function(e)
        {
          var query;
          var displayName;

          // Prevent the default 'click' behavior
          //e.preventDefault();
          //e.stop();

          // Remove "by" from displayName
          //displayName = e.getTarget().getValue().substring(8); 
          displayName = e.getTarget().getUserData("username"); 

          // Launch user page module
          aiagallery.module.dgallery.userinfo.UserInfo.addPublicUserView(
            displayName);
        }); 
    }
  }
});
